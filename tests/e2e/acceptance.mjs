/**
 * END-TO-END ACCEPTANCE TEST (master prompt §37) against the REAL built Electron app.
 *
 *   npm run build && node tests/e2e/acceptance.mjs
 *
 * Flow: fresh profile → onboarding → lesson 1 → lesson 2 "Je eerste Luau-script":
 * type print("Ik leer Luau!") in the editor → Run Code → output + success message →
 * finish lesson → XP awarded once → quit → relaunch → verify everything persisted.
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
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'rda-e2e-'));
const electron = path.join(root, 'node_modules/electron/dist/electron.exe');
const PORT = 9334;
let failures = 0;
const check = (cond, label) => {
  console.log(`${cond ? '  PASS' : '  FAIL'}  ${label}`);
  if (!cond) failures++;
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function launch() {
  // E2E_EXE: test the PACKAGED app (e.g. release/win-unpacked/Roblox Dev Academy.exe) instead of the dev build.
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

// ------------------------------------------------------------------ run 1
console.log('Run 1: fresh profile →', profile);
let proc = launch();
let page = await connect(PORT, 30000);
wrapWait(page);
await page.waitFor(`!!document.querySelector('.ob-title')`, 20000);
check((await page.eval(js.text)).includes('Leer Roblox programmeren. Vanaf nul.'), 'Welcome screen title');
await page.shot(path.join(shots, '01-welcome.png'));
await clickButton(page, 'Begin met leren');
check(await page.eval(`document.querySelector('.choice[aria-checked="true"]')?.textContent.includes('Helemaal niets')`), 'Experience defaults to "Helemaal niets"');
await clickButton(page, 'Volgende');
await page.eval(`[...document.querySelectorAll('.choice')].find(c => c.textContent.includes('Obby')).click()`);
await clickButton(page, 'Volgende');
await page.eval(`[...document.querySelectorAll('.choice')].find(c => c.textContent.includes('15 minuten')).click()`);
await clickButton(page, 'Volgende');
check((await page.eval(js.text)).includes('Je begint bij les 1: Wat is code?'), 'Starting-point screen');
await clickButton(page, 'Start les 1');
await page.waitFor(`document.querySelector('.lesson-header h1')?.textContent === 'Wat is code?'`);
check(true, 'Lesson 1 opened directly after onboarding');

// Lesson 1: walk through the steps.
for (let guard = 0; guard < 20; guard++) {
  if (await page.eval(`!!document.querySelector('.step-wrap.current .choice') && !document.querySelector('.step-wrap.current .feedback.ok')`)) await answerCurrentQuiz(page);
  if (await page.eval(js.clickButton('Verder'))) { await sleep(150); continue; }
  break;
}
await page.waitFor(js.runCurrent);
await page.waitFor(`document.querySelector('.console')?.innerText.includes('Welkom bij de Roblox Dev Academy!')`);
check(true, 'Lesson 1 code example really runs');
await clickButton(page, 'Les afronden');
await page.waitFor(`document.body.innerText.includes('Les afgerond!')`);
check(true, 'Lesson 1 completed');
await clickButton(page, 'Volgende les');

// Lesson 2: the acceptance lesson.
await page.waitFor(`document.querySelector('.lesson-header h1')?.textContent === 'Je eerste Luau-script'`);
check(true, 'Lesson 2 "Je eerste Luau-script" unlocked and opened');
check((await page.eval(js.text)).includes('Met code geef je instructies aan je programma.'), 'Lesson teaches "Met code geef je instructies aan je programma."');
await clickButton(page, 'Verder');
check(await page.eval(`!!document.querySelector('.step-wrap.current .code-block') && document.querySelector('.step-wrap.current .code-block').innerText.includes('print("Hallo Roblox!")')`), 'Shows print("Hallo Roblox!")');
for (const tok of ['print', '(', '"Hallo Roblox!"', ')']) {
  await page.eval(`[...document.querySelectorAll('.step-wrap.current .ann-tab')].find(t => t.textContent === ${JSON.stringify(tok)}).click()`);
  await sleep(60);
}
check((await page.eval(`document.querySelector('.step-wrap.current .ann-body').innerText`)).includes('sluitende haakje'), 'Annotations explain print, parentheses and quotes');
await clickButton(page, 'Verder');
await answerCurrentQuiz(page);
await clickButton(page, 'Verder');

// Exercise: first a wrong attempt, then the correct one.
check((await page.eval(js.text)).includes('Ik leer Luau!'), 'Exercise asks for "Ik leer Luau!"');
await typeInCurrentEditor(page, 'print("Ik leer Luau!")');
await page.key('End', 'End', 35);
await page.key('Backspace', 'Backspace', 8); // remove the closing bracket: a typical beginner mistake
await page.waitFor(js.runCurrent);
await page.waitFor(`!!document.querySelector('.step-wrap.current .explain')`);
check((await page.eval(`document.querySelector('.step-wrap.current .explain').innerText`)).includes('sluitend haakje'), 'Missing bracket explained in Dutch');
await page.shot(path.join(shots, '02-error-explained.png'));

await typeInCurrentEditor(page, 'print("Ik leer Luau!")');
const editorText = await page.eval(`document.querySelector('.step-wrap.current .view-lines').innerText.replace(/\\u00a0/g, ' ')`);
check(editorText.trim() === 'print("Ik leer Luau!")', `Editor contains exactly the typed code (got: ${editorText.trim()})`);
await page.waitFor(js.runCurrent);
await page.waitFor(`!!document.querySelector('.step-wrap.current .feedback.ok')`);
check((await page.eval(`document.querySelector('.step-wrap.current .console').innerText`)).trim() === 'Ik leer Luau!', 'Output shows "Ik leer Luau!"');
check((await page.eval(`document.querySelector('.step-wrap.current .feedback.ok').innerText`)).includes('Goed gedaan! Je hebt je eerste Luau-code aangepast en uitgevoerd.'), 'Success message shown');
await page.shot(path.join(shots, '03-first-exercise-solved.png'));

// Run it again: must not award XP twice.
const xpBefore = await page.eval(`window.academy.invoke('progress:snapshot').then(s => s.xp)`);
await page.waitFor(js.runCurrent);
await sleep(800);
const xpAfter = await page.eval(`window.academy.invoke('progress:snapshot').then(s => s.xp)`);
check(xpBefore === xpAfter, `Re-running a solved exercise awards no extra XP (${xpBefore} → ${xpAfter})`);

await clickButton(page, 'Verder');
await answerCurrentQuiz(page); // predict: 1 + 1
await clickButton(page, 'Verder');
await typeInCurrentEditor(page, 'print("Ik word Roblox-developer")');
await page.waitFor(js.runCurrent);
await page.waitFor(`!!document.querySelector('.step-wrap.current .feedback.ok')`);
check(true, 'Independent exercise solved from an empty editor');
await clickButton(page, 'Les afronden');
await page.waitFor(`document.body.innerText.includes('Les afgerond!')`);
await page.shot(path.join(shots, '04-lesson-complete.png'));

const snap1 = await page.eval(`window.academy.invoke('progress:snapshot')`);
const l2 = snap1.lessons.find((l) => l.lessonId === 'c0-first-script');
check(l2?.status === 'completed', 'Lesson 2 saved as completed');
check(snap1.achievements.some((a) => a.id === 'hello-roblox'), 'Achievement "Hello Roblox" earned');
const stats1 = await page.eval(`window.academy.invoke('stats:get')`);
check(stats1.exercisesCompleted >= 2 && stats1.codeSubmissions >= 4, `Exercise attempts recorded (${stats1.codeSubmissions} submissions, ${stats1.exercisesCompleted} solved)`);
check(stats1.lessonsCompleted === 2, 'Statistics show 2 lessons completed');
// Lesson 1 (25) + lesson 2 (25) + guided exercise (10) + independent exercise (20) + quizzes answered right first try (5 each)
console.log(`  info  XP after run 1: ${snap1.xp}`);

await page.eval(`document.querySelectorAll('.nav-item')[0].click()`);
await page.waitFor(`document.body.innerText.includes('Wat is Luau?')`);
check(true, 'Dashboard updated: next lesson is "Wat is Luau?"');
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
check((await page.eval(js.text)).includes('Welkom terug!'), 'Dashboard says "Welkom terug!"');
const snap2 = await page.eval(`window.academy.invoke('progress:snapshot')`);
check(snap2.xp === snap1.xp, `XP persisted (${snap2.xp})`);
check(snap2.lessons.find((l) => l.lessonId === 'c0-first-script')?.status === 'completed', 'Lesson completion persisted');
check(snap2.achievements.length === snap1.achievements.length, 'Achievements persisted');
check(snap2.profile?.goal === 'obby' && snap2.profile?.dailyGoalMinutes === 15, 'Onboarding answers persisted');
const stats2 = await page.eval(`window.academy.invoke('stats:get')`);
check(stats2.codeSubmissions === stats1.codeSubmissions, 'Exercise attempts persisted');
await page.eval(`[...document.querySelectorAll('.nav-item')].find(n => n.textContent.includes('Leren')).click()`);
await sleep(300);
check(await page.eval(`[...document.querySelectorAll('.list-row')].find(r => r.textContent.includes('Wat is Luau?'))?.disabled === false`), 'Next lesson (3) is unlocked');
check(await page.eval(`[...document.querySelectorAll('.list-row')].find(r => r.textContent.includes('Tekst en aanhalingstekens'))?.disabled === true`), 'Lesson 4 is still locked');
await page.shot(path.join(shots, '06-learn-after-restart.png'));

// ------------------------------------------------------------------ Course 2: behaviour checks with other values
console.log('Course 2: if-statements');
await page.eval(`(async () => {
  const c0 = ['c0-what-is-code','c0-first-script','c0-what-is-luau','c0-strings','c0-brackets-commas','c0-comments','c0-lines-order','c0-roblox-studio','c0-script-types','c0-first-studio-script'];
  const c1 = ['c1-variables','c1-numbers','c1-concat','c1-interpolation','c1-booleans-nil','c1-typeof','c1-naming-scope','c1-warn-errors','c1-project-coins'];
  for (const id of c0) await window.academy.invoke('progress:completeLesson', { lessonId: id, courseId: 'course-0', courseLessonIds: c0 });
  for (const id of c1) await window.academy.invoke('progress:completeLesson', { lessonId: id, courseId: 'course-1', courseLessonIds: c1 });
  await window.academy.invoke('progress:completeLesson', { lessonId: 'c2-comparisons', courseId: 'course-2', courseLessonIds: [] });
})()`);
await page.eval('location.reload()').catch(() => {});
await page.waitFor(`!!document.querySelector('.sidebar')`, 20000);
await page.eval(`[...document.querySelectorAll('.nav-item')].find(n => n.textContent.includes('Leren')).click()`);
await sleep(300);
await page.eval(`(() => { const h = [...document.querySelectorAll('.course-head')].find(h => h.textContent.includes('Voorwaarden en logica')); if (h.getAttribute('aria-expanded') !== 'true') h.click(); })()`);
await sleep(200);
await page.waitFor(`(() => { const r = [...document.querySelectorAll('.list-row')].find(r => r.textContent.includes('If-statements')); if (!r || r.disabled) return false; r.click(); return true; })()`);
await page.waitFor(`document.querySelector('.lesson-header h1')?.textContent === 'If-statements'`);
check(true, 'Course 2 lesson "If-statements" unlocked and opened');
for (let i = 0; i < 3; i++) await clickButton(page, 'Verder');
check(await page.eval(`!!document.querySelector('.trace')`), 'Condition visualizer shown in the lesson');
// Fix-the-bug exercise: first a hard-coded answer, which must be rejected by the variant test.
await typeInCurrentEditor(page, 'local health = 0\nprint("Game over")');
await page.waitFor(js.runCurrent);
await page.waitFor(`!!document.querySelector('.step-wrap.current .feedback.bad')`);
check((await page.eval(`document.querySelector('.step-wrap.current .feedback.bad').innerText`)).includes('local health = 50'), 'Hard-coded answer rejected: tested with another value');
await typeInCurrentEditor(page, 'local health = 0\nif health <= 0 then print("Game over") end');
await page.waitFor(js.runCurrent);
await page.waitFor(`!!document.querySelector('.step-wrap.current .feedback.ok')`);
check(true, 'Real if-statement accepted');
await page.shot(path.join(shots, '07-course2-if.png'));
await quit(proc, page);

fs.rmSync(profile, { recursive: true, force: true });
console.log(failures ? `\n${failures} check(s) FAILED` : '\nAll acceptance checks passed.');
process.exit(failures ? 1 : 0);
