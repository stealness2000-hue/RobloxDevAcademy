/**
 * Concept mastery model.
 *
 * Evidence used (study TIME is deliberately not used as proof of competence):
 *  - correctness of exercise attempts (recent attempts weigh more)
 *  - hint usage (solutions with hints count less)
 *  - independent exercises (no scaffolding) count more than guided ones
 *  - quiz answers
 *  - successful spaced reviews
 * Inactivity never lowers the score; instead the review scheduler flags the concept.
 */
import type { MasteryLevel } from './types';

export interface Evidence {
  kind: 'exercise' | 'quiz' | 'review';
  correct: boolean;
  hintsUsed: number;
  independent: boolean;
  at: string; // ISO timestamp
}

export function masteryScore(evidence: Evidence[]): number {
  if (evidence.length === 0) return 0;
  const sorted = [...evidence].sort((a, b) => a.at.localeCompare(b.at));
  let weighted = 0;
  let totalWeight = 0;
  sorted.forEach((e, i) => {
    // Recency: the newest evidence weighs up to 2x the oldest.
    const recency = 1 + i / Math.max(1, sorted.length - 1);
    const kindWeight = e.kind === 'review' ? 1.3 : e.kind === 'quiz' ? 0.6 : e.independent ? 1.5 : 1;
    const weight = recency * kindWeight;
    let value = e.correct ? 1 : 0;
    if (e.correct && e.hintsUsed > 0) value = Math.max(0.4, 1 - 0.2 * e.hintsUsed);
    weighted += value * weight;
    totalWeight += weight;
  });
  const accuracy = weighted / totalWeight;
  // Confidence grows with the amount of correct (independent) evidence; one lucky answer is not mastery.
  const correctIndependent = sorted.filter((e) => e.correct && (e.independent || e.kind === 'review')).length;
  const correctAny = sorted.filter((e) => e.correct).length;
  const confidence = Math.min(1, (correctAny + correctIndependent) / 8);
  return Math.round(100 * accuracy * (0.35 + 0.65 * confidence));
}

export function masteryLevel(score: number, evidenceCount: number): MasteryLevel {
  if (evidenceCount === 0) return 'not-started';
  if (score >= 90) return 'mastered';
  if (score >= 75) return 'proficient';
  if (score >= 55) return 'developing';
  if (score >= 25) return 'practicing';
  return 'introduced';
}

export const MASTERY_LABELS: Record<MasteryLevel, string> = {
  'not-started': 'Nog niet begonnen',
  introduced: 'Geïntroduceerd',
  practicing: 'Aan het oefenen',
  developing: 'In ontwikkeling',
  proficient: 'Bekwaam',
  mastered: 'Beheerst',
};

/** Failures among the most recent pieces of evidence; used to suggest extra practice. */
export function recentFailures(evidence: Evidence[], window = 6): number {
  return [...evidence].sort((a, b) => a.at.localeCompare(b.at)).slice(-window).filter((e) => !e.correct).length;
}

export function needsExtraPractice(evidence: Evidence[]): boolean {
  return recentFailures(evidence) >= 3 && masteryScore(evidence) < 75;
}
