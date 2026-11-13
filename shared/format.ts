/**
 * Conservative Luau re-indenter ("Inspringing herstellen").
 * It only changes leading whitespace and trailing spaces, based on block structure.
 * It never reorders or rewrites code. Lines inside multi-line strings/comments are left untouched.
 */
import { tokenize } from './luau-lexer';

const OPEN = new Set(['function', 'then', 'do', 'repeat', '{', '(', '[']);
const CLOSE = new Set(['end', 'until', '}', ')', ']']);

export function reindent(code: string, indentUnit = '    '): string {
  const lines = code.replace(/\r\n/g, '\n').split('\n');
  const toks = tokenize(code).filter((t) => t.type !== 'whitespace');
  const byLine = new Map<number, typeof toks>();
  const frozen = new Set<number>(); // lines that are inside a multi-line token
  for (const t of toks) {
    if (!byLine.has(t.line)) byLine.set(t.line, []);
    byLine.get(t.line)!.push(t);
    const extra = t.value.split('\n').length - 1;
    for (let i = 1; i <= extra; i++) frozen.add(t.line + i);
  }

  let depth = 0;
  const out: string[] = [];
  lines.forEach((raw, idx) => {
    const ln = idx + 1;
    if (frozen.has(ln)) {
      out.push(raw);
      return;
    }
    const lt = (byLine.get(ln) ?? []).filter((t) => t.type !== 'comment' && t.type !== 'string');
    const code = lt.map((t) => t.value);
    let leading = 0;
    for (const v of code) {
      if (CLOSE.has(v)) leading++;
      else if (v === 'elseif' || v === 'else') {
        leading++;
        break;
      } else break;
    }
    let net = 0;
    for (const v of code) {
      if (OPEN.has(v)) net++;
      else if (CLOSE.has(v) || v === 'elseif') net--;
    }
    const trimmed = raw.trim();
    out.push(trimmed ? indentUnit.repeat(Math.max(0, depth - leading)) + trimmed : '');
    depth = Math.max(0, depth + net);
  });
  return out.join('\n');
}
