import { describe, expect, it } from 'vitest';
import { ALL_LESSONS, languageOfLesson } from '../src/curriculum';
import { builtinScript } from '../src/features/mentor/script';
import { MentorScript, sceneDurationMs } from '../shared/mentor';
import { AiMentor } from '../electron/services/ai';

describe('AI Mentor video scripts', () => {
  it('every lesson (Luau, C++ and Java) gets a valid built-in video script', () => {
    for (const l of ALL_LESSONS) {
      const s = builtinScript(l, languageOfLesson(l.id));
      const parsed = MentorScript.safeParse(s);
      expect(parsed.success, `${l.id}: ${parsed.success ? '' : JSON.stringify(parsed.error.issues[0])}`).toBe(true);
      expect(s.scenes[0].kind).toBe('title');
      expect(s.scenes[s.scenes.length - 1].kind).toBe('recap');
      expect(s.scenes.every((sc) => sceneDurationMs(sc) >= 2600)).toBe(true);
    }
  });

  it('never reveals exercise solutions in the built-in script', () => {
    for (const l of ALL_LESSONS) {
      const text = JSON.stringify(builtinScript(l, languageOfLesson(l.id)));
      for (const st of l.steps) if (st.type === 'exercise' && st.solution.length > 25 && st.solution !== st.starter) {
        expect(text.includes(JSON.stringify(st.solution).slice(1, -1)), `${st.id} solution leaked`).toBe(false);
      }
    }
  });

  it('rejects malformed AI output by schema', () => {
    expect(MentorScript.safeParse({ lessonId: 'x', source: 'ai', language: 'luau', scenes: [{ kind: 'say', text: '' }] }).success).toBe(false);
    expect(MentorScript.safeParse({ lessonId: 'x', source: 'ai', language: 'luau', scenes: [{ kind: 'script', text: 'x' }, { kind: 'say', text: 'y' }] }).success).toBe(false);
  });

  it('AI mentor needs a key and refuses to store one without OS encryption', async () => {
    const noCrypto = new AiMentor({ available: () => false, read: () => null, write: () => {} });
    expect(() => noCrypto.setKey('sk-ant-' + 'a'.repeat(30))).toThrow(/versleuteling/);
    await expect(noCrypto.script({ lessonId: 'x', language: 'luau', title: 't', objective: 'o', content: 'c', level: 'short', regenerate: false })).rejects.toThrow(/sleutel/);
    expect(noCrypto.status().configured).toBe(false);
  });
});
