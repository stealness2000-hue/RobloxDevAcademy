/**
 * Beginner-friendly error assistant.
 *
 * Translates REAL diagnostics (from the Luau compiler, runtime or analyzer) into simple Dutch.
 * Rules:
 *  - Every explanation starts from an actual message; we never invent an error.
 *  - `certainty: 'zeker'` means the message itself states the cause.
 *    `certainty: 'waarschijnlijk'` means we infer the most common beginner cause.
 *  - Unknown messages fall back to the original text, clearly labelled.
 */
import { findBracketIssues, codeTokens } from './luau-lexer';
import type { Diagnostic, RunError } from './types';

export type ErrorCategory =
  | 'missing-bracket'
  | 'missing-then'
  | 'missing-do'
  | 'missing-end'
  | 'unfinished-string'
  | 'nil-arithmetic'
  | 'nil-concat'
  | 'nil-call'
  | 'nil-index'
  | 'unknown-global'
  | 'roblox-only'
  | 'type-mismatch'
  | 'incomplete-statement'
  | 'infinite-loop'
  | 'memory'
  | 'unused-variable'
  | 'other';

export const ERROR_CATEGORY_LABELS: Record<ErrorCategory, string> = {
  'missing-bracket': 'Haakje vergeten',
  'missing-then': '`then` vergeten',
  'missing-do': '`do` vergeten',
  'missing-end': '`end` vergeten',
  'unfinished-string': 'Tekst niet afgesloten',
  'nil-arithmetic': 'Rekenen met nil',
  'nil-concat': 'Tekst plakken met nil',
  'nil-call': 'Functie bestaat niet',
  'nil-index': 'Iets zoeken in nil',
  'unknown-global': 'Onbekende naam',
  'roblox-only': 'Alleen in Roblox Studio',
  'type-mismatch': 'Verkeerd soort waarde',
  'incomplete-statement': 'Onvolledige regel',
  'infinite-loop': 'Oneindige lus',
  memory: 'Te veel geheugen',
  'unused-variable': 'Ongebruikte variabele',
  other: 'Overig',
};

export interface Explanation {
  category: ErrorCategory;
  certainty: 'zeker' | 'waarschijnlijk' | 'onbekend';
  /** Wat ging er mis? */
  what: string;
  /** Waarom gebeurt dit? */
  why: string;
  /** Waar zit de fout? */
  line?: number;
  column?: number;
  /** Hoe kun je dit oplossen? (a hint, never the full answer) */
  hint: string;
  /** Wil je meer uitleg? */
  more: string;
  /** The original technical message, always shown on request. */
  original: string;
}

/** Roblox engine globals that do not exist in a plain Luau runtime. */
export const ROBLOX_GLOBALS = new Set([
  'game', 'workspace', 'script', 'plugin', 'Instance', 'Vector3', 'Vector2', 'CFrame', 'Color3', 'BrickColor',
  'UDim', 'UDim2', 'Enum', 'Ray', 'RaycastParams', 'TweenInfo', 'NumberSequence', 'ColorSequence', 'NumberRange',
  'Region3', 'Rect', 'PhysicalProperties', 'tick', 'wait', 'spawn', 'delay', 'shared', 'DateTime',
  'OverlapParams', 'Random', 'Axes', 'Faces', 'Font', 'Path2DControlPoint',
]);

const lineFromMessage = (msg: string): number | undefined => {
  const m = /main\.luau:(\d+)/.exec(msg) ?? /:(\d+):/.exec(msg);
  return m ? Number(m[1]) : undefined;
};

function stripPrefix(msg: string): string {
  return msg
    .replace(/^(syntax|runtime|compile) error:\s*/i, '')
    .replace(/^main\.luau:\d+:\s*/, '')
    .replace(/\nstack traceback:[\s\S]*$/, '')
    .trim();
}

const NIL_OPS: Record<string, string> = {
  add: 'optellen (+)',
  sub: 'aftrekken (-)',
  mul: 'vermenigvuldigen (*)',
  div: 'delen (/)',
  mod: 'de rest berekenen (%)',
  pow: 'machtsverheffen (^)',
  unm: 'negatief maken (-)',
  idiv: 'heeltallig delen (//)',
};

/** Explain a single technical message. `code` is the student's source, used for precise locations. */
export function explainMessage(rawMessage: string, code: string, knownLine?: number, knownColumn?: number): Explanation {
  const original = rawMessage.trim();
  const msg = stripPrefix(original);
  const line = knownLine ?? lineFromMessage(original);
  const base = { original, line, column: knownColumn };
  let m: RegExpExecArray | null;

  // ---- Syntax errors -------------------------------------------------------
  if ((m = /Expected '\)' \(to close '\(' at (?:line (\d+), )?column (\d+)\)/.exec(msg))) {
    const issue = findBracketIssues(code).find((i) => i.kind === 'unclosed' && i.open === '(');
    return {
      ...base,
      line: issue?.line ?? (m[1] ? Number(m[1]) : line),
      column: issue?.column ?? Number(m[2]),
      category: 'missing-bracket',
      certainty: 'zeker',
      what: 'Je bent waarschijnlijk een sluitend haakje `)` vergeten.',
      why: 'Elk openend haakje `(` heeft een sluitend haakje `)` nodig. Luau zag een `(` maar vond niet waar die eindigt.',
      hint: 'Kijk naar het gemarkeerde haakje. Waar eindigt de informatie die je tussen de haakjes zet? Zet daar een `)`.',
      more: 'Haakjes werken als een paar: `print(` opent de lijst met informatie voor `print`, en `)` sluit hem. Tel in je regel hoeveel `(` en hoeveel `)` er staan: dat aantal moet gelijk zijn.',
    };
  }
  if ((m = /Expected '([\]}])' \(to close '([[{])' at (?:line (\d+), )?column (\d+)\)/.exec(msg))) {
    return {
      ...base,
      line: m[3] ? Number(m[3]) : line,
      column: Number(m[4]),
      category: 'missing-bracket',
      certainty: 'zeker',
      what: `Je bent een sluitend haakje \`${m[1]}\` vergeten.`,
      why: `Er staat een openend \`${m[2]}\` zonder bijpassende \`${m[1]}\`.`,
      hint: `Zoek het gemarkeerde \`${m[2]}\` en zet de \`${m[1]}\` op de plek waar die groep eindigt.`,
      more: 'Elk soort haakje heeft zijn eigen sluiter: `(` met `)`, `{` met `}` en `[` met `]`.',
    };
  }
  if (/Expected 'then' when parsing if statement/.test(msg) || /Expected 'then' when parsing elseif/.test(msg)) {
    return {
      ...base,
      category: 'missing-then',
      certainty: 'zeker',
      what: 'Je bent het woord `then` vergeten na je voorwaarde.',
      why: 'In Luau ziet een if-statement er altijd zo uit: `if voorwaarde then`. Het woord `then` vertelt Luau waar de voorwaarde stopt en de code begint die moet gebeuren.',
      hint: 'Kijk naar de regel met `if`. Wat moet er aan het einde van die regel staan?',
      more: 'Lees het als een zin: "**als** coins groter dan 50 is **dan** ...". Zonder `then` weet Luau niet waar je vraag ophoudt.',
      line: line && line > 1 ? findIfLine(code, line) : line,
    };
  }
  if (/Expected 'do' when parsing (for|while) loop/.test(msg)) {
    return {
      ...base,
      category: 'missing-do',
      certainty: 'zeker',
      what: 'Je bent het woord `do` vergeten bij je lus.',
      why: 'Een `for`- of `while`-lus heeft het woord `do` nodig om aan te geven waar de herhaalde code begint.',
      hint: 'Zet `do` aan het einde van de regel waar je lus begint.',
      more: 'Voorbeeld van de vorm: `for i = 1, 3 do` … `end`.',
    };
  }
  if ((m = /Expected 'end' \(to close '(\w+)' at line (\d+)\)/.exec(msg))) {
    const what: Record<string, string> = { function: 'functie', if: 'if-statement', do: 'blok', for: 'for-lus', while: 'while-lus', then: 'if-statement' };
    return {
      ...base,
      line: Number(m[2]),
      category: 'missing-end',
      certainty: 'zeker',
      what: `Je ${what[m[1]] ?? 'blok'} op regel ${m[2]} wordt niet afgesloten met \`end\`.`,
      why: 'Blokken zoals `if`, `for`, `while` en `function` moeten eindigen met het woord `end`, zodat Luau weet waar het blok stopt.',
      hint: `Bedenk waar het blok van regel ${m[2]} moet stoppen, en zet daar \`end\`.`,
      more: 'Een goede gewoonte: schrijf `end` meteen nadat je een blok begint, en vul daarna pas de binnenkant in.',
    };
  }
  if (/Malformed string|Unfinished string|unfinished string/i.test(msg)) {
    return {
      ...base,
      category: 'unfinished-string',
      certainty: 'zeker',
      what: 'Je tekst (string) is niet afgesloten met een aanhalingsteken.',
      why: 'Tekst begint en eindigt met hetzelfde aanhalingsteken, bijvoorbeeld `"Hallo"`. Luau vond het begin, maar niet het einde.',
      hint: 'Kijk of je tekst op deze regel aan beide kanten een `"` heeft.',
      more: 'Aanhalingstekens vertellen Luau: "alles hiertussen is gewone tekst, geen code". Daarom moet je zowel het begin als het einde aangeven.',
    };
  }
  if (/Malformed number/.test(msg)) {
    return {
      ...base,
      category: 'incomplete-statement',
      certainty: 'zeker',
      what: 'Er staat een getal dat direct vastzit aan letters.',
      why: 'Luau leest iets als `2coins` of `0print` als één kapot getal. Een naam mag niet met een cijfer beginnen, en tussen een getal en een nieuw woord hoort een spatie of een nieuwe regel.',
      hint: 'Zoek op deze regel een cijfer met direct letters erachter. Moet daar een nieuwe regel of een spatie tussen? Of begint een variabelenaam met een cijfer?',
      more: 'Goede namen: `coins2`, `secondPlayer`. Foute namen: `2coins`, `2ndPlayer`. Decimale getallen schrijf je met een punt: `1.5`, niet `1,5`.',
    };
  }
  if (/Incomplete statement: expected assignment or a function call/.test(msg)) {
    return {
      ...base,
      category: 'incomplete-statement',
      certainty: 'waarschijnlijk',
      what: 'Deze regel is geen complete opdracht.',
      why: 'Elke regel code moet iets dóén: een waarde opslaan (`x = 5`) of een functie aanroepen (`print(x)`). Alleen een naam of waarde neerzetten is geen opdracht.',
      hint: 'Vaak ontbreken haakjes achter een functienaam, of een `=` bij het opslaan van een waarde.',
      more: '`print "x"` kan in Luau soms werken, maar `print` zonder haakjes en zonder tekst doet niets. Gebruik altijd `print(...)`.',
    };
  }
  if ((m = /Expected identifier when parsing (expression|variable name), got '?([^']*)'?/.exec(msg))) {
    return {
      ...base,
      category: 'incomplete-statement',
      certainty: 'waarschijnlijk',
      what: `Luau verwachtte hier een naam of waarde, maar vond ${m[2] ? `\`${m[2]}\`` : 'niets'}.`,
      why: 'Na tekens zoals `=`, `+` of `,` moet er nog iets komen. Misschien is er iets weggevallen of staat er een teken te veel.',
      hint: 'Lees de gemarkeerde regel van links naar rechts: staat er na elk rekenteken of `=` een waarde?',
      more: 'Namen van variabelen mogen ook niet met een cijfer beginnen en geen spaties of speciale tekens bevatten.',
    };
  }

  // ---- Runtime errors ------------------------------------------------------
  if ((m = /attempt to perform arithmetic \((\w+)\) on (\w+)(?: and (\w+))?/.exec(msg))) {
    const op = NIL_OPS[m[1]] ?? 'rekenen';
    const types = [m[2], m[3]].filter(Boolean);
    if (types.includes('nil')) {
      return {
        ...base,
        category: 'nil-arithmetic',
        certainty: 'zeker',
        what: `Je probeert te ${op} met een waarde die niet bestaat (\`nil\`).`,
        why: '`nil` betekent "niets". Een variabele is `nil` als je hem nooit een waarde gaf, of als je de naam verkeerd typte.',
        hint: 'Controleer op deze regel welke variabele `nil` is. Heb je hem eerder een getal gegeven? Is de naam precies hetzelfde gespeld?',
        more: 'Luau is hoofdlettergevoelig: `Coins` en `coins` zijn twee verschillende namen. Een tikfout maakt dus een nieuwe, lege (`nil`) naam.',
      };
    }
    return {
      ...base,
      category: 'type-mismatch',
      certainty: 'zeker',
      what: `Je probeert te ${op} met een ${types.map(dutchType).join(' en een ')}.`,
      why: 'Rekenen werkt alleen met getallen. Tekst zoals `"10"` is geen getal, ook al ziet het er zo uit.',
      hint: 'Kijk of een van de waarden tussen aanhalingstekens staat. Moet dat echt tekst zijn?',
      more: 'Wil je tekst omzetten naar een getal? Daarvoor bestaat `tonumber("10")`. Wil je tekst aan elkaar plakken? Gebruik dan `..` in plaats van `+`.',
    };
  }
  if ((m = /attempt to concatenate (\w+) with (\w+)/.exec(msg))) {
    const hasNil = m[1] === 'nil' || m[2] === 'nil';
    return {
      ...base,
      category: hasNil ? 'nil-concat' : 'type-mismatch',
      certainty: 'zeker',
      what: hasNil
        ? 'Je probeert tekst aan elkaar te plakken met een waarde die niet bestaat (`nil`).'
        : `Je probeert een ${dutchType(m[1])} en een ${dutchType(m[2])} aan elkaar te plakken.`,
      why: hasNil
        ? 'Met `..` plak je tekst aan elkaar. Maar één van de twee kanten is `nil`: daar is niets om te plakken.'
        : '`..` werkt met tekst en getallen, niet met andere soorten waarden zoals `true`/`false` of tabellen.',
      hint: hasNil
        ? 'Kijk welke variabele op deze regel nog geen waarde heeft, of verkeerd gespeld is.'
        : 'Gebruik `tostring(waarde)` om de waarde eerst naar tekst om te zetten.',
      more: 'Voorbeeld: `"Coins: " .. tostring(isRich)` maakt van `true` eerst de tekst `"true"`.',
    };
  }
  if (/attempt to call a nil value/.test(msg)) {
    const guess = guessMistypedCall(code, line);
    return {
      ...base,
      category: 'nil-call',
      certainty: 'waarschijnlijk',
      what: guess ? `Luau kent geen functie met de naam \`${guess}\`.` : 'Je roept een functie aan die niet bestaat.',
      why: 'Achter een naam met haakjes, zoals `print(...)`, verwacht Luau een functie. Die naam bestaat hier niet (hij is `nil`).',
      hint: guess && guess.toLowerCase() === 'print' && guess !== 'print'
        ? 'Let op hoofdletters: Luau maakt onderscheid tussen `Print` en `print`.'
        : 'Controleer de spelling en hoofdletters van de functienaam op deze regel.',
      more: 'Veel beginnersfouten zijn tikfouten: `pritn`, `Print`, `prnt`. Luau is hoofdlettergevoelig.',
    };
  }
  if ((m = /attempt to index (\w+) with '?([^'\n]*)'?/.exec(msg))) {
    return {
      ...base,
      category: m[1] === 'nil' ? 'nil-index' : 'type-mismatch',
      certainty: 'zeker',
      what: m[1] === 'nil'
        ? `Je zoekt \`${m[2]}\` in iets dat niet bestaat (\`nil\`).`
        : `Je zoekt \`${m[2]}\` in een ${dutchType(m[1])}, maar daar kun je niets in opzoeken.`,
      why: 'Met een punt (`a.b`) of haakjes (`a["b"]`) zoek je iets op ín een waarde. De waarde vóór de punt moet daarvoor een tabel of object zijn.',
      hint: 'Kijk naar het deel vóór de punt op deze regel. Bestaat dat echt, en heeft het de juiste naam?',
      more: 'In Roblox gebeurt dit vaak als een object nog niet geladen is. Later leer je daarvoor `WaitForChild()` te gebruiken.',
    };
  }
  if (/interrupt budget|interrupted/i.test(msg)) {
    return {
      ...base,
      category: 'infinite-loop',
      certainty: 'waarschijnlijk',
      what: 'Je programma bleef te lang doorlopen en is gestopt.',
      why: 'Meestal komt dit door een lus die nooit stopt, bijvoorbeeld `while true do` zonder `break`, of een voorwaarde die altijd waar blijft.',
      hint: 'Bekijk je lus: verandert er binnen de lus iets waardoor de voorwaarde ooit onwaar wordt?',
      more: 'De Academy stopt code die te lang draait, zodat de app niet vastloopt. In Roblox Studio kan een oneindige lus zonder `task.wait()` je hele spel laten vastlopen.',
    };
  }
  if (/not enough memory|memory limit/i.test(msg)) {
    return {
      ...base,
      category: 'memory',
      certainty: 'waarschijnlijk',
      what: 'Je programma gebruikte te veel geheugen.',
      why: 'Dit gebeurt vaak als een lus steeds meer gegevens toevoegt en nooit stopt.',
      hint: 'Kijk of je lus een duidelijk einde heeft.',
      more: 'De Academy beperkt het geheugen van oefencode tot ongeveer 32 MB.',
    };
  }

  // ---- Analyzer diagnostics --------------------------------------------------
  if ((m = /Unknown global '([^']+)'/.exec(msg))) {
    const name = m[1];
    if (ROBLOX_GLOBALS.has(name)) {
      return {
        ...base,
        category: 'roblox-only',
        certainty: 'zeker',
        what: `\`${name}\` bestaat alleen in Roblox Studio.`,
        why: `De Luau-speeltuin draait gewone Luau. Dingen van de Roblox-engine, zoals \`${name}\`, zijn daar niet beschikbaar.`,
        hint: 'Gebruik "Open oefening in Roblox Studio" of test deze code in Studio zelf.',
        more: 'Luau is de programmeertaal. Roblox voegt daar zijn eigen onderdelen aan toe (zoals `game`, `workspace` en `Instance`). Die werken alleen binnen Roblox.',
      };
    }
    const similar = closestName(name, code);
    return {
      ...base,
      category: 'unknown-global',
      certainty: similar ? 'waarschijnlijk' : 'zeker',
      what: `Luau kent de naam \`${name}\` niet.`,
      why: 'Je gebruikt een naam die nog nergens een waarde heeft gekregen. Vaak is dit een tikfout, of ben je vergeten de variabele eerst te maken.',
      hint: similar ? `Bedoelde je \`${similar}\`? Let op spelling en hoofdletters.` : `Maak \`${name}\` eerst aan met \`local ${name} = ...\`, of controleer de spelling.`,
      more: 'Een variabele bestaat pas vanaf de regel waarop je hem maakt. Gebruik je hem eerder, dan is hij nog onbekend.',
    };
  }
  if ((m = /Variable '([^']+)' is never used/.exec(msg)) || (m = /Local variable '([^']+)' is never used/.exec(msg))) {
    return {
      ...base,
      category: 'unused-variable',
      certainty: 'zeker',
      what: `De variabele \`${m[1]}\` wordt nergens gebruikt.`,
      why: 'Dit is geen fout, maar een tip: je hebt een waarde opgeslagen die je daarna nooit gebruikt.',
      hint: 'Is dat de bedoeling? Zo niet, gebruik hem bijvoorbeeld in een `print`.',
      more: 'Waarschuwingen (geel) laten je code niet stoppen. Fouten (rood) wel.',
    };
  }
  if ((m = /Type '([^']+)' could not be converted into '([^']+)'/.exec(msg))) {
    return {
      ...base,
      category: 'type-mismatch',
      certainty: 'zeker',
      what: `Hier staat een waarde van het soort \`${m[1]}\`, maar Luau verwacht \`${m[2]}\`.`,
      why: 'Sommige bewerkingen werken alleen met een bepaald soort waarde (bijvoorbeeld alleen met getallen).',
      hint: 'Kijk of je per ongeluk tekst (met aanhalingstekens) gebruikt waar een getal hoort, of andersom.',
      more: '`number` = getal, `string` = tekst, `boolean` = true/false, `nil` = niets.',
    };
  }

  // ---- More syntax mistakes ------------------------------------------------
  if (/Expected ',' after table constructor element/.test(msg)) {
    return { ...base, category: 'missing-bracket', certainty: 'zeker',
      what: 'In je tabel mist een komma, of de sluitende accolade `}`.',
      why: 'In een tabel `{ }` zet je tussen elk item een komma, zoals `{1, 2, 3}`. Na het laatste item sluit je af met `}`.',
      hint: 'Kijk naar het einde van de vorige regel: staat er een komma? En staat er onderaan een `}`?',
      more: 'Voorbeeld: `local stats = { health = 100, speed = 16 }`. Een komma na het laatste item mag ook.' };
  }
  if ((m = /Expected '\}' \(to close '\{' at line (\d+)\)/.exec(msg)) || (m = /Expected '\)' \(to close '\(' at line (\d+)\)/.exec(msg))) {
    const brace = msg.includes("'{'");
    return { ...base, line: Number(m[1]), category: 'missing-bracket', certainty: 'zeker',
      what: brace ? 'Je bent een sluitende accolade `}` vergeten.' : 'Je bent een sluitend haakje `)` vergeten.',
      why: brace ? `Op regel ${m[1]} begint een tabel met \`{\`, maar die wordt nergens afgesloten.` : `Op regel ${m[1]} begint iets met \`(\`, maar het sluitende haakje ontbreekt.`,
      hint: brace ? 'Zet een `}` op de plek waar je tabel moet eindigen.' : 'Zet een `)` waar de informatie tussen de haakjes eindigt.',
      more: 'Elk openend teken heeft een sluitend teken nodig: `(` met `)`, `{` met `}`, `[` met `]`.' };
  }
  if ((m = /Expected <eof>, got '(end|else|elseif|until|\))'/.exec(msg))) {
    const w = m[1];
    return { ...base, category: 'missing-end', certainty: 'zeker',
      what: w === 'end' ? 'Er staat een `end` te veel.' : w === ')' ? 'Er staat een haakje `)` te veel.' : `Er staat een \`${w}\` zonder bijbehorende \`if\`.`,
      why: w === 'end' ? 'Elke `end` sluit een blok af (zoals `if`, `for` of `function`). Deze `end` heeft geen blok meer om af te sluiten.' : w === ')' ? 'Er zijn meer sluitende dan openende haakjes.' : `\`${w}\` kan alleen binnen een if-statement staan, na \`if ... then\`.`,
      hint: w === 'end' ? 'Tel je blokken: hoort elke `end` bij een `if`, `for`, `while` of `function`? Haal de extra `end` weg.' : w === ')' ? 'Tel de `(` en `)` op deze regel en haal er één `)` weg.' : 'Zet er een `if ... then` boven, of haal deze regel weg.',
      more: 'Tip: met de knop Formatteren zie je aan het inspringen welk blok waar eindigt.' };
  }
  if (/A new statement is on the same line/.test(msg)) {
    return { ...base, category: 'incomplete-statement', certainty: 'waarschijnlijk',
      what: 'Er staan twee opdrachten op één regel, waarschijnlijk door een fout ervoor.',
      why: 'Luau denkt dat er een nieuwe opdracht begint op dezelfde regel. Dat gebeurt vaak als er iets te veel of te weinig staat, zoals een haakje of een `=`.',
      hint: 'Los eerst de andere fout op deze regel op; deze melding verdwijnt dan meestal vanzelf.',
      more: 'Wil je echt twee opdrachten op één regel? Zet ze dan op aparte regels; dat is ook veel beter leesbaar.' };
  }
  if ((m = /Expected identifier when parsing expression, got '\)'/.exec(msg))) {
    return { ...base, category: 'missing-bracket', certainty: 'zeker',
      what: 'Er staat een haakje `)` te veel, of er ontbreekt iets vóór het haakje.',
      why: 'Luau verwachtte nog een waarde, maar kwam een sluitend haakje tegen.',
      hint: 'Tel de `(` en `)` op deze regel. Zijn het er evenveel?',
      more: 'Ook een komma te veel kan dit veroorzaken, zoals `print("a",)`.' };
  }

  // ---- More runtime mistakes -----------------------------------------------
  if ((m = /attempt to compare (\w+) [<>=]+ (\w+)/.exec(msg))) {
    return { ...base, category: 'type-mismatch', certainty: 'zeker',
      what: `Je vergelijkt een ${dutchType(m[1])} met een ${dutchType(m[2])}.`,
      why: 'Met `<`, `>`, `<=` en `>=` kun je alleen getallen met getallen (of tekst met tekst) vergelijken.',
      hint: 'Controleer welke waarde geen getal is. Staat er misschien tekst tussen aanhalingstekens, of is iets `nil`?',
      more: 'Tekst omzetten naar een getal kan met `tonumber("10")`.' };
  }
  if ((m = /invalid argument #(\d+) to '([^']+)' \((\w+) expected, got (\w+)\)/.exec(msg)) || (m = /the function '([^']+)' expects to get an? (\w+) as its (\d+)\w* argument, but is being given an? (\w+)/.exec(msg))) {
    const fn = m[0].startsWith('invalid') ? m[2] : m[1];
    const nr = m[0].startsWith('invalid') ? m[1] : m[3];
    const want = m[0].startsWith('invalid') ? m[3] : m[2];
    const got = m[4];
    return { ...base, category: 'type-mismatch', certainty: 'zeker',
      what: `Je geeft \`${fn}\` het verkeerde soort waarde.`,
      why: `\`${fn}\` verwacht als ${nr}e argument een ${dutchType(want)}, maar kreeg een ${dutchType(got)}.`,
      hint: `Kijk wat je tussen de haakjes van \`${fn}(...)\` zet. Moet dat een ${dutchType(want)} zijn?`,
      more: 'Een argument is de informatie tussen de haakjes. Elke functie verwacht een bepaald soort informatie.' };
  }
  if ((m = /missing argument #(\d+)(?: to '([^']+)')?/.exec(msg)) || (m = /the function '([^']+)' will error at runtime if it is not called with (\d+) arguments?/.exec(msg))) {
    const analyzer = m[0].startsWith('the function');
    const fn = analyzer ? m[1] : m[2] ?? 'deze functie';
    const methodLike = /^[a-z]\w*\.(upper|lower|sub|len|rep|find|gsub|split|format)$/.test(fn);
    return { ...base, category: 'incomplete-statement', certainty: 'zeker',
      what: methodLike ? `Gebruik een dubbele punt: \`${fn.replace('.', ':')}()\` in plaats van \`${fn}()\`.` : `Je bent informatie vergeten tussen de haakjes van \`${fn}\`.`,
      why: methodLike ? 'Tekstfuncties op een variabele roep je aan met `:`. Dan geeft Luau de tekst zelf automatisch mee.' : `\`${fn}\` heeft informatie (een argument) nodig om te werken, maar de haakjes zijn leeg of er ontbreekt er een.`,
      hint: methodLike ? `Schrijf \`${fn.replace('.', ':')}()\`.` : `Zet tussen de haakjes wat \`${fn}\` nodig heeft, bijvoorbeeld een getal of tekst.`,
      more: 'Met `naam:methode()` werk je met de waarde zelf. Met `naam.functie()` moet je alles zelf meegeven.' };
  }
  if ((m = /attempt to call an? (\w+) value/.exec(msg)) && m[1] !== 'nil') {
    return { ...base, category: 'nil-call', certainty: 'zeker',
      what: `Je gebruikt haakjes \`()\` achter een ${dutchType(m[1])}, maar dat is geen functie.`,
      why: 'Haakjes achter een naam betekenen: voer deze functie uit. Maar deze naam bevat een waarde, geen functie.',
      hint: 'Haal de haakjes weg, of controleer of je de juiste naam gebruikt (misschien heeft een variabele dezelfde naam als een functie).',
      more: 'Voorbeeld: `local score = 5` en daarna `score()` geeft deze fout, want 5 is geen functie.' };
  }
  if (/stack overflow/i.test(msg)) {
    return { ...base, category: 'infinite-loop', certainty: 'waarschijnlijk',
      what: 'Een functie roept zichzelf eindeloos aan.',
      why: 'Als een functie zichzelf aanroept zonder ooit te stoppen, raakt het geheugen voor aanroepen op.',
      hint: 'Kijk of je functie zichzelf aanroept. Zorg voor een `if` die ervoor zorgt dat hij een keer stopt.',
      more: 'Dit heet recursie. Het is handig, maar heeft altijd een stopvoorwaarde nodig.' };
  }
  if (/table index is nil/.test(msg)) {
    return { ...base, category: 'nil-index', certainty: 'zeker',
      what: 'Je gebruikt `nil` als sleutel in een tabel.',
      why: 'Een sleutel (tussen `[ ]`) moet een echte waarde zijn, zoals een naam of getal. `nil` betekent "niets" en kan geen sleutel zijn.',
      hint: 'Kijk welke variabele je tussen de blokhaken zet. Heeft die wel een waarde?',
      more: 'Vaak is de variabele verkeerd gespeld, of heeft hij nog geen waarde gekregen.' };
  }
  if (/\berror\s*\(/.test(code) && !/attempt to|Expected|Unknown global|Malformed/.test(msg) && /runtime error/.test(original)) {
    return { ...base, category: 'other', certainty: 'zeker',
      what: `Je code gaf zelf een foutmelding: "${msg}".`,
      why: 'Met `error("...")` stop je je programma bewust met een eigen melding. Dat is handig om problemen op te merken.',
      hint: 'Is dit de bedoeling? Zo niet, kijk waarom de regel met `error(...)` is uitgevoerd.',
      more: 'In Roblox gebruik je `error` vaak om te stoppen als iets ontbreekt, en `pcall` om zo\'n fout netjes op te vangen.' };
  }

  return {
    ...base,
    category: 'other',
    certainty: 'onbekend',
    what: 'Er is iets misgegaan dat we nog niet precies kunnen uitleggen.',
    why: 'Luau gaf een melding die nog niet in de lijst van de Academy staat. Meestal staat er wel in op welke regel het misgaat.',
    hint: line ? `Kijk naar regel ${line}. Lees hem langzaam van links naar rechts. Klopt elk haakje, aanhalingsteken en elke naam?` : 'Lees je code langzaam van boven naar beneden. Klopt elk haakje, aanhalingsteken en elke naam?',
    more: `Originele melding (in het Engels): ${msg}`,
  };
}

export function explainRunError(err: RunError, code: string): Explanation {
  if (err.kind === 'interrupted' || err.kind === 'timeout') return explainMessage('interrupted', code, err.line);
  if (err.kind === 'memory') return explainMessage('memory limit', code, err.line);
  return explainMessage(err.message, code, err.line);
}

export function explainDiagnostic(d: Diagnostic, code: string): Explanation {
  return explainMessage(d.message, code, d.line, d.column);
}

function dutchType(t: string): string {
  return ({ string: 'tekst (string)', number: 'getal (number)', boolean: 'boolean (true/false)', nil: 'nil', table: 'tabel', function: 'functie' } as Record<string, string>)[t] ?? t;
}

function findIfLine(code: string, errLine: number): number {
  const lines = code.split('\n');
  for (let i = Math.min(errLine, lines.length) - 1; i >= 0; i--) {
    if (/^\s*(if|elseif)\b/.test(lines[i])) return i + 1;
  }
  return errLine;
}

function guessMistypedCall(code: string, line?: number): string | null {
  if (!line) return null;
  const toks = codeTokens(code).filter((t) => t.line === line);
  for (let i = 0; i < toks.length - 1; i++) {
    if (toks[i].type === 'name' && toks[i + 1].value === '(') return toks[i].value;
  }
  return null;
}

/** Edit distance that also counts a swap of two neighbouring letters (a very common typo) as one edit. */
function editDistance(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) dp[i][j] = Math.min(dp[i][j], dp[i - 2][j - 2] + 1);
    }
  return dp[a.length][b.length];
}

const KNOWN_FUNCTIONS = ['print', 'warn', 'typeof', 'tostring', 'tonumber', 'math', 'string', 'table', 'task', 'pairs', 'ipairs', 'type', 'error', 'pcall', 'select'];

function closestName(name: string, code: string): string | null {
  const locals = new Set<string>(KNOWN_FUNCTIONS);
  const toks = codeTokens(code);
  toks.forEach((t, i) => {
    if (t.value === 'local' && toks[i + 1]?.type === 'name') locals.add(toks[i + 1].value);
    if (t.value === 'function' && toks[i + 1]?.type === 'name') locals.add(toks[i + 1].value);
  });
  let best: string | null = null;
  let bestD = Infinity;
  for (const cand of locals) {
    if (cand === name) continue;
    const d = cand.toLowerCase() === name.toLowerCase() ? 0 : editDistance(cand, name);
    if (d < bestD) {
      bestD = d;
      best = cand;
    }
  }
  return bestD <= (name.length <= 4 ? 1 : 2) ? best : null;
}
