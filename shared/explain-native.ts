/**
 * Dutch explanations for real g++ / javac / JVM messages. Same rules as the Luau assistant:
 * always based on the actual message, certainty labelled, unknown messages shown verbatim.
 */
import type { Explanation } from './explain-error';

type Lang = 'cpp' | 'java';

function lineOf(msg: string, lang: Lang): number | undefined {
  const m = lang === 'java' ? /Main\.java:(\d+)/.exec(msg) : /main\.cpp:(\d+):/.exec(msg);
  return m ? Number(m[1]) : undefined;
}

/** First meaningful error line, without file paths. */
function core(msg: string): string {
  const l = msg.split('\n').find((x) => /error|Exception|Error/.test(x)) ?? msg.split('\n')[0] ?? msg;
  return l.replace(/^.*?(main\.cpp|Main\.java):\d+(:\d+)?:\s*/, '').trim();
}

export function explainNative(raw: string, lang: Lang): Explanation {
  const original = raw.trim();
  const msg = core(original);
  const line = lineOf(original, lang);
  const base = { original, line };
  const L = lang === 'java' ? 'Java' : 'C++';
  let m: RegExpExecArray | null;

  if (/expected ';'|';' expected/.test(msg)) {
    return { ...base, category: 'incomplete-statement', certainty: 'zeker',
      what: 'Je bent een puntkomma `;` vergeten.',
      why: `In ${L} eindigt elke opdracht met een \`;\`. Zo weet de compiler waar de ene opdracht stopt en de volgende begint.`,
      hint: 'Kijk aan het einde van de gemarkeerde regel, of van de regel erboven. Staat daar een `;`?',
      more: 'Na `}` van een blok (zoals `if` of een functie) komt meestal géén puntkomma. Na een gewone opdracht wel.' };
  }
  if (/expected '}' at end of input|reached end of file while parsing/.test(msg)) {
    return { ...base, category: 'missing-end', certainty: 'zeker',
      what: 'Je bent een sluitende accolade `}` vergeten.',
      why: 'Elke `{` heeft een `}` nodig. De compiler kwam aan het einde van je code, maar er stond nog een blok open.',
      hint: 'Tel de `{` en de `}` in je code. Waar eindigt elk blok?',
      more: 'Tip: spring de code binnen elk blok in. Dan zie je meteen welke `}` bij welke `{` hoort.' };
  }
  if (/missing terminating " character|unclosed string literal/.test(msg)) {
    return { ...base, category: 'unfinished-string', certainty: 'zeker',
      what: 'Je tekst is niet afgesloten met een aanhalingsteken `"`.',
      why: 'Tekst staat tussen twee `"`. De compiler vond het begin, maar niet het einde.',
      hint: 'Zoek op deze regel de tekst en zet een `"` aan het einde ervan.',
      more: `In ${L} gebruik je voor tekst altijd dubbele aanhalingstekens. Enkele \`'\` zijn voor één teken, zoals \`'a'\`.` };
  }
  if ((m = /'(cout|cin|endl|string)' was not declared in this scope/.exec(msg)) || (m = /'(cout|cin|endl|string)' is not a member/.exec(msg))) {
    return { ...base, category: 'unknown-global', certainty: 'waarschijnlijk',
      what: `C++ kent \`${m[1]}\` hier niet.`,
      why: `\`${m[1]}\` hoort bij de standaardbibliotheek. Je moet het juiste bestand insluiten en \`std::\` ervoor zetten.`,
      hint: m[1] === 'string' ? 'Zet `#include <string>` bovenaan en schrijf `std::string`.' : 'Zet `#include <iostream>` bovenaan en schrijf `std::' + m[1] + '`.',
      more: '`std::` betekent "uit de standaardbibliotheek". Sommige voorbeelden gebruiken `using namespace std;`, maar `std::` voluit schrijven is duidelijker.' };
  }
  if ((m = /'([A-Za-z_]\w*)' was not declared in this scope/.exec(msg)) || (m = /cannot find symbol[\s\S]*?symbol:\s+\w+\s+([A-Za-z_]\w*)/.exec(original))) {
    return { ...base, category: 'unknown-global', certainty: 'waarschijnlijk',
      what: `${L} kent de naam \`${m[1]}\` niet.`,
      why: 'Je gebruikt een variabele of functie die (nog) niet bestaat. Vaak is het een tikfout of een vergeten declaratie.',
      hint: `Controleer de spelling en hoofdletters van \`${m[1]}\`. Heb je hem eerder gemaakt, bijvoorbeeld met \`int ${m[1]} = ...;\`?`,
      more: `${L} is hoofdlettergevoelig, en een variabele bestaat alleen binnen het blok \`{ }\` waarin je hem maakt.` };
  }
  if (/cannot find symbol/.test(msg)) {
    return { ...base, category: 'unknown-global', certainty: 'waarschijnlijk',
      what: 'Java kent een naam in deze regel niet.',
      why: 'Je gebruikt een variabele, methode of klasse die niet bestaat. Vaak is het een tikfout (let op hoofdletters: `System`, `String`).',
      hint: 'Vergelijk elke naam op deze regel letter voor letter met waar je hem gemaakt hebt.',
      more: 'In Java beginnen klassen met een hoofdletter (`String`, `System`), variabelen en methodes met een kleine letter.' };
  }
  if ((m = /incompatible types: (\w+) cannot be converted to (\w+)/.exec(msg)) || (m = /invalid conversion from '([^']+)' to '([^']+)'/.exec(msg)) || (m = /cannot convert '([^']+)' to '([^']+)'/.exec(msg))) {
    return { ...base, category: 'type-mismatch', certainty: 'zeker',
      what: `Je stopt een waarde van het soort \`${m[1]}\` in iets van het soort \`${m[2]}\`.`,
      why: `In ${L} heeft elke variabele een vast type. Een \`int\` kan alleen hele getallen bevatten, een \`String\`/\`string\` alleen tekst.`,
      hint: 'Controleer of je tekst (met aanhalingstekens) gebruikt waar een getal hoort, of andersom.',
      more: 'Getal naar tekst: in Java `String.valueOf(5)`, in C++ `std::to_string(5)`. Tekst naar getal: `Integer.parseInt("5")` of `std::stoi("5")`.' };
  }
  if (/class, interface, enum, or record expected|expected unqualified-id/.test(msg)) {
    return { ...base, category: 'incomplete-statement', certainty: 'waarschijnlijk',
      what: 'Er staat code op een plek waar die niet mag.',
      why: lang === 'java' ? 'In Java moet code binnen een klasse en binnen een methode staan, zoals in `main`.' : 'In C++ moeten opdrachten binnen een functie staan, zoals in `main`.',
      hint: 'Kijk of er een `}` te veel staat, waardoor je code buiten `main` terechtkomt.',
      more: 'Tel je accolades: na de laatste `}` van `main` (en in Java van de klasse) mag geen code meer staan.' };
  }
  if ((m = /Exception in thread "main" java\.lang\.(\w+)(?::\s*(.*))?/.exec(original))) {
    const kind = m[1];
    const map: Record<string, [string, string, string]> = {
      ArithmeticException: ['Je deelt door nul.', 'Een geheel getal delen door 0 kan niet; Java stopt het programma.', 'Controleer met een `if` of de deler niet 0 is voordat je deelt.'],
      ArrayIndexOutOfBoundsException: ['Je gebruikt een plek in een array die niet bestaat.', 'Arrays in Java beginnen bij index 0. Een array van lengte 3 heeft de plekken 0, 1 en 2.', 'Gebruik `< array.length` in je for-lus, niet `<=`.'],
      NullPointerException: ['Je gebruikt iets dat `null` is (er zit niets in).', 'Een variabele die naar geen object wijst, is `null`. Daar kun je geen methode op aanroepen.', 'Controleer waar deze variabele een waarde had moeten krijgen.'],
      NumberFormatException: ['Je probeert tekst om te zetten naar een getal, maar het is geen getal.', '`Integer.parseInt` werkt alleen met tekst die uit cijfers bestaat.', 'Controleer de tekst die je omzet.'],
      StackOverflowError: ['Je functie roept zichzelf eindeloos aan.', 'Bij recursie moet er een stopvoorwaarde zijn.', 'Controleer of je methode ooit stopt met zichzelf aan te roepen.'],
    };
    const t = map[kind];
    if (t) return { ...base, category: 'other', certainty: 'zeker', what: t[0], why: t[1], hint: t[2], more: `Java-melding: ${kind}${m[2] ? ': ' + m[2] : ''}` };
  }
  if (/niet gevonden op deze computer|geen C\+\+-compiler/.test(original)) {
    return { ...base, category: 'other', certainty: 'zeker',
      what: original,
      why: lang === 'java' ? 'Om Java te draaien heb je de gratis Java Development Kit (JDK) nodig.' : 'Om C++ te draaien heb je een gratis C++-compiler nodig (g++ uit MinGW-w64).',
      hint: 'Bovenaan de les staat hoe je hem gratis installeert. Klik daarna op "Opnieuw zoeken".',
      more: 'De Academy gebruikt de officiële gereedschappen, zodat je code precies zo werkt als bij echte programmeurs.' };
  }
  return { ...base, category: 'other', certainty: 'onbekend',
    what: `${lang === 'java' ? 'Java' : 'De C++-compiler'} meldt een probleem dat we nog niet in gewone taal kunnen vertalen.`,
    why: 'Hieronder staat de originele melding. Meestal staat het regelnummer erin.',
    hint: line ? `Begin met regel ${line}: lees hem langzaam van links naar rechts.` : 'Lees je code langzaam van boven naar beneden.',
    more: `Originele melding: ${msg}` };
}
