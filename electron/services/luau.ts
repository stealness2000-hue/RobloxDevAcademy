/**
 * Local Luau execution & analysis.
 *
 * Runtime: @luau-rs/luau (official Luau v739 compiled to WebAssembly), running in a Node worker thread.
 * Isolation (honest summary):
 *  - each run gets a fresh sandboxed Luau state; there is no `io`, `os`, file, network or process access
 *  - memory (32 MB), instruction-interrupt budget and output size are limited inside the worker
 *  - a wall-clock timeout terminates and replaces the worker if code hangs anyway
 *  - this is strong isolation for learning exercises, but no sandbox is a guarantee against every bug
 *
 * Roblox engine APIs (game, workspace, Instance, ...) do NOT exist here; those belong in Roblox Studio.
 */
import type { Diagnostic, OutputLine, RunResult } from '../../shared/types';
import type { CompletionItem } from '../../shared/ipc';

const WARN_MARK = '\u0001W';

/**
 * Prelude placed on LINE 1 (no newline), so error line numbers in the student's code stay correct.
 *  - print joins arguments with a space, like Roblox Studio's Output window does
 *  - warn() exists in Roblox; here it is shown as a yellow warning line
 *  - task.wait() is simulated (it returns immediately); other task functions explain they need Studio
 */
const PRELUDE = [
  'local __print = print;',
  'local function __fmt(...) local n = select("#", ...) local t = table.create(n) for i = 1, n do t[i] = tostring((select(i, ...))) end return table.concat(t, " ") end;',
  'local print = function(...) __print(__fmt(...)) end;',
  `local warn = function(...) __print("${WARN_MARK}" .. __fmt(...)) end;`,
  'local task = table.freeze({ wait = function(s) return if type(s) == "number" then s else 0.03 end,',
  ' spawn = function() error("task.spawn only works in Roblox Studio", 2) end,',
  ' delay = function() error("task.delay only works in Roblox Studio", 2) end,',
  ' defer = function() error("task.defer only works in Roblox Studio", 2) end });',
  ' ',
].join(' ');

const DEFINITIONS = `
declare function warn(...: any): ()
declare task: {
  wait: (seconds: number?) -> number,
  spawn: (f: (...any) -> ...any, ...any) -> (),
  delay: (seconds: number, f: (...any) -> ...any, ...any) -> (),
  defer: (f: (...any) -> ...any, ...any) -> (),
}
`;

/** Lints that are noise for beginners writing tiny exercises. */
const IGNORED_LINTS = new Set(['LocalUnused', 'FunctionUnused', 'ImportUnused', 'UnusedVariable', 'LocalShadow']);

interface LuaWorkerLike {
  execute(code: string, opts?: Record<string, unknown>): Promise<{ ok: boolean; error: { kind: string; message: string } | null; values: unknown[]; outputTruncated: boolean }>;
  addEventListener(type: 'print', fn: (e: { text: string }) => void): void;
  terminate(): void;
}

interface AnalysisWorkerLike {
  setModule(name: string, source: string, kind?: 'module' | 'script'): void;
  addDefinition(name: string, source: string): void;
  setLint(enabled: boolean): void;
  check(name: string, opts?: { signal?: AbortSignal }): Promise<{ diagnostics: Array<{ kind: string; severity: 'error' | 'warning'; location: { begin: { line: number; column: number }; end: { line: number; column: number } }; message: string; code: number | string }> }>;
  autocomplete(name: string, pos: { line: number; column: number }, opts?: { signal?: AbortSignal }): Promise<{ entries: Array<{ label: string; kind: string; type?: string; deprecated: boolean; insertText?: string }> }>;
  terminate(): void;
}

export interface LuauServiceOptions {
  wallTimeoutMs?: number;
  interruptLimit?: number;
  /** Absolute path to the package's dist folder (used to load workers from app.asar.unpacked). */
  distDir?: string;
}

export class LuauService {
  private worker: LuaWorkerLike | null = null;
  private analysis: AnalysisWorkerLike | null = null;
  private queue: Promise<unknown> = Promise.resolve();
  private aQueue: Promise<unknown> = Promise.resolve();
  private sink: OutputLine[] = [];
  private modulePromise: Promise<typeof import('@luau-rs/luau/worker')> | null = null;

  constructor(private opts: LuauServiceOptions = {}) {}

  private async getWorker(): Promise<LuaWorkerLike> {
    if (this.worker) return this.worker;
    this.modulePromise ??= import('@luau-rs/luau/worker');
    const mod = await this.modulePromise;
    const options: Record<string, unknown> = {};
    if (this.opts.distDir) options.workerUrl = new URL(`file:///${this.opts.distDir.replace(/\\/g, '/')}/node-worker.js`);
    const w = new mod.LuaWorker(options) as unknown as LuaWorkerLike;
    w.addEventListener('print', (e) => {
      const text = e.text;
      if (text.startsWith(WARN_MARK)) this.sink.push({ kind: 'warn', text: text.slice(WARN_MARK.length) });
      else this.sink.push({ kind: 'print', text });
    });
    this.worker = w;
    return w;
  }

  /** Executes student code. Calls are serialized; each run uses a fresh sandboxed state. */
  run(code: string): Promise<RunResult> {
    const job = this.queue.then(() => this.runNow(code));
    this.queue = job.catch(() => undefined);
    return job;
  }

  private async runNow(code: string): Promise<RunResult> {
    const started = performance.now();
    const worker = await this.getWorker();
    this.sink = [];
    const timeoutMs = this.opts.wallTimeoutMs ?? 4000;
    let timer: NodeJS.Timeout | undefined;
    const timeout = new Promise<'timeout'>((resolve) => {
      timer = setTimeout(() => resolve('timeout'), timeoutMs);
    });
    try {
      const res = await Promise.race([
        worker.execute(PRELUDE + code, { interruptLimit: this.opts.interruptLimit ?? 2_000_000, outputLimitEvents: 500, outputLimitBytes: 64 * 1024 }),
        timeout,
      ]);
      // Give queued print events a moment to arrive (they are dispatched asynchronously).
      await new Promise((r) => setImmediate(r));
      const output = this.sink;
      if (res === 'timeout') {
        this.resetWorker();
        return { ok: false, output, error: { kind: 'timeout', message: `Execution stopped after ${timeoutMs / 1000} seconds.` }, values: [], outputTruncated: false, durationMs: performance.now() - started };
      }
      const error = res.error ? normalizeError(res.error.kind, res.error.message) : null;
      return { ok: res.ok, output, error, values: res.values ?? [], outputTruncated: res.outputTruncated, durationMs: performance.now() - started };
    } catch (e) {
      this.resetWorker();
      return { ok: false, output: this.sink, error: { kind: 'host', message: String((e as Error)?.message ?? e) }, values: [], outputTruncated: false, durationMs: performance.now() - started };
    } finally {
      clearTimeout(timer);
    }
  }

  private resetWorker() {
    try {
      this.worker?.terminate();
    } catch {
      /* already gone */
    }
    this.worker = null;
  }

  private async getAnalysis(): Promise<AnalysisWorkerLike> {
    if (this.analysis) return this.analysis;
    const mod = await import('@luau-rs/luau/analysis/worker');
    const options: Record<string, unknown> = { mode: 'nonstrict', lint: true };
    if (this.opts.distDir) options.workerUrl = new URL(`file:///${this.opts.distDir.replace(/\\/g, '/')}/node-analysis-worker-entry.js`);
    const a = new mod.AnalysisWorker(options) as unknown as AnalysisWorkerLike;
    a.addDefinition('academy', DEFINITIONS);
    this.analysis = a;
    return a;
  }

  /** Static diagnostics from the real Luau analyzer (syntax, unknown names, type and lint warnings). */
  check(code: string): Promise<Diagnostic[]> {
    const job = this.aQueue.then(async () => {
      const a = await this.getAnalysis();
      a.setModule('main.luau', code, 'script');
      const res = await withTimeout(a.check('main.luau'), 4000);
      if (!res) return [];
      return res.diagnostics
        .filter((d) => !(d.kind === 'lint' && IGNORED_LINTS.has(String(d.code))))
        .map<Diagnostic>((d) => ({
          severity: d.severity,
          source: d.kind === 'lint' ? 'lint' : 'analyzer',
          message: d.message,
          code: d.code,
          line: d.location.begin.line + 1,
          column: d.location.begin.column + 1,
          endLine: d.location.end.line + 1,
          endColumn: d.location.end.column + 1,
        }));
    });
    this.aQueue = job.catch(() => undefined);
    return job;
  }

  /** Real Luau autocomplete (types and scope aware), positions are zero-based. */
  autocomplete(code: string, line: number, column: number): Promise<CompletionItem[]> {
    const job = this.aQueue.then(async () => {
      const a = await this.getAnalysis();
      a.setModule('main.luau', code, 'script');
      const res = await withTimeout(a.autocomplete('main.luau', { line, column }), 2000);
      if (!res) return [];
      return res.entries.slice(0, 200).map((e) => ({ label: e.label, kind: e.kind, detail: e.type, insertText: e.insertText, deprecated: e.deprecated }));
    });
    this.aQueue = job.catch(() => undefined);
    return job;
  }

  dispose() {
    this.resetWorker();
    this.analysis?.terminate();
    this.analysis = null;
  }
}

/**
 * The prelude sits on line 1, so columns reported for line 1 are shifted by its length.
 * Correct them so the student sees positions in their own code.
 */
export function fixPreludeColumns(message: string): string {
  const errLine = Number(/main\.luau:(\d+)/.exec(message)?.[1] ?? 0);
  return message
    .replace(/at line 1, column (\d+)/g, (_, c) => `at line 1, column ${Math.max(1, Number(c) - PRELUDE.length)}`)
    .replace(/at column (\d+)/g, (all, c) => (errLine === 1 ? `at column ${Math.max(1, Number(c) - PRELUDE.length)}` : all));
}

function normalizeError(kind: string, rawMessage: string) {
  const message = fixPreludeColumns(rawMessage);
  const m = /main\.luau:(\d+)/.exec(message);
  const k = (['syntax', 'runtime', 'interrupted', 'memory', 'compile', 'input', 'host', 'conversion'].includes(kind) ? kind : 'runtime') as RunResult['error'] extends infer E ? (E extends { kind: infer K } ? K : never) : never;
  return { kind: k, message, line: m ? Number(m[1]) : undefined };
}

async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T | null> {
  let t: NodeJS.Timeout | undefined;
  const timeout = new Promise<null>((r) => {
    t = setTimeout(() => r(null), ms);
  });
  try {
    return await Promise.race([p, timeout]);
  } finally {
    clearTimeout(t);
  }
}
