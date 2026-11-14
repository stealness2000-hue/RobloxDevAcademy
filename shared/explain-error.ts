/**
 * Beginner-friendly error assistant.
 *
 * Turns REAL diagnostics (from the Luau compiler, runtime or analyzer) into plain language.
 * Texts are English and go through t(), so they appear in the student's language.
 * Rules:
 *  - Every explanation starts from an actual message; we never invent an error.
 *  - `certainty: 'certain'` means the message itself states the cause.
 *    `certainty: 'likely'` means we infer the most common beginner cause.
 *  - Unknown messages fall back to the original text, clearly labelled.
 */
import { findBracketIssues, codeTokens } from './luau-lexer';
import { t } from './i18n';
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

/** English labels; show them with t(). */
export const ERROR_CATEGORY_LABELS: Record<ErrorCategory, string> = {
  'missing-bracket': 'Forgot a bracket',
  'missing-then': 'Forgot `then`',
  'missing-do': 'Forgot `do`',
  'missing-end': 'Forgot `end`',
  'unfinished-string': 'Text not closed',
  'nil-arithmetic': 'Math with nil',
  'nil-concat': 'Joining text with nil',
  'nil-call': 'Function does not exist',
  'nil-index': 'Looking something up in nil',
  'unknown-global': 'Unknown name',
  'roblox-only': 'Only in Roblox Studio',
  'type-mismatch': 'Wrong kind of value',
  'incomplete-statement': 'Incomplete line',
  'infinite-loop': 'Infinite loop',
  memory: 'Too much memory',
  'unused-variable': 'Unused variable',
  other: 'Other',
};

export type Certainty = 'certain' | 'likely' | 'unknown';

export interface Explanation {
  category: ErrorCategory;
  certainty: Certainty;
  /** What went wrong? */
  what: string;
  /** Why does this happen? */
  why: string;
  /** Where is the mistake? */
  line?: number;
  column?: number;
  /** How can you fix it? (a hint, never the full answer) */
  hint: string;
  /** Want more explanation? */
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
  add: 'add (+)',
  sub: 'subtract (-)',
  mul: 'multiply (*)',
  div: 'divide (/)',
  mod: 'take the remainder (%)',
  pow: 'raise to a power (^)',
  unm: 'make negative (-)',
  idiv: 'divide into whole numbers (//)',
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
      certainty: 'certain',
      what: t('You probably forgot a closing bracket `)`.'),
      why: t('Every opening bracket `(` needs a closing bracket `)`. Luau saw a `(` but could not find where it ends.'),
      hint: t('Look at the highlighted bracket. Where does the information you put between the brackets end? Put a `)` there.'),
      more: t('Brackets work as a pair: `print(` opens the list of information for `print`, and `)` closes it. Count how many `(` and how many `)` are on your line: the numbers must be equal.'),
    };
  }
  if ((m = /Expected '([\]}])' \(to close '([[{])' at (?:line (\d+), )?column (\d+)\)/.exec(msg))) {
    return {
      ...base,
      line: m[3] ? Number(m[3]) : line,
      column: Number(m[4]),
      category: 'missing-bracket',
      certainty: 'certain',
      what: t('You forgot a closing bracket `{close}`.', { close: m[1] }),
      why: t('There is an opening `{open}` without a matching `{close}`.', { open: m[2], close: m[1] }),
      hint: t('Find the highlighted `{open}` and put the `{close}` where that group ends.', { open: m[2], close: m[1] }),
      more: t('Every kind of bracket has its own closer: `(` with `)`, `{` with `}` and `[` with `]`.'),
    };
  }
  if (/Expected 'then' when parsing if statement/.test(msg) || /Expected 'then' when parsing elseif/.test(msg)) {
    return {
      ...base,
      category: 'missing-then',
      certainty: 'certain',
      what: t('You forgot the word `then` after your condition.'),
      why: t('In Luau an if statement always looks like this: `if condition then`. The word `then` tells Luau where the condition stops and the code that should happen begins.'),
      hint: t('Look at the line with `if`. What has to be at the end of that line?'),
      more: t('Read it like a sentence: "**if** coins is greater than 50 **then** ...". Without `then` Luau does not know where your question ends.'),
      line: line && line > 1 ? findIfLine(code, line) : line,
    };
  }
  if (/Expected 'do' when parsing (for|while) loop/.test(msg)) {
    return {
      ...base,
      category: 'missing-do',
      certainty: 'certain',
      what: t('You forgot the word `do` in your loop.'),
      why: t('A `for` or `while` loop needs the word `do` to show where the repeated code starts.'),
      hint: t('Put `do` at the end of the line where your loop starts.'),
      more: t('Example of the shape: `for i = 1, 3 do` … `end`.'),
    };
  }
  if ((m = /Expected 'end' \(to close '(\w+)' at line (\d+)\)/.exec(msg))) {
    const what: Record<string, string> = { function: 'function', if: 'if statement', do: 'block', for: 'for loop', while: 'while loop', then: 'if statement' };
    return {
      ...base,
      line: Number(m[2]),
      category: 'missing-end',
      certainty: 'certain',
      what: t('Your {block} on line {line} is not closed with `end`.', { block: t(what[m[1]] ?? 'block'), line: m[2] }),
      why: t('Blocks like `if`, `for`, `while` and `function` must end with the word `end`, so Luau knows where the block stops.'),
      hint: t('Think about where the block from line {line} should stop, and put `end` there.', { line: m[2] }),
      more: t('A good habit: write `end` right after you start a block, and only then fill in the inside.'),
    };
  }
  if (/Malformed string|Unfinished string|unfinished string/i.test(msg)) {
    return {
      ...base,
      category: 'unfinished-string',
      certainty: 'certain',
      what: t('Your text (string) is not closed with a quote.'),
      why: t('Text starts and ends with the same quote, for example `"Hello"`. Luau found the start, but not the end.'),
      hint: t('Check that your text on this line has a `"` on both sides.'),
      more: t('Quotes tell Luau: "everything between these is plain text, not code". That is why you have to mark both the start and the end.'),
    };
  }
  if (/Malformed number/.test(msg)) {
    return {
      ...base,
      category: 'incomplete-statement',
      certainty: 'certain',
      what: t('There is a number stuck directly to letters.'),
      why: t('Luau reads something like `2coins` or `0print` as one broken number. A name may not start with a digit, and between a number and a new word there should be a space or a new line.'),
      hint: t('Find a digit directly followed by letters on this line. Should there be a new line or a space in between? Or does a variable name start with a digit?'),
      more: t('Good names: `coins2`, `secondPlayer`. Wrong names: `2coins`, `2ndPlayer`. Decimal numbers are written with a dot: `1.5`, not `1,5`.'),
    };
  }
  if (/Incomplete statement: expected assignment or a function call/.test(msg)) {
    return {
      ...base,
      category: 'incomplete-statement',
      certainty: 'likely',
      what: t('This line is not a complete instruction.'),
      why: t('Every line of code must DO something: store a value (`x = 5`) or call a function (`print(x)`). Just writing a name or a value is not an instruction.'),
      hint: t('Often the brackets after a function name are missing, or an `=` when storing a value.'),
      more: t('`print` without brackets and without text does nothing. Always use `print(...)`.'),
    };
  }
  if ((m = /Expected identifier when parsing (expression|variable name), got '?([^']*)'?/.exec(msg)) && m[2] !== ')') {
    return {
      ...base,
      category: 'incomplete-statement',
      certainty: 'likely',
      what: m[2] ? t('Luau was waiting for a name or value here, but found `{found}`.', { found: m[2] }) : t('Luau was waiting for a name or value here, but found nothing.'),
      why: t('After signs like `=`, `+` or `,` something still has to follow. Maybe something fell out, or there is one sign too many.'),
      hint: t('Read the highlighted line from left to right: is there a value after every math sign or `=`?'),
      more: t('Variable names also may not start with a digit or contain spaces or special characters.'),
    };
  }

  // ---- Runtime errors ------------------------------------------------------
  if ((m = /attempt to perform arithmetic \((\w+)\) on (\w+)(?: and (\w+))?/.exec(msg))) {
    const op = t(NIL_OPS[m[1]] ?? 'calculate');
    const types = [m[2], m[3]].filter(Boolean);
    if (types.includes('nil')) {
      return {
        ...base,
        category: 'nil-arithmetic',
        certainty: 'certain',
        what: t('You are trying to {op} with a value that does not exist (`nil`).', { op }),
        why: t('`nil` means "nothing". A variable is `nil` if you never gave it a value, or if you typed the name wrong.'),
        hint: t('Check which variable on this line is `nil`. Did you give it a number earlier? Is the name spelled exactly the same?'),
        more: t('Luau is case-sensitive: `Coins` and `coins` are two different names. So a typo creates a new, empty (`nil`) name.'),
      };
    }
    return {
      ...base,
      category: 'type-mismatch',
      certainty: 'certain',
      what: t('You are trying to {op} with {types}.', { op, types: types.map(typeName).join(t(' and ')) }),
      why: t('Math only works with numbers. Text like `"10"` is not a number, even though it looks like one.'),
      hint: t('Check whether one of the values is between quotes. Does that really have to be text?'),
      more: t('Want to turn text into a number? Use `tonumber("10")`. Want to join text together? Use `..` instead of `+`.'),
    };
  }
  if ((m = /attempt to concatenate (\w+) with (\w+)/.exec(msg))) {
    const hasNil = m[1] === 'nil' || m[2] === 'nil';
    return {
      ...base,
      category: hasNil ? 'nil-concat' : 'type-mismatch',
      certainty: 'certain',
      what: hasNil
        ? t('You are trying to join text with a value that does not exist (`nil`).')
        : t('You are trying to join {a} and {b} together.', { a: typeName(m[1]), b: typeName(m[2]) }),
      why: hasNil
        ? t('With `..` you join text together. But one of the two sides is `nil`: there is nothing there to join.')
        : t('`..` works with text and numbers, not with other kinds of values like `true`/`false` or tables.'),
      hint: hasNil
        ? t('Check which variable on this line has no value yet, or is spelled wrong.')
        : t('Use `tostring(value)` to turn the value into text first.'),
      more: t('Example: `"Coins: " .. tostring(isRich)` first turns `true` into the text `"true"`.'),
    };
  }
  if (/attempt to call a nil value/.test(msg)) {
    const guess = guessMistypedCall(code, line);
    return {
      ...base,
      category: 'nil-call',
      certainty: 'likely',
      what: guess ? t('Luau does not know a function called `{name}`.', { name: guess }) : t('You are calling a function that does not exist.'),
      why: t('After a name with brackets, like `print(...)`, Luau expects a function. That name does not exist here (it is `nil`).'),
      hint: guess && guess.toLowerCase() === 'print' && guess !== 'print'
        ? t('Watch the capital letters: Luau sees `Print` and `print` as different.')
        : t('Check the spelling and capital letters of the function name on this line.'),
      more: t('Many beginner mistakes are typos: `pritn`, `Print`, `prnt`. Luau is case-sensitive.'),
    };
  }
  if ((m = /attempt to index (\w+) with '?([^'\n]*)'?/.exec(msg))) {
    return {
      ...base,
      category: m[1] === 'nil' ? 'nil-index' : 'type-mismatch',
      certainty: 'certain',
      what: m[1] === 'nil'
        ? t('You are looking up `{key}` in something that does not exist (`nil`).', { key: m[2] })
        : t('You are looking up `{key}` in {kind}, but you cannot look anything up in that.', { key: m[2], kind: typeName(m[1]) }),
      why: t('With a dot (`a.b`) or brackets (`a["b"]`) you look something up inside a value. The value before the dot must be a table or object for that.'),
      hint: t('Look at the part before the dot on this line. Does it really exist, and does it have the right name?'),
      more: t('In Roblox this often happens when an object has not loaded yet. Later you will learn to use `WaitForChild()` for that.'),
    };
  }
  if (/interrupt budget|interrupted/i.test(msg)) {
    return {
      ...base,
      category: 'infinite-loop',
      certainty: 'likely',
      what: t('Your program kept running too long and was stopped.'),
      why: t('Usually this is caused by a loop that never stops, for example `while true do` without `break`, or a condition that always stays true.'),
      hint: t('Look at your loop: does something change inside the loop so the condition eventually becomes false?'),
      more: t('The Academy stops code that runs too long, so the app does not freeze. In Roblox Studio an infinite loop without `task.wait()` can freeze your whole game.'),
    };
  }
  if (/not enough memory|memory limit/i.test(msg)) {
    return {
      ...base,
      category: 'memory',
      certainty: 'likely',
      what: t('Your program used too much memory.'),
      why: t('This often happens when a loop keeps adding more data and never stops.'),
      hint: t('Check whether your loop has a clear end.'),
      more: t('The Academy limits the memory of practice code to about 32 MB.'),
    };
  }

  // ---- Analyzer diagnostics --------------------------------------------------
  if ((m = /Unknown global '([^']+)'/.exec(msg))) {
    const name = m[1];
    if (ROBLOX_GLOBALS.has(name)) {
      return {
        ...base,
        category: 'roblox-only',
        certainty: 'certain',
        what: t('`{name}` only exists in Roblox Studio.', { name }),
        why: t('The Luau playground runs plain Luau. Parts of the Roblox engine, like `{name}`, are not available there.', { name }),
        hint: t('Test this code in Roblox Studio itself.'),
        more: t('Luau is the programming language. Roblox adds its own parts to it (like `game`, `workspace` and `Instance`). Those only work inside Roblox.'),
      };
    }
    const similar = closestName(name, code);
    return {
      ...base,
      category: 'unknown-global',
      certainty: similar ? 'likely' : 'certain',
      what: t('Luau does not know the name `{name}`.', { name }),
      why: t('You are using a name that has not been given a value anywhere yet. Often this is a typo, or you forgot to create the variable first.'),
      hint: similar ? t('Did you mean `{similar}`? Watch the spelling and capital letters.', { similar }) : t('First create `{name}` with `local {name} = ...`, or check the spelling.', { name }),
      more: t('A variable only exists from the line where you create it. If you use it earlier, it is still unknown.'),
    };
  }
  if ((m = /Variable '([^']+)' is never used/.exec(msg)) || (m = /Local variable '([^']+)' is never used/.exec(msg))) {
    return {
      ...base,
      category: 'unused-variable',
      certainty: 'certain',
      what: t('The variable `{name}` is not used anywhere.', { name: m[1] }),
      why: t('This is not an error, but a tip: you stored a value that you never use afterwards.'),
      hint: t('Is that on purpose? If not, use it, for example in a `print`.'),
      more: t('Warnings (yellow) do not stop your code. Errors (red) do.'),
    };
  }
  if ((m = /Type '([^']+)' could not be converted into '([^']+)'/.exec(msg))) {
    return {
      ...base,
      category: 'type-mismatch',
      certainty: 'certain',
      what: t('Here is a value of the kind `{got}`, but Luau expects `{want}`.', { got: m[1], want: m[2] }),
      why: t('Some operations only work with a certain kind of value (for example only with numbers).'),
      hint: t('Check whether you accidentally used text (with quotes) where a number belongs, or the other way round.'),
      more: t('`number` = number, `string` = text, `boolean` = true/false, `nil` = nothing.'),
    };
  }

  // ---- More syntax mistakes ------------------------------------------------
  if (/Expected ',' after table constructor element/.test(msg)) {
    return { ...base, category: 'missing-bracket', certainty: 'certain',
      what: t('Your table is missing a comma, or the closing curly brace `}`.'),
      why: t('In a table `{ }` you put a comma between every item, like `{1, 2, 3}`. After the last item you close with `}`.'),
      hint: t('Look at the end of the previous line: is there a comma? And is there a `}` at the bottom?'),
      more: t('Example: `local stats = { health = 100, speed = 16 }`. A comma after the last item is allowed too.') };
  }
  if ((m = /Expected '\}' \(to close '\{' at line (\d+)\)/.exec(msg)) || (m = /Expected '\)' \(to close '\(' at line (\d+)\)/.exec(msg))) {
    const brace = msg.includes("'{'");
    return { ...base, line: Number(m[1]), category: 'missing-bracket', certainty: 'certain',
      what: brace ? t('You forgot a closing curly brace `}`.') : t('You forgot a closing bracket `)`.'),
      why: brace ? t('On line {line} a table starts with `{`, but it is never closed.', { line: m[1] }) : t('On line {line} something starts with `(`, but the closing bracket is missing.', { line: m[1] }),
      hint: brace ? t('Put a `}` where your table should end.') : t('Put a `)` where the information between the brackets ends.'),
      more: t('Every opening sign needs a closing sign: `(` with `)`, `{` with `}`, `[` with `]`.') };
  }
  if ((m = /Expected <eof>, got '(end|else|elseif|until|\))'/.exec(msg))) {
    const w = m[1];
    return { ...base, category: 'missing-end', certainty: 'certain',
      what: w === 'end' ? t('There is one `end` too many.') : w === ')' ? t('There is one bracket `)` too many.') : t('There is an `{word}` without a matching `if`.', { word: w }),
      why: w === 'end' ? t('Every `end` closes a block (like `if`, `for` or `function`). This `end` has no block left to close.') : w === ')' ? t('There are more closing than opening brackets.') : t('`{word}` can only be inside an if statement, after `if ... then`.', { word: w }),
      hint: w === 'end' ? t('Count your blocks: does every `end` belong to an `if`, `for`, `while` or `function`? Remove the extra `end`.') : w === ')' ? t('Count the `(` and `)` on this line and remove one `)`.') : t('Put an `if ... then` above it, or remove this line.'),
      more: t('Tip: with the Format button you can see from the indentation which block ends where.') };
  }
  if (/A new statement is on the same line/.test(msg)) {
    return { ...base, category: 'incomplete-statement', certainty: 'likely',
      what: t('There are two instructions on one line, probably because of a mistake before it.'),
      why: t('Luau thinks a new instruction starts on the same line. That often happens when there is something too many or too few, like a bracket or an `=`.'),
      hint: t('First fix the other mistake on this line; this message then usually disappears by itself.'),
      more: t('Really want two instructions? Put them on separate lines; that is much easier to read too.') };
  }
  if (/Expected identifier when parsing expression, got '\)'/.exec(msg)) {
    return { ...base, category: 'missing-bracket', certainty: 'certain',
      what: t('There is one bracket `)` too many, or something is missing before the bracket.'),
      why: t('Luau still expected a value, but ran into a closing bracket.'),
      hint: t('Count the `(` and `)` on this line. Are there as many of each?'),
      more: t('An extra comma can also cause this, like `print("a",)`.') };
  }

  // ---- More runtime mistakes -----------------------------------------------
  if ((m = /attempt to compare (\w+) [<>=]+ (\w+)/.exec(msg))) {
    return { ...base, category: 'type-mismatch', certainty: 'certain',
      what: t('You are comparing {a} with {b}.', { a: typeName(m[1]), b: typeName(m[2]) }),
      why: t('With `<`, `>`, `<=` and `>=` you can only compare numbers with numbers (or text with text).'),
      hint: t('Check which value is not a number. Is there text between quotes, or is something `nil`?'),
      more: t('You can turn text into a number with `tonumber("10")`.') };
  }
  if ((m = /invalid argument #(\d+) to '([^']+)' \((\w+) expected, got (\w+)\)/.exec(msg)) || (m = /the function '([^']+)' expects to get an? (\w+) as its (\d+)\w* argument, but is being given an? (\w+)/.exec(msg))) {
    const fn = m[0].startsWith('invalid') ? m[2] : m[1];
    const nr = m[0].startsWith('invalid') ? m[1] : m[3];
    const want = m[0].startsWith('invalid') ? m[3] : m[2];
    const got = m[4];
    return { ...base, category: 'type-mismatch', certainty: 'certain',
      what: t('You are giving `{fn}` the wrong kind of value.', { fn }),
      why: t('`{fn}` expects {want} as argument number {nr}, but got {got}.', { fn, nr, want: typeName(want), got: typeName(got) }),
      hint: t('Look at what you put between the brackets of `{fn}(...)`. Should that be {want}?', { fn, want: typeName(want) }),
      more: t('An argument is the information between the brackets. Every function expects a certain kind of information.') };
  }
  if ((m = /missing argument #(\d+)(?: to '([^']+)')?/.exec(msg)) || (m = /the function '([^']+)' will error at runtime if it is not called with (\d+) arguments?/.exec(msg))) {
    const analyzer = m[0].startsWith('the function');
    const fn = analyzer ? m[1] : m[2] ?? t('this function');
    const methodLike = /^[a-z]\w*\.(upper|lower|sub|len|rep|find|gsub|split|format)$/.test(fn);
    const colon = fn.replace('.', ':');
    return { ...base, category: 'incomplete-statement', certainty: 'certain',
      what: methodLike ? t('Use a colon: `{good}()` instead of `{bad}()`.', { good: colon, bad: fn }) : t('You forgot information between the brackets of `{fn}`.', { fn }),
      why: methodLike ? t('You call text functions on a variable with `:`. Then Luau passes the text itself along automatically.') : t('`{fn}` needs information (an argument) to work, but the brackets are empty or one is missing.', { fn }),
      hint: methodLike ? t('Write `{good}()`.', { good: colon }) : t('Put what `{fn}` needs between the brackets, for example a number or text.', { fn }),
      more: t('With `name:method()` you work with the value itself. With `name.function()` you have to pass everything yourself.') };
  }
  if ((m = /attempt to call an? (\w+) value/.exec(msg)) && m[1] !== 'nil') {
    return { ...base, category: 'nil-call', certainty: 'certain',
      what: t('You are using brackets `()` after {kind}, but that is not a function.', { kind: typeName(m[1]) }),
      why: t('Brackets after a name mean: run this function. But this name holds a value, not a function.'),
      hint: t('Remove the brackets, or check that you use the right name (maybe a variable has the same name as a function).'),
      more: t('Example: `local score = 5` and then `score()` gives this error, because 5 is not a function.') };
  }
  if (/stack overflow/i.test(msg)) {
    return { ...base, category: 'infinite-loop', certainty: 'likely',
      what: t('A function keeps calling itself without end.'),
      why: t('When a function calls itself without ever stopping, the memory for calls runs out.'),
      hint: t('Check whether your function calls itself. Add an `if` that makes it stop at some point.'),
      more: t('This is called recursion. It is useful, but always needs a stop condition.') };
  }
  if (/table index is nil/.test(msg)) {
    return { ...base, category: 'nil-index', certainty: 'certain',
      what: t('You are using `nil` as a key in a table.'),
      why: t('A key (between `[ ]`) must be a real value, like a name or number. `nil` means "nothing" and cannot be a key.'),
      hint: t('Check which variable you put between the square brackets. Does it have a value?'),
      more: t('Often the variable is spelled wrong, or has not been given a value yet.') };
  }
  if (/\berror\s*\(/.test(code) && !/attempt to|Expected|Unknown global|Malformed/.test(msg) && /runtime error/.test(original)) {
    return { ...base, category: 'other', certainty: 'certain',
      what: t('Your code gave its own error message: "{message}".', { message: msg }),
      why: t('With `error("...")` you stop your program on purpose with your own message. That is handy for noticing problems.'),
      hint: t('Is this on purpose? If not, check why the line with `error(...)` ran.'),
      more: t('In Roblox you often use `error` to stop when something is missing, and `pcall` to catch such an error neatly.') };
  }

  return {
    ...base,
    category: 'other',
    certainty: 'unknown',
    what: t('Something went wrong that we cannot explain exactly yet.'),
    why: t('Luau gave a message that is not in the Academy\'s list yet. It usually does say on which line it goes wrong.'),
    hint: line ? t('Look at line {line}. Read it slowly from left to right. Is every bracket, quote and name right?', { line }) : t('Read your code slowly from top to bottom. Is every bracket, quote and name right?'),
    more: t('Original message (in English): {message}', { message: msg }),
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

/** "a number (number)", "text (string)", … in the current language. */
function typeName(kind: string): string {
  const names: Record<string, string> = {
    string: 'text (string)', number: 'a number (number)', boolean: 'a boolean (true/false)', nil: 'nil', table: 'a table', function: 'a function',
  };
  return names[kind] ? t(names[kind]) : kind;
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
  const toks = codeTokens(code).filter((tok) => tok.line === line);
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
  toks.forEach((tok, i) => {
    if (tok.value === 'local' && toks[i + 1]?.type === 'name') locals.add(toks[i + 1].value);
    if (tok.value === 'function' && toks[i + 1]?.type === 'name') locals.add(toks[i + 1].value);
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
