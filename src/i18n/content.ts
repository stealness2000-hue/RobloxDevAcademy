/**
 * Machine translation of lesson content (lessons, practice, knowledge base, projects) for languages
 * without a human translation. Only prose fields are translated; code, starters, solutions, expected
 * output, check sequences and answers that look like code are never touched.
 */
import { useEffect, useState } from 'react';
import { useApp } from '@/store';
import { isMachineLanguage } from '@shared/languages';
import { call } from '@/api';

const TEXT_KEYS = new Set([
  'title', 'objective', 'body', 'prompt', 'hints', 'success', 'after', 'question', 'text', 'feedback', 'summary', 'expected',
  'detail', 'explanation', 'message', 'description', 'simple', 'when', 'mistakes', 'learns', 'setup', 'scriptLocation', 'testing', 'done', 'planned',
]);

/** Strings that are (mostly) code: translating them would break them. */
export function looksLikeCode(s: string): boolean {
  const x = s.trim();
  if (!x) return true;
  if (/\n {2,}\S/.test(x)) return true; // indented code block
  if (/^(local |print\(|for |if |while |return |table\.|function|end\b|-- |#include|int |static |std::|System\.|public )/.test(x)) return true;
  if (/^[\w.:[\]#]+\s*(=|\+=|-=|\(|\[|==|~=)/.test(x) && !/\s[a-z]+\s[a-z]+\s[a-z]+/.test(x.replace(/`[^`]*`/g, ''))) return true;
  if (/^[\d\s.,x=+\-*/%()]+$/.test(x)) return true; // numbers / arithmetic answers
  return false;
}

interface Slot { get(): string; set(v: string): void }

/** Collects every translatable string in a deep copy of `value`. */
function collect(value: unknown, slots: Slot[]): unknown {
  // Arrays outside TEXT_KEYS (expected lines, token sequences, ...) are copied; their objects are walked.
  if (Array.isArray(value)) return value.map((v) => (v && typeof v === 'object' ? collect(v, slots) : v));
  if (!value || typeof value !== 'object') return value;
  const src = value as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  const predict = src.type === 'predict' || src.kind === 'predict';
  for (const [k, v] of Object.entries(src)) {
    if (k === 'options' && predict) {
      // Predicted output must stay exact; only the feedback is prose.
      out[k] = (v as { text: string; feedback?: string }[]).map((o) => {
        const c = { ...o };
        if (c.feedback && !looksLikeCode(c.feedback)) slots.push({ get: () => c.feedback!, set: (x) => (c.feedback = x) });
        return c;
      });
      continue;
    }
    if (TEXT_KEYS.has(k) && typeof v === 'string') {
      out[k] = v;
      if (!looksLikeCode(v)) slots.push({ get: () => out[k] as string, set: (x) => (out[k] = x) });
      continue;
    }
    if (TEXT_KEYS.has(k) && Array.isArray(v) && v.every((x) => typeof x === 'string')) {
      const arr = [...(v as string[])];
      out[k] = arr;
      arr.forEach((s, i) => {
        if (!looksLikeCode(s)) slots.push({ get: () => arr[i], set: (x) => (arr[i] = x) });
      });
      continue;
    }
    out[k] = v && typeof v === 'object' ? collect(v, slots) : v;
  }
  return out;
}

const memo = new Map<string, unknown>();

/** Translates the prose of `value` into `lang`. Resolves with a translated copy (English where the model is missing). */
export async function translateContent<T>(value: T, lang: string, cacheKey: string): Promise<{ value: T; missing: number }> {
  const key = `${lang}:${cacheKey}`;
  if (memo.has(key)) return { value: memo.get(key) as T, missing: 0 };
  const slots: Slot[] = [];
  const copy = collect(value, slots) as T;
  let missing = 0;
  for (let i = 0; i < slots.length; i += 150) {
    const part = slots.slice(i, i + 150);
    const res = await call('mt:translate', { lang, texts: part.map((s) => s.get()) });
    part.forEach((s, j) => s.set(res.texts[j]));
    missing += res.missing;
  }
  if (!missing) memo.set(key, copy);
  return { value: copy, missing };
}

/**
 * React hook: returns `value` unchanged for English and Dutch, and a machine-translated copy for other
 * languages (English first, translated text once ready).
 */
export function useTranslatedContent<T>(value: T, cacheKey: string): { value: T; machine: boolean; loading: boolean; missing: number } {
  const lang = useApp((s) => s.settings.language);
  const machine = isMachineLanguage(lang);
  const [res, setRes] = useState<{ key: string; value: T; missing: number } | null>(null);
  const key = `${lang}:${cacheKey}`;
  useEffect(() => {
    if (!machine || value == null) return;
    let alive = true;
    translateContent(value, lang, cacheKey)
      .then((r) => alive && setRes({ key, value: r.value, missing: r.missing }))
      .catch(() => alive && setRes({ key, value, missing: 1 }));
    return () => {
      alive = false;
    };
  }, [machine, lang, cacheKey, key, value]);
  if (!machine) return { value, machine: false, loading: false, missing: 0 };
  if (res && res.key === key) return { value: res.value, machine: true, loading: false, missing: res.missing };
  return { value, machine: true, loading: true, missing: 0 };
}
