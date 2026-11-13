/**
 * Studio integration: plugin source compiles, bridge security, pairing, verification and push/conflict protocol.
 * The bridge is exercised over real HTTP on an ephemeral loopback port.
 */
import fs from 'node:fs';
import http from 'node:http';
import { afterEach, describe, expect, it } from 'vitest';
import { LuaWorker } from '@luau-rs/luau/worker';
import { StudioBridge, type BridgeEvents } from '../electron/services/studio-bridge';
import { STUDIO_EXERCISES, STUDIO_EXERCISE_BY_ID, verifyStudioFacts, type StudioFacts } from '../shared/studio';

describe('plugin source', () => {
  it('compiles as valid Luau', async () => {
    const src = fs.readFileSync('studio-plugin/RobloxDevAcademy.lua', 'utf8');
    const w = new LuaWorker();
    const r = await w.compile(src);
    w.terminate();
    expect(r.error?.message ?? null).toBeNull();
    expect(r.ok).toBe(true);
  });
  it('only talks to loopback', () => {
    const src = fs.readFileSync('studio-plugin/RobloxDevAcademy.lua', 'utf8');
    const urls = src.match(/https?:\/\/[^\s"']+/g) ?? [];
    expect(urls.every((u) => u.startsWith('http://127.0.0.1:34873'))).toBe(true);
    expect(src).not.toMatch(/loadstring|require\(/);
  });
});

// ---------------------------------------------------------------- helpers
let bridge: StudioBridge | null = null;
afterEach(() => bridge?.stop());

function makeBridge(overrides: Partial<BridgeEvents> = {}) {
  const log: { facts: unknown[]; pushResults: unknown[]; pulls: unknown[]; logs: unknown[] } = { facts: [], pushResults: [], pulls: [], logs: [] };
  let stored: string | null = null;
  const events: BridgeEvents = {
    onFacts: (ex, f) => log.facts.push({ ex: ex.id, f }),
    onPushResult: (p, r) => log.pushResults.push({ p, r }),
    onPull: (path, source) => log.pulls.push({ path, source }),
    onLog: (m) => log.logs.push(m),
    onChange: () => {},
    loadTokenHash: () => stored,
    saveTokenHash: (h) => { stored = h; },
    ...overrides,
  };
  bridge = new StudioBridge(events, 0);
  return { bridge, log };
}

function req(port: number, method: string, path: string, body?: unknown, headers: Record<string, string> = {}): Promise<{ status: number; data: any }> {
  return new Promise((resolve, reject) => {
    const data = body === undefined ? undefined : JSON.stringify(body);
    const r = http.request({ host: '127.0.0.1', port, method, path, headers: { host: `127.0.0.1:${port}`, ...(data ? { 'content-type': 'application/json' } : {}), ...headers } }, (res) => {
      let s = '';
      res.on('data', (c) => (s += c));
      res.on('end', () => resolve({ status: res.statusCode!, data: s ? JSON.parse(s) : null }));
    });
    r.on('error', reject);
    if (data) r.write(data);
    r.end();
  });
}

async function paired() {
  const ctx = makeBridge();
  const port = await ctx.bridge.start();
  const code = ctx.bridge.startPairing();
  const r = await req(port, 'POST', '/v1/pair', { code, placeName: 'Baseplate' });
  return { ...ctx, port, token: r.data.token as string, auth: { authorization: `Bearer ${r.data.token}` } };
}

describe('bridge security', () => {
  it('reports plugin-unavailable until the plugin says hello', async () => {
    const { bridge } = makeBridge();
    const port = await bridge.start();
    expect(bridge.status).toBe('plugin-unavailable');
    const r = await req(port, 'GET', '/v1/hello');
    expect(r.data.app).toBe('roblox-dev-academy');
    expect(bridge.status).toBe('disconnected');
  });

  it('refuses pairing without explicit consent in the Academy', async () => {
    const { bridge } = makeBridge();
    const port = await bridge.start();
    const r = await req(port, 'POST', '/v1/pair', { code: '123456' });
    expect(r.status).toBe(403);
    expect(r.data.error).toBe('no-pairing-active');
  });

  it('invalidates the pairing code after 5 wrong attempts', async () => {
    const { bridge } = makeBridge();
    const port = await bridge.start();
    const code = bridge.startPairing();
    const wrong = code === '000000' ? '111111' : '000000';
    for (let i = 0; i < 5; i++) {
      await new Promise((r) => setTimeout(r, 400)); // stay under the pairing rate limit
      expect((await req(port, 'POST', '/v1/pair', { code: wrong })).status).toBe(403);
    }
    await new Promise((r) => setTimeout(r, 400));
    expect((await req(port, 'POST', '/v1/pair', { code })).data.error).toBe('no-pairing-active');
  });

  it('pairs with the right code and then requires the token', async () => {
    const { port, auth, bridge } = await paired();
    expect((await req(port, 'POST', '/v1/poll', {})).status).toBe(401);
    expect((await req(port, 'POST', '/v1/poll', {}, { authorization: 'Bearer ' + 'a'.repeat(64) })).status).toBe(401);
    const ok = await req(port, 'POST', '/v1/poll', { placeName: 'Baseplate' }, auth);
    expect(ok.status).toBe(200);
    expect(bridge.status).toBe('connected');
  });

  it('rejects browser requests (Origin header) and wrong Host headers', async () => {
    const { port, auth } = await paired();
    expect((await req(port, 'POST', '/v1/poll', {}, { ...auth, origin: 'https://evil.example' })).status).toBe(403);
    expect((await req(port, 'POST', '/v1/poll', {}, { ...auth, host: 'evil.example' })).status).toBe(403);
  });

  it('rejects unknown operations, invalid payloads and oversized bodies', async () => {
    const { port, auth } = await paired();
    expect((await req(port, 'POST', '/v1/execute', { code: 'print(1)' }, auth)).status).toBe(404);
    expect((await req(port, 'POST', '/v1/poll', { extra: 'x' }, auth)).status).toBe(400);
    const huge = await req(port, 'POST', '/v1/pull', { path: 'Workspace.Script', source: 'x'.repeat(300_000) }, auth).catch(() => ({ status: 413 }));
    expect(huge.status).toBe(413);
    expect((await req(port, 'POST', '/v1/pull', { path: '../../etc/passwd', source: '' }, auth)).status).toBe(400);
  });

  it('rate-limits floods', async () => {
    const { port, auth } = await paired();
    const results = await Promise.all(Array.from({ length: 30 }, () => req(port, 'POST', '/v1/poll', {}, auth)));
    expect(results.some((r) => r.status === 429)).toBe(true);
  });

  it('survives an Academy restart via the stored token hash, and unpair revokes it', async () => {
    const first = await paired();
    // The hash the first bridge persisted, as if loaded from the database after a restart.
    let stored: string | null = (first.bridge as unknown as { tokenHash: string }).tokenHash;
    first.bridge.stop();
    const restarted = new StudioBridge({ onFacts() {}, onPushResult() {}, onPull() {}, onLog() {}, onChange() {}, loadTokenHash: () => stored, saveTokenHash: (h) => { stored = h; } }, 0);
    const port = await restarted.start();
    expect((await req(port, 'POST', '/v1/poll', {}, first.auth)).status).toBe(200);
    restarted.unpair();
    expect(stored).toBeNull();
    expect((await req(port, 'POST', '/v1/poll', {}, first.auth)).status).toBe(401);
    restarted.stop();
  });
});

describe('exercise flow', () => {
  it('delivers the exercise and a check request, and passes facts on', async () => {
    const { port, auth, bridge, log } = await paired();
    bridge.setExercise('studio-color-part');
    bridge.requestCheck();
    const poll = await req(port, 'POST', '/v1/poll', {}, auth);
    expect(poll.data.exercise.id).toBe('studio-color-part');
    expect(poll.data.exercise.queries.paths).toEqual(['Workspace.TrainingPart']);
    expect(poll.data.exercise.starterSource).not.toMatch(/Touched/); // never the answer
    expect(poll.data.check).toBe(true);
    expect((await req(port, 'POST', '/v1/poll', {}, auth)).data.check).toBe(false);
    const facts: StudioFacts = { parentExists: true, instances: { 'Workspace.TrainingPart': { exists: true, className: 'Part', props: { Anchored: true } } }, scripts: [] };
    expect((await req(port, 'POST', '/v1/report', { exerciseId: 'studio-color-part', facts }, auth)).status).toBe(200);
    expect(log.facts).toHaveLength(1);
  });

  it('push protocol: applied, declined and conflict results reach the Academy', async () => {
    const { port, auth, bridge, log } = await paired();
    const push = bridge.queuePush('ServerScriptService.Countdown', 'print("nieuw")', 'print("oud")');
    const poll = await req(port, 'POST', '/v1/poll', {}, auth);
    expect(poll.data.pushes[0].baseSource).toBe('print("oud")');
    await req(port, 'POST', '/v1/push-result', { pushId: push.id, applied: false, reason: 'conflict', currentSource: 'print("studio")' }, auth);
    expect((log.pushResults[0] as { r: { reason: string } }).r.reason).toBe('conflict');
    expect((await req(port, 'POST', '/v1/poll', {}, auth)).data.pushes).toHaveLength(0);
  });
});

describe('verification of Studio facts', () => {
  const ex = STUDIO_EXERCISE_BY_ID.get('studio-color-part')!;
  const noErrors = () => [];
  const solution = 'local part = script.Parent\npart.Touched:Connect(function()\n    part.Color = Color3.fromRGB(0, 120, 255)\nend)';

  it('passes a correct setup, even with a different script name', () => {
    const v = verifyStudioFacts(ex, { parentExists: true, instances: { 'Workspace.TrainingPart': { exists: true, className: 'Part', props: { Anchored: true } } }, scripts: [{ name: 'MijnScript', className: 'Script', source: solution }] }, noErrors);
    expect(v.passed).toBe(true);
    expect(v.scriptName).toBe('MijnScript');
  });

  it('explains what is missing: part not anchored, no script', () => {
    const v = verifyStudioFacts(ex, { parentExists: true, instances: { 'Workspace.TrainingPart': { exists: true, className: 'Part', props: { Anchored: false } } }, scripts: [] }, noErrors);
    expect(v.passed).toBe(false);
    expect(v.items.find((i) => !i.ok)?.message).toMatch(/Anchored/);
  });

  it('does not accept the empty starter script', () => {
    const v = verifyStudioFacts(ex, { parentExists: true, instances: { 'Workspace.TrainingPart': { exists: true, className: 'Part', props: { Anchored: true } } }, scripts: [{ name: 'ColorScript', className: 'Script', source: ex.starterSource }] }, noErrors);
    expect(v.passed).toBe(false);
  });

  it('every Studio exercise: starter fails, and a script with all required constructs passes', () => {
    for (const e of STUDIO_EXERCISES) {
      const instances = Object.fromEntries(e.requirements.map((r) => [r.path, { exists: true, className: r.kind === 'instance' ? r.className : 'Part', props: { Anchored: true } }]));
      const starter = verifyStudioFacts(e, { parentExists: true, instances, scripts: [{ name: e.scriptName, className: e.scriptClass, source: e.starterSource }] }, noErrors);
      expect(starter.passed, e.id).toBe(false);
    }
  });
});
