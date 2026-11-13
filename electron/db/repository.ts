/**
 * Data access + learning rules (awards, mastery, review scheduling).
 * Pure Node: no Electron imports, so it is fully unit-testable.
 */
import type { AcademyDatabase } from './database';
import { ACHIEVEMENT_BY_ID, COURSE_ACHIEVEMENTS } from '../../shared/achievements';
import { masteryLevel, masteryScore, recentFailures, type Evidence } from '../../shared/mastery';
import { initialReview, isDue, scheduleNext, type ReviewState } from '../../shared/review';
import { localDay, streakFromDays } from '../../shared/study-tracker';
import { XP_RULES } from '../../shared/xp';
import {
  DEFAULT_SETTINGS,
  type Award, type CodeFile, type CodeRevision, type ConceptMastery, type DailyActivity, type LessonProgressRow,
  type Profile, type ProgressSnapshot, type Settings, type Statistics,
} from '../../shared/types';

export interface AttemptInput {
  exerciseId: string;
  lessonId: string | null;
  concepts: string[];
  correct: boolean;
  hintsUsed: number;
  independent: boolean;
  kind: 'exercise' | 'challenge' | 'fix-bug' | 'review';
  errorCategory: string | null;
  code: string;
}

const nowIso = () => new Date().toISOString();

export class Repository {
  constructor(private db: AcademyDatabase, private clock: () => Date = () => new Date()) {}

  private now() {
    return this.clock().toISOString();
  }

  // ---------------------------------------------------------------- profile
  getProfile(): Profile | null {
    const r = this.db.get<Record<string, string | number | null>>('SELECT * FROM users WHERE id = 1');
    if (!r) return null;
    return {
      experience: r.experience as Profile['experience'],
      goal: r.goal as Profile['goal'],
      dailyGoalMinutes: Number(r.daily_goal_minutes),
      onboardedAt: (r.onboarded_at as string) ?? null,
      createdAt: r.created_at as string,
    };
  }

  completeOnboarding(input: Pick<Profile, 'experience' | 'goal' | 'dailyGoalMinutes'>): Profile {
    const t = this.now();
    this.db.transaction(() => {
      this.db.run(
        `INSERT INTO users (id, experience, goal, daily_goal_minutes, onboarded_at, created_at) VALUES (1, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET experience = excluded.experience, goal = excluded.goal,
           daily_goal_minutes = excluded.daily_goal_minutes, onboarded_at = excluded.onboarded_at`,
        [input.experience, input.goal, input.dailyGoalMinutes, t, t],
      );
      this.setSettings({ dailyGoalMinutes: input.dailyGoalMinutes });
    });
    return this.getProfile()!;
  }

  // ---------------------------------------------------------------- settings
  getSettings(): Settings {
    const rows = this.db.all<{ key: string; value: string }>('SELECT key, value FROM settings');
    const s: Record<string, unknown> = { ...DEFAULT_SETTINGS };
    for (const r of rows) {
      if (r.key in DEFAULT_SETTINGS) {
        try {
          s[r.key] = JSON.parse(r.value);
        } catch {
          /* ignore malformed value, keep default */
        }
      }
    }
    return s as unknown as Settings;
  }

  setSettings(patch: Partial<Settings>): Settings {
    this.db.transaction(() => {
      for (const [k, v] of Object.entries(patch)) {
        if (!(k in DEFAULT_SETTINGS) || v === undefined) continue;
        this.db.run('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value', [k, JSON.stringify(v)]);
      }
      if (patch.dailyGoalMinutes !== undefined) this.db.run('UPDATE users SET daily_goal_minutes = ? WHERE id = 1', [patch.dailyGoalMinutes]);
    });
    return this.getSettings();
  }

  // ---------------------------------------------------------------- awards
  private awardXp(key: string, amount: number, reason: string, out: Award[]) {
    this.db.run('INSERT OR IGNORE INTO xp_events (award_key, amount, reason, created_at) VALUES (?, ?, ?, ?)', [key, amount, reason, this.now()]);
    if (this.db.changes() > 0) out.push({ kind: 'xp', amount, reason });
  }

  private awardAchievement(id: string, out: Award[]) {
    if (!ACHIEVEMENT_BY_ID.has(id)) return;
    this.db.run('INSERT OR IGNORE INTO earned_achievements (achievement_id, earned_at) VALUES (?, ?)', [id, this.now()]);
    if (this.db.changes() > 0) out.push({ kind: 'achievement', achievementId: id, reason: ACHIEVEMENT_BY_ID.get(id)!.title });
  }

  totalXp(): number {
    return Number(this.db.get<{ x: number }>('SELECT COALESCE(SUM(amount), 0) AS x FROM xp_events')!.x);
  }

  // ---------------------------------------------------------------- lessons
  openLesson(lessonId: string, courseId: string) {
    const t = this.now();
    this.db.run(
      `INSERT INTO lesson_progress (lesson_id, course_id, status, step_index, state_json, started_at, last_opened_at)
       VALUES (?, ?, 'started', 0, '{}', ?, ?)
       ON CONFLICT(lesson_id) DO UPDATE SET last_opened_at = excluded.last_opened_at`,
      [lessonId, courseId, t, t],
    );
    this.setMeta('lastLessonId', lessonId);
  }

  saveLessonState(lessonId: string, stepIndex: number, state: Record<string, unknown>) {
    this.db.run('UPDATE lesson_progress SET step_index = ?, state_json = ?, last_opened_at = ? WHERE lesson_id = ?', [
      stepIndex, JSON.stringify(state), this.now(), lessonId,
    ]);
  }

  completeLesson(lessonId: string, courseId: string, courseLessonIds: string[]): Award[] {
    const awards: Award[] = [];
    this.db.transaction(() => {
      const t = this.now();
      this.db.run(
        `INSERT INTO lesson_progress (lesson_id, course_id, status, step_index, state_json, started_at, completed_at, last_opened_at)
         VALUES (?, ?, 'completed', 0, '{}', ?, ?, ?)
         ON CONFLICT(lesson_id) DO UPDATE SET status = 'completed', completed_at = COALESCE(lesson_progress.completed_at, excluded.completed_at)`,
        [lessonId, courseId, t, t, t],
      );
      if (courseId === 'projects') {
        this.awardXp(`project:${lessonId}`, XP_RULES.guidedProject, 'Begeleid project afgerond', awards);
        return;
      }
      this.awardXp(`lesson:${lessonId}`, XP_RULES.lessonComplete, 'Les afgerond', awards);
      this.awardAchievement('first-lesson', awards);
      if (courseLessonIds.length > 0) {
        const placeholders = courseLessonIds.map(() => '?').join(',');
        const done = Number(
          this.db.get<{ n: number }>(`SELECT COUNT(*) AS n FROM lesson_progress WHERE status = 'completed' AND lesson_id IN (${placeholders})`, courseLessonIds)!.n,
        );
        if (done === courseLessonIds.length) {
          this.awardXp(`course:${courseId}`, XP_RULES.chapterComplete, 'Cursus afgerond', awards);
          const ach = COURSE_ACHIEVEMENTS[courseId];
          if (ach) this.awardAchievement(ach, awards);
        }
      }
    });
    return awards;
  }

  lessonRows(): LessonProgressRow[] {
    return this.db.all<Record<string, string | number | null>>('SELECT * FROM lesson_progress').map((r) => ({
      lessonId: r.lesson_id as string,
      courseId: r.course_id as string,
      status: r.status as 'started' | 'completed',
      stepIndex: Number(r.step_index),
      state: safeJson(r.state_json as string),
      startedAt: r.started_at as string,
      completedAt: (r.completed_at as string) ?? null,
      lastOpenedAt: r.last_opened_at as string,
    }));
  }

  // ---------------------------------------------------------------- exercises & quizzes
  recordAttempt(a: AttemptInput): Award[] {
    const awards: Award[] = [];
    this.db.transaction(() => {
      const id = this.db.insert(
        `INSERT INTO exercise_attempts (exercise_id, lesson_id, kind, concepts, correct, hints_used, independent, error_category, code, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [a.exerciseId, a.lessonId, a.kind, JSON.stringify(a.concepts), a.correct ? 1 : 0, a.hintsUsed, a.independent ? 1 : 0, a.errorCategory, a.code.slice(0, 20_000), this.now()],
      );
      for (const c of a.concepts) this.db.run('INSERT OR IGNORE INTO attempt_concepts (attempt_id, concept_id) VALUES (?, ?)', [id, c]);

      if (a.correct) {
        if (a.kind === 'review') this.awardXp(`review:${a.exerciseId}:${localDay(this.clock())}`, XP_RULES.review, 'Herhaling afgerond', awards);
        else if (a.independent) this.awardXp(`exercise:${a.exerciseId}`, XP_RULES.firstIndependentSolution, 'Eerste zelfstandige oplossing', awards);
        else this.awardXp(`exercise:${a.exerciseId}`, 10, 'Begeleide oefening opgelost', awards);

        if (a.independent && a.concepts.includes('variables')) this.awardAchievement('first-variable', awards);
        if (a.kind === 'fix-bug') this.awardAchievement('bug-hunter', awards);
        const distinct = Number(this.db.get<{ n: number }>('SELECT COUNT(DISTINCT exercise_id) AS n FROM exercise_attempts WHERE correct = 1')!.n);
        if (distinct >= 10) this.awardAchievement('ten-solutions', awards);
      }
      this.updateReviews(a.concepts, a.kind === 'review' ? (a.correct ? (a.hintsUsed > 0 ? 1 : 2) : 0) : a.correct ? 'introduce' : null);
      this.checkMasteryAchievements(awards);
    });
    return awards;
  }

  recordQuiz(quizId: string, lessonId: string | null, concepts: string[], correct: boolean): Award[] {
    const awards: Award[] = [];
    this.db.run('INSERT INTO quiz_results (quiz_id, lesson_id, concepts, correct, created_at) VALUES (?, ?, ?, ?, ?)', [
      quizId, lessonId, JSON.stringify(concepts), correct ? 1 : 0, this.now(),
    ]);
    if (correct) this.awardXp(`quiz:${quizId}`, XP_RULES.quizCorrect, 'Kennisvraag goed beantwoord', awards);
    return awards;
  }

  /** Records a playground/lesson code run. */
  recordRun(ok: boolean, errorKind: string | null): Award[] {
    const awards: Award[] = [];
    this.db.run('INSERT INTO app_events (type, payload, created_at) VALUES (?, ?, ?)', ['run', JSON.stringify({ ok, errorKind }), this.now()]);
    if (ok) this.awardAchievement('hello-roblox', awards);
    return awards;
  }

  private updateReviews(concepts: string[], quality: 0 | 1 | 2 | 'introduce' | null) {
    if (quality === null) return;
    const now = this.clock();
    for (const c of concepts) {
      const row = this.db.get<Record<string, number | string | null>>('SELECT * FROM review_schedule WHERE concept_id = ?', [c]);
      let next: ReviewState;
      if (!row) {
        if (quality === 0) continue;
        next = initialReview(now);
      } else {
        if (quality === 'introduce') continue; // normal practice doesn't reset the review clock
        next = scheduleNext(
          { intervalDays: Number(row.interval_days), ease: Number(row.ease), reps: Number(row.reps), dueAt: row.due_at as string, lastReviewedAt: (row.last_reviewed_at as string) ?? null },
          quality,
          now,
        );
      }
      this.db.run(
        `INSERT INTO review_schedule (concept_id, interval_days, ease, reps, due_at, last_reviewed_at) VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(concept_id) DO UPDATE SET interval_days = excluded.interval_days, ease = excluded.ease, reps = excluded.reps,
           due_at = excluded.due_at, last_reviewed_at = excluded.last_reviewed_at`,
        [c, next.intervalDays, next.ease, next.reps, next.dueAt, next.lastReviewedAt],
      );
    }
  }

  private checkMasteryAchievements(awards: Award[]) {
    const loops = this.mastery().find((m) => m.conceptId === 'loops');
    if (loops && (loops.level === 'proficient' || loops.level === 'mastered')) this.awardAchievement('loop-master', awards);
  }

  // ---------------------------------------------------------------- mastery
  private evidenceByConcept(): Map<string, Evidence[]> {
    const map = new Map<string, Evidence[]>();
    const push = (c: string, e: Evidence) => {
      if (!map.has(c)) map.set(c, []);
      map.get(c)!.push(e);
    };
    const attempts = this.db.all<{ concept_id: string; correct: number; hints_used: number; independent: number; kind: string; created_at: string }>(
      `SELECT ac.concept_id, a.correct, a.hints_used, a.independent, a.kind, a.created_at
       FROM attempt_concepts ac JOIN exercise_attempts a ON a.id = ac.attempt_id`,
    );
    for (const a of attempts)
      push(a.concept_id, { kind: a.kind === 'review' ? 'review' : 'exercise', correct: !!a.correct, hintsUsed: a.hints_used, independent: !!a.independent, at: a.created_at });
    for (const q of this.db.all<{ concepts: string; correct: number; created_at: string }>('SELECT concepts, correct, created_at FROM quiz_results')) {
      for (const c of safeJsonArray(q.concepts)) push(c, { kind: 'quiz', correct: !!q.correct, hintsUsed: 0, independent: true, at: q.created_at });
    }
    return map;
  }

  mastery(): ConceptMastery[] {
    const now = this.clock();
    const reviews = new Map(
      this.db.all<{ concept_id: string; due_at: string; interval_days: number; ease: number; reps: number; last_reviewed_at: string | null }>('SELECT * FROM review_schedule').map((r) => [r.concept_id, r]),
    );
    const out: ConceptMastery[] = [];
    for (const [conceptId, ev] of this.evidenceByConcept()) {
      const score = masteryScore(ev);
      const r = reviews.get(conceptId);
      const last = ev.reduce((m, e) => (e.at > m ? e.at : m), '');
      out.push({
        conceptId,
        score,
        level: masteryLevel(score, ev.length),
        attempts: ev.filter((e) => e.kind !== 'quiz').length,
        correct: ev.filter((e) => e.kind !== 'quiz' && e.correct).length,
        lastPracticedAt: last || null,
        needsReview: r ? isDue({ intervalDays: r.interval_days, ease: r.ease, reps: r.reps, dueAt: r.due_at, lastReviewedAt: r.last_reviewed_at }, now) : false,
        reviewDueAt: r?.due_at ?? null,
        recentFailures: recentFailures(ev),
      });
    }
    return out.sort((a, b) => b.score - a.score);
  }

  // ---------------------------------------------------------------- study sessions
  /** Adds active seconds to the current session row (creating one per app run per day). Returns the row id. */
  addStudyTime(sessionId: number | null, sessionDay: string | null, seconds: number): { id: number; day: string } {
    const now = this.clock();
    const day = localDay(now);
    if (sessionId === null || sessionDay !== day) {
      const id = this.db.insert('INSERT INTO study_sessions (day, started_at, updated_at, active_seconds) VALUES (?, ?, ?, ?)', [day, now.toISOString(), now.toISOString(), Math.round(seconds)]);
      return { id, day };
    }
    this.db.run('UPDATE study_sessions SET active_seconds = active_seconds + ?, updated_at = ? WHERE id = ?', [Math.round(seconds), now.toISOString(), sessionId]);
    return { id: sessionId, day };
  }

  private activeDays(): Set<string> {
    const days = new Set(this.db.all<{ day: string }>('SELECT DISTINCT day FROM study_sessions WHERE active_seconds >= 60').map((r) => r.day));
    for (const r of this.db.all<{ created_at: string }>('SELECT created_at FROM exercise_attempts')) days.add(localDay(new Date(r.created_at)));
    return days;
  }

  streak(): number {
    return streakFromDays(this.activeDays(), this.clock());
  }

  checkStreakAchievement(): Award[] {
    const awards: Award[] = [];
    if (this.streak() >= 3) this.awardAchievement('streak-3', awards);
    return awards;
  }

  todaySeconds(): number {
    return Number(this.db.get<{ s: number }>('SELECT COALESCE(SUM(active_seconds), 0) AS s FROM study_sessions WHERE day = ?', [localDay(this.clock())])!.s);
  }

  // ---------------------------------------------------------------- snapshot
  snapshot(): ProgressSnapshot {
    return {
      profile: this.getProfile(),
      lessons: this.lessonRows(),
      xp: this.totalXp(),
      achievements: this.db.all<{ achievement_id: string; earned_at: string }>('SELECT * FROM earned_achievements').map((r) => ({ id: r.achievement_id, earnedAt: r.earned_at })),
      mastery: this.mastery(),
      lastLessonId: this.getMeta('lastLessonId'),
      todaySeconds: this.todaySeconds(),
      streakDays: this.streak(),
    };
  }

  private setMeta(key: string, value: string) {
    this.db.run('INSERT INTO app_events (type, payload, created_at) VALUES (?, ?, ?)', [`meta:${key}`, value, this.now()]);
  }

  private getMeta(key: string): string | null {
    return this.db.get<{ payload: string }>('SELECT payload FROM app_events WHERE type = ? ORDER BY id DESC LIMIT 1', [`meta:${key}`])?.payload ?? null;
  }

  // ---------------------------------------------------------------- code files
  listFiles(): CodeFile[] {
    return this.db.all<Record<string, string | number | null>>('SELECT * FROM code_files WHERE deleted_at IS NULL ORDER BY updated_at DESC').map(toFile);
  }

  getFile(id: number): CodeFile | null {
    const r = this.db.get<Record<string, string | number | null>>('SELECT * FROM code_files WHERE id = ? AND deleted_at IS NULL', [id]);
    return r ? toFile(r) : null;
  }

  createFile(name: string, content: string): CodeFile {
    const t = this.now();
    const id = this.db.transaction(() => {
      const fid = this.db.insert('INSERT INTO code_files (name, content, draft, created_at, updated_at) VALUES (?, ?, NULL, ?, ?)', [uniqueName(this.listFiles(), name), content, t, t]);
      this.db.run('INSERT INTO code_revisions (file_id, content, reason, created_at) VALUES (?, ?, ?, ?)', [fid, content, 'Aangemaakt', t]);
      return fid;
    });
    return this.getFile(id)!;
  }

  renameFile(id: number, name: string): CodeFile {
    this.db.run('UPDATE code_files SET name = ?, updated_at = ? WHERE id = ?', [uniqueName(this.listFiles().filter((f) => f.id !== id), name), this.now(), id]);
    return this.getFile(id)!;
  }

  /** Soft delete: files can be recovered from the database/backups. */
  removeFile(id: number) {
    this.db.run('UPDATE code_files SET deleted_at = ? WHERE id = ?', [this.now(), id]);
  }

  saveFile(id: number, content: string, reason: string): { file: CodeFile; awards: Award[] } {
    const awards: Award[] = [];
    this.db.transaction(() => {
      const prev = this.getFile(id);
      if (!prev) throw new Error('Bestand niet gevonden');
      const t = this.now();
      this.db.run('UPDATE code_files SET content = ?, draft = NULL, updated_at = ? WHERE id = ?', [content, t, id]);
      if (prev.content !== content) this.db.run('INSERT INTO code_revisions (file_id, content, reason, created_at) VALUES (?, ?, ?, ?)', [id, content, reason, t]);
      this.awardAchievement('own-file', awards);
    });
    return { file: this.getFile(id)!, awards };
  }

  saveDraft(id: number, draft: string | null) {
    this.db.run('UPDATE code_files SET draft = ? WHERE id = ?', [draft, id]);
  }

  revisions(fileId: number): CodeRevision[] {
    return this.db
      .all<Record<string, string | number>>('SELECT * FROM code_revisions WHERE file_id = ? ORDER BY id DESC LIMIT 50', [fileId])
      .map((r) => ({ id: Number(r.id), fileId: Number(r.file_id), content: r.content as string, reason: r.reason as string, createdAt: r.created_at as string }));
  }

  restoreRevision(revisionId: number): CodeFile {
    const rev = this.db.get<{ file_id: number; content: string; created_at: string }>('SELECT file_id, content, created_at FROM code_revisions WHERE id = ?', [revisionId]);
    if (!rev) throw new Error('Versie niet gevonden');
    return this.saveFile(rev.file_id, rev.content, `Hersteld naar versie van ${rev.created_at.slice(0, 16).replace('T', ' ')}`).file;
  }

  // ---------------------------------------------------------------- statistics
  statistics(): Statistics {
    const now = this.clock();
    const days: string[] = [];
    for (let i = 89; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      days.push(localDay(d));
    }
    const daily = new Map<string, DailyActivity>(days.map((d) => [d, { day: d, seconds: 0, exercises: 0, correct: 0, lessonsCompleted: 0 }]));
    for (const r of this.db.all<{ day: string; s: number }>('SELECT day, SUM(active_seconds) AS s FROM study_sessions GROUP BY day')) {
      const d = daily.get(r.day);
      if (d) d.seconds = Number(r.s);
    }
    const attempts = this.db.all<{ exercise_id: string; correct: number; independent: number; error_category: string | null; created_at: string }>(
      'SELECT exercise_id, correct, independent, error_category, created_at FROM exercise_attempts ORDER BY created_at',
    );
    for (const a of attempts) {
      const d = daily.get(localDay(new Date(a.created_at)));
      if (d) {
        d.exercises++;
        if (a.correct) d.correct++;
      }
    }
    const completed = this.db.all<{ completed_at: string }>("SELECT completed_at FROM lesson_progress WHERE status = 'completed' AND completed_at IS NOT NULL AND course_id != 'projects' ORDER BY completed_at");
    for (const l of completed) {
      const d = daily.get(localDay(new Date(l.completed_at)));
      if (d) d.lessonsCompleted++;
    }
    // cumulative lessons over time (only days where something changed + today)
    const lessonsOverTime: { day: string; total: number }[] = [];
    let total = 0;
    const perDay = new Map<string, number>();
    for (const l of completed) perDay.set(localDay(new Date(l.completed_at)), (perDay.get(localDay(new Date(l.completed_at))) ?? 0) + 1);
    for (const [day, n] of [...perDay.entries()].sort()) {
      total += n;
      lessonsOverTime.push({ day, total });
    }

    const errorCounts = new Map<string, number>();
    for (const a of attempts) if (!a.correct && a.error_category) errorCounts.set(a.error_category, (errorCounts.get(a.error_category) ?? 0) + 1);

    const quizzes = new Map<string, { day: string; correct: number; total: number }>();
    for (const q of this.db.all<{ correct: number; created_at: string }>('SELECT correct, created_at FROM quiz_results ORDER BY created_at')) {
      const day = localDay(new Date(q.created_at));
      const e = quizzes.get(day) ?? { day, correct: 0, total: 0 };
      e.total++;
      if (q.correct) e.correct++;
      quizzes.set(day, e);
    }

    const independent = attempts.filter((a) => a.independent);
    const efficiency: Statistics['efficiency'] = [];
    for (let i = 0; i < independent.length; i += 5) {
      const chunk = independent.slice(i, i + 5);
      efficiency.push({ bucket: i / 5 + 1, attempts: chunk.length, accuracy: chunk.filter((c) => c.correct).length / chunk.length });
    }

    const runs = Number(this.db.get<{ n: number }>("SELECT COUNT(*) AS n FROM app_events WHERE type = 'run'")!.n);
    return {
      totalSeconds: Number(this.db.get<{ s: number }>('SELECT COALESCE(SUM(active_seconds), 0) AS s FROM study_sessions')!.s),
      todaySeconds: this.todaySeconds(),
      lessonsCompleted: completed.length,
      exercisesAttempted: new Set(attempts.map((a) => a.exercise_id)).size,
      exercisesCompleted: new Set(attempts.filter((a) => a.correct).map((a) => a.exercise_id)).size,
      codeRuns: runs,
      codeSubmissions: attempts.length,
      xp: this.totalXp(),
      streakDays: this.streak(),
      independentAccuracy: independent.length ? independent.filter((a) => a.correct).length / independent.length : null,
      daily: [...daily.values()],
      lessonsOverTime,
      errorCategories: [...errorCounts.entries()].map(([category, count]) => ({ category, count })).sort((a, b) => b.count - a.count),
      quizzes: [...quizzes.values()],
      efficiency,
      mastery: this.mastery(),
      sessions: this.db
        .all<{ started_at: string; active_seconds: number }>('SELECT started_at, active_seconds FROM study_sessions WHERE active_seconds > 0 ORDER BY id DESC LIMIT 20')
        .map((s) => ({ startedAt: s.started_at, activeSeconds: Number(s.active_seconds) })),
    };
  }

  // ---------------------------------------------------------------- Roblox Studio pairing + sync
  getStudioTokenHash(): string | null {
    return this.db.get<{ detail: string }>("SELECT detail FROM studio_connections WHERE state = 'paired' ORDER BY id DESC LIMIT 1")?.detail ?? null;
  }

  setStudioTokenHash(hash: string | null) {
    this.db.transaction(() => {
      this.db.run("DELETE FROM studio_connections WHERE state = 'paired'");
      if (hash) this.db.run("INSERT INTO studio_connections (state, detail, created_at) VALUES ('paired', ?, ?)", [hash, this.now()]);
    });
  }

  /**
   * A script arrives from Studio. Never overwrites Academy changes silently:
   *  - new path → new Playground file
   *  - only Studio changed → Academy file updated (old version kept as revision)
   *  - both changed → a conflict is recorded for the student to resolve
   */
  studioPull(studioPath: string, source: string): { kind: 'created' | 'updated' | 'unchanged' | 'conflict'; fileId: number; conflictId?: number } {
    return this.db.transaction(() => {
      const sync = this.db.get<{ file_id: number; base_source: string }>('SELECT file_id, base_source FROM studio_sync WHERE studio_path = ?', [studioPath]);
      const file = sync ? this.getFile(sync.file_id) : null;
      if (!sync || !file) {
        const short = studioPath.split('.').slice(-2).join('.');
        const created = this.createFile(`Studio - ${short}`, source);
        this.db.run('INSERT OR REPLACE INTO studio_sync (studio_path, file_id, base_source, updated_at) VALUES (?, ?, ?, ?)', [studioPath, created.id, source, this.now()]);
        return { kind: 'created' as const, fileId: created.id };
      }
      const academy = file.draft ?? file.content;
      const setBase = (s: string) => this.db.run('UPDATE studio_sync SET base_source = ?, updated_at = ? WHERE studio_path = ?', [s, this.now(), studioPath]);
      if (source === academy) {
        setBase(source);
        return { kind: 'unchanged' as const, fileId: file.id };
      }
      if (source === sync.base_source) return { kind: 'unchanged' as const, fileId: file.id };
      if (academy === sync.base_source) {
        this.saveFile(file.id, source, 'Bijgewerkt vanuit Studio');
        setBase(source);
        return { kind: 'updated' as const, fileId: file.id };
      }
      const conflictId = this.db.insert('INSERT INTO studio_conflicts (studio_path, studio_source, academy_source, created_at) VALUES (?, ?, ?, ?)', [studioPath, source, academy, this.now()]);
      return { kind: 'conflict' as const, fileId: file.id, conflictId };
    });
  }

  /** What to send to Studio for a linked Playground file. */
  studioPushData(fileId: number): { path: string; source: string; baseSource: string } | null {
    const sync = this.db.get<{ studio_path: string; base_source: string }>('SELECT studio_path, base_source FROM studio_sync WHERE file_id = ?', [fileId]);
    const file = this.getFile(fileId);
    if (!sync || !file) return null;
    return { path: sync.studio_path, source: file.draft ?? file.content, baseSource: sync.base_source };
  }

  studioPushResult(path: string, pushed: string, reason: 'applied' | 'declined' | 'conflict' | 'missing', currentSource?: string) {
    if (reason === 'applied') this.db.run('UPDATE studio_sync SET base_source = ?, updated_at = ? WHERE studio_path = ?', [pushed, this.now(), path]);
    if (reason === 'conflict' && currentSource !== undefined)
      this.db.insert('INSERT INTO studio_conflicts (studio_path, studio_source, academy_source, created_at) VALUES (?, ?, ?, ?)', [path, currentSource, pushed, this.now()]);
  }

  studioConflicts() {
    return this.db
      .all<{ id: number; studio_path: string; studio_source: string; academy_source: string; created_at: string }>('SELECT * FROM studio_conflicts WHERE resolved_at IS NULL ORDER BY id DESC')
      .map((c) => ({ id: Number(c.id), path: c.studio_path, studioSource: c.studio_source, academySource: c.academy_source, createdAt: c.created_at }));
  }

  /**
   * Resolve a conflict. Both versions always stay available in the file's revision history.
   * 'studio': the Academy file takes the Studio version. 'academy': the Academy version is kept and becomes the
   * version to push (the base is set to what Studio has now, so the next push is not a conflict).
   */
  resolveStudioConflict(id: number, choice: 'studio' | 'academy'): { path: string; fileId: number } | null {
    return this.db.transaction(() => {
      const c = this.db.get<{ studio_path: string; studio_source: string; academy_source: string }>('SELECT * FROM studio_conflicts WHERE id = ? AND resolved_at IS NULL', [id]);
      const sync = c && this.db.get<{ file_id: number }>('SELECT file_id FROM studio_sync WHERE studio_path = ?', [c.studio_path]);
      if (!c || !sync) return null;
      const keepBoth = (reason: string, content: string) => this.saveFile(sync.file_id, content, reason);
      if (choice === 'studio') {
        keepBoth('Academy-versie bewaard (conflict)', c.academy_source);
        keepBoth('Conflict opgelost: Studio-versie gekozen', c.studio_source);
      } else {
        keepBoth('Studio-versie bewaard (conflict)', c.studio_source);
        keepBoth('Conflict opgelost: Academy-versie gekozen', c.academy_source);
      }
      this.db.run('UPDATE studio_sync SET base_source = ?, updated_at = ? WHERE studio_path = ?', [c.studio_source, this.now(), c.studio_path]);
      this.db.run('UPDATE studio_conflicts SET resolved_at = ?, resolution = ? WHERE id = ?', [this.now(), choice, id]);
      return { path: c.studio_path, fileId: sync.file_id };
    });
  }

  studioSyncedFiles() {
    return this.db
      .all<{ studio_path: string; file_id: number; updated_at: string }>('SELECT s.studio_path, s.file_id, s.updated_at FROM studio_sync s JOIN code_files f ON f.id = s.file_id WHERE f.deleted_at IS NULL ORDER BY s.updated_at DESC')
      .map((r) => ({ path: r.studio_path, fileId: Number(r.file_id), updatedAt: r.updated_at }));
  }

  // ---------------------------------------------------------------- data management
  exportAll(): Record<string, unknown> {
    const tables = ['users', 'settings', 'lesson_progress', 'exercise_attempts', 'quiz_results', 'review_schedule', 'study_sessions', 'code_files', 'code_revisions', 'xp_events', 'earned_achievements'];
    const data: Record<string, unknown> = { exportedAt: nowIso(), schemaVersion: this.db.schemaVersion, app: 'Roblox Dev Academy' };
    for (const t of tables) data[t] = this.db.all(`SELECT * FROM ${t}`);
    return data;
  }

  reset(scope: 'lessons' | 'practice' | 'statistics' | 'all') {
    this.db.transaction(() => {
      if (scope === 'lessons' || scope === 'all') {
        this.db.run('DELETE FROM lesson_progress');
        this.db.run("DELETE FROM xp_events WHERE award_key LIKE 'lesson:%' OR award_key LIKE 'course:%' OR award_key LIKE 'quiz:%'");
        this.db.run('DELETE FROM quiz_results');
        this.db.run("DELETE FROM app_events WHERE type = 'meta:lastLessonId'");
      }
      if (scope === 'practice' || scope === 'all') {
        this.db.run('DELETE FROM attempt_concepts');
        this.db.run('DELETE FROM exercise_attempts');
        this.db.run('DELETE FROM review_schedule');
        this.db.run("DELETE FROM xp_events WHERE award_key LIKE 'exercise:%' OR award_key LIKE 'review:%'");
      }
      if (scope === 'statistics' || scope === 'all') {
        this.db.run('DELETE FROM study_sessions');
        this.db.run("DELETE FROM app_events WHERE type = 'run'");
      }
      if (scope === 'all') {
        this.db.run('DELETE FROM xp_events');
        this.db.run('DELETE FROM earned_achievements');
      }
    });
  }

  deleteProfile() {
    this.db.transaction(() => {
      for (const t of ['studio_sync', 'studio_conflicts', 'attempt_concepts', 'exercise_attempts', 'quiz_results', 'review_schedule', 'study_sessions', 'code_revisions', 'code_files', 'xp_events', 'earned_achievements', 'lesson_progress', 'app_events', 'settings', 'users', 'tutor_conversations', 'studio_connections'])
        this.db.run(`DELETE FROM ${t}`);
    });
  }
}

function toFile(r: Record<string, string | number | null>): CodeFile {
  return { id: Number(r.id), name: r.name as string, content: r.content as string, draft: (r.draft as string) ?? null, createdAt: r.created_at as string, updatedAt: r.updated_at as string };
}

function uniqueName(existing: CodeFile[], wanted: string): string {
  const clean = wanted.trim().replace(/[\\/:*?"<>|]/g, '') || 'script.luau';
  const name = /\.luau?$/.test(clean) ? clean : `${clean}.luau`;
  const names = new Set(existing.map((f) => f.name));
  if (!names.has(name)) return name;
  const stem = name.replace(/\.luau?$/, '');
  for (let i = 2; ; i++) if (!names.has(`${stem}-${i}.luau`)) return `${stem}-${i}.luau`;
}

function safeJson(s: string): Record<string, unknown> {
  try {
    const v = JSON.parse(s);
    return v && typeof v === 'object' ? v : {};
  } catch {
    return {};
  }
}

function safeJsonArray(s: string): string[] {
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}
