/**
 * END-TO-END CHECK of the offline translator inside the real app.
 *
 *   MODEL_DIR=<folder containing Xenova/m2m100_418M> node tests/e2e/translator.mjs
 *
 * The model (~630 MB) is not downloaded here: point MODEL_DIR at an existing copy. The test copies it
 * into a fresh profile, switches to Spanish and checks that the interface and a lesson are translated
 * on this computer, with code left untouched.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { connect } from '../../scripts/cdp.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const modelDir = process.env.MODEL_DIR;
if (!modelDir || !fs.existsSync(path.join(modelDir, 'Xenova', 'm2m100_418M', 'onnx'))) {
  console.log('SKIP: set MODEL_DIR to a folder that contains Xenova/m2m100_418M');
  process.exit(0);
}
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'lumora-mt-'));
fs.cpSync(path.join(modelDir, 'Xenova'), path.join(profile, 'models', 'Xenova'), { recursive: true });
const PORT = 9335;
let failures = 0;
const check = (c, l) => { console.log(`${c ? '  PASS' : '  FAIL'}  ${l}`); if (!c) failures++; };

const exe = process.env.E2E_EXE;
const proc = spawn(exe ?? path.join(root, 'node_modules/electron/dist/electron.exe'), exe ? [`--remote-debugging-port=${PORT}`] : ['.', `--remote-debugging-port=${PORT}`], { cwd: root, env: { ...process.env, RDA_USER_DATA: profile }, stdio: 'ignore' });
const page = await connect(PORT, 30000);
try {
  await page.waitFor(`!!document.querySelector('.ob-title')`, 20000);
  const st = await page.eval(`window.academy.invoke('mt:status')`);
  check(st.installed, 'Model found in the app data folder');

  const t0 = Date.now();
  const r = await page.eval(`window.academy.invoke('mt:translate', { lang: 'es', texts: ['Use \`print()\` to show text in the Output.', 'You have {n} coins'] })`);
  console.log('  info ', JSON.stringify(r.texts), `${Date.now() - t0} ms`);
  check(r.missing === 0, 'Translated without missing pieces');
  check(r.texts[0].includes('`print()`') && r.texts[0] !== 'Use `print()` to show text in the Output.', 'Sentence translated, inline code kept exactly');
  check(r.texts[1].includes('{n}'), 'Placeholder {n} kept');
  const again = Date.now();
  await page.eval(`window.academy.invoke('mt:translate', { lang: 'es', texts: ['Use \`print()\` to show text in the Output.'] })`);
  check(Date.now() - again < 500, 'Second time comes from the cache');

  // Interface + lesson content in a machine language.
  await page.eval(`window.academy.invoke('settings:set', { language: 'es' })`);
  await page.eval(`window.academy.invoke('profile:completeOnboarding', { experience: 'none', goal: 'obby', dailyGoalMinutes: 15 })`);
  await page.eval('location.reload()').catch(() => {});
  await page.waitFor(`!!document.querySelector('.sidebar')`, 30000);
  // Open lesson 1; its prose is translated in the background.
  await page.eval(`[...document.querySelectorAll('.nav-item')][1].click()`);
  await page.waitFor(`(() => { const r = document.querySelector('.list-row'); if (!r) return false; r.click(); return true; })()`, 20000);
  await page.waitFor(`!!document.querySelector('.machine-badge') && !document.querySelector('.machine-badge .spin')`, 300000);
  const title = await page.eval(`document.querySelector('.lesson-header h1').textContent`);
  console.log('  info  lesson title:', title);
  check(title !== 'What is code?' && title.length > 3, 'Lesson title machine-translated');
  check((await page.eval(`document.querySelector('.machine-badge').innerText`)).length > 10, 'Honest "automatically translated" label shown');
  await page.shot(path.join(root, 'tests/e2e/screenshots/09-machine-translated.png'));
} finally {
  await page.eval('window.close()').catch(() => {});
  page.close();
  setTimeout(() => proc.kill(), 3000);
}
fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5 });
console.log(failures ? `\n${failures} check(s) FAILED` : '\nTranslator checks passed.');
process.exit(failures ? 1 : 0);
