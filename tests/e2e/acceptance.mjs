/**
 * END-TO-END ACCEPTANCE TEST against the REAL built Electron app.
 *
 *   npm run build && node tests/e2e/acceptance.mjs
 *
 * Flow: fresh profile → onboarding (English) → lesson 1 → lesson 2 "Your first Luau script":
 * type print("I'm learning Luau!") in the editor → Run Code → output + success message →
 * finish lesson → XP awarded once → quit → relaunch → verify everything persisted →
 * paid lesson shows the lock screen → switch to Dutch (human translation) and back.
 * Screenshots are written to tests/e2e/screenshots/.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { connect } from '../../scripts/cdp.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const shots = path.join(root, 'tests/e2e/screenshots');
fs.mkdirSync(shots, { recursive: true });
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'lumora-e2e-'));
const electron = path.join(root, 'node_modules/electron/dist/electron.exe');
const PORT = 9334;
let failures = 0;
const check = (cond, label) => {
  console.log(`${cond ? '  PASS' : '  FAIL'}  ${label}`);
  if (!cond) failures++;
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function launch() {
  // E2E_EXE: test the PACKAGED app (e.g. release/win-unpacked/Lumora Academy.exe) instead of the dev build.
  const exe = process.env.E2E_EXE;
  const proc = spawn(exe ?? electron, exe ? [`--remote-debugging-port=${PORT}`] : ['.', `--remote-debugging-port=${PORT}`], { cwd: root, env: { ...process.env, RDA_USER_DATA: profile }, stdio: 'ignore' });
  return proc;
}

async function quit(proc, page) {
  // Close the window the way a user does; the app flushes the database on quit.
  await page.eval('window.close()').catch(() => {});
  page.close();
  await new Promise((r) => {
    const t = setTimeout(() => { proc.kill(); r(); }, 8000);
    proc.on('exit', () => { clearTimeout(t); r(); });
  });
}

function wrapWait(p) {
  const orig = p.waitFor.bind(p);
  p.waitFor = async (expr, timeout) => {
    try {
      return await orig(expr, timeout);
    } catch (e) {
      console.log('  WAIT FAILED:', expr.slice(0, 120));
      console.log('  editor:', JSON.stringify(await p.eval("document.querySelector('.step-wrap.current .view-lines')?.innerText").catch(() => null)));
      console.log('  result:', JSON.stringify(await p.eval("document.querySelector('.step-wrap.current .exercise-result')?.innerText").catch(() => null)));
      await p.shot(path.join(shots, 'failure.png')).catch(() => {});
      throw e;
    }
  };
}

const js = {
  clickButton: (text) => `(() => { const b = [...document.querySelectorAll('button')].find(b => b.textContent.trim().includes(${JSON.stringify(text)}) && !b.disabled); if (!b) return false; b.click(); return true; })()`,
  text: `document.body.innerText`,
  runCurrent: `(() => { const b = [...document.querySelectorAll('.step-wrap.current button')].find(b => b.textContent.includes('Run Code') && !b.disabled); if (!b) return false; b.click(); return true; })()`,
  nav: (label) => `[...document.querySelectorAll('.nav-item')].find(n => n.textContent.includes(${JSON.stringify(label)})).click()`,
  /** Sets a React-controlled input/select value the way a user would. */
  setValue: (selector, value, proto, event) => `(() => { const el = document.querySelector(${JSON.stringify(selector)}); Object.getOwnPropertyDescriptor(${proto}.prototype, 'value').set.call(el, ${JSON.stringify(value)}); el.dispatchEvent(new Event(${JSON.stringify(event)}, { bubbles: true })); return true; })()`,
};

async function clickButton(page, text, timeout = 8000) {
  await page.waitFor(js.clickButton(text), timeout);
  await sleep(120);
}

/** Answer the current quiz/predict step: tries options until the correct one is chosen. */
async function answerCurrentQuiz(page) {
  const n = await page.eval(`document.querySelectorAll('.step-wrap.current .choice').length`);
  for (let i = 0; i < n; i++) {
    await page.eval(`document.querySelectorAll('.step-wrap.current .choice')[${i}].click()`);
    await sleep(150);
    if (await page.eval(`!!document.querySelector('.step-wrap.current .feedback.ok')`)) return true;
  }
  return false;
}

async function typeInCurrentEditor(page, code) {
  await page.click('.step-wrap.current .monaco-editor .view-lines');
  await sleep(100);
  await page.key('a', 'KeyA', 65, 2); // Ctrl+A
  await page.key('Delete', 'Delete', 46);
  await page.type(code);
  await sleep(250);
  if (process.env.E2E_DEBUG) console.log('  debug editor:', JSON.stringify(await page.eval(`document.querySelector('.step-wrap.current .view-lines').innerText`)));
}

process.on('unhandledRejection', async (e) => {
  console.log('  ERROR', e.message);
  try {
    console.log('  editor:', JSON.stringify(await page.eval(`document.querySelector('.step-wrap.current .view-lines')?.innerText`)));
    console.log('  result:', JSON.stringify(await page.eval(`document.querySelector('.step-wrap.current .exercise-result')?.innerText`)));
    await page.shot(path.join(shots, 'failure.png'));
  } catch {}
  proc.kill();
  process.exit(1);
});

const FIRST = "I'm learning Luau!";

// ------------------------------------------------------------------ run 1
console.log('Run 1: fresh profile →', profile);
let proc = launch();
let page = await connect(PORT, 30000);
wrapWait(page);
await page.waitFor(`!!document.querySelector('.ob-title')`, 20000);
// The first language follows Windows; the test machine may be Dutch, so choose English like a student would.
check(await page.eval(`!!document.querySelector('.ob-language select')`), 'Language picker on the welcome screen');
check(await page.eval(`document.querySelectorAll('.ob-language option').length > 50`), 'More than 50 languages offered');
await page.eval(js.setValue('.ob-language select', 'en', 'HTMLSelectElement', 'change'));
await page.waitFor(`document.body.innerText.includes('Learn to code Roblox games. From zero.')`, 10000);
check(true, 'Welcome screen title (English)');
await page.shot(path.join(shots, '01-welcome.png'));
await clickButton(page, 'Start learning');
check(await page.eval(`document.querySelector('.choice[aria-checked="true"]')?.textContent.includes('Nothing at all')`), 'Experience defaults to "Nothing at all"');
await clickButton(page, 'Next');
await page.eval(`[...document.querySelectorAll('.choice')].find(c => c.textContent.includes('Obby')).click()`);
await clickButton(page, 'Next');
await page.eval(`[...document.querySelectorAll('.choice')].find(c => c.textContent.includes('15 minutes')).click()`);
await clickButton(page, 'Next');
check((await page.eval(js.text)).includes('You start with lesson 1: What is code?'), 'Starting-point screen');
await clickButton(page, 'Start lesson 1');
await page.waitFor(`document.querySelector('.lesson-header h1')?.textContent === 'What is code?'`);
check(true, 'Lesson 1 opened directly after onboarding');

// Lesson 1: walk through the steps.
for (let guard = 0; guard < 20; guard++) {
  if (await page.eval(`!!document.querySelector('.step-wrap.current .choice') && !document.querySelector('.step-wrap.current .feedback.ok')`)) await answerCurrentQuiz(page);
  if (await page.eval(js.clickButton('Next'))) { await sleep(150); continue; }
  break;
}
await page.waitFor(js.runCurrent);
await page.waitFor(`document.querySelector('.console')?.innerText.includes('Welcome to Lumora Academy!')`);
check(true, 'Lesson 1 code example really runs');
await clickButton(page, 'Finish lesson');
await page.waitFor(`document.body.innerText.includes('Lesson finished!')`);
check(true, 'Lesson 1 completed');
await clickButton(page, 'Next lesson');

// Lesson 2: the acceptance lesson.
await page.waitFor(`document.querySelector('.lesson-header h1')?.textContent === 'Your first Luau script'`);
check(true, 'Lesson 2 "Your first Luau script" unlocked and opened');
check((await page.eval(js.text)).includes('With code you give instructions to your program.'), 'Lesson teaches "With code you give instructions to your program."');
check((await page.eval(js.text)).includes('Video explanation'), 'Every lesson has a "Video explanation" button');
await clickButton(page, 'Next');
check(await page.eval(`!!document.querySelector('.step-wrap.current .code-block') && document.querySelector('.step-wrap.current .code-block').innerText.includes('print("Hello Roblox!")')`), 'Shows print("Hello Roblox!")');
for (const tok of ['print', '(', '"Hello Roblox!"', ')']) {
  await page.eval(`[...document.querySelectorAll('.step-wrap.current .ann-tab')].find(t => t.textContent === ${JSON.stringify(tok)}).click()`);
  await sleep(60);
}
check((await page.eval(`document.querySelector('.step-wrap.current .ann-body').innerText`)).includes('closing bracket'), 'Annotations explain print, parentheses and quotes');
await clickButton(page, 'Next');
await answerCurrentQuiz(page);
await clickButton(page, 'Next');

// Exercise: first a wrong attempt, then the correct one.
check((await page.eval(js.text)).includes(FIRST), `Exercise asks for "${FIRST}"`);
await typeInCurrentEditor(page, `print("${FIRST}")`);
await page.key('End', 'End', 35);
await page.key('Backspace', 'Backspace', 8); // remove the closing bracket: a typical beginner mistake
await page.waitFor(js.runCurrent);
await page.waitFor(`!!document.querySelector('.step-wrap.current .explain')`);
check((await page.eval(`document.querySelector('.step-wrap.current .explain').innerText`)).includes('closing bracket'), 'Missing bracket explained in plain language');
await page.shot(path.join(shots, '02-error-explained.png'));

await typeInCurrentEditor(page, `print("${FIRST}")`);
const editorText = await page.eval(`document.querySelector('.step-wrap.current .view-lines').innerText.replace(/\\u00a0/g, ' ')`);
check(editorText.trim() === `print("${FIRST}")`, `Editor contains exactly the typed code (got: ${editorText.trim()})`);
await page.waitFor(js.runCurrent);
await page.waitFor(`!!document.querySelector('.step-wrap.current .feedback.ok')`);
check((await page.eval(`document.querySelector('.step-wrap.current .console').innerText`)).trim() === FIRST, `Output shows "${FIRST}"`);
check((await page.eval(`document.querySelector('.step-wrap.current .feedback.ok').innerText`)).includes('Well done! You changed and ran your first Luau code.'), 'Success message shown');
await page.shot(path.join(shots, '03-first-exercise-solved.png'));

// Run it again: must not award XP twice.
const xpBefore = await page.eval(`window.academy.invoke('progress:snapshot').then(s => s.xp)`);
await page.waitFor(js.runCurrent);
await sleep(800);
const xpAfter = await page.eval(`window.academy.invoke('progress:snapshot').then(s => s.xp)`);
check(xpBefore === xpAfter, `Re-running a solved exercise awards no extra XP (${xpBefore} → ${xpAfter})`);

await clickButton(page, 'Next');
await answerCurrentQuiz(page); // predict: 1 + 1
await clickButton(page, 'Next');
await typeInCurrentEditor(page, 'print("I will be a Roblox developer")');
await page.waitFor(js.runCurrent);
await page.waitFor(`!!document.querySelector('.step-wrap.current .feedback.ok')`);
check(true, 'Independent exercise solved from an empty editor');
await clickButton(page, 'Finish lesson');
await page.waitFor(`document.body.innerText.includes('Lesson finished!')`);
await page.shot(path.join(shots, '04-lesson-complete.png'));

const snap1 = await page.eval(`window.academy.invoke('progress:snapshot')`);
const l2 = snap1.lessons.find((l) => l.lessonId === 'c0-first-script');
check(l2?.status === 'completed', 'Lesson 2 saved as completed');
check(snap1.achievements.some((a) => a.id === 'hello-roblox'), 'Achievement "Hello Roblox" earned');
const stats1 = await page.eval(`window.academy.invoke('stats:get')`);
check(stats1.exercisesCompleted >= 2 && stats1.codeSubmissions >= 4, `Exercise attempts recorded (${stats1.codeSubmissions} submissions, ${stats1.exercisesCompleted} solved)`);
check(stats1.lessonsCompleted === 2, 'Statistics show 2 lessons completed');
console.log(`  info  XP after run 1: ${snap1.xp}`);

await page.eval(`document.querySelectorAll('.nav-item')[0].click()`);
await page.waitFor(`document.body.innerText.includes('What is Luau? (and Lua)')`);
check(true, 'Dashboard updated: next lesson is "What is Luau?"');
await page.shot(path.join(shots, '05-dashboard.png'));
await quit(proc, page);

// ------------------------------------------------------------------ run 2: persistence
console.log('Run 2: relaunch with the same profile');
await sleep(500);
proc = launch();
page = await connect(PORT, 30000);
wrapWait(page);
await page.waitFor(`!!document.querySelector('.sidebar')`, 20000);
check(!(await page.eval(`!!document.querySelector('.ob-title')`)), 'Onboarding is not shown again');
check((await page.eval(js.text)).includes('Welcome back!'), 'Dashboard says "Welcome back!" (language choice persisted)');
const snap2 = await page.eval(`window.academy.invoke('progress:snapshot')`);
check(snap2.xp === snap1.xp, `XP persisted (${snap2.xp})`);
check(snap2.lessons.find((l) => l.lessonId === 'c0-first-script')?.status === 'completed', 'Lesson completion persisted');
check(snap2.achievements.length === snap1.achievements.length, 'Achievements persisted');
check(snap2.profile?.goal === 'obby' && snap2.profile?.dailyGoalMinutes === 15, 'Onboarding answers persisted');
const stats2 = await page.eval(`window.academy.invoke('stats:get')`);
check(stats2.codeSubmissions === stats1.codeSubmissions, 'Exercise attempts persisted');
await page.eval(js.nav('Courses'));
await sleep(300);
check(await page.eval(`[...document.querySelectorAll('.list-row')].find(r => r.textContent.includes('What is Luau?'))?.disabled === false`), 'Next lesson (3) is unlocked');
check(await page.eval(`[...document.querySelectorAll('.list-row')].find(r => r.textContent.includes('Text and quotation marks'))?.disabled === true`), 'Lesson 4 is still locked');
check((await page.eval(js.text)).includes('Courses 0 and 1 are free.'), 'Free-trial banner on the course page');
await page.shot(path.join(shots, '06-learn-after-restart.png'));

// ------------------------------------------------------------------ paid lesson: lock screen
console.log('Full course: lock screen');
await page.eval(`(async () => {
  const c0 = ['c0-what-is-code','c0-first-script','c0-what-is-luau','c0-strings','c0-brackets-commas','c0-comments','c0-lines-order','c0-roblox-studio','c0-script-types','c0-first-studio-script'];
  const c1 = ['c1-variables','c1-numbers','c1-concat','c1-interpolation','c1-booleans-nil','c1-typeof','c1-naming-scope','c1-warn-errors','c1-project-coins'];
  for (const id of c0) await window.academy.invoke('progress:completeLesson', { lessonId: id, courseId: 'course-0', courseLessonIds: c0 });
  for (const id of c1) await window.academy.invoke('progress:completeLesson', { lessonId: id, courseId: 'course-1', courseLessonIds: c1 });
})()`);
await page.eval('location.reload()').catch(() => {});
await page.waitFor(`!!document.querySelector('.sidebar')`, 20000);
await page.eval(js.nav('Courses'));
await sleep(300);
await page.eval(`(() => { const h = [...document.querySelectorAll('.course-head')].find(h => h.textContent.includes('Conditions and logic')); if (h.getAttribute('aria-expanded') !== 'true') h.click(); })()`);
await sleep(200);
await page.waitFor(`(() => { const r = [...document.querySelectorAll('.list-row')].find(r => r.textContent.includes('Comparing: true or false?')); if (!r || r.disabled) return false; r.click(); return true; })()`);
await page.waitFor(`!!document.querySelector('.lock-card')`);
check((await page.eval(js.text)).includes('This lesson is part of the full course.'), 'Course 2 shows the lock screen instead of the lesson');
await page.eval(js.setValue('.lock-card input', 'LUMORA1-' + 'A'.repeat(102), 'HTMLInputElement', 'input'));
await clickButton(page, 'Activate');
await page.waitFor(`!!document.querySelector('.lock-card .feedback.bad')`);
check((await page.eval(`document.querySelector('.lock-card .feedback.bad').innerText`)).includes('not valid'), 'A forged LUMORA1 key is refused (offline signature check)');
const lic = await page.eval(`window.academy.invoke('license:status')`);
check(lic.unlocked === false, 'Full course stays locked without a valid key');
await page.shot(path.join(shots, '07-lock-screen.png'));

// ------------------------------------------------------------------ language switch: human Dutch translation
console.log('Language: switch to Dutch and back');
await page.eval(js.nav('Settings'));
await sleep(300);
await page.eval(`[...document.querySelectorAll('.settings-nav .nav-item')].find(n => n.textContent.includes('Language')).click()`);
await page.waitFor(`!!document.querySelector('.settings-body select')`);
await page.eval(js.setValue('.settings-body select', 'nl', 'HTMLSelectElement', 'change'));
await page.waitFor(`document.body.innerText.includes('Instellingen')`, 10000);
await page.eval(js.nav('Leren'));
await sleep(300);
check((await page.eval(js.text)).includes('Voorwaarden en logica'), 'Dutch course content after switching (human translation)');
check((await page.eval(js.text)).includes('Cursus 0 en 1 zijn gratis.'), 'Dutch interface after switching');
const snap3 = await page.eval(`window.academy.invoke('progress:snapshot')`);
check(snap3.lessons.find((l) => l.lessonId === 'c0-first-script')?.status === 'completed', 'Progress is kept across languages (same lesson ids)');
await page.shot(path.join(shots, '08-dutch.png'));
await page.eval(`window.academy.invoke('settings:set', { language: 'en' })`);
await quit(proc, page);

fs.rmSync(profile, { recursive: true, force: true });
console.log(failures ? `\n${failures} check(s) FAILED` : '\nAll acceptance checks passed.');
process.exit(failures ? 1 : 0);
