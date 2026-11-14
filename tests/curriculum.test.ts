/**
 * Content validation: every exercise's reference solution must pass its own checks in the REAL Luau runtime,
 * and the starter code (an intentionally incorrect or empty solution) must fail. This catches broken lessons.
 */
import { afterAll, describe, expect, it } from 'vitest';
import { LuauService } from '../electron/services/luau';
import { evaluate } from '../shared/evaluator';
import { CONTENT_SETS, languageOfLesson } from '../src/curriculum';
import { NativeRunner } from '../electron/services/native-runner';
import { PRACTICE as EN_PRACTICE } from '../src/curriculum/practice';
import { PRACTICE as NL_PRACTICE } from '../src/curriculum/nl/practice';
import { CONCEPT_BY_ID } from '../src/curriculum/concepts';

const luau = new LuauService();
const run = (c: string) => luau.run(c);
afterAll(() => luau.dispose());

// C++/Java content is checked with the real toolchains when they are installed (CI has both).
const native = new NativeRunner();
const available = { luau: true, java: (await native.detect('java')).available, cpp: (await native.detect('cpp')).available };
const runFor = (lessonId: string) => {
  const lang = languageOfLesson(lessonId);
  return { lang, run: lang === 'luau' ? run : (c: string) => native.run(lang, c), available: available[lang] };
};

describe.runIf(process.env.REQUIRE_TOOLCHAINS === '1')('build server has the C++ and Java toolchains', () => {
  it('java and g++ are available, so no C++/Java content is skipped', () => {
    expect(available.java, 'Java (JDK) missing on the build server').toBe(true);
    expect(available.cpp, 'g++ missing on the build server').toBe(true);
  });
});

// Both content sets (English base + human Dutch) are checked the same way.
for (const contentLang of ['en', 'nl'] as const) {
const COURSES = CONTENT_SETS[contentLang]();
const ALL_LESSONS = COURSES.flatMap((c) => c.lessons);
const PRACTICE = contentLang === 'en' ? EN_PRACTICE : NL_PRACTICE;
describe(`content: ${contentLang}`, () => {
const exercises = ALL_LESSONS.flatMap((l) => l.steps.filter((s) => s.type === 'exercise').map((s) => ({ lesson: l.id, ex: s as Extract<typeof s, { type: 'exercise' }> })));


describe('curriculum structure', () => {
  it('has unique ids and known concepts', () => {
    const ids = new Set<string>();
    for (const l of ALL_LESSONS) {
      expect(ids.has(l.id)).toBe(false);
      ids.add(l.id);
      for (const s of l.steps) if ('id' in s) {
        expect(ids.has(s.id), s.id).toBe(false);
        ids.add(s.id);
      }
      for (const c of [...l.concepts, ...l.prerequisites]) expect(CONCEPT_BY_ID.has(c), `${l.id}: ${c}`).toBe(true);
    }
    for (const p of PRACTICE) for (const c of p.concepts) expect(CONCEPT_BY_ID.has(c), `${p.id}: ${c}`).toBe(true);
  });

  it('every written lesson has an objective, a summary and something graded', () => {
    for (const l of ALL_LESSONS) {
      expect(l.objective.length).toBeGreaterThan(10);
      expect(l.summary.length).toBeGreaterThan(0);
      expect(l.steps.some((s) => s.type === 'exercise' || s.type === 'quiz' || s.type === 'predict')).toBe(true);
    }
    expect(COURSES[0].lessons[1].title).toBe(contentLang === 'en' ? 'Your first Luau script' : 'Je eerste Luau-script');
  });

  it('every quiz/predict has exactly one correct answer', () => {
    for (const l of ALL_LESSONS) for (const s of l.steps) if (s.type === 'quiz' || s.type === 'predict') expect(s.options.filter((o) => o.correct).length, s.id).toBe(1);
  });
});

describe('lesson exercises: reference solutions pass, starters fail', () => {
  for (const { lesson, ex } of exercises) {
    const r = runFor(lesson);
    it.skipIf(!r.available)(`${lesson} / ${ex.id}`, async () => {
      const good = await evaluate(ex.solution, ex.checks, r.run, r.lang);
      expect(good.passed, `${ex.id} solution failed: ${good.feedback}`).toBe(true);
      const bad = await evaluate(ex.starter, ex.checks, r.run, r.lang);
      expect(bad.passed, `${ex.id} starter should fail`).toBe(false);
    });
  }
});

describe('practice bank', () => {
  for (const p of PRACTICE.filter((p) => p.kind !== 'predict')) {
    it(p.id, async () => {
      expect((await evaluate(p.solution, p.checks, run)).passed, p.id).toBe(true);
      expect((await evaluate(p.starter, p.checks, run)).passed).toBe(false);
    });
  }
  it('predict exercises show what their correct option says', async () => {
    for (const p of PRACTICE.filter((p) => p.kind === 'predict')) {
      const r = await run(p.starter);
      expect(r.output[0]?.text).toBe(p.options!.find((o) => o.correct)!.text);
    }
  });
});

describe('predict steps in lessons match the real output', () => {
  for (const l of ALL_LESSONS) for (const s of l.steps) if (s.type === 'predict' && !/fout|error|Hoeveel|How many|Hoe vaak|eerste regel|first line/i.test(s.question + s.options.find((o) => o.correct)!.text)) {
    const rf = runFor(l.id);
    it.skipIf(!rf.available)(s.id, async () => {
      const r = await rf.run(s.code);
      expect(r.output.map((o) => o.text).join(' ')).toBe(s.options.find((o) => o.correct)!.text);
    });
  }
});

describe('runnable code examples run without errors (except deliberate error demos)', () => {
  for (const l of ALL_LESSONS) l.steps.forEach((s, i) => {
    if (s.type === 'code' && s.runnable && !/fout|error/i.test((s.title ?? '') + (s.after ?? ''))) {
      const rf = runFor(l.id);
      it.skipIf(!rf.available)(`${l.id} step ${i + 1}`, async () => {
        const r = await rf.run(s.code);
        expect(r.ok, r.error?.message).toBe(true);
      });
    }
  });
});
});
}
