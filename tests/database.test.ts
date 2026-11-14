import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import initSqlJs, { type SqlJsStatic } from 'sql.js';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { AcademyDatabase } from '../electron/db/database';
import { Repository } from '../electron/db/repository';

let SQL: SqlJsStatic;
let dir: string;
beforeAll(async () => {
  SQL = await initSqlJs();
});
beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rda-test-'));
});

const open = () => AcademyDatabase.open(SQL, path.join(dir, 'academy.sqlite'), path.join(dir, 'backups'), { flushDelayMs: 5 });
const attempt = (over: Partial<Parameters<Repository['recordAttempt']>[0]> = {}) => ({
  exerciseId: 'ex-1', lessonId: 'l1', concepts: ['variables'], correct: true, hintsUsed: 0, independent: true,
  kind: 'exercise' as const, errorCategory: null, code: 'local score = 50', ...over,
});

describe('database persistence', () => {
  it('survives close and reopen (first-lesson flow)', async () => {
    let db = await open();
    let repo = new Repository(db);
    repo.completeOnboarding({ experience: 'none', goal: 'obby', dailyGoalMinutes: 15 });
    repo.openLesson('c0-first-script', 'course-0');
    repo.recordAttempt(attempt({ exerciseId: 'c0-first-script-ex', concepts: ['print'], code: 'print("Ik leer Luau!")' }));
    repo.completeLesson('c0-first-script', 'course-0', ['c0-what-is-code', 'c0-first-script']);
    const xpBefore = repo.totalXp();
    db.close();

    db = await open();
    repo = new Repository(db);
    const snap = repo.snapshot();
    expect(snap.profile?.goal).toBe('obby');
    expect(snap.lessons.find((l) => l.lessonId === 'c0-first-script')?.status).toBe('completed');
    expect(snap.lastLessonId).toBe('c0-first-script');
    expect(snap.xp).toBe(xpBefore);
    expect(snap.xp).toBe(20 + 25);
    expect(snap.achievements.map((a) => a.id)).toContain('first-lesson');
    db.close();
  });

  it('never awards one-time XP twice', async () => {
    const db = await open();
    const repo = new Repository(db);
    const a1 = repo.completeLesson('l1', 'course-0', []);
    const a2 = repo.completeLesson('l1', 'course-0', []);
    expect(a1.filter((a) => a.kind === 'xp')).toHaveLength(1);
    expect(a2).toHaveLength(0);
    repo.recordAttempt(attempt());
    repo.recordAttempt(attempt());
    expect(repo.totalXp()).toBe(25 + 20);
    db.close();
  });

  it('awards the course bonus once all lessons are done', async () => {
    const db = await open();
    const repo = new Repository(db);
    repo.completeLesson('a', 'course-0', ['a', 'b']);
    const awards = repo.completeLesson('b', 'course-0', ['a', 'b']);
    expect(awards.some((a) => a.reason === 'Course finished')).toBe(true);
    expect(awards.some((a) => a.achievementId === 'course-0')).toBe(true);
    db.close();
  });

  it('settings persist', async () => {
    let db = await open();
    new Repository(db).setSettings({ theme: 'light', editorFontSize: 18 });
    db.close();
    db = await open();
    const s = new Repository(db).getSettings();
    expect(s.theme).toBe('light');
    expect(s.editorFontSize).toBe(18);
    expect(s.accent).toBe('blue'); // default kept
    db.close();
  });

  it('code files keep revisions and drafts, and can be restored', async () => {
    let db = await open();
    let repo = new Repository(db);
    const f = repo.createFile('test', 'print(1)');
    expect(f.name).toBe('test.luau');
    repo.saveFile(f.id, 'print(2)', 'Opgeslagen');
    repo.saveDraft(f.id, 'print(3) -- niet opgeslagen');
    db.close();
    db = await open();
    repo = new Repository(db);
    const again = repo.getFile(f.id)!;
    expect(again.content).toBe('print(2)');
    expect(again.draft).toBe('print(3) -- niet opgeslagen');
    const revs = repo.revisions(f.id);
    expect(revs).toHaveLength(2);
    const restored = repo.restoreRevision(revs[1].id);
    expect(restored.content).toBe('print(1)');
    db.close();
  });

  it('backup and restore', async () => {
    const db = await open();
    const repo = new Repository(db);
    repo.completeLesson('l1', 'course-0', []);
    const b = db.backup('manual');
    repo.reset('all');
    expect(repo.totalXp()).toBe(0);
    expect(db.restoreBackup(b.file)).toBe(true);
    expect(new Repository(db).totalXp()).toBe(25);
    db.close();
  });

  it('recovers from a corrupt database file without deleting it', async () => {
    let db = await open();
    new Repository(db).completeLesson('l1', 'course-0', []);
    db.backup('daily');
    db.close();
    fs.writeFileSync(path.join(dir, 'academy.sqlite'), 'this is not sqlite');
    db = await open();
    expect(db.startup.recoveredFromCorruption).toBe(true);
    expect(db.startup.restoredBackup).toMatch(/^backup-/);
    expect(fs.existsSync(db.startup.corruptFileKeptAt!)).toBe(true);
    expect(new Repository(db).totalXp()).toBe(25);
    db.close();
  });

  it('caches machine translations per language and stores one license', async () => {
    const db = await open();
    const repo = new Repository(db);
    repo.saveTranslations('fr', [{ hash: 'h1', text: 'Bonjour' }, { hash: 'h2', text: 'Monde' }]);
    repo.saveTranslations('fr', [{ hash: 'h1', text: 'Salut' }]);
    expect([...repo.getTranslations('fr', ['h1', 'h2', 'h3']).entries()]).toEqual([['h1', 'Salut'], ['h2', 'Monde']]);
    expect(repo.getTranslations('de', ['h1']).size).toBe(0);
    expect(repo.getLicense()).toBeNull();
    repo.saveLicense('LUMORA1-abc');
    repo.saveLicense('LUMORA1-def');
    expect(repo.getLicense()?.key).toBe('LUMORA1-def');
    repo.removeLicense();
    expect(repo.getLicense()).toBeNull();
    expect(repo.hasSetting('language')).toBe(false);
    repo.setSettings({ language: 'fr' });
    expect(repo.hasSetting('language')).toBe(true);
    db.close();
  });

  it('migrations are applied once and recorded', async () => {
    let db = await open();
    expect(db.schemaVersion).toBe(5);
    db.close();
    db = await open();
    expect(db.schemaVersion).toBe(5);
    db.close();
  });

  it('mastery, weak-concept detection and review scheduling', async () => {
    let t = new Date('2026-11-01T10:00:00Z');
    const db = await open();
    const repo = new Repository(db, () => t);
    for (let i = 0; i < 4; i++) repo.recordAttempt(attempt({ exerciseId: `if-${i}`, concepts: ['conditions'], correct: false, errorCategory: 'missing-then' }));
    const weak = repo.mastery().find((m) => m.conceptId === 'conditions')!;
    expect(weak.recentFailures).toBeGreaterThanOrEqual(3);
    expect(weak.score).toBeLessThan(30);

    for (let i = 0; i < 8; i++) repo.recordAttempt(attempt({ exerciseId: `var-${i}` }));
    const strong = repo.mastery().find((m) => m.conceptId === 'variables')!;
    expect(strong.score).toBeGreaterThan(80);
    expect(strong.needsReview).toBe(false);
    t = new Date('2026-11-05T10:00:00Z'); // days later: flagged for review, score unchanged
    const later = repo.mastery().find((m) => m.conceptId === 'variables')!;
    expect(later.needsReview).toBe(true);
    expect(later.score).toBe(strong.score);
    db.close();
  });

  it('records study time and statistics', async () => {
    const db = await open();
    const repo = new Repository(db);
    let s = repo.addStudyTime(null, null, 30);
    s = repo.addStudyTime(s.id, s.day, 45);
    repo.recordAttempt(attempt({ correct: false, errorCategory: 'nil-arithmetic' }));
    const stats = repo.statistics();
    expect(stats.todaySeconds).toBe(75);
    expect(stats.daily).toHaveLength(90);
    expect(stats.errorCategories[0]).toEqual({ category: 'nil-arithmetic', count: 1 });
    db.close();
  });
});

