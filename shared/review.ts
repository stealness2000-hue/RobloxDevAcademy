/**
 * Spaced-review scheduler (a simplified SM-2 variant).
 * Successful reviews grow the interval; a failed review shortens it, but never erases mastery.
 */
export interface ReviewState {
  intervalDays: number;
  ease: number; // 1.3 – 2.8
  reps: number;
  dueAt: string; // ISO
  lastReviewedAt: string | null;
}

const DAY = 86_400_000;

export function initialReview(now: Date): ReviewState {
  return { intervalDays: 1, ease: 2.3, reps: 0, dueAt: new Date(now.getTime() + DAY).toISOString(), lastReviewedAt: null };
}

/** quality: 0 = failed, 1 = correct with hints, 2 = correct independently */
export function scheduleNext(state: ReviewState, quality: 0 | 1 | 2, now: Date): ReviewState {
  let { intervalDays, ease, reps } = state;
  if (quality === 0) {
    reps = 0;
    intervalDays = 1;
    ease = Math.max(1.3, ease - 0.2);
  } else {
    reps += 1;
    if (reps === 1) intervalDays = quality === 2 ? 3 : 2;
    else intervalDays = Math.round(intervalDays * (quality === 2 ? ease : Math.max(1.2, ease - 0.5)));
    ease = Math.min(2.8, ease + (quality === 2 ? 0.1 : -0.05));
  }
  intervalDays = Math.min(intervalDays, 120);
  return { intervalDays, ease, reps, dueAt: new Date(now.getTime() + intervalDays * DAY).toISOString(), lastReviewedAt: now.toISOString() };
}

export function isDue(state: ReviewState, now: Date): boolean {
  return new Date(state.dueAt).getTime() <= now.getTime();
}
