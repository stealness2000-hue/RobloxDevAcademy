import { app, BrowserWindow, dialog, ipcMain, nativeTheme, net, protocol, session, shell } from 'electron';
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import initSqlJs from 'sql.js';
import { AcademyDatabase } from './db/database';
import { Repository } from './db/repository';
import { LuauService } from './services/luau';
import { loadWindowState, trackWindowState } from './services/window-state';
import { StudioBridge } from './services/studio-bridge';
import { NativeRunner } from './services/native-runner';

const native = new NativeRunner();
import { execFile } from 'node:child_process';
import os from 'node:os';
import { verifyStudioFacts, type StudioExercise, type StudioFacts, type StudioVerification } from '../shared/studio';
import { ROBLOX_GLOBALS, explainMessage } from '../shared/explain-error';
import type { StudioState } from '../shared/types';
import { EXTERNAL_HOST_ALLOWLIST, schemas, type Channel } from '../shared/ipc';
import { StudyTracker } from '../shared/study-tracker';
import type { Award } from '../shared/types';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEV_URL = process.env.VITE_DEV_SERVER_URL;
const APP_ORIGIN = 'app://academy';

const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'", // Monaco injects inline styles
  "img-src 'self' data:",
  "font-src 'self' data:",
  "worker-src 'self' blob:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'none'",
  "frame-src 'none'",
  "form-action 'none'",
].join('; ');

// Test/portable override: keep all data in a separate folder (used by the automated acceptance test).
if (process.env.RDA_USER_DATA) app.setPath('userData', path.resolve(process.env.RDA_USER_DATA));

protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true } }]);

if (!app.requestSingleInstanceLock()) app.quit();

let win: BrowserWindow | null = null;
let db: AcademyDatabase;
let repo: Repository;
let luau: LuauService;

// ---------------------------------------------------------------- study time
let tracker: StudyTracker;
let persistedMs = 0;
let session_: { id: number; day: string } | null = null;
let msSinceBreak = 0;

function persistStudyTime() {
  if (!tracker || !repo) return;
  tracker.tick(Date.now());
  const delta = tracker.activeMs - persistedMs;
  if (delta < 1000) return;
  const seconds = Math.floor(delta / 1000);
  session_ = repo.addStudyTime(session_?.id ?? null, session_?.day ?? null, seconds);
  persistedMs += seconds * 1000;
  msSinceBreak += seconds * 1000;
  const reminder = repo.getSettings().breakReminderMinutes;
  if (reminder > 0 && msSinceBreak >= reminder * 60_000) {
    msSinceBreak = 0;
    win?.webContents.send('notice', { type: 'break', minutes: reminder });
  }
  const awards = repo.checkStreakAchievement();
  if (awards.length) win?.webContents.send('notice', { type: 'awards', awards });
}

// ---------------------------------------------------------------- paths
function resourcePath(...parts: string[]) {
  // Files listed in asarUnpack live next to app.asar in "app.asar.unpacked".
  const base = app.isPackaged ? `${app.getAppPath()}.unpacked` : app.getAppPath();
  return path.join(base, ...parts);
}

async function initData() {
  const SQL = await initSqlJs({ locateFile: (f: string) => resourcePath('node_modules', 'sql.js', 'dist', f) });
  const dataDir = path.join(app.getPath('userData'), 'data');
  db = await AcademyDatabase.open(SQL, path.join(dataDir, 'academy.sqlite'), path.join(app.getPath('userData'), 'backups'));
  db.dailyBackup();
  repo = new Repository(db);
  luau = new LuauService({ distDir: app.isPackaged ? resourcePath('node_modules', '@luau-rs', 'luau', 'dist') : undefined });
  tracker = new StudyTracker(repo.getSettings().idleTimeoutMinutes * 60_000, Date.now());
  setInterval(() => tracker.tick(Date.now()), 15_000).unref();
  setInterval(persistStudyTime, 30_000).unref();
}

// ---------------------------------------------------------------- Roblox Studio bridge
let bridge: StudioBridge;
const studioVerifications = new Map<string, StudioVerification>();
let studioLogs: StudioState['logs'] = [];

function notifyStudio(extra: Record<string, unknown> = {}) {
  win?.webContents.send('notice', { type: 'studio', ...extra });
}

const pluginSourcePath = () =>
  app.isPackaged ? path.join(process.resourcesPath, 'studio-plugin', 'RobloxDevAcademy.lua') : path.join(app.getAppPath(), 'studio-plugin', 'RobloxDevAcademy.lua');
const robloxPluginsDir = () => path.join(process.env.LOCALAPPDATA ?? path.join(os.homedir(), 'AppData', 'Local'), 'Roblox', 'Plugins');

function pluginInfo(): StudioState['plugin'] {
  const target = path.join(robloxPluginsDir(), 'RobloxDevAcademy.lua');
  const installed = fs.existsSync(target);
  let upToDate = false;
  try {
    upToDate = installed && fs.readFileSync(target, 'utf8') === fs.readFileSync(pluginSourcePath(), 'utf8');
  } catch {
    upToDate = false;
  }
  return { installed, upToDate, path: target, robloxFound: fs.existsSync(path.dirname(robloxPluginsDir())) };
}

async function handleStudioFacts(ex: StudioExercise, facts: StudioFacts) {
  const errors = new Map<string, { line: number; message: string }[]>();
  for (const s of facts.scripts) {
    const diags = await luau.check(s.source);
    errors.set(
      s.source,
      diags
        .filter((d) => d.severity === 'error')
        .filter((d) => {
          const m = /Unknown global '([^']+)'/.exec(d.message);
          return !(m && ROBLOX_GLOBALS.has(m[1]));
        })
        .map((d) => ({ line: d.line, message: explainMessage(d.message, s.source, d.line, d.column).what })),
    );
  }
  const v = verifyStudioFacts(ex, facts, (src) => errors.get(src) ?? []);
  studioVerifications.set(ex.id, v);
  const used = facts.scripts.find((s) => s.name === v.scriptName);
  const awards = repo.recordAttempt({
    exerciseId: ex.id, lessonId: null, concepts: ex.concepts, correct: v.passed, hintsUsed: 0, independent: true,
    kind: 'exercise', errorCategory: v.passed ? null : 'other', code: used?.source ?? '',
  });
  notifyStudio({ verification: v });
  if (awards.length) win?.webContents.send('notice', { type: 'awards', awards });
}

async function initStudio() {
  bridge = new StudioBridge({
    onFacts: (ex, facts) => void handleStudioFacts(ex, facts),
    onPushResult: (push, r) => {
      repo.studioPushResult(push.path, push.source, r.reason, r.currentSource);
      notifyStudio({ pushResult: { path: push.path, reason: r.reason } });
    },
    onPull: (p, source) => {
      const res = repo.studioPull(p, source);
      notifyStudio({ pull: { path: p, kind: res.kind } });
    },
    onLog: (messages) => {
      const at = new Date().toISOString();
      studioLogs = [...messages.map((m) => ({ ...m, at })), ...studioLogs].slice(0, 50);
      notifyStudio();
    },
    onChange: () => notifyStudio(),
    loadTokenHash: () => repo.getStudioTokenHash(),
    saveTokenHash: (h) => repo.setStudioTokenHash(h),
  });
  try {
    await bridge.start();
  } catch {
    /* the status shows the error (e.g. port in use); the rest of the app keeps working */
  }
  const detect = () =>
    execFile('tasklist', ['/FI', 'IMAGENAME eq RobloxStudioBeta.exe', '/NH'], { windowsHide: true }, (err, out) => {
      const running = !err && /RobloxStudioBeta\.exe/i.test(out);
      if (bridge.studioRunning !== running) {
        bridge.studioRunning = running;
        notifyStudio();
      }
    });
  detect();
  setInterval(detect, 8000).unref();
}

function studioState(): StudioState {
  return {
    ...bridge.snapshot(),
    plugin: pluginInfo(),
    verifications: [...studioVerifications.values()],
    logs: studioLogs,
    conflicts: repo.studioConflicts(),
    synced: repo.studioSyncedFiles(),
  };
}

// ---------------------------------------------------------------- window
const THEME_COLORS = {
  dark: { color: '#10151F', symbolColor: '#929CAF', background: '#0C1018' },
  light: { color: '#EEF1F6', symbolColor: '#4A5466', background: '#F6F7FA' },
};

function createWindow() {
  const theme = repo.getSettings().theme;
  const state = loadWindowState(app.getPath('userData'));
  win = new BrowserWindow({
    ...state.bounds,
    minWidth: 1024,
    minHeight: 680,
    show: false,
    title: 'Roblox Dev Academy',
    backgroundColor: THEME_COLORS[theme].background,
    titleBarStyle: 'hidden',
    titleBarOverlay: { color: THEME_COLORS[theme].color, symbolColor: THEME_COLORS[theme].symbolColor, height: 40 },
    icon: path.join(app.getAppPath(), 'assets', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      spellcheck: false,
      devTools: !app.isPackaged,
    },
  });
  if (state.maximized) win.maximize();
  trackWindowState(win, app.getPath('userData'));
  win.once('ready-to-show', () => win?.show());

  // Never navigate away from the app; external links go through the allowlist.
  win.webContents.on('will-navigate', (e, url) => {
    if (!isAppUrl(url)) e.preventDefault();
  });
  win.webContents.setWindowOpenHandler(({ url }) => {
    openExternalSafe(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-attach-webview', (e) => e.preventDefault());

  if (DEV_URL) win.loadURL(DEV_URL);
  else win.loadURL(`${APP_ORIGIN}/index.html`);
}

function isAppUrl(url: string) {
  return url.startsWith(`${APP_ORIGIN}/`) || (!!DEV_URL && url.startsWith(DEV_URL));
}

function openExternalSafe(url: string): boolean {
  try {
    const u = new URL(url);
    if (u.protocol !== 'https:' || !EXTERNAL_HOST_ALLOWLIST.includes(u.hostname)) return false;
    void shell.openExternal(u.toString());
    return true;
  } catch {
    return false;
  }
}

function registerAppProtocol() {
  const root = path.join(app.getAppPath(), 'dist');
  protocol.handle('app', async (req) => {
    const { pathname, host } = new URL(req.url);
    if (host !== 'academy') return new Response('Not found', { status: 404 });
    if (pathname.startsWith('/user-content/')) {
      // Custom background images chosen by the student (copied into the app's own folder).
      const name = decodeURIComponent(pathname.slice('/user-content/'.length));
      if (!/^bg-[a-f0-9]{16}.(png|jpe?g|webp|gif)$/.test(name)) return new Response('Forbidden', { status: 403 });
      const res = await net.fetch(pathToFileURL(path.join(backgroundsDir(), name)).toString());
      return new Response(res.body, { status: res.status, headers: { 'Content-Type': res.headers.get('content-type') ?? 'image/png', 'X-Content-Type-Options': 'nosniff' } });
    }
    const rel = decodeURIComponent(pathname).replace(/^\/+/, '') || 'index.html';
    const full = path.normalize(path.join(root, rel));
    if (!full.startsWith(root + path.sep)) return new Response('Forbidden', { status: 403 }); // path traversal guard
    const res = await net.fetch(pathToFileURL(full).toString());
    const headers = new Headers(res.headers);
    headers.set('Content-Security-Policy', CSP);
    headers.set('X-Content-Type-Options', 'nosniff');
    return new Response(res.body, { status: res.status, headers });
  });
}

const backgroundsDir = () => path.join(app.getPath('userData'), 'backgrounds');

// ---------------------------------------------------------------- IPC
type Handler = (arg: never) => unknown | Promise<unknown>;
const handlers: Record<Channel, Handler> = {
  'app:startupStatus': () => db.startup,
  'app:openExternal': (url: string) => openExternalSafe(url),
  'window:setTheme': (theme: 'dark' | 'light') => {
    nativeTheme.themeSource = theme;
    const c = THEME_COLORS[theme];
    win?.setTitleBarOverlay({ color: c.color, symbolColor: c.symbolColor, height: 40 });
    win?.setBackgroundColor(c.background);
  },
  'profile:get': () => repo.getProfile(),
  'profile:completeOnboarding': (input: Parameters<Repository['completeOnboarding']>[0]) => repo.completeOnboarding(input),
  'settings:get': () => repo.getSettings(),
  'settings:set': (patch: Parameters<Repository['setSettings']>[0]) => {
    const s = repo.setSettings(patch);
    if (patch.idleTimeoutMinutes) tracker.setIdleTimeout(patch.idleTimeoutMinutes * 60_000);
    return s;
  },
  'progress:snapshot': () => {
    persistStudyTime();
    return repo.snapshot();
  },
  'progress:openLesson': (a: { lessonId: string; courseId: string }) => repo.openLesson(a.lessonId, a.courseId),
  'progress:saveLessonState': (a: { lessonId: string; stepIndex: number; state: Record<string, unknown> }) => repo.saveLessonState(a.lessonId, a.stepIndex, a.state),
  'progress:completeLesson': (a: { lessonId: string; courseId: string; courseLessonIds: string[] }) => repo.completeLesson(a.lessonId, a.courseId, a.courseLessonIds),
  'progress:recordAttempt': (a: Parameters<Repository['recordAttempt']>[0]) => repo.recordAttempt(a),
  'progress:recordQuiz': (a: { quizId: string; lessonId: string | null; concepts: string[]; correct: boolean }) => repo.recordQuiz(a.quizId, a.lessonId, a.concepts, a.correct),
  'luau:run': async (code: string) => {
    const r = await luau.run(code);
    const awards = repo.recordRun(r.ok, r.error?.kind ?? null);
    if (awards.length) win?.webContents.send('notice', { type: 'awards', awards });
    return r;
  },
  // Extra runs made by the evaluator for value/test checks: not counted as student runs.
  'luau:evalRun': (code: string) => luau.run(code),
  'luau:check': (code: string) => luau.check(code),
  'luau:autocomplete': (a: { code: string; line: number; column: number }) => luau.autocomplete(a.code, a.line, a.column),
  'files:list': () => repo.listFiles(),
  'files:create': (a: { name: string; content: string }) => repo.createFile(a.name, a.content),
  'files:rename': (a: { id: number; name: string }) => repo.renameFile(a.id, a.name),
  'files:remove': (id: number) => repo.removeFile(id),
  'files:save': (a: { id: number; content: string; reason: string }) => repo.saveFile(a.id, a.content, a.reason),
  'files:saveDraft': (a: { id: number; draft: string | null }) => repo.saveDraft(a.id, a.draft),
  'files:revisions': (id: number) => repo.revisions(id),
  'files:restore': (id: number) => repo.restoreRevision(id),
  'stats:get': () => {
    persistStudyTime();
    return repo.statistics();
  },
  'data:export': async () => {
    const res = await dialog.showSaveDialog(win!, {
      title: 'Leergegevens exporteren',
      defaultPath: path.join(app.getPath('documents'), `roblox-dev-academy-export-${new Date().toISOString().slice(0, 10)}.json`),
      filters: [{ name: 'JSON', extensions: ['json'] }],
    });
    if (res.canceled || !res.filePath) return { saved: false };
    fs.writeFileSync(res.filePath, JSON.stringify(repo.exportAll(), null, 2), 'utf8');
    return { saved: true, path: res.filePath };
  },
  'data:backupNow': () => db.backup('manual'),
  'data:listBackups': () => db.listBackups(),
  'data:restoreBackup': (file: string) => {
    const restored = db.restoreBackup(file);
    if (restored) repo = new Repository(db);
    return { restored };
  },
  'data:reset': (scope: 'lessons' | 'practice' | 'statistics' | 'all') => {
    db.backup('prereset');
    repo.reset(scope);
  },
  'data:deleteProfile': () => {
    db.backup('predelete');
    repo.deleteProfile();
    bridge.unpair();
  },
  'code:run': async (a: { language: 'cpp' | 'java'; code: string; record: boolean }) => {
    const r = await native.run(a.language, a.code);
    if (a.record) repo.recordRun(r.ok, r.error?.kind ?? null);
    return r;
  },
  'code:toolchain': (a: { language: 'cpp' | 'java'; refresh: boolean }) => native.detect(a.language, a.refresh),
  'settings:pickBackground': async () => {
    const res = await dialog.showOpenDialog(win!, { title: 'Kies een achtergrond', properties: ['openFile'], filters: [{ name: 'Afbeeldingen', extensions: ['png', 'jpg', 'jpeg', 'webp', 'gif'] }] });
    if (res.canceled || !res.filePaths[0]) return null;
    const src = res.filePaths[0];
    const ext = path.extname(src).slice(1).toLowerCase();
    if (!['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext)) throw new Error('Kies een PNG-, JPG-, WEBP- of GIF-afbeelding.');
    if (fs.statSync(src).size > 15 * 1024 * 1024) throw new Error('Deze afbeelding is groter dan 15 MB.');
    const dir = backgroundsDir();
    fs.mkdirSync(dir, { recursive: true });
    for (const old of fs.readdirSync(dir)) if (/^bg-/.test(old)) fs.rmSync(path.join(dir, old), { force: true });
    const name = `bg-${crypto.randomBytes(8).toString('hex')}.${ext}`;
    fs.copyFileSync(src, path.join(dir, name));
    return repo.setSettings({ background: 'custom', customBackground: name });
  },
  'studio:status': () => studioState(),
  'studio:startPairing': () => bridge.startPairing(),
  'studio:unpair': () => bridge.unpair(),
  'studio:openExercise': (id: string | null) => bridge.setExercise(id),
  'studio:requestCheck': () => bridge.requestCheck(),
  'studio:installPlugin': () => {
    // Writes exactly one file: our own plugin, into Roblox's local plugins folder.
    const dir = robloxPluginsDir();
    fs.mkdirSync(dir, { recursive: true });
    fs.copyFileSync(pluginSourcePath(), path.join(dir, 'RobloxDevAcademy.lua'));
    return pluginInfo();
  },
  'studio:push': (fileId: number) => {
    const d = repo.studioPushData(fileId);
    if (!d) throw new Error('Dit bestand is niet gekoppeld aan een script in Studio.');
    bridge.queuePush(d.path, d.source, d.baseSource);
    return true;
  },
  'studio:resolveConflict': (a: { id: number; choice: 'studio' | 'academy' }) => {
    const r = repo.resolveStudioConflict(a.id, a.choice);
    if (r && a.choice === 'academy') {
      const d = repo.studioPushData(r.fileId);
      if (d) bridge.queuePush(d.path, d.source, d.baseSource); // the plugin still asks the student before applying
    }
    notifyStudio();
    return r;
  },
  'studio:clearLogs': () => {
    studioLogs = [];
  },
};

function registerIpc() {
  for (const [channel, handler] of Object.entries(handlers) as [Channel, Handler][]) {
    ipcMain.handle(channel, async (event, arg: unknown) => {
      if (!event.senderFrame || !isAppUrl(event.senderFrame.url)) throw new Error('Rejected: unknown sender');
      const parsed = schemas[channel].safeParse(arg);
      if (!parsed.success) throw new Error(`Invalid input for ${channel}`);
      return handler(parsed.data as never);
    });
  }
  let lastPing = 0;
  ipcMain.on('activity', (event) => {
    if (!event.senderFrame || !isAppUrl(event.senderFrame.url)) return;
    const now = Date.now();
    if (now - lastPing < 2000) return; // rate limit
    lastPing = now;
    tracker.activity(now);
  });
}

// ---------------------------------------------------------------- lifecycle
app.on('second-instance', () => {
  if (win) {
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.whenReady().then(async () => {
  try {
    await initData();
  } catch (e) {
    dialog.showErrorBox(
      'Roblox Dev Academy kon niet starten',
      `De leergegevens konden niet worden geopend. Er is niets verwijderd.\n\nTechnische details: ${(e as Error).message}`,
    );
    app.quit();
    return;
  }
  session.defaultSession.setPermissionRequestHandler((_wc, _perm, cb) => cb(false));
  registerAppProtocol();
  registerIpc();
  await initStudio();
  createWindow();
});

let quitting = false;
app.on('before-quit', () => {
  if (quitting) return;
  quitting = true;
  try {
    persistStudyTime();
    bridge?.stop();
    db?.close();
    luau?.dispose();
  } catch (e) {
    console.error('Shutdown error', e);
  }
});

app.on('window-all-closed', () => app.quit());

export type { Award };
