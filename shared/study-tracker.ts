/**
 * Active study-time tracker.
 * Time only counts while the learner interacts (activity pings from the UI).
 * After `idleTimeoutMs` without activity, counting pauses. The caller persists periodically,
 * so an unexpected crash loses at most one persistence interval.
 */
export class StudyTracker {
  private lastActivity = -Infinity;
  private lastTick: number;
  activeMs = 0;

  constructor(private idleTimeoutMs: number, now: number) {
    this.lastTick = now;
  }

  setIdleTimeout(ms: number) {
    this.idleTimeoutMs = ms;
  }

  activity(now: number) {
    this.tick(now);
    this.lastActivity = now;
  }

  /** Accumulate active time up to `now`. Time past the idle cutoff is not counted. */
  tick(now: number) {
    const from = this.lastTick;
    const activeUntil = Math.min(now, this.lastActivity + this.idleTimeoutMs);
    if (activeUntil > from) this.activeMs += activeUntil - from;
    this.lastTick = now;
  }

  isActive(now: number) {
    return now - this.lastActivity < this.idleTimeoutMs;
  }
}

/** Local calendar day (YYYY-MM-DD) for a date. */
export function localDay(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Consecutive active days ending today (or yesterday, so a streak isn't "lost" before today's session). */
export function streakFromDays(activeDays: Set<string>, today: Date): number {
  let streak = 0;
  const d = new Date(today);
  if (!activeDays.has(localDay(d))) d.setDate(d.getDate() - 1);
  while (activeDays.has(localDay(d))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}
