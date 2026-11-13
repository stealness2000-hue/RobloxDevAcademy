/**
 * Static "explain my code" analysis. The code is NOT executed: this reads the text and explains it.
 * Every remark is derived from the tokens actually present in the code.
 */
import { codeTokens, tokenize, type Token } from '@shared/luau-lexer';
import { ROBLOX_GLOBALS } from '@shared/explain-error';

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
      if (commentLines.has(ln)) lines.push({ line: ln, text: 'Een comment: een notitie voor mensen. Luau slaat dit over.' });
      return;
    }

    const gs = v.findIndex((x, k) => x === 'GetService' && v[k - 1] === ':');
    if (gs >= 0) {
      const name = lt[gs + 2]?.type === 'string' ? lt[gs + 2].value.replace(/["'`]/g, '') : '?';
      services.add(name);
      notes.push(`Haalt de Roblox-service **${name}** op.`);
    }
    if (v[0] === 'local' && v[1] === 'function') {
      functions.add(v[2]);
      notes.push(`Maakt een lokale functie \`${v[2]}\`: een herbruikbaar stuk code${lt.findIndex((t) => t.value === '(') >= 0 ? ' met de parameters tussen de haakjes' : ''}.`);
    } else if (v[0] === 'function') {
      functions.add(v[1]);
      notes.push(`Maakt een functie \`${v.slice(1, v.indexOf('(')).join('')}\`.`);
    } else if (v[0] === 'local') {
      const names: string[] = [];
      for (let k = 1; k < v.length && v[k] !== '='; k++) if (lt[k].type === 'name') names.push(v[k]);
      names.forEach((n) => variables.add(n));
      if (gs < 0) notes.push(`Maakt de variabele${names.length > 1 ? 's' : ''} ${names.map((n) => `\`${n}\``).join(', ')}${has('=') ? ' en geeft een beginwaarde' : ' (zonder waarde: nil)'}.`);
    }
    const connect = v.findIndex((x, k) => x === 'Connect' && v[k - 1] === ':');
    if (connect >= 0) {
      const ev = v[connect - 2];
      events.add(ev);
      notes.push(`Verbindt een functie met het event **${ev}**: die functie draait elke keer als het event gebeurt.`);
      if (ev === 'OnServerEvent') findings.push({ level: 'warning', line: ln, text: 'Server ontvangt een RemoteEvent. Controleer hier alle argumenten van de client (type, bestaan, bedragen): vertrouw de client nooit.' });
    }
    if (v[0] === 'if') notes.push('Een **if-statement**: de code eronder draait alleen als de voorwaarde waar is.');
    if (v[0] === 'elseif') notes.push('**elseif**: een extra voorwaarde, als de vorige niet waar was.');
    if (v[0] === 'else') notes.push('**else**: draait als geen van de voorwaarden erboven waar was.');
    if (v[0] === 'for') notes.push('Een **for-lus**: herhaalt de code eronder een aantal keer.');
    if (v[0] === 'while') {
      notes.push('Een **while-lus**: herhaalt zolang de voorwaarde waar is.');
      if (v[1] === 'true') {
        const body = srcLines.slice(i + 1, i + 40).join('\n');
        if (!/task\.wait|wait\(|:Wait\(/.test(body)) findings.push({ level: 'warning', line: ln, text: '`while true do` zonder `task.wait()` erin laat je game vastlopen.' });
      }
    }
    if (v[0] === 'repeat') notes.push('Een **repeat-lus**: herhaalt tot de voorwaarde bij `until` waar is.');
    if (v[0] === 'return') notes.push('**return** geeft een waarde terug en stopt de functie.');
    if (v[0] === 'end' || (v[0] === 'end' && v[1] === ')')) notes.push('Sluit het blok af dat erboven begon.');
    if (v[0] === 'until') notes.push('Einde van de repeat-lus, met de stopvoorwaarde.');
    if (has('print') && !notes.length) notes.push('Laat iets zien in de Output.');
    if (has('warn')) notes.push('Laat een gele waarschuwing zien in de Output.');
    if (has('Instance') && has('new')) {
      notes.push('Maakt een nieuw Roblox-object (Instance).');
      const k = v.indexOf('new');
      if (v.slice(k).filter((x) => x === ',').length >= 1 && v[k + 1] === '(') findings.push({ level: 'info', line: ln, text: 'Instance.new met een tweede argument (Parent) is trager. Stel eigenschappen eerst in en zet `Parent` als laatste.' });
    }
    if (has('WaitForChild')) notes.push('Wacht tot een onderdeel bestaat en geeft het dan terug.');
    if (v.includes('wait') && v[v.indexOf('wait') - 1] !== '.' && v[v.indexOf('wait') - 1] !== ':') findings.push({ level: 'info', line: ln, text: '`wait()` is verouderd. Gebruik `task.wait()`.' });
    if (v.some((x, k) => (x === 'spawn' || x === 'delay') && v[k - 1] !== '.')) findings.push({ level: 'info', line: ln, text: '`spawn`/`delay` zijn verouderd. Gebruik `task.spawn` of `task.delay`.' });
    if (!notes.length && has('=') && lt[0].type === 'name') notes.push(`Geeft \`${v.slice(0, v.indexOf('=')).join('')}\` een nieuwe waarde.`);
    if (!notes.length && lt[0].type === 'name' && v.includes('(')) notes.push(`Roept \`${v.slice(0, v.indexOf('(')).join('')}\` aan (voert die functie uit).`);
    if (notes.length) lines.push({ line: ln, text: notes.join(' ') });
  });

  const present = (s: string) => toks.some((t) => t.value === s);
  if (present('LocalPlayer') && present('leaderstats') && present('Value') && (present('=') || present('+='))) {
    findings.push({ level: 'warning', line: toks.find((t) => t.value === 'leaderstats')!.line, text: 'Leaderstats aanpassen vanaf de client (LocalPlayer) werkt alleen op dat ene scherm en wordt niet opgeslagen. Doe dit op de server.' });
  }

  const robloxSpecific = toks.some((t) => t.type === 'name' && ROBLOX_GLOBALS.has(t.value));
  let scriptHint: string | null = null;
  if (toks.some((t) => ['LocalPlayer', 'UserInputService', 'PlayerGui', 'MouseButton1Click'].includes(t.value))) scriptHint = 'Dit lijkt code voor een **LocalScript** (draait op het apparaat van de speler).';
  else if (toks.some((t) => ['OnServerEvent', 'DataStoreService', 'PlayerAdded', 'ServerStorage'].includes(t.value))) scriptHint = 'Dit lijkt code voor een **Script** op de server, bijvoorbeeld in ServerScriptService.';
  else if (toks.length && toks[toks.length - 1].type === 'name' && toks[toks.length - 2]?.value === 'return') scriptHint = 'Deze code eindigt met `return`: het lijkt een **ModuleScript**.';

  return { lines, variables: [...variables], functions: [...functions], services: [...services], events: [...events], findings, robloxSpecific, scriptHint };
}
