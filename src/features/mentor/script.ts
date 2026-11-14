/**
 * Builds a mentor video script from a lesson (offline, no AI). Uses the lesson's own explanations,
 * code examples with their click-through annotations, exercises and summary.
 */
import type { Lesson } from '@/curriculum/types';
import type { MentorScene, MentorScript } from '@shared/mentor';

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
  scenes.push({ kind: 'say', text: `Hoi! Ik ben je mentor. In deze les: ${plain(lesson.objective)}`.slice(0, 590) });

  for (const step of lesson.steps) {
    if (scenes.length > 34) break;
    switch (step.type) {
      case 'explain':
        for (const c of chunks(step.body)) scenes.push({ kind: 'say', text: c });
        break;
      case 'code': {
        const intro = step.title ? `${plain(step.title)}. ` : '';
        scenes.push({ kind: 'code', code: step.code.slice(0, 3990), highlight: [], typing: true, say: `${intro}Kijk mee: ik typ de code voor je uit.`.slice(0, 590) });
        for (const a of step.annotations ?? []) {
          const line = lineOf(step.code, a.token);
          scenes.push({ kind: 'code', code: step.code.slice(0, 3990), highlight: line ? [line] : [], typing: false, say: plain(a.text).slice(0, 590) });
        }
        // Output scene: the player fills `lines` by really running the code (dropped if it can't run).
        if (step.runnable) scenes.push({ kind: 'output', lines: [], say: 'Als je dit uitvoert, verschijnt dit in de Output.' });
        if (step.after) for (const c of chunks(step.after)) scenes.push({ kind: 'say', text: c });
        break;
      }
      case 'quiz':
      case 'predict':
        scenes.push({ kind: 'tip', text: `Denk even mee: ${plain(step.question)} In de les kies je zelf het antwoord.`.slice(0, 590) });
        break;
      case 'exercise':
        scenes.push({ kind: 'tip', text: `Nu ben jij aan de beurt: ${plain(step.prompt)}`.slice(0, 590) });
        break;
      case 'studio':
        scenes.push({ kind: 'say', text: `In Roblox Studio ga je dit zelf doen: ${plain(step.title)}. Volg de stappen in de les.`.slice(0, 590) });
        break;
      case 'visual':
        if (step.body) scenes.push({ kind: 'say', text: plain(step.body).slice(0, 590) });
        break;
    }
  }
  scenes.push({ kind: 'recap', points: lesson.summary.slice(0, 8).map((s) => plain(s).slice(0, 199)) });
  return { lessonId: lesson.id, source: 'builtin', language, scenes: scenes.slice(0, 40) };
}

/** Plain-text version of a lesson, sent to Claude as context for an AI script. */
export function lessonAsText(lesson: Lesson): string {
  const parts: string[] = [`Les: ${lesson.title}`, `Doel: ${lesson.objective}`];
  for (const s of lesson.steps) {
    if (s.type === 'explain') parts.push(`Uitleg${s.title ? ` (${s.title})` : ''}: ${s.body}`);
    if (s.type === 'code') parts.push(`Codevoorbeeld${s.title ? ` (${s.title})` : ''}:\n${s.code}\n${(s.annotations ?? []).map((a) => `- ${a.token}: ${a.text}`).join('\n')}`);
    if (s.type === 'exercise') parts.push(`Oefening (de student lost dit zelf op, geef het antwoord NIET): ${s.prompt}`);
    if (s.type === 'quiz' || s.type === 'predict') parts.push(`Kennisvraag (geef het antwoord niet): ${s.question}`);
  }
  parts.push(`Samenvatting: ${lesson.summary.join(' | ')}`);
  return parts.join('\n\n').slice(0, 19_000);
}
