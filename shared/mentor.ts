/**
 * Mentor explainer videos: a script is a list of scenes that the in-app player animates
 * (typed code, highlighted lines, captions, optional Dutch voice-over).
 * Scripts are generated offline from the lesson itself; no AI service or account is needed.
 */
import { z } from 'zod';

const say = z.string().min(1).max(600);

export const MentorScene = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('title'), title: z.string().min(1).max(120), subtitle: z.string().max(200).default('') }).strict(),
  z.object({ kind: z.literal('say'), text: say }).strict(),
  z.object({ kind: z.literal('code'), code: z.string().min(1).max(4000), highlight: z.array(z.number().int().min(1).max(200)).max(20).default([]), say, typing: z.boolean().default(true) }).strict(),
  z.object({ kind: z.literal('output'), lines: z.array(z.string().max(300)).max(30), say }).strict(),
  z.object({ kind: z.literal('tip'), text: say }).strict(),
  z.object({ kind: z.literal('recap'), points: z.array(z.string().min(1).max(200)).min(1).max(8) }).strict(),
]);
export type MentorScene = z.infer<typeof MentorScene>;

export const MentorScript = z
  .object({
    lessonId: z.string().max(80),
    source: z.literal('builtin'),
    language: z.enum(['luau', 'cpp', 'java']),
    scenes: z.array(MentorScene).min(2).max(40),
  })
  .strict();
export type MentorScript = z.infer<typeof MentorScript>;

/** Rough reading time for a scene, used when there is no voice-over. */
export function sceneDurationMs(s: MentorScene): number {
  const text = s.kind === 'recap' ? s.points.join(' ') : s.kind === 'title' ? `${s.title} ${s.subtitle}` : s.kind === 'code' || s.kind === 'output' ? s.say : s.text;
  const reading = 1400 + text.length * 55;
  const typing = s.kind === 'code' && s.typing ? Math.min(6000, s.code.length * 28) : 0;
  return Math.max(2600, reading + typing);
}
