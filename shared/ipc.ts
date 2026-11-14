/**
 * IPC contract between renderer and main.
 * Every invoke channel has a Zod schema for its argument; the main process rejects anything else.
 */
import { z } from 'zod';
import { MentorRequest, type MentorScript } from './mentor';
import type {
  Award, BackupInfo, CodeFile, CodeRevision, Diagnostic, Profile, ProgressSnapshot, RunResult, Settings, StartupStatus, Statistics, StudioState,
} from './types';

const id = z.string().min(1).max(120).regex(/^[a-z0-9][a-z0-9-_.]*$/i);
const code = z.string().max(200_000);

export const SettingsPatch = z
  .object({
    theme: z.enum(['dark', 'light']),
    accent: z.enum(['blue', 'violet', 'teal', 'amber']),
    uiScale: z.number().min(0.8).max(1.4),
    reducedMotion: z.enum(['system', 'on', 'off']),
    editorFontSize: z.number().int().min(10).max(28),
    editorFont: z.string().min(1).max(200),
    editorTabSize: z.number().int().min(2).max(8),
    editorLineNumbers: z.boolean(),
    editorMinimap: z.boolean(),
    editorAutocomplete: z.boolean(),
    editorAutoSave: z.boolean(),
    editorWordWrap: z.boolean(),
    dailyGoalMinutes: z.number().int().min(5).max(240),
    hintPreference: z.enum(['on-request', 'after-mistake']),
    explanationDepth: z.enum(['short', 'detailed']),
    idleTimeoutMinutes: z.number().int().min(1).max(30),
    breakReminderMinutes: z.number().int().min(0).max(180),
    showXp: z.boolean(),
    typingSound: z.enum(['off', 'soft', 'mechanical', 'typewriter', 'bubble']),
    soundVolume: z.number().min(0).max(1),
    feedbackSounds: z.boolean(),
    background: z.enum(['none', 'aurora', 'grid', 'dots', 'sunset', 'ocean', 'custom']),
    backgroundDim: z.number().min(0).max(0.9),
    customBackground: z.string().regex(/^bg-[a-f0-9]{16}.(png|jpe?g|webp|gif)$/).nullable(),
  })
  .partial()
  .strict();

export const schemas = {
  'app:startupStatus': z.undefined(),
  'app:openExternal': z.string().url().max(500),
  'window:setTheme': z.enum(['dark', 'light']),
  'profile:get': z.undefined(),
  'profile:completeOnboarding': z
    .object({
      experience: z.enum(['none', 'edited', 'basics', 'some']),
      goal: z.enum(['simulator', 'tycoon', 'obby', 'multiplayer', 'adventure', 'ui', 'various', 'unknown']),
      dailyGoalMinutes: z.number().int().min(5).max(240),
    })
    .strict(),
  'settings:get': z.undefined(),
  'settings:set': SettingsPatch,
  'progress:snapshot': z.undefined(),
  'progress:openLesson': z.object({ lessonId: id, courseId: id }).strict(),
  'progress:saveLessonState': z
    .object({ lessonId: id, stepIndex: z.number().int().min(0).max(500), state: z.record(z.string(), z.unknown()) })
    .strict()
    .refine((v) => JSON.stringify(v.state).length < 400_000, 'state too large'),
  'progress:completeLesson': z.object({ lessonId: id, courseId: id, courseLessonIds: z.array(id).max(200) }).strict(),
  'progress:recordAttempt': z
    .object({
      exerciseId: id,
      lessonId: id.nullable(),
      concepts: z.array(id).max(20),
      correct: z.boolean(),
      hintsUsed: z.number().int().min(0).max(50),
      independent: z.boolean(),
      kind: z.enum(['exercise', 'challenge', 'fix-bug', 'review']),
      errorCategory: z.string().max(60).nullable(),
      code: code,
    })
    .strict(),
  'progress:recordQuiz': z.object({ quizId: id, lessonId: id.nullable(), concepts: z.array(id).max(20), correct: z.boolean() }).strict(),
  'luau:run': code,
  'luau:evalRun': code,
  'luau:check': code,
  'luau:autocomplete': z.object({ code, line: z.number().int().min(0), column: z.number().int().min(0) }).strict(),
  'files:list': z.undefined(),
  'files:create': z.object({ name: z.string().min(1).max(80), content: code }).strict(),
  'files:rename': z.object({ id: z.number().int().positive(), name: z.string().min(1).max(80) }).strict(),
  'files:remove': z.number().int().positive(),
  'files:save': z.object({ id: z.number().int().positive(), content: code, reason: z.string().max(80) }).strict(),
  'files:saveDraft': z.object({ id: z.number().int().positive(), draft: code.nullable() }).strict(),
  'files:revisions': z.number().int().positive(),
  'files:restore': z.number().int().positive(),
  'stats:get': z.undefined(),
  'data:export': z.undefined(),
  'data:backupNow': z.undefined(),
  'data:listBackups': z.undefined(),
  'data:restoreBackup': z.string().regex(/^backup-[0-9T-]+(?:-[a-z]+)?\.sqlite$/),
  'data:reset': z.enum(['lessons', 'practice', 'statistics', 'all']),
  'data:deleteProfile': z.literal('VERWIJDER'),
  'settings:pickBackground': z.undefined(),
  'ai:status': z.undefined(),
  'ai:setKey': z.string().regex(/^sk-ant-[A-Za-z0-9_-]{20,300}$/),
  'ai:clearKey': z.undefined(),
  'mentor:aiScript': MentorRequest,
  'mentor:cached': z.string().min(1).max(80),
  'code:run': z.object({ language: z.enum(['cpp', 'java']), code, record: z.boolean() }).strict(),
  'code:toolchain': z.object({ language: z.enum(['cpp', 'java']), refresh: z.boolean() }).strict(),
  'studio:status': z.undefined(),
  'studio:startPairing': z.undefined(),
  'studio:unpair': z.undefined(),
  'studio:openExercise': z.string().max(80).nullable(),
  'studio:requestCheck': z.undefined(),
  'studio:installPlugin': z.undefined(),
  'studio:push': z.number().int().positive(),
  'studio:resolveConflict': z.object({ id: z.number().int().positive(), choice: z.enum(['studio', 'academy']) }).strict(),
  'studio:clearLogs': z.undefined(),
} as const;

export type Channel = keyof typeof schemas;

export interface CompletionItem {
  label: string;
  kind: string;
  detail?: string;
  insertText?: string;
  deprecated: boolean;
}

/** Return types per channel. */
export interface ChannelResults {
  'app:startupStatus': StartupStatus;
  'app:openExternal': boolean;
  'window:setTheme': void;
  'profile:get': Profile | null;
  'profile:completeOnboarding': Profile;
  'settings:get': Settings;
  'settings:set': Settings;
  'progress:snapshot': ProgressSnapshot;
  'progress:openLesson': void;
  'progress:saveLessonState': void;
  'progress:completeLesson': Award[];
  'progress:recordAttempt': Award[];
  'progress:recordQuiz': Award[];
  'luau:run': RunResult;
  'luau:evalRun': RunResult;
  'luau:check': Diagnostic[];
  'luau:autocomplete': CompletionItem[];
  'files:list': CodeFile[];
  'files:create': CodeFile;
  'files:rename': CodeFile;
  'files:remove': void;
  'files:save': { file: CodeFile; awards: Award[] };
  'files:saveDraft': void;
  'files:revisions': CodeRevision[];
  'files:restore': CodeFile;
  'stats:get': Statistics;
  'data:export': { saved: boolean; path?: string };
  'data:backupNow': BackupInfo;
  'data:listBackups': BackupInfo[];
  'data:restoreBackup': { restored: boolean };
  'data:reset': void;
  'data:deleteProfile': void;
  'settings:pickBackground': Settings | null;
  'ai:status': { configured: boolean; encryptionAvailable: boolean; model: string };
  'ai:setKey': void;
  'ai:clearKey': void;
  'mentor:aiScript': MentorScript;
  'mentor:cached': MentorScript | null;
  'code:run': RunResult;
  'code:toolchain': { language: 'cpp' | 'java'; available: boolean; command: string | null; version: string | null };
  'studio:status': StudioState;
  'studio:startPairing': string;
  'studio:unpair': void;
  'studio:openExercise': void;
  'studio:requestCheck': void;
  'studio:installPlugin': StudioState['plugin'];
  'studio:push': boolean;
  'studio:resolveConflict': { path: string; fileId: number } | null;
  'studio:clearLogs': void;
}

export type ChannelArgs = { [K in Channel]: z.input<(typeof schemas)[K]> };

export interface AcademyApi {
  invoke<K extends Channel>(channel: K, ...args: ChannelArgs[K] extends undefined ? [] : [ChannelArgs[K]]): Promise<ChannelResults[K]>;
  /** Fire-and-forget activity signal for study-time tracking (throttled in the renderer). */
  ping(): void;
  platform: string;
}

/** Hosts the app may open in the external browser. Everything else is refused. */
export const EXTERNAL_HOST_ALLOWLIST = ['create.roblox.com', 'luau.org', 'www.roblox.com', 'github.com', 'adoptium.net', 'www.msys2.org', 'winlibs.com', 'en.cppreference.com', 'docs.oracle.com'];
