/**
 * Free, offline machine translation for the ~85 languages without a human translation.
 *
 * Model: Xenova/m2m100_418M (MIT licence; quantized ONNX, about 640 MB), downloaded once from
 * huggingface.co into the app's own data folder after the student asks for it. Translation runs
 * locally in a separate utility process; no text ever leaves the computer.
 * Every translated sentence is cached in the database, so each sentence is translated only once.
 */
import fs from 'node:fs';
import path from 'node:path';
import { original, pieceKey, restore, segment, type Piece } from '../../shared/mt-segment';

export const MODEL_ID = 'Xenova/m2m100_418M';
/** Files the model needs, with their size in bytes (for the progress bar). */
export const MODEL_FILES: { file: string; bytes: number }[] = [
  { file: 'config.json', bytes: 908 },
  { file: 'generation_config.json', bytes: 233 },
  { file: 'tokenizer_config.json', bytes: 1_813 },
  { file: 'tokenizer.json', bytes: 7_988_527 },
  { file: 'onnx/encoder_model_quantized.onnx', bytes: 287_856_370 },
  { file: 'onnx/decoder_model_merged_quantized.onnx', bytes: 344_128_178 },
];
export const MODEL_BYTES = MODEL_FILES.reduce((a, f) => a + f.bytes, 0);

import type { TranslatorStatus } from '../../shared/ipc';
export type { TranslatorStatus };

export interface TranslationCache {
  get(lang: string, keys: string[]): Map<string, string>;
  save(lang: string, items: { hash: string; text: string }[]): void;
}

export interface TranslatorDeps {
  root: string; // folder that will contain Xenova/m2m100_418M/...
  fetch: (url: string) => Promise<Response>;
  cache: TranslationCache;
  /** Starts the worker process; returns a send function and lets us listen for answers. */
  spawn: (modelRoot: string) => { post(msg: unknown): void; onMessage(cb: (m: { id: number; results?: string[]; error?: string }) => void): void; onExit(cb: () => void): void; kill(): void };
  onStatus: (s: TranslatorStatus) => void;
}

export class Translator {
  private state: TranslatorStatus = { installed: false, downloading: false, progress: 0, error: null, sizeMb: Math.round(MODEL_BYTES / 1e6) };
  private worker: ReturnType<TranslatorDeps['spawn']> | null = null;
  private nextId = 1;
  private waiting = new Map<number, { resolve(r: string[]): void; reject(e: Error): void }>();

  constructor(private deps: TranslatorDeps) {
    this.state.installed = this.isInstalled();
  }

  private dir() {
    return path.join(this.deps.root, ...MODEL_ID.split('/'));
  }

  private isInstalled() {
    return MODEL_FILES.every((f) => fs.existsSync(path.join(this.dir(), f.file)));
  }

  status(): TranslatorStatus {
    return { ...this.state };
  }

  private set(p: Partial<TranslatorStatus>) {
    this.state = { ...this.state, ...p };
    this.deps.onStatus(this.status());
  }

  /** Downloads the model files. Safe to call twice; finished files are skipped. */
  async download(): Promise<TranslatorStatus> {
    if (this.state.downloading || this.isInstalled()) {
      this.set({ installed: this.isInstalled() });
      return this.status();
    }
    this.set({ downloading: true, progress: 0, error: null });
    let done = 0;
    try {
      for (const f of MODEL_FILES) {
        const target = path.join(this.dir(), f.file);
        if (fs.existsSync(target)) {
          done += f.bytes;
          continue;
        }
        fs.mkdirSync(path.dirname(target), { recursive: true });
        const res = await this.deps.fetch(`https://huggingface.co/${MODEL_ID}/resolve/main/${f.file}`);
        if (!res.ok || !res.body) throw new Error(`HTTP ${res.status} for ${f.file}`);
        const part = `${target}.part`;
        const out = fs.createWriteStream(part);
        let got = 0;
        let lastReport = 0;
        const reader = res.body.getReader();
        for (;;) {
          const { done: end, value } = await reader.read();
          if (end) break;
          got += value.byteLength;
          if (!out.write(value)) await new Promise((r) => out.once('drain', r));
          const now = Date.now();
          if (now - lastReport > 250) {
            lastReport = now;
            this.set({ progress: Math.min(0.999, (done + Math.min(got, f.bytes)) / MODEL_BYTES) });
          }
        }
        await new Promise<void>((resolve, reject) => out.end((e?: Error | null) => (e ? reject(e) : resolve())));
        if (got < 100) throw new Error(`${f.file} is empty`);
        fs.renameSync(part, target);
        done += f.bytes;
      }
      this.set({ downloading: false, installed: true, progress: 1 });
    } catch (e) {
      this.set({ downloading: false, installed: false, error: (e as Error).message });
    }
    return this.status();
  }

  remove(): TranslatorStatus {
    this.stop();
    fs.rmSync(this.dir(), { recursive: true, force: true });
    this.set({ installed: false, progress: 0 });
    return this.status();
  }

  stop() {
    this.worker?.kill();
    this.worker = null;
  }

  private ensureWorker() {
    if (this.worker) return this.worker;
    const w = this.deps.spawn(this.deps.root);
    w.onMessage((m) => {
      const job = this.waiting.get(m.id);
      if (!job) return;
      this.waiting.delete(m.id);
      if (m.error || !m.results) job.reject(new Error(m.error ?? 'translation failed'));
      else job.resolve(m.results);
    });
    w.onExit(() => {
      this.worker = null;
      for (const j of this.waiting.values()) j.reject(new Error('The translator stopped unexpectedly.'));
      this.waiting.clear();
    });
    this.worker = w;
    return w;
  }

  private runModel(lang: string, sources: string[]): Promise<string[]> {
    const id = this.nextId++;
    const w = this.ensureWorker();
    return new Promise((resolve, reject) => {
      this.waiting.set(id, { resolve, reject });
      w.post({ type: 'translate', id, lang, sources });
    });
  }

  /**
   * Translates English texts into `lang`. Uses the cache first; only new sentences go to the model.
   * Returns texts in the same order. Without the model, uncached sentences stay English.
   */
  async translate(lang: string, texts: string[]): Promise<{ texts: string[]; missing: number }> {
    const segmented = texts.map((t) => segment(t));
    const all = new Map<string, Piece>();
    for (const pieces of segmented) for (const p of pieces) if (p.source) all.set(pieceKey(p.source), p);
    const known = this.deps.cache.get(lang, [...all.keys()]);
    const todo = [...all.entries()].filter(([k]) => !known.has(k));
    let missing = 0;
    if (todo.length && this.isInstalled()) {
      // Small batches so a long lesson shows progress and other requests can interleave.
      for (let i = 0; i < todo.length; i += 12) {
        const batch = todo.slice(i, i + 12);
        const out = await this.runModel(lang, batch.map(([, p]) => p.source));
        // Short phrases sometimes lose a {0} token. Retry those with number tokens (9101, 9102, …),
        // which the model copies much more reliably, and store the result in {0} form again.
        const retry = batch.map(([, p], j) => ({ p, j })).filter(({ p, j }) => p.tokens.length > 0 && restore(p, out[j]) === null);
        if (retry.length) {
          const again = await this.runModel(lang, retry.map(({ p }) => toNumberTokens(p.source)));
          retry.forEach(({ p, j }, r) => {
            const back = fromNumberTokens(again[r], p.tokens.length);
            if (back !== null && restore(p, back) !== null) out[j] = back;
          });
        }
        const fresh: { hash: string; text: string }[] = [];
        batch.forEach(([k], j) => {
          known.set(k, out[j]);
          fresh.push({ hash: k, text: out[j] });
        });
        this.deps.cache.save(lang, fresh);
      }
    } else missing = todo.length;
    const result = segmented.map((pieces) =>
      pieces
        .map((p) => {
          if (!p.source) return p.keep;
          const tr = known.get(pieceKey(p.source));
          if (tr == null) return original(p);
          return restore(p, tr) ?? original(p);
        })
        .join(''),
    );
    return { texts: result, missing };
  }
}

const NUMBER_TOKEN_BASE = 9101;

/** "{0} and {1}" -> "9101 and 9102". */
export function toNumberTokens(source: string): string {
  return source.replace(/\{(\d+)\}/g, (_m, n: string) => String(NUMBER_TOKEN_BASE + Number(n)));
}

/** Back to "{0}" form; null when a number token is missing or appears twice. */
export function fromNumberTokens(text: string, count: number): string | null {
  const seen = new Set<number>();
  let ok = true;
  const out = text.replace(/\d+/g, (m) => {
    const i = Number(m) - NUMBER_TOKEN_BASE;
    if (i < 0 || i >= count) return m;
    if (seen.has(i)) ok = false;
    seen.add(i);
    return `{${i}}`;
  });
  return ok && seen.size === count ? out : null;
}
