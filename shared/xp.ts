// XP rules and level curve. XP is a light motivator; mastery is what really measures learning.

export const XP_RULES = {
  firstIndependentSolution: 20,
  lessonComplete: 25,
  review: 10,
  chapterComplete: 100,
  guidedProject: 150,
  independentProject: 300,
  quizCorrect: 5,
} as const;

/** Total XP needed to REACH a level: level 1 = 0, level 2 = 100, level 3 = 300, level 4 = 600 ... */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  const n = level - 1;
  return 50 * n * (n + 1);
}

export interface LevelInfo {
  level: number;
  xpIntoLevel: number;
  xpForNext: number;
  progress: number; // 0-1
}

export function levelFromXp(xp: number): LevelInfo {
  let level = 1;
  while (xpForLevel(level + 1) <= xp) level++;
  const start = xpForLevel(level);
  const next = xpForLevel(level + 1);
  return { level, xpIntoLevel: xp - start, xpForNext: next - start, progress: (xp - start) / (next - start) };
}
