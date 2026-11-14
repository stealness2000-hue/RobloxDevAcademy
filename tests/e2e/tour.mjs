// Screenshot tour of every page (design review + smoke test). Usage: node tests/e2e/tour.mjs [light]
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { connect } from '../../scripts/cdp.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const shots = path.join(root, 'tests/e2e/screenshots/tour');
fs.mkdirSync(shots, { recursive: true });
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'lumora-tour-'));
const proc = spawn(path.join(root, 'node_modules/electron/dist/electron.exe'), ['.', '--remote-debugging-port=9336'], { cwd: root, env: { ...process.env, RDA_USER_DATA: profile }, stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const p = await connect(9336, 30000);
await p.send('Runtime.enable');
const errors = [];
await p.waitFor(`!!document.querySelector('.ob-title')`, 20000);
// The tour runs in English; TOUR_LANG=nl (or any language code) shows another language.
await p.eval(`window.academy.invoke('settings:set', { language: ${JSON.stringify(process.env.TOUR_LANG ?? 'en')} })`);
await p.eval(`window.academy.invoke('profile:completeOnboarding', { experience: 'none', goal: 'simulator', dailyGoalMinutes: 15 })`);
if (process.argv[2] === 'light') await p.eval(`window.academy.invoke('settings:set', { theme: 'light' })`);
// some real practice data so charts have content
await p.eval(`(async () => {
  const a = (o) => window.academy.invoke('progress:recordAttempt', { lessonId: null, hintsUsed: 0, independent: true, kind: 'exercise', errorCategory: null, code: 'x', ...o });
  for (let i = 0; i < 6; i++) await a({ exerciseId: 'tour-v' + i, concepts: ['variables'], correct: i % 3 !== 0, errorCategory: i % 3 === 0 ? 'nil-arithmetic' : null });
  for (let i = 0; i < 4; i++) await a({ exerciseId: 'tour-s' + i, concepts: ['strings'], correct: i > 1, errorCategory: i <= 1 ? 'unfinished-string' : null });
  await window.academy.invoke('progress:completeLesson', { lessonId: 'c0-what-is-code', courseId: 'course-0', courseLessonIds: [] });
})()`);
await p.eval('location.reload()').catch(() => {});
await sleep(2500);
const pages = ['Dashboard', 'Courses', 'Code Playground', 'Practice', 'Projects', 'Code Explainer', 'Challenges', 'Knowledge Base', 'Statistics', 'Achievements', 'Settings'];
for (const [i, name] of pages.entries()) {
  await p.eval(`[...document.querySelectorAll('.nav-item')].find(n => n.textContent.trim() === ${JSON.stringify(name)}).click()`);
  await sleep(name === 'Code Playground' || name === 'Code Explainer' ? 1800 : 900);
  const crashed = await p.eval(`document.body.innerText.includes('This screen got stuck')`);
  if (crashed) errors.push(`${name}: ${await p.eval(`document.querySelector('.main pre')?.innerText`)}`);
  await p.shot(path.join(shots, `${String(i + 1).padStart(2, '0')}-${name.replace(/\s/g, '-').toLowerCase()}${process.argv[2] ? '-' + process.argv[2] : ''}.png`));
}
console.log(errors.length ? 'CRASHES:\n' + errors.join('\n') : 'No page crashed.');
p.close();
proc.kill();
await sleep(1500);
try { fs.rmSync(profile, { recursive: true, force: true }); } catch { /* still locked: temp folder */ }
process.exit(errors.length ? 1 : 0);
