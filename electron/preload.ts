/**
 * Strict preload bridge. The renderer gets exactly three things:
 *  - invoke(channel, arg) for an allowlisted set of channels (arguments are re-validated in main)
 *  - ping() for study-time tracking
 *  - onNotice(cb) for main → renderer notifications
 * No Node, filesystem or Electron objects are exposed.
 */
import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron';

const CHANNELS = new Set([
  'app:startupStatus', 'app:openExternal', 'window:setTheme', 'profile:get', 'profile:completeOnboarding', 'settings:get', 'settings:set',
  'progress:snapshot', 'progress:openLesson', 'progress:saveLessonState', 'progress:completeLesson', 'progress:recordAttempt', 'progress:recordQuiz',
  'luau:run', 'luau:evalRun', 'luau:check', 'luau:autocomplete', 'files:list', 'files:create', 'files:rename', 'files:remove', 'files:save', 'files:saveDraft',
  'files:revisions', 'files:restore', 'stats:get', 'data:export', 'data:backupNow', 'data:listBackups', 'data:restoreBackup', 'data:reset',
  'data:deleteProfile', 'settings:pickBackground', 'code:run', 'code:toolchain', 'ai:status', 'ai:setKey', 'ai:clearKey', 'mentor:aiScript', 'mentor:cached', 'studio:status', 'studio:startPairing', 'studio:unpair', 'studio:openExercise', 'studio:requestCheck',
  'studio:installPlugin', 'studio:push', 'studio:resolveConflict', 'studio:clearLogs',
]);

contextBridge.exposeInMainWorld('academy', {
  invoke: (channel: string, arg?: unknown) => {
    if (!CHANNELS.has(channel)) return Promise.reject(new Error(`Unknown channel ${channel}`));
    return ipcRenderer.invoke(channel, arg);
  },
  ping: () => ipcRenderer.send('activity'),
  onNotice: (cb: (notice: unknown) => void) => {
    const listener = (_e: IpcRendererEvent, notice: unknown) => cb(notice);
    ipcRenderer.on('notice', listener);
    return () => ipcRenderer.removeListener('notice', listener);
  },
  platform: process.platform,
});
