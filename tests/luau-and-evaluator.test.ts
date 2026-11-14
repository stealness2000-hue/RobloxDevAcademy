import { afterAll, describe, expect, it } from 'vitest';
import { LuauService } from '../electron/services/luau';
import { evaluate, type Check } from '../shared/evaluator';

const luau = new LuauService({ wallTimeoutMs: 3000 });
const run = (code: string) => luau.run(code);
afterAll(() => luau.dispose());

describe('Luau runtime', () => {
  it('runs print and keeps Roblox-style spacing', async () => {
    const r = await run('print("Hallo", "Roblox", 5)');
    expect(r.ok).toBe(true);
    expect(r.output).toEqual([{ kind: 'print', text: 'Hallo Roblox 5' }]);
  });

  it('supports Luau-only syntax (compound ops, interpolation, continue)', async () => {
    const r = await run('local n = 1\nn += 2\nfor i = 1, 3 do if i == 2 then continue end print(`{n}-{i}`) end');
    expect(r.ok).toBe(true);
    expect(r.output.map((o) => o.text)).toEqual(['3-1', '3-3']);
  });

  it('reports warn() as a warning line', async () => {
    const r = await run('warn("Pas op")');
    expect(r.output).toEqual([{ kind: 'warn', text: 'Pas op' }]);
  });

  it('keeps line numbers correct despite the prelude', async () => {
    const r = await run('local a = 1\nlocal b = nil\nprint(a + b)');
    expect(r.ok).toBe(false);
    expect(r.error?.line).toBe(3);
  });

  it('reports columns in the student code, not shifted by the prelude', async () => {
    const r = await run('print("Hallo"');
    expect(r.error?.message).toContain("at column 6");
    const r2 = await run('local x = 1\nprint("a"');
    expect(r2.error?.message).toContain("at column 6");
  });

  it('stops infinite loops', async () => {
    const r = await run('while true do end');
    expect(r.ok).toBe(false);
    expect(['interrupted', 'timeout']).toContain(r.error?.kind);
  });

  it('has no access to os/io', async () => {
    const r = await run('print(os, io)');
    expect(r.output[0].text).toBe('nil nil');
  });

  it('analyzer finds a missing then', async () => {
    const d = await luau.check('local coins = 100\nif coins > 50\n  print("x")\nend');
    expect(d.some((x) => /then/.test(x.message))).toBe(true);
  });

  it('analyzer knows warn and flags Roblox globals', async () => {
    const d = await luau.check('warn("x")\nlocal p = Instance.new("Part")');
    expect(d.some((x) => /warn/.test(x.message))).toBe(false);
    expect(d.some((x) => /Unknown global 'Instance'/.test(x.message))).toBe(true);
  });

  it('autocomplete returns real scope-aware entries', async () => {
    const items = await luau.autocomplete('local coins = 5\nco', 1, 2);
    expect(items.some((i) => i.label === 'coins')).toBe(true);
  });
});

describe('Evaluator', () => {
  const firstLesson: Check[] = [
    { kind: 'output', lines: ['Ik leer Luau!'], message: 'Je programma moet precies "Ik leer Luau!" laten zien.' },
    { kind: 'uses', sequence: ['print', '('], message: 'Gebruik print().' },
  ];

  it('accepts the first-lesson answer', async () => {
    const r = await evaluate('print("Ik leer Luau!")', firstLesson, run);
    expect(r.passed).toBe(true);
  });

  it('accepts single quotes too (multiple correct approaches)', async () => {
    const r = await evaluate("print('Ik leer Luau!')", firstLesson, run);
    expect(r.passed).toBe(true);
  });

  it('rejects wrong text with a hint, not the answer', async () => {
    const r = await evaluate('print("Hallo Roblox!")', firstLesson, run);
    expect(r.passed).toBe(false);
    expect(r.feedback).toMatch(/Ik leer Luau/);
  });

  it('explains a syntax error instead of failing silently', async () => {
    const r = await evaluate('print("Ik leer Luau!"', firstLesson, run);
    expect(r.passed).toBe(false);
    expect(r.errorCategory).toBe('missing-bracket');
  });

  const variableChecks: Check[] = [
    { kind: 'uses', sequence: ['local', 'score'], message: 'Maak score met local.' },
    { kind: 'value', expr: 'score', equals: 50, message: 'score moet 50 zijn.' },
  ];

  it('validates values by behaviour: 25 + 25 is also 50', async () => {
    expect((await evaluate('local score = 50', variableChecks, run)).passed).toBe(true);
    expect((await evaluate('local score = 25 + 25', variableChecks, run)).passed).toBe(true);
    expect((await evaluate('local score = 40', variableChecks, run)).passed).toBe(false);
  });

  it('does not count keywords inside strings or comments', async () => {
    const r = await evaluate('-- local score = 50\nprint("local score")', variableChecks, run);
    expect(r.passed).toBe(false);
  });

  it('variants: rejects hard-coded answers, accepts real conditions', async () => {
    const checks: Check[] = [
      { kind: 'output', lines: ['Kopen!'], message: 'x' },
      { kind: 'variants', replace: 'local coins = 120', cases: [{ with: 'local coins = 50', lines: ['Te weinig'] }], message: 'Werkt niet voor andere waarden.' },
    ];
    const real = 'local coins = 120\nif coins >= 100 then print("Kopen!") else print("Te weinig") end';
    expect((await evaluate(real, checks, run)).passed).toBe(true);
    const fake = await evaluate('local coins = 120\nprint("Kopen!")', checks, run);
    expect(fake.passed).toBe(false);
    expect(fake.feedback).toContain('local coins = 50');
    const changedLine = await evaluate('local coins = 121\nif coins >= 100 then print("Kopen!") end', checks, run);
    expect(changedLine.feedback).toContain('exactly as it is');
  });

  it('runs test harnesses for functions', async () => {
    const checks: Check[] = [{ kind: 'test', harness: 'return add(2, 3) == 5 or "add(2, 3) moet 5 geven"', message: 'x' }];
    expect((await evaluate('local function add(a, b) return a + b end', checks, run)).passed).toBe(true);
    const bad = await evaluate('local function add(a, b) return a - b end', checks, run);
    expect(bad.passed).toBe(false);
    expect(bad.feedback).toBe('add(2, 3) moet 5 geven');
  });
});
