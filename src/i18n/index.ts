/**
 * Interface language for the renderer.
 *
 * - English: the texts in the code (t('...') keys).
 * - Dutch: written by people (src/i18n/nl/*).
 * - Every other language: machine-translated on this computer by the offline M2M100 model.
 *   A pre-translated pack (src/i18n/packs/<code>.json) is used when the build has one; anything
 *   still missing is translated on demand and cached in the database, so it happens only once.
 *
 * The full list of interface texts is the set of keys of the Dutch dictionary (a test makes sure
 * every t('...') in the code has a Dutch entry), so we always know what to translate.
 */
import { currentLanguage, setDictionary, type Dict } from '@shared/i18n';
import { LANGUAGE_BY_CODE, isMachineLanguage } from '@shared/languages';
import { setContentLanguage } from '@/curriculum';
import { NL } from './nl';
import { call } from '@/api';

export { t, tn } from '@shared/i18n';

const packs = import.meta.glob<Dict>('./packs/*.json', { import: 'default' });

/** All English interface texts. */
export const UI_KEYS = Object.keys(NL);

export interface LanguageState {
  code: string;
  machine: boolean;
  /** Interface texts still in English (model not installed or translation in progress). */
  missing: number;
}

let state: LanguageState = { code: 'en', machine: false, missing: 0 };
export const languageState = () => state;

async function loadPack(code: string): Promise<Dict> {
  const loader = packs[`./packs/${code}.json`];
  if (!loader) return {};
  try {
    return await loader();
  } catch {
    return {};
  }
}

/**
 * Switches the interface and lesson content to `code`. For machine languages it first shows the
 * pack (instant), then fills gaps from the local translator in the background, calling onProgress
 * so the app can re-render as texts arrive.
 */
export async function applyLanguage(code: string, onProgress?: (s: LanguageState) => void): Promise<LanguageState> {
  const lang = LANGUAGE_BY_CODE.get(code) ?? LANGUAGE_BY_CODE.get('en')!;
  document.documentElement.lang = lang.code;
  document.documentElement.dir = lang.rtl ? 'rtl' : 'ltr';
  setContentLanguage(lang.code);

  if (lang.code === 'en') {
    setDictionary('en', {});
    return (state = { code: 'en', machine: false, missing: 0 });
  }
  if (lang.code === 'nl') {
    setDictionary('nl', NL);
    return (state = { code: 'nl', machine: false, missing: 0 });
  }

  const dict: Dict = { ...(await loadPack(lang.code)) };
  setDictionary(lang.code, dict);
  const todo = UI_KEYS.filter((k) => !(k in dict));
  state = { code: lang.code, machine: true, missing: todo.length };
  if (todo.length) void fillFromTranslator(lang.code, dict, todo, onProgress);
  return state;
}

async function fillFromTranslator(code: string, dict: Dict, todo: string[], onProgress?: (s: LanguageState) => void) {
  // Short texts first: menus and buttons appear translated quickly.
  const queue = [...todo].sort((a, b) => a.length - b.length);
  for (let i = 0; i < queue.length; i += 40) {
    if (state.code !== code) return; // the student switched language meanwhile
    const batch = queue.slice(i, i + 40);
    let res: { texts: string[]; missing: number };
    try {
      res = await call('mt:translate', { lang: code, texts: batch });
    } catch {
      return;
    }
    if (state.code !== code) return;
    if (res.missing > 0) {
      // Model not installed: keep English for the rest. The Settings page offers the download.
      state = { ...state, missing: queue.length - i };
      onProgress?.(state);
      return;
    }
    batch.forEach((k, j) => (dict[k] = res.texts[j]));
    setDictionary(code, dict);
    state = { ...state, missing: Math.max(0, queue.length - i - batch.length) };
    onProgress?.(state);
  }
}

/** True when lesson text for this language comes from the machine translator. */
export const isMachine = (code: string) => isMachineLanguage(code);

/** BCP-47 locale of the current language, for dates and numbers. */
export const locale = () => LANGUAGE_BY_CODE.get(currentLanguage())?.locale ?? 'en-US';
