import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { NL } from '../src/i18n/nl';
import { MAIN_NL } from '../shared/i18n-main-nl';
import { fill, setDictionary, t, tn } from '../shared/i18n';
import { LANGUAGES, languageFromLocale } from '../shared/languages';
import { original, restore, segment } from '../shared/mt-segment';
import { CONCEPTS, SKILL_GROUPS } from '../src/curriculum/concepts';
import { ACHIEVEMENTS } from '../shared/achievements';
import { MASTERY_LABELS } from '../shared/mastery';
import { ERROR_CATEGORY_LABELS } from '../shared/explain-error';
import { CONTENT_SETS, KNOWLEDGE, PROJECTS } from '../src/curriculum';

function sourceFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === 'nl' || e.name === 'packs' ? [] : sourceFiles(p);
    return /\.(ts|tsx)$/.test(e.name) ? [p] : [];
  });
}

/** Every literal passed to t('...') / tn(n, '...', '...'). */
function literalKeys(files: string[]): Set<string> {
  const keys = new Set<string>();
  const str = String.raw`'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"`;
  const reT = new RegExp(String.raw`\bt\(\s*(?:${str})`, 'g');
  const reTn = new RegExp(String.raw`\btn\([^,]+,\s*(?:${str})\s*,\s*(?:${str})`, 'g');
  const unescape = (s: string) => s.replace(/\\(['"\\])/g, '$1');
  for (const f of files) {
    // Comments may mention t('...') as an example; only real code counts.
    const src = fs.readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    for (const m of src.matchAll(reT)) keys.add(unescape(m[1] ?? m[2]));
    for (const m of src.matchAll(reTn)) {
      keys.add(unescape(m[1] ?? m[2]));
      keys.add(unescape(m[3] ?? m[4]));
    }
  }
  return keys;
}

describe('interface translations', () => {
  it('every t() text in the renderer and shared code has a Dutch translation', () => {
    const keys = literalKeys([...sourceFiles('src'), ...sourceFiles('shared')]);
    const missing = [...keys].filter((k) => !(k in NL) && !(k in MAIN_NL));
    expect(missing).toEqual([]);
  });

  it('every t() text in the main process has a Dutch translation', () => {
    const keys = literalKeys(sourceFiles('electron'));
    expect([...keys].filter((k) => !(k in MAIN_NL))).toEqual([]);
  });

  it('data-driven labels have Dutch translations', () => {
    const labels = [
      ...CONCEPTS.map((c) => c.name), ...SKILL_GROUPS, ...ACHIEVEMENTS.flatMap((a) => [a.title, a.description]),
      ...Object.values(MASTERY_LABELS), ...Object.values(ERROR_CATEGORY_LABELS),
      ...CONTENT_SETS.en().map((c) => c.level), ...KNOWLEDGE.map((k) => k.where), ...PROJECTS.map((p) => p.difficulty),
    ];
    expect(labels.filter((l) => !(l in NL))).toEqual([]);
  });

  it('Dutch keeps every {placeholder} of the English text', () => {
    const bad = Object.entries(NL).filter(([en, nl]) => {
      const ph = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join();
      return ph(en) !== ph(nl);
    });
    expect(bad).toEqual([]);
  });

  it('t() falls back to English and fills placeholders', () => {
    setDictionary('nl', { 'Hello {name}': 'Hallo {name}' });
    expect(t('Hello {name}', { name: 'Kai' })).toBe('Hallo Kai');
    expect(t('Not in the dictionary')).toBe('Not in the dictionary');
    expect(tn(1, '{n} day', '{n} days')).toBe('1 day');
    expect(fill('{a}-{b}', { a: 1 })).toBe('1-{b}');
    setDictionary('en', {});
  });
});

describe('languages', () => {
  it('offers more than 50 languages with unique codes', () => {
    expect(LANGUAGES.length).toBeGreaterThan(50);
    expect(new Set(LANGUAGES.map((l) => l.code)).size).toBe(LANGUAGES.length);
    expect(LANGUAGES.filter((l) => l.quality === 'human').map((l) => l.code)).toEqual(['en', 'nl']);
  });
  it('maps OS locales to a language', () => {
    expect(languageFromLocale('nl-NL')).toBe('nl');
    expect(languageFromLocale('pt-BR')).toBe('pt');
    expect(languageFromLocale('nb-NO')).toBe('no');
    expect(languageFromLocale('xx-YY')).toBe('en');
    expect(languageFromLocale(undefined)).toBe('en');
  });
});

describe('machine translation segmenting', () => {
  it('protects code, placeholders and bold markers and rebuilds the text', () => {
    const text = 'Use `print()` to show text.\n- It needs **brackets**.\n\n```lua\nprint("hi")\n```\nHello {name}!';
    const pieces = segment(text);
    expect(pieces.map((p) => original(p)).join('')).toBe(text);
    const tr = pieces.find((p) => p.source.includes('show text'))!;
    expect(tr.source).toBe('Use {0} to show text.');
    expect(restore(tr, 'Gebruik {0} om tekst te tonen.')).toBe('Gebruik `print()` om tekst te tonen.');
    expect(restore(tr, 'Gebruik print om tekst te tonen.')).toBeNull(); // token lost -> keep English
    expect(pieces.some((p) => p.keep.includes('print("hi")'))).toBe(true);
  });
  it('keeps pieces without words verbatim', () => {
    expect(segment('`x = 5`').every((p) => !p.source)).toBe(true);
  });
});
