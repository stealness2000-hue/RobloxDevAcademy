/**
 * SQLite storage built on sql.js (SQLite compiled to WebAssembly).
 *
 * Why sql.js instead of a native module: no native rebuild against Electron's ABI, which makes
 * Windows installs reliable. The database is an ordinary SQLite file on disk.
 *
 * Durability:
 *  - every write marks the DB dirty; it is flushed after a short debounce and on shutdown
 *  - files are written to `<file>.tmp` and then renamed, so a crash never leaves a half-written DB
 *  - a backup is taken before migrations and once per day automatically
 *  - a corrupt file is moved aside (never deleted) and the newest valid backup is restored
 */
import fs from 'node:fs';
import path from 'node:path';
import type { Database, SqlJsStatic, SqlValue } from 'sql.js';
import { MIGRATIONS } from './migrations';
import type { BackupInfo, StartupStatus } from '../../shared/types';

export type Params = Record<string, SqlValue> | SqlValue[];

const MAX_BACKUPS = 15;

export class AcademyDatabase {
  private dirty = false;
  private flushTimer: NodeJS.Timeout | null = null;
  private txDepth = 0;
  startup: StartupStatus = { recoveredFromCorruption: false, restoredBackup: null, corruptFileKeptAt: null };

  private constructor(
    private SQL: SqlJsStatic,
    private db: Database,
    readonly filePath: string,
    readonly backupDir: string,
    private flushDelayMs: number,
  ) {}

  static async open(SQL: SqlJsStatic, filePath: string, backupDir: string, opts: { flushDelayMs?: number } = {}): Promise<AcademyDatabase> {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.mkdirSync(backupDir, { recursive: true });
    const startup: StartupStatus = { recoveredFromCorruption: false, restoredBackup: null, corruptFileKeptAt: null };

    let db: Database | null = null;
    if (fs.existsSync(filePath)) {
      db = tryLoad(SQL, fs.readFileSync(filePath));
      if (!db) {
        // Keep the damaged file for manual recovery, then try backups from newest to oldest.
        const kept = `${filePath}.corrupt-${stamp()}`;
        fs.renameSync(filePath, kept);
        startup.recoveredFromCorruption = true;
        startup.corruptFileKeptAt = kept;
        for (const b of listBackupFiles(backupDir)) {
          db = tryLoad(SQL, fs.readFileSync(path.join(backupDir, b.file)));
          if (db) {
            startup.restoredBackup = b.file;
            break;
          }
        }
      }
    }
    const fresh = !db;
    db ??= new SQL.Database();
    const instance = new AcademyDatabase(SQL, db, filePath, backupDir, opts.flushDelayMs ?? 400);
    instance.startup = startup;
    db.run('PRAGMA foreign_keys = ON;');
    instance.migrate(fresh);
    if (fresh || startup.recoveredFromCorruption) instance.flushNow();
    return instance;
  }

  private migrate(fresh: boolean) {
    this.db.run('CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, name TEXT NOT NULL, applied_at TEXT NOT NULL);');
    const applied = new Set(this.all<{ version: number }>('SELECT version FROM schema_migrations').map((r) => r.version));
    const pending = MIGRATIONS.filter((m) => !applied.has(m.version)).sort((a, b) => a.version - b.version);
    if (pending.length === 0) return;
    if (!fresh && fs.existsSync(this.filePath)) this.backup('pre-migration');
    for (const m of pending) {
      this.transaction(() => {
        this.db.run(m.sql);
        this.run('INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?)', [m.version, m.name, new Date().toISOString()]);
      });
    }
  }

  get schemaVersion(): number {
    return this.get<{ v: number }>('SELECT MAX(version) AS v FROM schema_migrations')?.v ?? 0;
  }

  run(sql: string, params: Params = []): void {
    this.db.run(sql, params);
    this.markDirty();
  }

  /** INSERT and return last_insert_rowid(). */
  insert(sql: string, params: Params = []): number {
    this.db.run(sql, params);
    this.markDirty();
    return Number(this.get<{ id: number }>('SELECT last_insert_rowid() AS id')!.id);
  }

  changes(): number {
    return this.db.getRowsModified();
  }

  all<T = Record<string, unknown>>(sql: string, params: Params = []): T[] {
    const stmt = this.db.prepare(sql);
    try {
      stmt.bind(params);
      const rows: T[] = [];
      while (stmt.step()) rows.push(stmt.getAsObject() as T);
      return rows;
    } finally {
      stmt.free();
    }
  }

  get<T = Record<string, unknown>>(sql: string, params: Params = []): T | undefined {
    return this.all<T>(sql, params)[0];
  }

  /** Runs fn atomically. Nested calls join the outer transaction. */
  transaction<T>(fn: () => T): T {
    if (this.txDepth > 0) {
      this.txDepth++;
      try {
        return fn();
      } finally {
        this.txDepth--;
      }
    }
    this.db.run('BEGIN');
    this.txDepth = 1;
    let result: T;
    try {
      result = fn();
      this.db.run('COMMIT');
    } catch (e) {
      this.db.run('ROLLBACK');
      throw e;
    } finally {
      this.txDepth = 0;
    }
    this.markDirty(); // must run after txDepth is reset, or the commit is never flushed
    return result;
  }

  private markDirty() {
    if (this.txDepth > 0) return; // flushed once the transaction commits
    this.dirty = true;
    if (this.flushTimer) return;
    this.flushTimer = setTimeout(() => {
      this.flushTimer = null;
      this.flushNow();
    }, this.flushDelayMs);
  }

  /** Write the database to disk atomically. */
  flushNow() {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
    const bytes = this.db.export();
    // db.export() resets some connection state in sql.js; foreign keys must be re-enabled.
    this.db.run('PRAGMA foreign_keys = ON;');
    const tmp = `${this.filePath}.tmp`;
    const fd = fs.openSync(tmp, 'w');
    try {
      fs.writeSync(fd, bytes);
      fs.fsyncSync(fd);
    } finally {
      fs.closeSync(fd);
    }
    fs.renameSync(tmp, this.filePath);
    this.dirty = false;
  }

  get isDirty() {
    return this.dirty;
  }

  backup(reason = 'manual'): BackupInfo {
    const file = `backup-${stamp()}-${reason.replace(/[^a-z]/g, '')}.sqlite`;
    const full = path.join(this.backupDir, file);
    const bytes = this.db.export();
    this.db.run('PRAGMA foreign_keys = ON;');
    fs.writeFileSync(full, bytes);
    this.pruneBackups();
    return { file, createdAt: new Date().toISOString(), sizeBytes: bytes.length };
  }

  /** Take an automatic backup if none exists for today. */
  dailyBackup(now = new Date()) {
    const today = now.toISOString().slice(0, 10);
    if (!listBackupFiles(this.backupDir).some((b) => b.file.startsWith(`backup-${today}`))) this.backup('daily');
  }

  listBackups(): BackupInfo[] {
    return listBackupFiles(this.backupDir);
  }

  /** Replace the live database with a backup. The current state is backed up first. */
  restoreBackup(file: string): boolean {
    if (path.basename(file) !== file) throw new Error('Invalid backup name');
    const full = path.join(this.backupDir, file);
    if (!fs.existsSync(full)) return false;
    const candidate = tryLoad(this.SQL, fs.readFileSync(full));
    if (!candidate) return false;
    this.backup('prerestore');
    this.db.close();
    this.db = candidate;
    this.db.run('PRAGMA foreign_keys = ON;');
    this.migrate(false);
    this.flushNow();
    return true;
  }

  exportBytes(): Uint8Array {
    const b = this.db.export();
    this.db.run('PRAGMA foreign_keys = ON;');
    return b;
  }

  private pruneBackups() {
    const all = listBackupFiles(this.backupDir);
    for (const b of all.slice(MAX_BACKUPS)) fs.rmSync(path.join(this.backupDir, b.file), { force: true });
  }

  close() {
    if (this.dirty) this.flushNow();
    this.db.close();
  }
}

function tryLoad(SQL: SqlJsStatic, bytes: Uint8Array): Database | null {
  try {
    const db = new SQL.Database(bytes);
    const res = db.exec('PRAGMA integrity_check;');
    const ok = res[0]?.values?.[0]?.[0] === 'ok';
    if (!ok) {
      db.close();
      return null;
    }
    return db;
  } catch {
    return null;
  }
}

function stamp(d = new Date()) {
  return d.toISOString().replace(/[:.]/g, '-').replace('Z', '').slice(0, 19);
}

function listBackupFiles(dir: string): BackupInfo[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => /^backup-.*\.sqlite$/.test(f))
    .map((f) => {
      const st = fs.statSync(path.join(dir, f));
      return { file: f, createdAt: st.mtime.toISOString(), sizeBytes: st.size };
    })
    .sort((a, b) => b.file.localeCompare(a.file));
}
