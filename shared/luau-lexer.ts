/**
 * A small, forgiving Luau tokenizer.
 *
 * It is NOT a parser. The real Luau compiler/analyzer decides whether code is valid.
 * This lexer is used for syntax-aware lesson checks (e.g. "did the student use `local`?")
 * that must ignore text inside strings and comments, and for the static "explain my code" view.
 */

export type TokenType = 'keyword' | 'name' | 'number' | 'string' | 'comment' | 'symbol' | 'whitespace' | 'unknown';

export interface Token {
  type: TokenType;
  value: string;
  line: number; // 1-based
  column: number; // 1-based
  /** For strings: true when the closing quote was found. */
  closed?: boolean;
}

export const LUAU_KEYWORDS = new Set([
  'and', 'break', 'do', 'else', 'elseif', 'end', 'false', 'for', 'function', 'if', 'in',
  'local', 'nil', 'not', 'or', 'repeat', 'return', 'then', 'true', 'until', 'while', 'continue',
]);

const SYMBOLS = [
  '...', '..=', '//=', '==', '~=', '<=', '>=', '+=', '-=', '*=', '/=', '%=', '^=', '..', '::', '->', '//',
  '+', '-', '*', '/', '%', '^', '#', '<', '>', '=', '(', ')', '{', '}', '[', ']', ';', ':', ',', '.', '?', '|', '&',
];

function longBracketLevel(src: string, i: number): number {
  // Returns the level of a long bracket opening at i ("[[" = 0, "[==[" = 2) or -1.
  if (src[i] !== '[') return -1;
  let j = i + 1;
  let level = 0;
  while (src[j] === '=') {
    level++;
    j++;
  }
  return src[j] === '[' ? level : -1;
}

export function tokenize(src: string, { keepWhitespace = false } = {}): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  let line = 1;
  let col = 1;

  const push = (type: TokenType, value: string, startLine: number, startCol: number, extra?: Partial<Token>) => {
    if (type === 'whitespace' && !keepWhitespace) return;
    tokens.push({ type, value, line: startLine, column: startCol, ...extra });
  };
  const advance = (text: string) => {
    for (const ch of text) {
      if (ch === '\n') {
        line++;
        col = 1;
      } else col++;
    }
  };

  while (i < src.length) {
    const ch = src[i];
    const startLine = line;
    const startCol = col;

    // whitespace
    if (/\s/.test(ch)) {
      let j = i;
      while (j < src.length && /\s/.test(src[j])) j++;
      const v = src.slice(i, j);
      push('whitespace', v, startLine, startCol);
      advance(v);
      i = j;
      continue;
    }

    // comments
    if (ch === '-' && src[i + 1] === '-') {
      const level = longBracketLevel(src, i + 2);
      let j: number;
      if (level >= 0) {
        const close = ']' + '='.repeat(level) + ']';
        const end = src.indexOf(close, i + 4 + level);
        j = end === -1 ? src.length : end + close.length;
      } else {
        j = src.indexOf('\n', i);
        if (j === -1) j = src.length;
      }
      const v = src.slice(i, j);
      push('comment', v, startLine, startCol);
      advance(v);
      i = j;
      continue;
    }

    // long strings
    if (ch === '[') {
      const level = longBracketLevel(src, i);
      if (level >= 0) {
        const close = ']' + '='.repeat(level) + ']';
        const end = src.indexOf(close, i + 2 + level);
        const j = end === -1 ? src.length : end + close.length;
        const v = src.slice(i, j);
        push('string', v, startLine, startCol, { closed: end !== -1 });
        advance(v);
        i = j;
        continue;
      }
    }

    // quoted strings (including `interpolated` strings)
    if (ch === '"' || ch === "'" || ch === '`') {
      let j = i + 1;
      let closed = false;
      while (j < src.length) {
        const c = src[j];
        if (c === '\\') {
          j += 2;
          continue;
        }
        if (c === ch) {
          closed = true;
          j++;
          break;
        }
        if (c === '\n' && ch !== '`') break; // normal strings cannot span lines
        j++;
      }
      const v = src.slice(i, j);
      push('string', v, startLine, startCol, { closed });
      advance(v);
      i = j;
      continue;
    }

    // numbers
    if (/[0-9]/.test(ch) || (ch === '.' && /[0-9]/.test(src[i + 1] ?? ''))) {
      const m = /^(0[xX][0-9a-fA-F_]+|0[bB][01_]+|[0-9_]*\.?[0-9_]+(?:[eE][+-]?[0-9]+)?)/.exec(src.slice(i));
      const v = m ? m[0] : ch;
      push('number', v, startLine, startCol);
      advance(v);
      i += v.length;
      continue;
    }

    // names / keywords
    if (/[A-Za-z_]/.test(ch)) {
      let j = i;
      while (j < src.length && /[A-Za-z0-9_]/.test(src[j])) j++;
      const v = src.slice(i, j);
      push(LUAU_KEYWORDS.has(v) ? 'keyword' : 'name', v, startLine, startCol);
      advance(v);
      i = j;
      continue;
    }

    const sym = SYMBOLS.find((s) => src.startsWith(s, i));
    if (sym) {
      push('symbol', sym, startLine, startCol);
      advance(sym);
      i += sym.length;
      continue;
    }

    push('unknown', ch, startLine, startCol);
    advance(ch);
    i++;
  }
  return tokens;
}

/** Tokens that carry meaning (no comments/whitespace). */
export function codeTokens(src: string): Token[] {
  return tokenize(src).filter((t) => t.type !== 'comment' && t.type !== 'whitespace');
}

/** The text value of a quoted string token, without quotes (escape sequences are kept simple). */
export function stringValue(tok: Token): string {
  const v = tok.value;
  if (v.startsWith('[')) {
    const level = longBracketLevel(v, 0);
    return v.slice(level + 2, v.length - (level + 2));
  }
  const body = tok.closed ? v.slice(1, -1) : v.slice(1);
  return body.replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\(["'\\`])/g, '$1');
}

/** Finds consecutive token sequences like ["local", "score", "="]. */
export function hasSequence(tokens: Token[], seq: string[]): boolean {
  outer: for (let i = 0; i <= tokens.length - seq.length; i++) {
    for (let k = 0; k < seq.length; k++) {
      if (seq[k] !== '*' && tokens[i + k].value !== seq[k]) continue outer;
    }
    return true;
  }
  return false;
}

export interface BracketIssue {
  kind: 'unclosed' | 'unexpected-close';
  open?: string;
  line: number;
  column: number;
}

/** Simple bracket matcher used to give beginners a precise location hint. */
export function findBracketIssues(src: string): BracketIssue[] {
  const pairs: Record<string, string> = { ')': '(', ']': '[', '}': '{' };
  const stack: Token[] = [];
  const issues: BracketIssue[] = [];
  for (const t of codeTokens(src)) {
    if (t.type !== 'symbol') continue;
    if (t.value === '(' || t.value === '[' || t.value === '{') stack.push(t);
    else if (t.value in pairs) {
      const top = stack[stack.length - 1];
      if (top && top.value === pairs[t.value]) stack.pop();
      else issues.push({ kind: 'unexpected-close', open: t.value, line: t.line, column: t.column });
    }
  }
  for (const t of stack) issues.push({ kind: 'unclosed', open: t.value, line: t.line, column: t.column });
  return issues;
}
