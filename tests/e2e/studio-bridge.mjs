/**
 * E2E test of the Studio integration against the REAL built app.
 * A simulated plugin speaks the exact HTTP protocol of studio-plugin/RobloxDevAcademy.lua.
 * (Roblox Studio itself is not driven here; see PROGRESS.md.)
 *
 *   npm run build && node tests/e2e/studio-bridge.mjs     (E2E_EXE=<packaged exe> to test the installer build)
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { connect } from '../../scripts/cdp.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const shots = path.join(root, 'tests/e2e/screenshots');
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'rda-studio-'));
const exe = process.env.E2E_EXE;
const PORT = 9338;
const proc = spawn(exe ?? path.join(root, 'node_modules/electron/dist/electron.exe'), exe ? [`--remote-debugging-port=${PORT}`] : ['.', `--remote-debugging-port=${PORT}`], { cwd: root, env: { ...process.env, RDA_USER_DATA: profile }, stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let failures = 0;
const check = (c, l) => { console.log(`${c ? '  PASS' : '  FAIL'}  ${l}`); if (!c) failures++; };

const BRIDGE = 'http://127.0.0.1:34873';
let token = null;
async function plugin(method, p, body) {
  const res = await fetch(BRIDGE + p, { method, headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined });
  return { status: res.status, data: await res.json().catch(() => null) };
}

try {
  const page = await connect(PORT, 30000);
  await page.waitFor(`!!document.querySelector('.ob-title')`, 20000);
  await page.eval(`window.academy.invoke('profile:completeOnboarding', { experience: 'none', goal: 'obby', dailyGoalMinutes: 15 })`);
  await page.eval('location.reload()').catch(() => {});
  await page.waitFor(`!!document.querySelector('.sidebar')`, 20000);
  await page.eval(`[...document.querySelectorAll('.nav-item')].find(n => n.textContent.includes('Roblox Studio')).click()`);
  await page.waitFor(`!!document.querySelector('.studio-status')`);

  const st0 = await page.eval(`window.academy.invoke('studio:status')`);
  check(st0.port === 34873 && st0.status !== 'connected', `Bridge listening on 127.0.0.1:34873, not connected (${st0.status})`);

  // Plugin before consent: hello works, pairing refused.
  check((await plugin('GET', '/v1/hello')).data?.app === 'roblox-dev-academy', 'Plugin finds the Academy (hello)');
  check((await plugin('POST', '/v1/pair', { code: '123456' })).status === 403, 'Pairing refused without clicking "Koppelen"');

  // Student clicks Koppelen in the Academy UI.
  await page.eval(`[...document.querySelectorAll('button')].find(b => b.textContent.includes('Koppelen')).click()`);
  await page.waitFor(`!!document.querySelector('.pair-code')`);
  const code = await page.eval(`document.querySelector('.pair-code').textContent`);
  check(/^\d{6}$/.test(code), `Pairing code shown in the Academy (${code})`);
  await page.shot(path.join(shots, 'studio-01-pairing.png'));
  const paired = await plugin('POST', '/v1/pair', { code, placeName: 'Baseplate' });
  token = paired.data?.token;
  check(paired.status === 200 && /^[a-f0-9]{64}$/.test(token ?? ''), 'Plugin paired with the code and received a session token');
  await plugin('POST', '/v1/poll', { placeName: 'Baseplate' });
  await page.waitFor(`document.querySelector('.studio-status .badge')?.textContent === 'Verbonden'`, 8000);
  check(true, 'Academy shows "Verbonden"');

  // Student opens the colour-part exercise from the Academy.
  await page.eval(`[...document.querySelectorAll('.studio-ex')].find(e => e.textContent.includes('Kleurveranderend')).querySelector('button').click()`);
  await sleep(400);
  const poll = await plugin('POST', '/v1/poll', { placeName: 'Baseplate' });
  check(poll.data?.exercise?.id === 'studio-color-part', 'Plugin receives the opened exercise');
  check(!/Touched/.test(poll.data.exercise.starterSource), 'Starter script contains no answer');

  // Incomplete place: part not anchored, starter script only.
  const ex = poll.data.exercise;
  await plugin('POST', '/v1/report', { exerciseId: ex.id, facts: { parentExists: true, instances: { 'Workspace.TrainingPart': { exists: true, className: 'Part', props: { Anchored: false, CanCollide: true, Transparency: 0 } } }, scripts: [{ name: 'ColorScript', className: 'Script', source: ex.starterSource }] } });
  await page.waitFor(`!!document.querySelector('.studio-ex .feedback.bad')`, 8000);
  const badText = await page.eval(`document.querySelector('.studio-ex .feedback.bad').innerText`);
  check(/Anchored/.test(badText), 'Incomplete work: Academy explains that Anchored is off');

  // Correct place.
  const solution = 'local part = script.Parent\n\npart.Touched:Connect(function()\n    part.Color = Color3.fromRGB(0, 120, 255)\nend)';
  await plugin('POST', '/v1/report', { exerciseId: ex.id, facts: { parentExists: true, instances: { 'Workspace.TrainingPart': { exists: true, className: 'Part', props: { Anchored: true, CanCollide: true, Transparency: 0 } } }, scripts: [{ name: 'ColorScript', className: 'Script', source: solution }] } });
  await page.waitFor(`!!document.querySelector('.studio-ex .feedback.ok')`, 8000);
  check(true, 'Correct work in Studio verified by the Academy');
  const stats = await page.eval(`window.academy.invoke('stats:get')`);
  check(stats.codeSubmissions >= 2, 'Studio checks recorded as exercise attempts');
  await page.shot(path.join(shots, 'studio-02-verified.png'));

  // Syntax error in Studio script is caught by the real Luau analyzer.
  await plugin('POST', '/v1/report', { exerciseId: ex.id, facts: { parentExists: true, instances: { 'Workspace.TrainingPart': { exists: true, className: 'Part', props: { Anchored: true } } }, scripts: [{ name: 'ColorScript', className: 'Script', source: solution.replace('then', '').replace('end)', '') }] } });
  await sleep(1200);
  const st1 = await page.eval(`window.academy.invoke('studio:status')`);
  const v1 = st1.verifications.find((v) => v.exerciseId === 'studio-color-part');
  check(v1 && !v1.passed && v1.items.some((i) => !i.ok && /Regel/.test(i.message ?? '')), 'Syntax error in the Studio script is reported with a line number');

  // Output help: errors from Play mode.
  await plugin('POST', '/v1/log', { messages: [{ kind: 'error', text: 'Workspace.TrainingPart.ColorScript:4: attempt to index nil with \'Color\'' }] });
  await page.waitFor(`document.body.innerText.includes('in iets dat niet bestaat')`, 8000);
  check(true, 'Studio Output error explained in Dutch');

  // Sync: pull, push applied, conflict, resolution.
  const pth = 'ServerScriptService.Countdown';
  await plugin('POST', '/v1/pull', { path: pth, source: 'print("v1")' });
  await sleep(500);
  let st = await page.eval(`window.academy.invoke('studio:status')`);
  const synced = st.synced.find((s) => s.path === pth);
  check(!!synced, 'Script from Studio arrives in the Academy as a Playground file');
  await page.eval(`window.academy.invoke('files:save', { id: ${synced.fileId}, content: 'print("v2 uit de Academy")', reason: 'test' })`);
  await page.eval(`window.academy.invoke('studio:push', ${synced.fileId})`);
  let p2 = await plugin('POST', '/v1/poll', {});
  check(p2.data.pushes[0]?.baseSource === 'print("v1")' && p2.data.pushes[0]?.source === 'print("v2 uit de Academy")', 'Push offered to the plugin with the base version');
  await plugin('POST', '/v1/push-result', { pushId: p2.data.pushes[0].id, applied: true, reason: 'applied' });
  // Now both sides change: Academy edits again, Studio edits too, then the plugin sends the Studio version.
  await page.eval(`window.academy.invoke('files:save', { id: ${synced.fileId}, content: 'print("academy edit")', reason: 'test' })`);
  await plugin('POST', '/v1/pull', { path: pth, source: 'print("studio edit")' });
  await page.waitFor(`document.body.innerText.includes('Conflict in ${pth}')`, 8000);
  check(true, 'Conflict detected when both sides changed; nothing overwritten');
  const file = await page.eval(`window.academy.invoke('files:list').then(fs => fs.find(f => f.id === ${synced.fileId}))`);
  check(file.content === 'print("academy edit")', 'Academy version untouched during the conflict');
  await page.eval(`[...document.querySelectorAll('button')].find(b => b.textContent.includes('Vergelijk en kies')).click()`);
  await page.waitFor(`!!document.querySelector('.compare-grid')`);
  await page.shot(path.join(shots, 'studio-03-compare.png'));
  await page.eval(`[...document.querySelectorAll('button')].find(b => b.textContent.includes('Houd Studio-versie')).click()`);
  await sleep(600);
  const after = await page.eval(`window.academy.invoke('files:list').then(fs => fs.find(f => f.id === ${synced.fileId}))`);
  const revs = await page.eval(`window.academy.invoke('files:revisions', ${synced.fileId})`);
  check(after.content === 'print("studio edit")' && revs.some((r) => r.content === 'print("academy edit")'), 'Studio version chosen; Academy version kept in history');

  // Unpair revokes the token.
  await page.eval(`[...document.querySelectorAll('button')].find(b => b.textContent.includes('Ontkoppelen')).click()`);
  await sleep(300);
  check((await plugin('POST', '/v1/poll', {})).status === 401, 'Unpair revokes the plugin token');

  page.close();
} catch (e) {
  console.log('  ERROR', e.message);
  failures++;
} finally {
  proc.kill();
  await sleep(1000);
  try { fs.rmSync(profile, { recursive: true, force: true }); } catch { /* temp */ }
}
console.log(failures ? `\n${failures} check(s) FAILED` : '\nAll Studio bridge checks passed.');
process.exit(failures ? 1 : 0);
