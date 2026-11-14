import { app, BrowserWindow, dialog, ipcMain, nativeTheme, net, protocol, session, shell, utilityProcess } from 'electron';
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import initSqlJs from 'sql.js';
import { AcademyDatabase } from './db/database';
import { Repository } from './db/repository';
import { LuauService } from './services/luau';
import { loadWindowState, trackWindowState } from './services/window-state';
import { NativeRunner } from './services/native-runner';

const native = new NativeRunner();
import { EXTERNAL_HOST_ALLOWLIST, schemas, type Channel } from '../shared/ipc';
import { StudyTracker } from '../shared/study-tracker';
import { APP_NAME, LEGACY_DATA_FOLDER } from '../shared/brand';
import { setDictionary, t } from '../shared/i18n';
import { languageFromLocale } from '../shared/languages';
import { MAIN_NL } from '../shared/i18n-main-nl';
import { LicenseService } from './services/license';
import { Translator } from './services/translator';
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
else migrateLegacyData();

/**
 * v0.5 and older were called "Roblox Dev Academy" and kept data in a folder with that name.
 * On the first start of the renamed app we copy (never move) that data, so progress is kept and
 * the old folder stays as a safety copy.
 */
function migrateLegacyData() {
  try {
    const target = app.getPath('userData');
    const legacy = path.join(app.getPath('appData'), LEGACY_DATA_FOLDER);
    if (path.resolve(legacy) === path.resolve(target)) return;
    if (fs.existsSync(path.join(target, 'data', 'academy.sqlite'))) return;
    if (!fs.existsSync(path.join(legacy, 'data', 'academy.sqlite'))) return;
    fs.mkdirSync(target, { recursive: true });
    for (const item of ['data', 'backups', 'backgrounds', 'window-state.json']) {
      const from = path.join(legacy, item);
      if (fs.existsSync(from)) fs.cpSync(from, path.join(target, item), { recursive: true, errorOnExist: false, force: false });
    }
  } catch (e) {
    console.error('Could not copy data from the old app folder', e);
  }
}

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
  // Language: v0.5 users (already onboarded, no language stored) were Dutch; new users get their OS language.
  if (!repo.hasSetting('language')) repo.setSettings({ language: repo.getProfile()?.onboardedAt ? 'nl' : languageFromLocale(app.getPreferredSystemLanguages()[0] ?? app.getLocale()) });
  applyMainLanguage(repo.getSettings().language);
  license = new LicenseService(
    { get: () => repo.getLicense(), save: (k) => repo.saveLicense(k), remove: () => repo.removeLicense() },
    (url, init) => net.fetch(url, init),
  );
  translator = new Translator({
    root: path.join(app.getPath('userData'), 'models'),
    fetch: (url) => net.fetch(url),
    cache: { get: (lang, keys) => repo.getTranslations(lang, keys), save: (lang, items) => repo.saveTranslations(lang, items) },
    spawn: spawnTranslateWorker,
    onStatus: (st) => win?.webContents.send('notice', { type: 'translator', status: st }),
  });
  tracker = new StudyTracker(repo.getSettings().idleTimeoutMinutes * 60_000, Date.now());
  setInterval(() => tracker.tick(Date.now()), 15_000).unref();
  setInterval(persistStudyTime, 30_000).unref();
}

// ---------------------------------------------------------------- language, license, translator
let license: LicenseService;
let translator: Translator;

/** Main-process texts (dialogs, errors) exist in English and Dutch; other languages use English here. */
function applyMainLanguage(lang: string) {
  setDictionary(lang, lang === 'nl' ? MAIN_NL : {});
}

function spawnTranslateWorker(modelRoot: string) {
  const child = utilityProcess.fork(path.join(__dirname, 'translate-worker.mjs'), [modelRoot], { serviceName: `${APP_NAME} translator`, stdio: 'ignore' });
  return {
    post: (m: unknown) => child.postMessage(m),
    onMessage: (cb: (m: { id: number; results?: string[]; error?: string }) => void) => child.on('message', cb),
    onExit: (cb: () => void) => child.on('exit', cb),
    kill: () => child.kill(),
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
    title: APP_NAME,
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
    const allowed = EXTERNAL_HOST_ALLOWLIST.includes(u.hostname) || u.hostname === 'gumroad.com' || u.hostname.endsWith('.gumroad.com');
    if (u.protocol !== 'https:' || !allowed) return false;
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
    if (patch.language) applyMainLanguage(patch.language);
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
      title: t('Export learning data'),
      defaultPath: path.join(app.getPath('documents'), `lumora-academy-export-${new Date().toISOString().slice(0, 10)}.json`),
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
  },
  'license:status': () => license.status(),
  'license:activate': (key: string) => license.activate(key),
  'license:deactivate': () => license.deactivate(),
  'mt:status': () => translator.status(),
  'mt:download': () => translator.download(),
  'mt:remove': () => translator.remove(),
  'mt:translate': (a: { lang: string; texts: string[] }) => translator.translate(a.lang, a.texts),
  'code:run': async (a: { language: 'cpp' | 'java'; code: string; record: boolean }) => {
    const r = await native.run(a.language, a.code);
    if (a.record) repo.recordRun(r.ok, r.error?.kind ?? null);
    return r;
  },
  'code:toolchain': (a: { language: 'cpp' | 'java'; refresh: boolean }) => native.detect(a.language, a.refresh),
  'settings:pickBackground': async () => {
    const res = await dialog.showOpenDialog(win!, { title: t('Choose a background'), properties: ['openFile'], filters: [{ name: t('Images'), extensions: ['png', 'jpg', 'jpeg', 'webp', 'gif'] }] });
    if (res.canceled || !res.filePaths[0]) return null;
    const src = res.filePaths[0];
    const ext = path.extname(src).slice(1).toLowerCase();
    if (!['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext)) throw new Error(t('Choose a PNG, JPG, WEBP or GIF image.'));
    if (fs.statSync(src).size > 15 * 1024 * 1024) throw new Error(t('This image is larger than 15 MB.'));
    const dir = backgroundsDir();
    fs.mkdirSync(dir, { recursive: true });
    for (const old of fs.readdirSync(dir)) if (/^bg-/.test(old)) fs.rmSync(path.join(dir, old), { force: true });
    const name = `bg-${crypto.randomBytes(8).toString('hex')}.${ext}`;
    fs.copyFileSync(src, path.join(dir, name));
    return repo.setSettings({ background: 'custom', customBackground: name });
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
      t('{app} could not start', { app: APP_NAME }),
      `${t('Your learning data could not be opened. Nothing was deleted.')}\n\n${t('Technical details:')} ${(e as Error).message}`,
    );
    app.quit();
    return;
  }
  session.defaultSession.setPermissionRequestHandler((_wc, _perm, cb) => cb(false));
  registerAppProtocol();
  registerIpc();
  createWindow();
  setTimeout(() => void license.recheck().catch(() => undefined), 20_000).unref();
});

let quitting = false;
app.on('before-quit', () => {
  if (quitting) return;
  quitting = true;
  try {
    persistStudyTime();
    translator?.stop();
    db?.close();
    luau?.dispose();
  } catch (e) {
    console.error('Shutdown error', e);
  }
});

app.on('window-all-closed', () => app.quit());

export type { Award };
