/**
 * Runs C++ and Java exercises with the student's locally installed, official toolchains:
 *  - Java: the JDK's single-file source launcher (`java Main.java`, JDK 11+)
 *  - C++: g++ (MinGW-w64 / MSYS2 / w64devkit) or clang++
 *
 * Isolation (honest summary): unlike Luau (a WASM sandbox), this is native code running as the student's
 * own user account. Mitigations: a fresh temporary folder per run (deleted afterwards), no stdin,
 * compile and run timeouts that kill the process, an output limit, and a minimal environment.
 * Only code typed by the student in the Academy is run; nothing is downloaded or run automatically.
 */
import { execFile, spawn } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { OutputLine, RunResult } from '../../shared/types';

export type NativeLanguage = 'cpp' | 'java';

export interface Toolchain {
  language: NativeLanguage;
  available: boolean;
  command: string | null;
  version: string | null;
}

const MAX_OUTPUT = 64 * 1024;

function exists(p: string) {
  try {
    return fs.statSync(p).isFile();
  } catch {
    return false;
  }
}

function which(names: string[]): string | null {
  const dirs = (process.env.PATH ?? '').split(path.delimiter).filter(Boolean);
  for (const n of names) for (const d of dirs) for (const ext of process.platform === 'win32' ? ['.exe', ''] : ['']) {
    const p = path.join(d, n + ext);
    if (exists(p)) return p;
  }
  return null;
}

function globDirs(base: string, pattern: RegExp): string[] {
  try {
    return fs.readdirSync(base).filter((d) => pattern.test(d)).map((d) => path.join(base, d)).sort().reverse();
  } catch {
    return [];
  }
}

function candidatesJava(): string[] {
  const list: string[] = [];
  if (process.env.JAVA_HOME) list.push(path.join(process.env.JAVA_HOME, 'bin', 'java.exe'), path.join(process.env.JAVA_HOME, 'bin', 'java'));
  const fromPath = which(['java']);
  if (fromPath) list.push(fromPath);
  const pf = process.env.ProgramFiles ?? 'C:\\Program Files';
  for (const vendor of ['Eclipse Adoptium', 'Java', 'Microsoft', 'Zulu', 'Amazon Corretto', 'BellSoft'])
    for (const d of globDirs(path.join(pf, vendor), /^(jdk|zulu|openjdk|liberica)/i)) list.push(path.join(d, 'bin', 'java.exe'));
  return [...new Set(list)].filter(exists);
}

function candidatesCpp(): string[] {
  const list: string[] = [];
  const fromPath = which(['g++', 'clang++']);
  if (fromPath) list.push(fromPath);
  for (const d of ['C:\\msys64\\ucrt64\\bin', 'C:\\msys64\\mingw64\\bin', 'C:\\msys64\\clang64\\bin', 'C:\\mingw64\\bin', 'C:\\w64devkit\\bin', 'C:\\ProgramData\\mingw64\\mingw64\\bin', 'C:\\winlibs\\mingw64\\bin'])
    list.push(path.join(d, 'g++.exe'), path.join(d, 'clang++.exe'));
  return [...new Set(list)].filter(exists);
}

function run(cmd: string, args: string[], opts: { cwd?: string; timeoutMs: number }): Promise<{ code: number | null; stdout: string; stderr: string; timedOut: boolean; truncated: boolean }> {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, {
      cwd: opts.cwd,
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
      // Keep PATH (compilers need their own DLLs), drop everything else that isn't needed.
      env: { PATH: process.env.PATH ?? '', SystemRoot: process.env.SystemRoot ?? '', TEMP: os.tmpdir(), TMP: os.tmpdir() },
    });
    let stdout = '';
    let stderr = '';
    let truncated = false;
    let timedOut = false;
    const add = (which: 'out' | 'err', chunk: Buffer) => {
      const text = chunk.toString('utf8');
      if (stdout.length + stderr.length + text.length > MAX_OUTPUT) {
        truncated = true;
        child.kill();
        return;
      }
      if (which === 'out') stdout += text;
      else stderr += text;
    };
    child.stdout.on('data', (c) => add('out', c));
    child.stderr.on('data', (c) => add('err', c));
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill();
      if (process.platform === 'win32' && child.pid) execFile('taskkill', ['/PID', String(child.pid), '/T', '/F'], () => {});
    }, opts.timeoutMs);
    child.on('error', (e) => {
      clearTimeout(timer);
      resolve({ code: -1, stdout, stderr: stderr + String(e.message), timedOut, truncated });
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({ code, stdout, stderr, timedOut, truncated });
    });
  });
}

export class NativeRunner {
  private cache = new Map<NativeLanguage, Toolchain>();

  async detect(language: NativeLanguage, refresh = false): Promise<Toolchain> {
    if (!refresh && this.cache.has(language)) return this.cache.get(language)!;
    let tc: Toolchain = { language, available: false, command: null, version: null };
    const candidates = language === 'java' ? candidatesJava() : candidatesCpp();
    for (const c of candidates) {
      const r = await run(c, language === 'java' ? ['-version'] : ['--version'], { timeoutMs: 8000 });
      const text = (r.stdout + r.stderr).trim();
      if (r.code !== 0) continue;
      if (language === 'java') {
        const m = /version "(\d+)(?:\.(\d+))?/.exec(text);
        const major = m ? Number(m[1] === '1' ? m[2] : m[1]) : 0;
        if (major < 11) continue;
      }
      tc = { language, available: true, command: c, version: text.split('\n')[0].trim() };
      break;
    }
    this.cache.set(language, tc);
    return tc;
  }

  async run(language: NativeLanguage, code: string): Promise<RunResult> {
    const started = performance.now();
    const tc = await this.detect(language);
    const done = (r: Omit<RunResult, 'durationMs' | 'values'>): RunResult => ({ ...r, values: [], durationMs: performance.now() - started });
    if (!tc.available || !tc.command) {
      return done({ ok: false, output: [], outputTruncated: false, error: { kind: 'host', message: language === 'java' ? 'Java (JDK) was not found on this computer.' : 'No C++ compiler (g++) was found on this computer.' } });
    }
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), `rda-${language}-${crypto.randomBytes(4).toString('hex')}-`));
    try {
      if (language === 'java') {
        const file = path.join(dir, 'Main.java');
        fs.writeFileSync(file, code, 'utf8');
        const r = await run(tc.command, ['-XX:TieredStopAtLevel=1', '-Dfile.encoding=UTF-8', '-Dstdout.encoding=UTF-8', '-Dstderr.encoding=UTF-8', 'Main.java'], { cwd: dir, timeoutMs: 15000 });
        return done(toResult('java', r));
      }
      const src = path.join(dir, 'main.cpp');
      const exe = path.join(dir, process.platform === 'win32' ? 'main.exe' : 'main');
      fs.writeFileSync(src, code, 'utf8');
      const c = await run(tc.command, ['-std=c++17', '-O0', '-fdiagnostics-color=never', '-o', exe, 'main.cpp'], { cwd: dir, timeoutMs: 30000 });
      if (c.code !== 0) {
        return done({ ok: false, output: [], outputTruncated: false, error: { kind: c.timedOut ? 'timeout' : 'syntax', message: (c.stderr || c.stdout).trim() || 'Compiling failed.', line: firstLine(c.stderr, 'cpp') } });
      }
      const r = await run(exe, [], { cwd: dir, timeoutMs: 5000 });
      return done(toResult('cpp', r));
    } finally {
      setTimeout(() => fs.rmSync(dir, { recursive: true, force: true }), 500).unref?.();
    }
  }
}

function firstLine(stderr: string, language: NativeLanguage): number | undefined {
  const m = language === 'java' ? /Main\.java:(\d+):/.exec(stderr) : /main\.cpp:(\d+):\d+:/.exec(stderr);
  return m ? Number(m[1]) : undefined;
}

function lines(text: string, kind: OutputLine['kind']): OutputLine[] {
  const t = text.replace(/\r\n/g, '\n').replace(/\n$/, '');
  return t ? t.split('\n').map((l) => ({ kind, text: l })) : [];
}

function toResult(language: NativeLanguage, r: { code: number | null; stdout: string; stderr: string; timedOut: boolean; truncated: boolean }): Omit<RunResult, 'durationMs' | 'values'> {
  const output = lines(r.stdout, 'print');
  if (r.timedOut) return { ok: false, output, outputTruncated: r.truncated, error: { kind: 'timeout', message: 'Your program kept running too long and was stopped.' } };
  if (r.truncated) return { ok: false, output, outputTruncated: true, error: { kind: 'interrupted', message: 'Your program showed too much text and was stopped (probably an infinite loop).' } };
  if (r.code === 0) return { ok: true, output, outputTruncated: false, error: null };
  const err = r.stderr.trim();
  // Java source launcher: compile errors look like "Main.java:3: error: ..."; runtime errors start with "Exception in thread".
  const compile = language === 'java' && /Main\.java:\d+: error:/.test(err);
  return { ok: false, output, outputTruncated: false, error: { kind: compile ? 'syntax' : 'runtime', message: err || `Program stopped with exit code ${r.code}.`, line: compile ? firstLine(err, 'java') : runtimeLine(err) } };
}

function runtimeLine(err: string): number | undefined {
  const m = /Main\.java:(\d+)\)/.exec(err);
  return m ? Number(m[1]) : undefined;
}
