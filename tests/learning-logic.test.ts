import { describe, expect, it } from 'vitest';
import { explainMessage } from '../shared/explain-error';
import { findBracketIssues, codeTokens } from '../shared/luau-lexer';
import { masteryLevel, masteryScore } from '../shared/mastery';
import { initialReview, scheduleNext } from '../shared/review';
import { StudyTracker, streakFromDays } from '../shared/study-tracker';
import { levelFromXp, xpForLevel } from '../shared/xp';

describe('XP levels', () => {
  it('has a monotonic curve', () => {
    expect([1, 2, 3, 4].map(xpForLevel)).toEqual([0, 100, 300, 600]);
    expect(levelFromXp(0).level).toBe(1);
    expect(levelFromXp(99).level).toBe(1);
    expect(levelFromXp(100).level).toBe(2);
    expect(levelFromXp(450).progress).toBeCloseTo(0.5);
  });
});

describe('study tracker', () => {
  it('only counts active time and pauses after idle', () => {
    const t = new StudyTracker(60_000, 0);
    t.activity(0);
    t.tick(30_000);
    expect(t.activeMs).toBe(30_000);
    t.tick(10 * 60_000); // 10 minutes idle: only 60s idle timeout counted
    expect(t.activeMs).toBe(60_000);
    t.activity(20 * 60_000);
    t.tick(20 * 60_000 + 5_000);
    expect(t.activeMs).toBe(65_000);
  });

  it('streak counts consecutive days, today or yesterday', () => {
    const today = new Date(2026, 10, 13, 12);
    expect(streakFromDays(new Set(['2026-11-13', '2026-11-12', '2026-11-11']), today)).toBe(3);
    expect(streakFromDays(new Set(['2026-11-12', '2026-11-11']), today)).toBe(2);
    expect(streakFromDays(new Set(['2026-11-10']), today)).toBe(0);
  });
});

describe('mastery & review', () => {
  const ev = (correct: boolean, i: number, hints = 0) => ({ kind: 'exercise' as const, correct, hintsUsed: hints, independent: true, at: `2026-11-0${i}T00:00:00Z` });
  it('one lucky answer is not mastery', () => {
    expect(masteryLevel(masteryScore([ev(true, 1)]), 1)).not.toBe('mastered');
  });
  it('hints reduce the score', () => {
    const a = masteryScore([1, 2, 3, 4].map((i) => ev(true, i)));
    const b = masteryScore([1, 2, 3, 4].map((i) => ev(true, i, 2)));
    expect(b).toBeLessThan(a);
  });
  it('review intervals grow on success and reset on failure', () => {
    const now = new Date('2026-11-13T00:00:00Z');
    let s = initialReview(now);
    s = scheduleNext(s, 2, now);
    expect(s.intervalDays).toBe(3);
    s = scheduleNext(s, 2, now);
    expect(s.intervalDays).toBeGreaterThan(3);
    s = scheduleNext(s, 0, now);
    expect(s.intervalDays).toBe(1);
  });
});

describe('error assistant (Dutch)', () => {
  it('missing closing bracket', () => {
    const e = explainMessage("syntax error: main.luau:1: Expected ')' (to close '(' at column 6), got <eof>", 'print("Hallo"');
    expect(e.category).toBe('missing-bracket');
    expect(e.what).toMatch(/sluitend haakje/);
    expect(e.line).toBe(1);
    expect(e.column).toBe(6);
  });
  it('nil arithmetic', () => {
    const e = explainMessage('runtime error: main.luau:2: attempt to perform arithmetic (add) on nil and number', 'local coins = nil\nprint(coins + 10)');
    expect(e.category).toBe('nil-arithmetic');
    expect(e.what).toMatch(/niet bestaat/);
    expect(e.line).toBe(2);
  });
  it('missing then points at the if line', () => {
    const code = 'local coins = 100\n\nif coins > 50\n    print("Genoeg coins!")\nend';
    const e = explainMessage("Expected 'then' when parsing if statement, got 'print'", code, 4);
    expect(e.category).toBe('missing-then');
    expect(e.line).toBe(3);
  });
  it('Roblox globals are explained as Studio-only', () => {
    expect(explainMessage("Unknown global 'workspace'", 'workspace.Part').category).toBe('roblox-only');
  });
  it('suggests close names for typos', () => {
    const e = explainMessage("Unknown global 'cions'", 'local coins = 1\nprint(cions)');
    expect(e.hint).toMatch(/coins/);
  });
  it('malformed numbers (2coins) are explained', () => {
    const e = explainMessage('syntax error: main.luau:1: Malformed number', 'local 2coins = 5');
    expect(e.certainty).toBe('zeker');
    expect(e.what).toMatch(/getal/);
  });
  it('unknown messages are labelled honestly', () => {
    const e = explainMessage('something exotic happened', 'x');
    expect(e.certainty).toBe('onbekend');
    expect(e.more).toMatch(/something exotic/);
  });
});

describe('lexer', () => {
  it('ignores strings and comments', () => {
    const t = codeTokens('-- print(\nlocal s = "(("\nprint(s)');
    expect(t.map((x) => x.value)).toEqual(['local', 's', '=', '"(("', 'print', '(', 's', ')']);
  });
  it('finds the unclosed bracket', () => {
    expect(findBracketIssues('print("a"')).toEqual([{ kind: 'unclosed', open: '(', line: 1, column: 6 }]);
  });
});

import { reindent } from '../shared/format';
describe('formatter', () => {
  it('re-indents blocks without changing code', () => {
    const src = 'local coins = 120\nif coins >= 100 then\nprint("ja")\nelseif coins > 50 then\nprint("bijna")\nelse\nprint("nee")\nend\nfor i = 1, 3 do\nlocal f = function()\nprint(i)\nend\nf()\nend';
    expect(reindent(src, '  ')).toBe('local coins = 120\nif coins >= 100 then\n  print("ja")\nelseif coins > 50 then\n  print("bijna")\nelse\n  print("nee")\nend\nfor i = 1, 3 do\n  local f = function()\n    print(i)\n  end\n  f()\nend');
  });
  it('handles tables and strings containing keywords', () => {
    expect(reindent('local t = {\n"end",\n}\nprint("do then")', '  ')).toBe('local t = {\n  "end",\n}\nprint("do then")');
  });
});
