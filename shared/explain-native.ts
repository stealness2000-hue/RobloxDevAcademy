/**
 * Plain-language explanations for real g++ / javac / JVM messages. Same rules as the Luau assistant:
 * always based on the actual message, certainty labelled, unknown messages shown verbatim.
 * Texts are English and go through t().
 */
import type { Explanation } from './explain-error';
import { t } from './i18n';

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
    return { ...base, category: 'incomplete-statement', certainty: 'certain',
      what: t('You forgot a semicolon `;`.'),
      why: t('In {lang} every instruction ends with a `;`. That is how the compiler knows where one instruction stops and the next one starts.', { lang: L }),
      hint: t('Look at the end of the highlighted line, or the line above it. Is there a `;`?'),
      more: t('After the `}` of a block (like `if` or a function) there is usually no semicolon. After a normal instruction there is.') };
  }
  if (/expected '}' at end of input|reached end of file while parsing/.test(msg)) {
    return { ...base, category: 'missing-end', certainty: 'certain',
      what: t('You forgot a closing curly brace `}`.'),
      why: t('Every `{` needs a `}`. The compiler reached the end of your code, but a block was still open.'),
      hint: t('Count the `{` and the `}` in your code. Where does each block end?'),
      more: t('Tip: indent the code inside every block. Then you see right away which `}` belongs to which `{`.') };
  }
  if (/missing terminating " character|unclosed string literal/.test(msg)) {
    return { ...base, category: 'unfinished-string', certainty: 'certain',
      what: t('Your text is not closed with a quote `"`.'),
      why: t('Text goes between two `"`. The compiler found the start, but not the end.'),
      hint: t('Find the text on this line and put a `"` at the end of it.'),
      more: t("In {lang} you always use double quotes for text. Single `'` quotes are for one character, like `'a'`.", { lang: L }) };
  }
  if ((m = /'(cout|cin|endl|string)' was not declared in this scope/.exec(msg)) || (m = /'(cout|cin|endl|string)' is not a member/.exec(msg))) {
    return { ...base, category: 'unknown-global', certainty: 'likely',
      what: t('C++ does not know `{name}` here.', { name: m[1] }),
      why: t('`{name}` belongs to the standard library. You have to include the right file and put `std::` in front of it.', { name: m[1] }),
      hint: m[1] === 'string' ? t('Put `#include <string>` at the top and write `std::string`.') : t('Put `#include <iostream>` at the top and write `std::{name}`.', { name: m[1] }),
      more: t('`std::` means "from the standard library". Some examples use `using namespace std;`, but writing `std::` in full is clearer.') };
  }
  if ((m = /'([A-Za-z_]\w*)' was not declared in this scope/.exec(msg)) || (m = /cannot find symbol[\s\S]*?symbol:\s+\w+\s+([A-Za-z_]\w*)/.exec(original))) {
    return { ...base, category: 'unknown-global', certainty: 'likely',
      what: t('{lang} does not know the name `{name}`.', { lang: L, name: m[1] }),
      why: t('You are using a variable or function that does not exist (yet). Often it is a typo or a forgotten declaration.'),
      hint: t('Check the spelling and capital letters of `{name}`. Did you create it earlier, for example with `int {name} = ...;`?', { name: m[1] }),
      more: t('{lang} is case-sensitive, and a variable only exists inside the block `{ }` where you create it.', { lang: L }) };
  }
  if (/cannot find symbol/.test(msg)) {
    return { ...base, category: 'unknown-global', certainty: 'likely',
      what: t('Java does not know a name on this line.'),
      why: t('You are using a variable, method or class that does not exist. Often it is a typo (watch capital letters: `System`, `String`).'),
      hint: t('Compare every name on this line letter by letter with where you created it.'),
      more: t('In Java, classes start with a capital letter (`String`, `System`), variables and methods with a small letter.') };
  }
  if ((m = /incompatible types: (\w+) cannot be converted to (\w+)/.exec(msg)) || (m = /invalid conversion from '([^']+)' to '([^']+)'/.exec(msg)) || (m = /cannot convert '([^']+)' to '([^']+)'/.exec(msg))) {
    return { ...base, category: 'type-mismatch', certainty: 'certain',
      what: t('You are putting a value of the kind `{from}` into something of the kind `{to}`.', { from: m[1], to: m[2] }),
      why: t('In {lang} every variable has a fixed type. An `int` can only hold whole numbers, a `String`/`string` only text.', { lang: L }),
      hint: t('Check whether you use text (with quotes) where a number belongs, or the other way round.'),
      more: t('Number to text: in Java `String.valueOf(5)`, in C++ `std::to_string(5)`. Text to number: `Integer.parseInt("5")` or `std::stoi("5")`.') };
  }
  if (/class, interface, enum, or record expected|expected unqualified-id/.test(msg)) {
    return { ...base, category: 'incomplete-statement', certainty: 'likely',
      what: t('There is code in a place where it is not allowed.'),
      why: lang === 'java' ? t('In Java, code must be inside a class and inside a method, like `main`.') : t('In C++, instructions must be inside a function, like `main`.'),
      hint: t('Check whether there is one `}` too many, which puts your code outside `main`.'),
      more: t('Count your curly braces: after the last `}` of `main` (and in Java of the class) no more code may follow.') };
  }
  if ((m = /Exception in thread "main" java\.lang\.(\w+)(?::\s*(.*))?/.exec(original))) {
    const kind = m[1];
    const map: Record<string, [string, string, string]> = {
      ArithmeticException: ['You are dividing by zero.', 'Dividing a whole number by 0 is impossible; Java stops the program.', 'Use an `if` to check that the divisor is not 0 before you divide.'],
      ArrayIndexOutOfBoundsException: ['You are using a spot in an array that does not exist.', 'Arrays in Java start at index 0. An array of length 3 has the spots 0, 1 and 2.', 'Use `< array.length` in your for loop, not `<=`.'],
      NullPointerException: ['You are using something that is `null` (there is nothing in it).', 'A variable that points to no object is `null`. You cannot call a method on it.', 'Check where this variable should have been given a value.'],
      NumberFormatException: ['You are trying to turn text into a number, but it is not a number.', '`Integer.parseInt` only works with text made of digits.', 'Check the text you are converting.'],
      StackOverflowError: ['Your function keeps calling itself without end.', 'With recursion there must be a stop condition.', 'Check whether your method ever stops calling itself.'],
    };
    const x = map[kind];
    if (x) return { ...base, category: 'other', certainty: 'certain', what: t(x[0]), why: t(x[1]), hint: t(x[2]), more: t('Java message: {message}', { message: `${kind}${m[2] ? ': ' + m[2] : ''}` }) };
  }
  if (/was not found on this computer|No C\+\+ compiler/.test(original)) {
    return { ...base, category: 'other', certainty: 'certain',
      what: lang === 'java' ? t('Java (JDK) was not found on this computer.') : t('No C++ compiler (g++) was found on this computer.'),
      why: lang === 'java' ? t('To run Java you need the free Java Development Kit (JDK).') : t('To run C++ you need a free C++ compiler (g++ from MinGW-w64).'),
      hint: t('The top of the lesson shows how to install it for free. Then click "Search again".'),
      more: t('The Academy uses the official tools, so your code works exactly as it does for real programmers.') };
  }
  return { ...base, category: 'other', certainty: 'unknown',
    what: t('Something went wrong that we cannot explain exactly yet.'),
    why: lang === 'java' ? t('Java gave a message that is not in the Academy\'s list yet. It usually does say on which line it goes wrong.') : t('The C++ compiler gave a message that is not in the Academy\'s list yet. It usually does say on which line it goes wrong.'),
    hint: line ? t('Look at line {line}. Is every semicolon, curly brace, quote and name right?', { line }) : t('Read your code slowly from top to bottom. Is every semicolon, curly brace and name right?'),
    more: t('Original message (in English): {message}', { message: msg }) };
}
