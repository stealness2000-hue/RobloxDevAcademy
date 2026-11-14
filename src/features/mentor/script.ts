/**
 * Builds a mentor video script from a lesson (offline, no AI). Uses the lesson's own explanations,
 * code examples with their click-through annotations, exercises and summary.
 */
import type { Lesson } from '@/curriculum/types';
import type { MentorScene, MentorScript } from '@shared/mentor';
import { t } from '@shared/i18n';

const plain = (s: string) =>
  s.replace(/\*\*(.+?)\*\*/g, '$1').replace(/^>\s?/gm, '').replace(/^\s*-\s+/gm, '').replace(/^\s*\d+\.\s+/gm, '').replace(/\s+/g, ' ').trim();

/** Splits a text into short spoken chunks of 1–2 sentences. */
function chunks(text: string, max = 220): string[] {
  const sentences = plain(text).match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((s) => s.trim()).filter(Boolean) ?? [];
  const out: string[] = [];
  let cur = '';
  for (const s of sentences) {
    if (cur && (cur + ' ' + s).length > max) {
      out.push(cur);
      cur = s;
    } else cur = cur ? `${cur} ${s}` : s;
  }
  if (cur) out.push(cur);
  return out.map((c) => c.slice(0, 590));
}

function lineOf(code: string, token: string): number | null {
  const lines = code.split('\n');
  const i = lines.findIndex((l) => l.includes(token));
  return i >= 0 ? i + 1 : null;
}

export function builtinScript(lesson: Lesson, language: 'luau' | 'cpp' | 'java'): MentorScript {
  const scenes: MentorScene[] = [{ kind: 'title', title: lesson.title, subtitle: plain(lesson.objective).slice(0, 200) }];
  scenes.push({ kind: 'say', text: t('Hi! I am your mentor. In this lesson: {goal}', { goal: plain(lesson.objective) }).slice(0, 590) });

  for (const step of lesson.steps) {
    if (scenes.length > 34) break;
    switch (step.type) {
      case 'explain':
        for (const c of chunks(step.body)) scenes.push({ kind: 'say', text: c });
        break;
      case 'code': {
        const intro = step.title ? `${plain(step.title)}. ` : '';
        scenes.push({ kind: 'code', code: step.code.slice(0, 3990), highlight: [], typing: true, say: `${intro}${t('Watch along: I will type the code out for you.')}`.slice(0, 590) });
        for (const a of step.annotations ?? []) {
          const line = lineOf(step.code, a.token);
          scenes.push({ kind: 'code', code: step.code.slice(0, 3990), highlight: line ? [line] : [], typing: false, say: plain(a.text).slice(0, 590) });
        }
        // Output scene: the player fills `lines` by really running the code (dropped if it can't run).
        if (step.runnable) scenes.push({ kind: 'output', lines: [], say: t('When you run this, this appears in the Output.') });
        if (step.after) for (const c of chunks(step.after)) scenes.push({ kind: 'say', text: c });
        break;
      }
      case 'quiz':
      case 'predict':
        scenes.push({ kind: 'tip', text: t('Think along: {question} In the lesson you pick the answer yourself.', { question: plain(step.question) }).slice(0, 590) });
        break;
      case 'exercise':
        scenes.push({ kind: 'tip', text: t('Now it is your turn: {task}', { task: plain(step.prompt) }).slice(0, 590) });
        break;
      case 'studio':
        scenes.push({ kind: 'say', text: t('In Roblox Studio you will do this yourself: {title}. Follow the steps in the lesson.', { title: plain(step.title) }).slice(0, 590) });
        break;
      case 'visual':
        if (step.body) scenes.push({ kind: 'say', text: plain(step.body).slice(0, 590) });
        break;
    }
  }
  scenes.push({ kind: 'recap', points: lesson.summary.slice(0, 8).map((s) => plain(s).slice(0, 199)) });
  return { lessonId: lesson.id, source: 'builtin', language, scenes: scenes.slice(0, 40) };
}
