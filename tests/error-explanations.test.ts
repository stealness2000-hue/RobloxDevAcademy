/**
 * Every typical beginner mistake must get an easy Dutch explanation:
 * the real Luau runtime and analyzer produce the messages; none may fall through to "onbekend".
 */
import { afterAll, describe, expect, it } from 'vitest';
import { LuauService } from '../electron/services/luau';
import { explainMessage, explainRunError } from '../shared/explain-error';
import { LUAU_ERROR_CORPUS } from './error-corpus';

const luau = new LuauService();
afterAll(() => luau.dispose());

describe('every real Luau error in the corpus gets an easy explanation', () => {
  for (const code of LUAU_ERROR_CORPUS) {
    it(JSON.stringify(code), async () => {
      const r = await luau.run(code);
      const diags = await luau.check(code);
      const explanations = [
        ...(r.error ? [explainRunError(r.error, code)] : []),
        ...diags.map((d) => explainMessage(d.message, code, d.line, d.column)),
      ];
      for (const e of explanations) {
        expect(e.certainty, `no easy explanation for: ${e.original}`).not.toBe('onbekend');
        expect(e.what.length).toBeGreaterThan(10);
        expect(e.hint.length).toBeGreaterThan(10);
        // easy language: no raw English compiler phrases in the main sentence
        expect(e.what).not.toMatch(/\b(attempt to|expected|got|argument #)\b/i);
      }
    });
  }
});
