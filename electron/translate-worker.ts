/**
 * Runs in an Electron utility process (its own Node process), so translating never freezes the app.
 * Loads the M2M100 model from the local folder only; never downloads anything itself.
 * Messages in:  { type: 'translate', id, lang, sources: string[] }
 * Messages out: { id, results: string[] } or { id, error }
 */
import { env, pipeline } from '@huggingface/transformers';
import { generationOptions } from '../shared/mt-segment';

type Translator = (text: string, opts: Record<string, unknown>) => Promise<{ translation_text: string }[]>;

const modelRoot = process.argv[2];
env.localModelPath = modelRoot;
env.allowRemoteModels = false;
env.allowLocalModels = true;

let loading: Promise<Translator> | null = null;
const load = () =>
  (loading ??= pipeline('translation', 'Xenova/m2m100_418M', { dtype: 'q8', device: 'cpu' }) as unknown as Promise<Translator>);

interface Job { type: 'translate'; id: number; lang: string; sources: string[] }

const port = (process as unknown as { parentPort: { on(e: 'message', cb: (m: { data: Job }) => void): void; postMessage(m: unknown): void } }).parentPort;
let queue = Promise.resolve();

port.on('message', ({ data }) => {
  queue = queue.then(async () => {
    try {
      const tr = await load();
      const results: string[] = [];
      for (const s of data.sources) {
        const o = await tr(s, generationOptions(s, 'en', data.lang));
        results.push(o[0]?.translation_text ?? '');
      }
      port.postMessage({ id: data.id, results });
    } catch (e) {
      port.postMessage({ id: data.id, error: (e as Error).message });
    }
  });
});
