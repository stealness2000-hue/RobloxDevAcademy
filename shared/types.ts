// Domain types shared by the Electron main process and the renderer.

export type OutputKind = 'print' | 'warn' | 'system';

export interface OutputLine {
  kind: OutputKind;
  text: string;
}

export type RunErrorKind = 'syntax' | 'runtime' | 'interrupted' | 'memory' | 'compile' | 'input' | 'host' | 'conversion' | 'timeout';

export interface RunError {
  kind: RunErrorKind;
  message: string;
  line?: number;
}

export interface RunResult {
  ok: boolean;
  output: OutputLine[];
  error: RunError | null;
  /** Values returned by the chunk (only used by evaluators). */
  values: unknown[];
  outputTruncated: boolean;
  durationMs: number;
}

export interface Diagnostic {
  severity: 'error' | 'warning';
  source: 'analyzer' | 'lint' | 'runtime' | 'syntax';
  message: string;
  code?: number | string;
  line: number; // 1-based
  column: number; // 1-based
  endLine: number;
  endColumn: number;
}

export type Experience = 'none' | 'edited' | 'basics' | 'some';
export type GoalGenre = 'simulator' | 'tycoon' | 'obby' | 'multiplayer' | 'adventure' | 'ui' | 'various' | 'unknown';

export interface Profile {
  experience: Experience;
  goal: GoalGenre;
  dailyGoalMinutes: number;
  onboardedAt: string | null;
  createdAt: string;
}

export type ThemeName = 'dark' | 'light';
export type AccentName = 'blue' | 'violet' | 'teal' | 'amber';
export type HintPreference = 'on-request' | 'after-mistake';
export type ExplanationDepth = 'short' | 'detailed';

export interface Settings {
  language: string; // code from shared/languages.ts
  theme: ThemeName;
  accent: AccentName;
  uiScale: number; // 0.9 – 1.25
  reducedMotion: 'system' | 'on' | 'off';
  editorFontSize: number;
  editorFont: string;
  editorTabSize: number;
  editorLineNumbers: boolean;
  editorMinimap: boolean;
  editorAutocomplete: boolean;
  editorAutoSave: boolean;
  editorWordWrap: boolean;
  dailyGoalMinutes: number;
  hintPreference: HintPreference;
  explanationDepth: ExplanationDepth;
  idleTimeoutMinutes: number;
  breakReminderMinutes: number; // 0 = off
  showXp: boolean;
  typingSound: 'off' | 'soft' | 'mechanical' | 'typewriter' | 'bubble';
  soundVolume: number; // 0 – 1
  feedbackSounds: boolean;
  background: 'none' | 'aurora' | 'grid' | 'dots' | 'sunset' | 'ocean' | 'custom';
  backgroundDim: number; // 0 – 0.9, darkens the background behind the content
  customBackground: string | null; // file name inside the app's backgrounds folder
}

export const DEFAULT_SETTINGS: Settings = {
  language: 'en',
  theme: 'dark',
  accent: 'blue',
  uiScale: 1,
  reducedMotion: 'system',
  editorFontSize: 14,
  editorFont: "'Cascadia Code', 'JetBrains Mono', Consolas, monospace",
  editorTabSize: 4,
  editorLineNumbers: true,
  editorMinimap: false,
  editorAutocomplete: true,
  editorAutoSave: true,
  editorWordWrap: false,
  dailyGoalMinutes: 15,
  hintPreference: 'on-request',
  explanationDepth: 'short',
  idleTimeoutMinutes: 3,
  breakReminderMinutes: 0,
  showXp: true,
  typingSound: 'mechanical',
  soundVolume: 0.35,
  feedbackSounds: true,
  background: 'aurora',
  backgroundDim: 0.55,
  customBackground: null,
};

export interface LessonProgressRow {
  lessonId: string;
  courseId: string;
  status: 'started' | 'completed';
  stepIndex: number;
  state: Record<string, unknown>;
  startedAt: string;
  completedAt: string | null;
  lastOpenedAt: string;
}

export type MasteryLevel = 'not-started' | 'introduced' | 'practicing' | 'developing' | 'proficient' | 'mastered';

export interface ConceptMastery {
  conceptId: string;
  score: number; // 0-100
  level: MasteryLevel;
  attempts: number;
  correct: number;
  lastPracticedAt: string | null;
  needsReview: boolean;
  reviewDueAt: string | null;
  recentFailures: number;
}

export interface Award {
  kind: 'xp' | 'achievement';
  amount?: number;
  reason: string;
  achievementId?: string;
}

export interface ProgressSnapshot {
  profile: Profile | null;
  lessons: LessonProgressRow[];
  xp: number;
  achievements: { id: string; earnedAt: string }[];
  mastery: ConceptMastery[];
  lastLessonId: string | null;
  todaySeconds: number;
  streakDays: number;
}

export interface CodeFile {
  id: number;
  name: string;
  content: string;
  draft: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CodeRevision {
  id: number;
  fileId: number;
  content: string;
  reason: string;
  createdAt: string;
}

export interface DailyActivity {
  day: string; // YYYY-MM-DD (local)
  seconds: number;
  exercises: number;
  correct: number;
  lessonsCompleted: number;
}

export interface Statistics {
  totalSeconds: number;
  todaySeconds: number;
  lessonsCompleted: number;
  exercisesAttempted: number;
  exercisesCompleted: number;
  codeRuns: number;
  codeSubmissions: number;
  xp: number;
  streakDays: number;
  independentAccuracy: number | null; // 0-1
  daily: DailyActivity[]; // last 90 days, oldest first
  lessonsOverTime: { day: string; total: number }[];
  errorCategories: { category: string; count: number }[];
  quizzes: { day: string; correct: number; total: number }[];
  efficiency: { bucket: number; accuracy: number; attempts: number }[];
  mastery: ConceptMastery[];
  sessions: { startedAt: string; activeSeconds: number }[];
}

export interface BackupInfo {
  file: string;
  createdAt: string;
  sizeBytes: number;
}

export interface StartupStatus {
  recoveredFromCorruption: boolean;
  restoredBackup: string | null;
  corruptFileKeptAt: string | null;
}

