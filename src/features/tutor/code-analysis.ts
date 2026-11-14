/**
 * Static "explain my code" analysis. The code is NOT executed: this reads the text and explains it.
 * Every remark is derived from the tokens actually present in the code.
 */
import { codeTokens, tokenize, type Token } from '@shared/luau-lexer';
import { ROBLOX_GLOBALS } from '@shared/explain-error';
import { t } from '@shared/i18n';

export interface LineNote {
  line: number;
  text: string;
}

export interface Analysis {
  lines: LineNote[];
  variables: string[];
  functions: string[];
  services: string[];
  events: string[];
  findings: { level: 'info' | 'warning'; line: number; text: string }[];
  robloxSpecific: boolean;
  scriptHint: string | null;
}

export function analyze(code: string): Analysis {
  const all = tokenize(code);
  const toks = codeTokens(code);
  const byLine = new Map<number, Token[]>();
  for (const t of toks) {
    if (!byLine.has(t.line)) byLine.set(t.line, []);
    byLine.get(t.line)!.push(t);
  }
  const lines: LineNote[] = [];
  const variables = new Set<string>();
  const functions = new Set<string>();
  const services = new Set<string>();
  const events = new Set<string>();
  const findings: Analysis['findings'] = [];

  const commentLines = new Set(all.filter((t) => t.type === 'comment').map((t) => t.line));
  const srcLines = code.split('\n');

  srcLines.forEach((_raw, i) => {
    const ln = i + 1;
    const lt = byLine.get(ln) ?? [];
    const v = lt.map((t) => t.value);
    const has = (s: string) => v.includes(s);
    const notes: string[] = [];
    if (lt.length === 0) {
      if (commentLines.has(ln)) lines.push({ line: ln, text: t('A comment: a note for people. Luau skips it.') });
      return;
    }

    const gs = v.findIndex((x, k) => x === 'GetService' && v[k - 1] === ':');
    if (gs >= 0) {
      const name = lt[gs + 2]?.type === 'string' ? lt[gs + 2].value.replace(/["'`]/g, '') : '?';
      services.add(name);
      notes.push(t('Gets the Roblox service **{name}**.', { name }));
    }
    if (v[0] === 'local' && v[1] === 'function') {
      functions.add(v[2]);
      notes.push(lt.findIndex((tok) => tok.value === '(') >= 0 ? t('Creates a local function `{name}`: a reusable piece of code with the parameters between the brackets.', { name: v[2] }) : t('Creates a local function `{name}`: a reusable piece of code.', { name: v[2] }));
    } else if (v[0] === 'function') {
      functions.add(v[1]);
      notes.push(t('Creates a function `{name}`.', { name: v.slice(1, v.indexOf('(')).join('') }));
    } else if (v[0] === 'local') {
      const names: string[] = [];
      for (let k = 1; k < v.length && v[k] !== '='; k++) if (lt[k].type === 'name') names.push(v[k]);
      names.forEach((n) => variables.add(n));
      if (gs < 0) {
        const list = names.map((n) => `\`${n}\``).join(', ');
        notes.push(has('=')
          ? t(names.length > 1 ? 'Creates the variables {names} and gives them a starting value.' : 'Creates the variable {names} and gives it a starting value.', { names: list })
          : t(names.length > 1 ? 'Creates the variables {names} (without a value: nil).' : 'Creates the variable {names} (without a value: nil).', { names: list }));
      }
    }
    const connect = v.findIndex((x, k) => x === 'Connect' && v[k - 1] === ':');
    if (connect >= 0) {
      const ev = v[connect - 2];
      events.add(ev);
      notes.push(t('Connects a function to the event **{event}**: that function runs every time the event happens.', { event: ev }));
      if (ev === 'OnServerEvent') findings.push({ level: 'warning', line: ln, text: t('The server receives a RemoteEvent. Check every argument from the client here (type, existence, amounts): never trust the client.') });
    }
    if (v[0] === 'if') notes.push(t('An **if statement**: the code below only runs when the condition is true.'));
    if (v[0] === 'elseif') notes.push(t('**elseif**: an extra condition, when the previous one was not true.'));
    if (v[0] === 'else') notes.push(t('**else**: runs when none of the conditions above was true.'));
    if (v[0] === 'for') notes.push(t('A **for loop**: repeats the code below a number of times.'));
    if (v[0] === 'while') {
      notes.push(t('A **while loop**: repeats as long as the condition is true.'));
      if (v[1] === 'true') {
        const body = srcLines.slice(i + 1, i + 40).join('\n');
        if (!/task\.wait|wait\(|:Wait\(/.test(body)) findings.push({ level: 'warning', line: ln, text: t('`while true do` without `task.wait()` inside freezes your game.') });
      }
    }
    if (v[0] === 'repeat') notes.push(t('A **repeat loop**: repeats until the condition at `until` is true.'));
    if (v[0] === 'return') notes.push(t('**return** gives back a value and stops the function.'));
    if (v[0] === 'end' || (v[0] === 'end' && v[1] === ')')) notes.push(t('Closes the block that started above.'));
    if (v[0] === 'until') notes.push(t('End of the repeat loop, with the stop condition.'));
    if (has('print') && !notes.length) notes.push(t('Shows something in the Output.'));
    if (has('warn')) notes.push(t('Shows a yellow warning in the Output.'));
    if (has('Instance') && has('new')) {
      notes.push(t('Creates a new Roblox object (Instance).'));
      const k = v.indexOf('new');
      if (v.slice(k).filter((x) => x === ',').length >= 1 && v[k + 1] === '(') findings.push({ level: 'info', line: ln, text: t('Instance.new with a second argument (Parent) is slower. Set properties first and set `Parent` last.') });
    }
    if (has('WaitForChild')) notes.push(t('Waits until a part exists and then gives it back.'));
    if (v.includes('wait') && v[v.indexOf('wait') - 1] !== '.' && v[v.indexOf('wait') - 1] !== ':') findings.push({ level: 'info', line: ln, text: t('`wait()` is outdated. Use `task.wait()`.') });
    if (v.some((x, k) => (x === 'spawn' || x === 'delay') && v[k - 1] !== '.')) findings.push({ level: 'info', line: ln, text: t('`spawn`/`delay` are outdated. Use `task.spawn` or `task.delay`.') });
    if (!notes.length && has('=') && lt[0].type === 'name') notes.push(t('Gives `{name}` a new value.', { name: v.slice(0, v.indexOf('=')).join('') }));
    if (!notes.length && lt[0].type === 'name' && v.includes('(')) notes.push(t('Calls `{name}` (runs that function).', { name: v.slice(0, v.indexOf('(')).join('') }));
    if (notes.length) lines.push({ line: ln, text: notes.join(' ') });
  });

  const present = (s: string) => toks.some((t) => t.value === s);
  if (present('LocalPlayer') && present('leaderstats') && present('Value') && (present('=') || present('+='))) {
    findings.push({ level: 'warning', line: toks.find((t) => t.value === 'leaderstats')!.line, text: t('Changing leaderstats from the client (LocalPlayer) only works on that one screen and is not saved. Do this on the server.') });
  }

  const robloxSpecific = toks.some((t) => t.type === 'name' && ROBLOX_GLOBALS.has(t.value));
  let scriptHint: string | null = null;
  if (toks.some((t) => ['LocalPlayer', 'UserInputService', 'PlayerGui', 'MouseButton1Click'].includes(t.value))) scriptHint = t('This looks like code for a **LocalScript** (runs on the player\'s device).');
  else if (toks.some((t) => ['OnServerEvent', 'DataStoreService', 'PlayerAdded', 'ServerStorage'].includes(t.value))) scriptHint = t('This looks like code for a **Script** on the server, for example in ServerScriptService.');
  else if (toks.length && toks[toks.length - 1].type === 'name' && toks[toks.length - 2]?.value === 'return') scriptHint = t('This code ends with `return`: it looks like a **ModuleScript**.');

  return { lines, variables: [...variables], functions: [...functions], services: [...services], events: [...events], findings, robloxSpecific, scriptHint };
}
