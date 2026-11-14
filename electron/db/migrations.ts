/**
 * Ordered schema migrations. NEVER edit a migration that has shipped; add a new one instead.
 * Updates run pending migrations inside a transaction, after taking a backup, so progress is never lost.
 *
 * Note: course/lesson/exercise CONTENT lives in versioned TypeScript files (src/curriculum), not in the
 * database. The database stores only the learner's data, referenced by stable content ids.
 */
export interface Migration {
  version: number;
  name: string;
  sql: string;
}

export const MIGRATIONS: Migration[] = [
  {
    version: 1,
    name: 'initial schema',
    sql: `
CREATE TABLE users (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  experience TEXT NOT NULL,
  goal TEXT NOT NULL,
  daily_goal_minutes INTEGER NOT NULL,
  onboarded_at TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE lesson_progress (
  lesson_id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('started', 'completed')),
  step_index INTEGER NOT NULL DEFAULT 0,
  state_json TEXT NOT NULL DEFAULT '{}',
  started_at TEXT NOT NULL,
  completed_at TEXT,
  last_opened_at TEXT NOT NULL
);
CREATE INDEX idx_lesson_progress_course ON lesson_progress(course_id);
CREATE INDEX idx_lesson_progress_completed ON lesson_progress(completed_at);

CREATE TABLE exercise_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  exercise_id TEXT NOT NULL,
  lesson_id TEXT,
  kind TEXT NOT NULL,
  concepts TEXT NOT NULL,
  correct INTEGER NOT NULL,
  hints_used INTEGER NOT NULL DEFAULT 0,
  independent INTEGER NOT NULL DEFAULT 0,
  error_category TEXT,
  code TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX idx_attempts_exercise ON exercise_attempts(exercise_id);
CREATE INDEX idx_attempts_created ON exercise_attempts(created_at);

CREATE TABLE attempt_concepts (
  attempt_id INTEGER NOT NULL REFERENCES exercise_attempts(id) ON DELETE CASCADE,
  concept_id TEXT NOT NULL,
  PRIMARY KEY (attempt_id, concept_id)
);
CREATE INDEX idx_attempt_concepts_concept ON attempt_concepts(concept_id);

CREATE TABLE quiz_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quiz_id TEXT NOT NULL,
  lesson_id TEXT,
  concepts TEXT NOT NULL,
  correct INTEGER NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX idx_quiz_created ON quiz_results(created_at);

CREATE TABLE review_schedule (
  concept_id TEXT PRIMARY KEY,
  interval_days REAL NOT NULL,
  ease REAL NOT NULL,
  reps INTEGER NOT NULL,
  due_at TEXT NOT NULL,
  last_reviewed_at TEXT
);

CREATE TABLE study_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  day TEXT NOT NULL,
  started_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  active_seconds INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_sessions_day ON study_sessions(day);

CREATE TABLE code_files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  draft TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT
);

CREATE TABLE code_revisions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  file_id INTEGER NOT NULL REFERENCES code_files(id),
  content TEXT NOT NULL,
  reason TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX idx_revisions_file ON code_revisions(file_id, created_at);

CREATE TABLE xp_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  award_key TEXT NOT NULL UNIQUE,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE earned_achievements (
  achievement_id TEXT PRIMARY KEY,
  earned_at TEXT NOT NULL
);

CREATE TABLE app_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  payload TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX idx_app_events_type ON app_events(type, created_at);
`,
  },
  {
    version: 2,
    name: 'studio connections and tutor history (reserved for phases 3 and 5)',
    sql: `
CREATE TABLE studio_connections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  state TEXT NOT NULL,
  detail TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE tutor_conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mode TEXT NOT NULL,
  messages_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
`,
  },
  {
    version: 3,
    name: 'roblox studio script sync and conflicts',
    sql: `
CREATE TABLE studio_sync (
  studio_path TEXT PRIMARY KEY,
  file_id INTEGER NOT NULL REFERENCES code_files(id),
  base_source TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX idx_studio_sync_file ON studio_sync(file_id);
CREATE TABLE studio_conflicts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  studio_path TEXT NOT NULL,
  studio_source TEXT NOT NULL,
  academy_source TEXT NOT NULL,
  created_at TEXT NOT NULL,
  resolved_at TEXT,
  resolution TEXT
);
`,
  },
  {
    version: 4,
    name: 'ai mentor video scripts cache',
    sql: `
CREATE TABLE mentor_scripts (
  lesson_id TEXT PRIMARY KEY,
  script_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);
`,
  },
  {
    version: 5,
    name: 'translations cache and license; Roblox Studio sync and AI scripts removed',
    sql: `
CREATE TABLE translations (
  lang TEXT NOT NULL,
  source_hash TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (lang, source_hash)
);
CREATE TABLE license (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  license_key TEXT NOT NULL,
  verified_at TEXT NOT NULL,
  last_check_at TEXT NOT NULL
);
DROP TABLE IF EXISTS studio_sync;
DROP TABLE IF EXISTS studio_conflicts;
DROP TABLE IF EXISTS mentor_scripts;
`,
  },
];
