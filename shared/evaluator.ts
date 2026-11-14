/**
 * Exercise evaluator.
 *
 * Validates student code by BEHAVIOUR wherever possible:
 *  - the code is executed in the real Luau runtime (sandboxed worker)
 *  - printed output is compared line by line
 *  - values and small test harnesses are evaluated by appending Luau code to the student's program
 * Token checks (`uses`/`notUses`) are only used when a lesson explicitly teaches a construct,
 * and they ignore text inside strings and comments.
 */
import { codeTokens, hasSequence, stringValue, tokenize } from './luau-lexer';
import { explainRunError, type Explanation, type ErrorCategory } from './explain-error';
import { explainNative } from './explain-native';
import type { RunResult } from './types';

export type Check =
  | { kind: 'runs'; message?: string }
  | { kind: 'output'; lines: string[]; mode?: 'exact' | 'contains'; caseSensitive?: boolean; message: string }
  | { kind: 'outputMatches'; pattern: string; flags?: string; message: string }
  | { kind: 'outputCount'; min?: number; max?: number; message: string }
  | { kind: 'value'; expr: string; equals?: string | number | boolean | null; type?: 'string' | 'number' | 'boolean' | 'nil' | 'table' | 'function'; message: string }
  | { kind: 'test'; harness: string; message: string }
  | { kind: 'uses'; sequence: string[]; message: string }
  | { kind: 'notUses'; sequence: string[]; message: string }
  | { kind: 'stringLiteral'; contains: string; caseSensitive?: boolean; message: string }
  | { kind: 'hasComment'; message: string }
  | { kind: 'warns'; message: string }
  /**
   * Behaviour with other input values: the line `replace` (which the student must keep) is swapped for
   * `with` and the program is run again; its output must equal `lines`. This proves the code really
   * decides/loops instead of printing a hard-coded answer.
   */
  | { kind: 'variants'; replace: string; cases: { with: string; lines: string[] }[]; message: string };

export interface CheckResult {
  check: Check;
  passed: boolean;
  message: string;
}

export interface EvaluationResult {
  passed: boolean;
  results: CheckResult[];
  /** First failing check's message (a hint, never the solution). */
  feedback: string | null;
  run: RunResult;
  explanation: Explanation | null;
  errorCategory: ErrorCategory | null;
}

export type Runner = (code: string) => Promise<RunResult>;

const norm = (s: string, cs = true) => {
  const t = s.replace(/\r/g, '').trim();
  return cs ? t : t.toLowerCase();
};

function luauEq(a: unknown, b: unknown): boolean {
  if (typeof a === 'number' && typeof b === 'number') return Math.abs(a - b) < 1e-9;
  return a === b;
}

function luauTypeOf(v: unknown): string {
  if (v === null || v === undefined) return 'nil';
  if (typeof v === 'string') return 'string';
  if (typeof v === 'number' || typeof v === 'bigint') return 'number';
  if (typeof v === 'boolean') return 'boolean';
  return 'table';
}

/** Appending code after a top-level `return` is invalid; detect it so we can explain instead of failing silently. */
function endsWithReturn(code: string): boolean {
  const toks = codeTokens(code);
  // crude but adequate: a `return` at nesting depth 0
  let depth = 0;
  for (const t of toks) {
    if (t.type !== 'keyword') continue;
    if (['function', 'do', 'then', 'repeat'].includes(t.value)) depth++;
    else if (t.value === 'end' || t.value === 'until') depth = Math.max(0, depth - 1);
    else if (t.value === 'elseif') depth = Math.max(0, depth - 1);
    else if (t.value === 'return' && depth === 0) return true;
  }
  return false;
}

export type CodeLanguage = 'luau' | 'cpp' | 'java';

export async function evaluate(code: string, checks: Check[], run: Runner, language: CodeLanguage = 'luau'): Promise<EvaluationResult> {
  const base = await run(code);
  const results: CheckResult[] = [];
  const tokens = codeTokens(code);
  const printed = base.output.filter((o) => o.kind === 'print').map((o) => o.text);
  const warned = base.output.filter((o) => o.kind === 'warn').map((o) => o.text);

  // Any runtime/syntax error fails the exercise; the error assistant explains it.
  if (!base.ok && base.error) {
    const explanation = language === 'luau' ? explainRunError(base.error, code) : explainNative(base.error.message, language);
    return {
      passed: false,
      results: [],
      feedback: explanation.what,
      run: base,
      explanation,
      errorCategory: explanation.category,
    };
  }

  for (const check of checks) {
    let passed = false;
    switch (check.kind) {
      case 'runs':
        passed = base.ok;
        break;
      case 'output': {
        const cs = check.caseSensitive ?? true;
        const got = printed.flatMap((p) => p.split('\n')).map((p) => norm(p, cs));
        const want = check.lines.map((l) => norm(l, cs));
        if ((check.mode ?? 'exact') === 'exact') passed = got.length === want.length && got.every((g, i) => g === want[i]);
        else passed = want.every((w) => got.includes(w));
        break;
      }
      case 'outputMatches': {
        const re = new RegExp(check.pattern, check.flags ?? '');
        passed = printed.some((p) => re.test(p));
        break;
      }
      case 'outputCount': {
        const n = printed.length;
        passed = (check.min === undefined || n >= check.min) && (check.max === undefined || n <= check.max);
        break;
      }
      case 'warns':
        passed = warned.length > 0;
        break;
      case 'value': {
        if (endsWithReturn(code)) {
          passed = false;
          results.push({ check, passed, message: 'Haal de `return` aan het einde van je code weg; deze oefening controleert je variabelen zelf.' });
          continue;
        }
        const r = await run(`${code}\nreturn (${check.expr})`);
        if (!r.ok) passed = false;
        else {
          const v = r.values[0];
          passed = true;
          if (check.type) passed = luauTypeOf(v) === check.type;
          if (passed && check.equals !== undefined) passed = check.equals === null ? v == null : luauEq(v, check.equals);
        }
        break;
      }
      case 'test': {
        if (endsWithReturn(code)) {
          results.push({ check, passed: false, message: 'Haal de `return` aan het einde van je code weg; deze oefening test je code zelf.' });
          continue;
        }
        const r = await run(`${code}\n${check.harness}`);
        const v = r.values[0];
        passed = r.ok && v === true;
        if (r.ok && typeof v === 'string') {
          results.push({ check, passed: false, message: v });
          continue;
        }
        break;
      }
      case 'variants': {
        if (!code.includes(check.replace)) {
          results.push({ check, passed: false, message: `Laat de regel \`${check.replace}\` precies zo staan: de controle verandert die waarde om je code met andere getallen te testen.` });
          continue;
        }
        passed = true;
        for (const c of check.cases) {
          const r = await run(code.replace(check.replace, c.with));
          const got = r.output.filter((o) => o.kind === 'print').flatMap((o) => o.text.split('\n')).map((t) => norm(t));
          if (!r.ok || got.length !== c.lines.length || got.some((g, i) => g !== norm(c.lines[i]))) {
            passed = false;
            results.push({ check, passed: false, message: `${check.message} (Getest met \`${c.with}\`: verwacht ${c.lines.map((l) => `"${l}"`).join(', ') || 'geen output'}, maar je programma liet ${got.length ? got.map((l) => `"${l}"`).join(', ') : 'niets'} zien.)` });
            break;
          }
        }
        if (!passed) continue;
        break;
      }
      case 'uses':
        passed = hasSequence(tokens, check.sequence);
        break;
      case 'notUses':
        passed = !hasSequence(tokens, check.sequence);
        break;
      case 'stringLiteral': {
        const cs = check.caseSensitive ?? true;
        const needle = cs ? check.contains : check.contains.toLowerCase();
        passed = tokens.some((t) => t.type === 'string' && (cs ? stringValue(t) : stringValue(t).toLowerCase()).includes(needle));
        break;
      }
      case 'hasComment':
        passed = codeTokensIncludeComment(code);
        break;
    }
    results.push({ check, passed, message: passed ? '' : (check as { message?: string }).message ?? 'Nog niet helemaal goed.' });
  }

  const firstFail = results.find((r) => !r.passed) ?? null;
  return {
    passed: !firstFail,
    results,
    feedback: firstFail?.message ?? null,
    run: base,
    explanation: null,
    errorCategory: firstFail ? 'other' : null,
  };
}

function codeTokensIncludeComment(code: string): boolean {
  return tokenize(code).some((t) => t.type === 'comment');
}
