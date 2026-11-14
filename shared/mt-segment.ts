/**
 * Prepares text for machine translation and puts it back together afterwards.
 *
 * - Fenced code blocks, inline `code`, {placeholders}, URLs and **bold** markers are swapped for
 *   numbered tokens like {0}, which the M2M100 model copies through unchanged. They are restored
 *   after translation, so code is never translated.
 * - Text is split into lines and sentences: the model translates short pieces much more reliably.
 * - If a translated sentence lost a token, the English sentence is kept (never broken code).
 *
 * No imports on purpose: this file is also used by the build script that pre-translates the app's
 * interface (scripts/build-ui-packs.mjs).
 */

export interface Piece {
  /** Text sent to the model, with tokens such as {0}. Empty when the piece is kept verbatim. */
  source: string;
  tokens: string[];
  /** Verbatim text (code blocks, separators, list markers). */
  keep: string;
}

const PROTECT = /```[\s\S]*?```|`[^`\n]+`|\{\w+\}|https?:\/\/\S+|\*\*/g;
const HAS_WORDS = /\p{L}{2,}/u;

function protect(sentence: string): Piece {
  const tokens: string[] = [];
  const source = sentence.replace(PROTECT, (m) => {
    tokens.push(m);
    return `{${tokens.length - 1}}`;
  });
  const words = source.replace(/\{\d+\}/g, '');
  if (!HAS_WORDS.test(words)) return { source: '', tokens: [], keep: sentence };
  return { source, tokens, keep: '' };
}

/** Splits text into pieces. Joining every piece's text (keep or translated) rebuilds the text. */
export function segment(text: string): Piece[] {
  const out: Piece[] = [];
  const keep = (s: string) => s && out.push({ source: '', tokens: [], keep: s });
  // Fenced code blocks stay as they are.
  const blocks = text.split(/(```[\s\S]*?```)/);
  for (const block of blocks) {
    if (block.startsWith('```')) {
      keep(block);
      continue;
    }
    const lines = block.split(/(\n)/);
    for (const line of lines) {
      if (line === '\n' || !line.trim()) {
        keep(line);
        continue;
      }
      const prefix = /^\s*(?:[-*•>]\s+|\d+[.)]\s+|#{1,6}\s+)?/.exec(line)![0];
      keep(prefix);
      const rest = line.slice(prefix.length);
      // Sentence split: after . ! ? followed by a space, but not inside inline code.
      const parts = rest.split(/(?<=[.!?])(\s+)(?=[^\s])/);
      for (const p of parts) {
        if (!p) continue;
        if (!p.trim()) keep(p);
        else out.push(protect(p));
      }
    }
  }
  return out;
}

/** Puts a model translation back together with its tokens. Returns null if a token went missing. */
export function restore(piece: Piece, translated: string): string | null {
  let ok = true;
  const used = new Set<number>();
  const text = translated.replace(/\{\s*(\d+)\s*\}/g, (m, n: string) => {
    const i = Number(n);
    if (i >= piece.tokens.length) {
      ok = false;
      return m;
    }
    used.add(i);
    return piece.tokens[i];
  });
  if (!ok || used.size !== piece.tokens.length) return null;
  return text;
}

/** Original sentence for a piece (used as fallback). */
export function original(piece: Piece): string {
  return piece.source ? piece.source.replace(/\{(\d+)\}/g, (_m, n: string) => piece.tokens[Number(n)]) : piece.keep;
}

/** Generation settings that gave clean output in our tests (no repetition, no drifting language). */
export function generationOptions(source: string, srcLang: string, tgtLang: string) {
  const words = source.split(/\s+/).length;
  return {
    src_lang: srcLang,
    tgt_lang: tgtLang,
    max_new_tokens: Math.ceil(words * 3) + 8,
    num_beams: 1,
    no_repeat_ngram_size: 3,
    repetition_penalty: 1.2,
  };
}

/** Stable short key for caching a piece's translation. FNV-1a 64-bit as hex; no crypto needed. */
export function pieceKey(source: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < source.length; i++) {
    const c = source.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0;
    h2 = Math.imul(h2 ^ c, 0x5bd1e995) >>> 0;
  }
  return h1.toString(16).padStart(8, '0') + h2.toString(16).padStart(8, '0') + source.length.toString(36);
}
