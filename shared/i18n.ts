/**
 * Tiny i18n core shared by the main process and the renderer.
 *
 * English text is the key: `t('Run code')`. A dictionary maps it to another language.
 * Anything without a translation falls back to English, so the app never shows a blank.
 * Placeholders use braces: `t('You have {n} coins', { n: 30 })`.
 */
export type Dict = Record<string, string>;

let current = 'en';
let dict: Dict = {};

export function setDictionary(lang: string, d: Dict) {
  current = lang;
  dict = d;
}

export const currentLanguage = () => current;

export function fill(text: string, vars?: Record<string, string | number>): string {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}

export function t(en: string, vars?: Record<string, string | number>): string {
  return fill(dict[en] ?? en, vars);
}

/** Picks singular or plural English text, then translates it. */
export function tn(n: number, one: string, many: string, vars?: Record<string, string | number>): string {
  return t(n === 1 ? one : many, { n, ...vars });
}
