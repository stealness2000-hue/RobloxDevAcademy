import type { Course } from './types';

export const course1: Course = {
  id: 'course-1',
  number: 1,
  title: 'Luau fundamentals',
  description: 'Variables, numbers, text, true/false and nil. The building blocks of every Roblox script.',
  level: 'Beginner',
  planned: [],
  lessons: [
    // ------------------------------------------------------------------ 1
    {
      id: 'c1-variables',
      courseId: 'course-1',
      title: 'What is a variable?',
      objective: 'You can create a variable with local, store a value in it and use it later.',
      minutes: 10,
      prerequisites: ['print', 'strings'],
      concepts: ['variables'],
      steps: [
        {
          type: 'explain',
          body: `A **variable** is like a little box where you keep information. The box has a **name**, and inside it is a **value**.

In a game you use this to remember things like how many coins a player has, how fast they walk or what their level is called. Later you can use that value or change it.`,
        },
        {
          type: 'code',
          title: 'Creating a variable',
          body: 'Click the parts to see what they mean.',
          code: 'local coins = 100',
          annotations: [
            { token: 'local', text: '`local` means: create a **new** variable. It also says the variable only exists in this part of your code; you will learn exactly how later.' },
            { token: 'coins', text: '`coins` is the **name** of the variable. You choose it yourself. Pick a name that says what is inside.' },
            { token: '=', text: 'The `=` sign here means **"gets the value"**. It is not a question whether something is equal, but an instruction: put this value in the box.' },
            { token: '100', text: '`100` is the **value** that is stored: a number.' },
          ],
        },
        {
          type: 'visual',
          kind: 'variable',
          title: 'Look inside the boxes',
          body: 'Change the values in the code below (for example 100 to 200) and watch the boxes change.',
          code: 'local coins = 100\nlocal playerName = "Builder"',
        },
        {
          type: 'code',
          title: 'Using a variable',
          body: 'When you use the name of a variable, without quotes, you get the value that is inside.',
          code: 'local coins = 100\nprint(coins)\nprint("coins")',
          runnable: true,
          after: 'Line 2 shows `100`: the value in the box. Line 3 shows the word `coins`, because with quotes it is just text.',
        },
        {
          type: 'exercise',
          id: 'c1-variables-ex1',
          mode: 'guided',
          title: 'Make your first variable',
          prompt: 'Create a variable called **score** with the value **50**.',
          starter: '',
          checks: [
            { kind: 'uses', sequence: ['local', 'score'], message: 'Start with `local`, followed by the name `score`.' },
            { kind: 'uses', sequence: ['score', '='], message: 'Use `=` to give the variable a value.' },
            { kind: 'value', expr: 'score', equals: 50, message: 'The variable `score` exists, but its value is not 50 yet.' },
          ],
          hints: ['Look at the example `local coins = 100`. What do you need to change?', 'The shape is: `local name = value`'],
          solution: 'local score = 50',
          concepts: ['variables'],
          success: 'Your first variable. Almost every Roblox script uses dozens of them.',
        },
        {
          type: 'exercise',
          id: 'c1-variables-ex2',
          mode: 'independent',
          title: 'Store it and show it',
          prompt: 'Create a variable **playerName** with the text **Builder** in it. Then use `print` to show the **value** of that variable.',
          starter: '',
          checks: [
            { kind: 'uses', sequence: ['local', 'playerName', '='], message: 'Create the variable with `local playerName = ...`' },
            { kind: 'value', expr: 'playerName', equals: 'Builder', message: '`playerName` must contain the text "Builder". Do not forget the quotes.' },
            { kind: 'uses', sequence: ['print', '(', 'playerName', ')'], message: 'Show the variable with `print(playerName)`, without quotes around the name.' },
            { kind: 'output', lines: ['Builder'], message: 'The Output must be **Builder**.' },
          ],
          hints: ['Text as a value goes between quotes; the name of the variable does not.', 'Two lines: first create the variable, then print it.'],
          solution: 'local playerName = "Builder"\nprint(playerName)',
          concepts: ['variables', 'strings'],
          success: 'Exactly: you stored information and used it later.',
        },
        {
          type: 'code',
          title: 'Changing a value',
          body: 'You can give a variable a new value later. Then you do **not** write `local` again: the variable already exists.',
          code: 'local coins = 100\ncoins = 150\nprint(coins)',
          runnable: true,
          after: 'After line 2, `coins` contains `150`. The old value is gone.',
        },
        {
          type: 'predict',
          id: 'c1-variables-p1',
          question: 'What does this code show?',
          code: 'local level = 1\nlevel = 2\nlevel = 3\nprint(level)',
          concepts: ['variables'],
          options: [
            { text: '1', feedback: 'That was the first value, but after that `level` got a new value twice.' },
            { text: '3', correct: true, feedback: 'Right. Every new assignment replaces the old value; the last one was 3.' },
            { text: '1 2 3', feedback: 'A variable holds only one value at a time.' },
          ],
        },
      ],
      summary: ['A variable is a box with a name and a value.', '`local name = value` creates a new variable.', '`=` means "gets the value".', 'You give a new value without `local`: `coins = 150`.'],
    },

    // ------------------------------------------------------------------ 2
    {
      id: 'c1-numbers',
      courseId: 'course-1',
      title: 'Numbers and math',
      objective: 'You can calculate with + - * / and %, and update values in variables.',
      minutes: 10,
      prerequisites: ['variables'],
      concepts: ['numbers', 'operators'],
      steps: [
        {
          type: 'explain',
          body: `You write **numbers** without quotes. They can have decimals, written with a **dot**: \`1.5\`.

Math signs are called **operators**:
- \`+\` add and \`-\` subtract
- \`*\` multiply (not x!)
- \`/\` divide
- \`%\` the **remainder** after dividing: \`10 % 3\` is \`1\`
- \`^\` power: \`2 ^ 3\` is \`8\`

Just like at school, \`*\` and \`/\` go before \`+\` and \`-\`. With brackets you decide the order yourself.`,
        },
        {
          type: 'code',
          code: 'local coins = 100\nlocal price = 30\nprint(coins - price)\nprint(2 + 3 * 4)\nprint((2 + 3) * 4)\nprint(10 % 3)',
          runnable: true,
          after: 'You see 70, 14, 20 and 1. Look at lines 4 and 5: the brackets change the result.',
        },
        {
          type: 'explain',
          title: 'Updating with += and -=',
          body: `In games you often change a value based on itself: "give them 10 more coins".

The long form is \`coins = coins + 10\`: take the current value, add 10, and store the result in \`coins\` again.

Luau has a shorter form: \`coins += 10\`. There are also \`-=\`, \`*=\` and \`/=\`.`,
        },
        {
          type: 'predict',
          id: 'c1-numbers-p1',
          question: 'What does this code show?',
          code: 'local health = 100\nhealth -= 25\nhealth -= 25\nprint(health)',
          concepts: ['operators'],
          options: [
            { text: '75', feedback: '25 is subtracted twice.' },
            { text: '50', correct: true, feedback: 'Right: 100 - 25 - 25 = 50.' },
            { text: '-25', feedback: '`-=` subtracts from the current value; it does not replace the value with -25.' },
          ],
        },
        {
          type: 'exercise',
          id: 'c1-numbers-ex1',
          mode: 'guided',
          title: 'Earning coins',
          prompt: 'A player has 40 coins and collects **3 tokens worth 15 coins each**. Make the code update `coins` with the right calculation, so the Output is **85**.',
          starter: 'local coins = 40\n-- update coins here\n\nprint(coins)',
          checks: [
            { kind: 'output', lines: ['85'], message: 'The Output must be **85**. How much are 3 tokens of 15 together?' },
            { kind: 'notUses', sequence: ['local', 'coins', '=', '85'], message: 'Let Luau do the math instead of typing the answer yourself.' },
          ],
          hints: ['3 tokens of 15 is `3 * 15`.', 'Use `coins += 3 * 15` on line 2.'],
          solution: 'local coins = 40\ncoins += 3 * 15\n\nprint(coins)',
          concepts: ['operators', 'numbers'],
          success: 'Good. Almost every reward system in Roblox games works like this.',
        },
        {
          type: 'exercise',
          id: 'c1-numbers-ex2',
          mode: 'independent',
          title: 'How much can you buy?',
          prompt: 'A sword costs **25** coins. The player has **110** coins.\nCreate variables `coins` and `price`, and a variable `rest` that calculates how many coins are left after buying as many swords as possible. Use `%`.',
          starter: '',
          checks: [
            { kind: 'value', expr: 'coins', equals: 110, message: 'Create a variable `coins` with the value 110.' },
            { kind: 'value', expr: 'price', equals: 25, message: 'Create a variable `price` with the value 25.' },
            { kind: 'uses', sequence: ['%'], message: 'Use the remainder operator `%`.' },
            { kind: 'value', expr: 'rest', equals: 10, message: '`rest` is not right yet. What is left over when you divide 110 by 25?' },
          ],
          hints: ['The remainder after dividing is written as `a % b`.', '`local rest = coins % price`'],
          solution: 'local coins = 110\nlocal price = 25\nlocal rest = coins % price\nprint(rest)',
          concepts: ['operators', 'variables'],
          success: 'Exactly: after 4 swords, 10 coins are left.',
        },
      ],
      summary: ['Numbers are written without quotes; decimals with a dot.', '+ - * / % ^ are the math operators.', '`coins += 10` is short for `coins = coins + 10`.'],
    },

    // ------------------------------------------------------------------ 3
    {
      id: 'c1-concat',
      courseId: 'course-1',
      title: 'Joining text together',
      objective: 'You can combine text and values with .. and know when you need tostring.',
      minutes: 8,
      prerequisites: ['variables', 'strings'],
      concepts: ['concatenation'],
      steps: [
        {
          type: 'explain',
          body: `With two dots \`..\` you join text together. Programmers call that **concatenation**.

\`"Hello " .. "world"\` becomes \`"Hello world"\`. Careful: \`..\` does **not** add a space. You have to put it in the text yourself.

Numbers automatically become text when you join them: \`"Coins: " .. 100\` becomes \`"Coins: 100"\`.`,
        },
        {
          type: 'code',
          code: 'local name = "Builder"\nlocal coins = 250\nprint("Welcome, " .. name .. "!")\nprint(name .. " has " .. coins .. " coins")',
          runnable: true,
        },
        {
          type: 'predict',
          id: 'c1-concat-p1',
          question: 'What does this code show?',
          code: 'print("Level" .. 5)',
          concepts: ['concatenation'],
          options: [
            { text: 'Level 5', feedback: 'Look closely: `..` does not add a space.' },
            { text: 'Level5', correct: true, feedback: 'Right. Without a space in the text, `..` glues everything directly together.' },
            { text: 'An error', feedback: 'Joining a number to text is allowed. Luau turns 5 into the text "5" automatically.' },
          ],
        },
        {
          type: 'exercise',
          id: 'c1-concat-ex1',
          mode: 'guided',
          kind: 'fix-bug',
          title: 'Plus or dots?',
          prompt: 'This code tries to join text with `+`. That does not work in Luau. Click **Run Code**, read the explanation and fix the code so the Output is **Player: Nova**.',
          starter: 'local name = "Nova"\nprint("Player: " + name)',
          checks: [
            { kind: 'output', lines: ['Player: Nova'], message: 'The Output must be **Player: Nova**.' },
            { kind: 'uses', sequence: ['..'], message: 'Use `..` to join text together.' },
          ],
          hints: ['In Luau, `+` is only for math. For text you use a different sign.', 'Replace `+` with `..`'],
          solution: 'local name = "Nova"\nprint("Player: " .. name)',
          concepts: ['concatenation'],
          success: 'Fixed. In some other languages + works for text; in Luau it is always `..`.',
        },
        {
          type: 'exercise',
          id: 'c1-concat-ex2',
          mode: 'independent',
          title: 'A welcome message',
          prompt: 'Create variables `playerName` (**"Kai"**) and `wins` (**7**). Use `..` to print exactly: **Kai has 7 wins**',
          starter: '',
          checks: [
            { kind: 'value', expr: 'playerName', equals: 'Kai', message: '`playerName` must be "Kai".' },
            { kind: 'value', expr: 'wins', equals: 7, message: '`wins` must be the number 7 (without quotes).' },
            { kind: 'uses', sequence: ['..'], message: 'Join the text together with `..`' },
            { kind: 'output', lines: ['Kai has 7 wins'], message: 'The Output must be exactly **Kai has 7 wins**. Watch the spaces.' },
          ],
          hints: ['You have three pieces: the name, the text " has ", and `wins` followed by " wins".', '`playerName .. " has " .. wins .. " wins"`'],
          solution: 'local playerName = "Kai"\nlocal wins = 7\nprint(playerName .. " has " .. wins .. " wins")',
          concepts: ['concatenation', 'variables'],
          success: 'Nice. Soon you will make messages like this for your own interface.',
        },
      ],
      summary: ['`..` joins text together, without adding a space.', 'Numbers become text automatically with `..`.', '`+` is only for math, not for text.'],
    },

    // ------------------------------------------------------------------ 4
    {
      id: 'c1-interpolation',
      courseId: 'course-1',
      title: 'String interpolation',
      objective: 'You can put values inside text with backticks and {}.',
      minutes: 6,
      prerequisites: ['concatenation'],
      concepts: ['interpolation'],
      steps: [
        {
          type: 'explain',
          body: `Lots of \`..\` in a row quickly gets messy. That is why Luau has **string interpolation**: text between **backticks** (the \` sign) with values inside \`{ }\`.

You usually find the backtick at the top left of your keyboard, below Esc.`,
        },
        {
          type: 'code',
          code: 'local name = "Kai"\nlocal wins = 7\nprint(`{name} has {wins} wins`)\nprint(`In 3 rounds {name} will have {wins + 3}`)',
          runnable: true,
          after: 'You can even put a calculation between `{ }`, like `{wins + 3}`.',
        },
        {
          type: 'exercise',
          id: 'c1-interp-ex1',
          mode: 'independent',
          title: 'Rewrite with interpolation',
          prompt: 'Rewrite the `print` so it uses **backticks and { }** instead of `..`. The Output must stay the same.',
          starter: 'local item = "Sword"\nlocal price = 250\nprint("A " .. item .. " costs " .. price .. " coins")',
          checks: [
            { kind: 'output', lines: ['A Sword costs 250 coins'], message: 'The Output must stay **A Sword costs 250 coins**.' },
            { kind: 'notUses', sequence: ['..'], message: 'Do not use `..` anymore: put the values between `{ }` in text with backticks.' },
            { kind: 'stringLiteral', contains: '{item}', message: 'Put `{item}` in your text between backticks.' },
          ],
          hints: ['Start and end your text with a backtick ` instead of a "', 'print(`A {item} costs ... coins`)'],
          solution: 'local item = "Sword"\nlocal price = 250\nprint(`A {item} costs {price} coins`)',
          concepts: ['interpolation'],
          success: 'Easier to read, right? Most modern Roblox code uses this form.',
        },
      ],
      summary: ['Text between backticks ` can contain values between { }.', 'A calculation is allowed between { } too.', 'Interpolation is often easier to read than lots of `..`.'],
    },

    // ------------------------------------------------------------------ 5
    {
      id: 'c1-booleans-nil',
      courseId: 'course-1',
      title: 'true, false and nil',
      objective: 'You know booleans and nil, and recognise the error when you calculate with nil.',
      minutes: 8,
      prerequisites: ['variables', 'numbers'],
      concepts: ['booleans', 'nil'],
      steps: [
        {
          type: 'explain',
          body: `A **boolean** has only two possible values: \`true\` or \`false\`. Perfect for yes/no questions in a game: is the door open? Does the player have the key?

\`nil\` means **"nothing"** or "no value". A variable that never got a value is \`nil\`. A typo in a name also gives \`nil\`, because that name does not exist.

Careful: you write \`true\`, \`false\` and \`nil\` **without** quotes. \`"true"\` is just text.`,
        },
        {
          type: 'code',
          code: 'local doorOpen = false\nlocal hasKey = true\nlocal bonus\nprint(doorOpen, hasKey, bonus)',
          runnable: true,
          after: '`bonus` got no value, so print shows `nil`.',
        },
        {
          type: 'exercise',
          id: 'c1-nil-ex1',
          mode: 'guided',
          kind: 'fix-bug',
          title: 'Calculating with nothing',
          prompt: 'This code gives an error. Click **Run Code** and read the explanation. Fix the code so the Output is **110**.',
          starter: 'local coins = 100\nlocal reward = 10\nprint(coins + rewrd)',
          checks: [{ kind: 'output', lines: ['110'], message: 'The Output must be **110**.' }],
          hints: ['Which variable is `nil`? Compare the names letter by letter.', 'Line 3 says `rewrd`; the variable is called `reward`.'],
          solution: 'local coins = 100\nlocal reward = 10\nprint(coins + reward)',
          concepts: ['nil', 'variables'],
          success: 'Found it. A typo in a name is the most common cause of nil errors.',
        },
        {
          type: 'exercise',
          id: 'c1-booleans-ex1',
          mode: 'independent',
          title: 'Game status',
          prompt: 'Create two variables:\n- `isVip` with the value **true**\n- `isBanned` with the value **false**',
          starter: '',
          checks: [
            { kind: 'value', expr: 'isVip', equals: true, message: '`isVip` must be the boolean `true`, without quotes.' },
            { kind: 'value', expr: 'isBanned', equals: false, message: '`isBanned` must be the boolean `false`, without quotes.' },
          ],
          hints: ['You write booleans without quotes: `true` or `false`.'],
          solution: 'local isVip = true\nlocal isBanned = false',
          concepts: ['booleans'],
          success: 'Good. In the next course you will use booleans like these to make choices with if.',
        },
      ],
      summary: ['A boolean is `true` or `false`.', '`nil` means: no value.', 'Calculating with nil gives an error; often a typo in a name is the cause.'],
    },

    // ------------------------------------------------------------------ 6
    {
      id: 'c1-typeof',
      courseId: 'course-1',
      title: 'Kinds of values and typeof()',
      objective: 'You can use typeof() to ask what kind of value something is.',
      minutes: 6,
      prerequisites: ['booleans', 'nil', 'strings', 'numbers'],
      concepts: ['typeof'],
      steps: [
        {
          type: 'explain',
          body: `Every value has a **kind** (programmers say: a **type**):
- \`"Hello"\` is a \`string\`
- \`42\` is a \`number\`
- \`true\` is a \`boolean\`
- \`nil\` is \`nil\`

With \`typeof(value)\` you ask for the type. That helps when hunting bugs: "is this a number or text right now?"`,
        },
        {
          type: 'code',
          code: 'print(typeof("Hello"))\nprint(typeof(42))\nprint(typeof(true))\nprint(typeof(nil))\nprint(typeof("42"))',
          runnable: true,
          after: 'Look at the last one: `"42"` is a string, even though it is made of digits.',
        },
        {
          type: 'predict',
          id: 'c1-typeof-p1',
          question: 'What does `print(typeof("false"))` show?',
          code: 'print(typeof("false"))',
          concepts: ['typeof', 'booleans'],
          options: [
            { text: 'boolean', feedback: 'Look at the quotes around false.' },
            { text: 'string', correct: true, feedback: 'Right. Between quotes it is text.' },
            { text: 'nil', feedback: 'nil is only when there is no value at all.' },
          ],
        },
        {
          type: 'exercise',
          id: 'c1-typeof-ex1',
          mode: 'independent',
          title: 'The right types',
          prompt: 'Create three variables so that:\n- `a` is a **number**\n- `b` is a **string**\n- `c` is a **boolean**\nYou choose the values.',
          starter: '',
          checks: [
            { kind: 'value', expr: 'a', type: 'number', message: '`a` must be a number (without quotes).' },
            { kind: 'value', expr: 'b', type: 'string', message: '`b` must be text (with quotes).' },
            { kind: 'value', expr: 'c', type: 'boolean', message: '`c` must be `true` or `false`.' },
          ],
          hints: ['For example: a number like 5, text like "hi", and true or false.'],
          solution: 'local a = 5\nlocal b = "hi"\nlocal c = true',
          concepts: ['typeof', 'variables'],
          success: 'Exactly. You can now recognise and create the four basic types.',
        },
      ],
      summary: ['Values have a type: string, number, boolean or nil.', '`typeof(x)` gives the type as text.', 'Digits between quotes are a string.'],
    },

    // ------------------------------------------------------------------ 7
    {
      id: 'c1-naming-scope',
      courseId: 'course-1',
      title: 'Good names and scope',
      objective: 'You choose valid, clear names and know that a local only exists inside its block.',
      minutes: 9,
      prerequisites: ['variables'],
      concepts: ['naming', 'variables'],
      steps: [
        {
          type: 'explain',
          title: 'Rules for names',
          body: `The name of a variable:
- may contain letters, digits and \`_\`
- may **not** start with a digit (\`2coins\` is not allowed)
- may not contain spaces
- is **case-sensitive**: \`coins\` and \`Coins\` are two different variables
- may not be a word Luau uses itself, like \`local\`, \`end\` or \`if\`

In Roblox you usually write names in **camelCase**: joined together, each new word with a capital letter: \`playerCoins\`, \`maxHealth\`.`,
        },
        {
          type: 'quiz',
          id: 'c1-naming-q1',
          question: 'Which name is valid and clear?',
          concepts: ['naming'],
          options: [
            { text: 'maxHealth', correct: true, feedback: 'Valid, and you can see right away what is inside.' },
            { text: '2ndPlayer', feedback: 'A name may not start with a digit.' },
            { text: 'max health', feedback: 'Spaces are not allowed in a name.' },
            { text: 'x', feedback: 'Valid, but unclear. In a week you will not remember what x meant.' },
          ],
        },
        {
          type: 'explain',
          title: 'Scope: where a variable exists',
          body: `**Scope** means: the part of your code where a variable exists.

A \`local\` variable exists from the line where you create it until the end of the **block** it is in. A block starts, for example, with \`do\` and ends with \`end\`. Later you will see that \`if\`, loops and functions are blocks too.

Outside the block the variable no longer exists: it is \`nil\` there.`,
        },
        {
          type: 'code',
          code: 'local outside = "visible"\ndo\n    local inside = "only in the block"\n    print(inside)\n    print(outside)\nend\nprint(inside)',
          runnable: true,
          after: 'Line 7 shows `nil`: `inside` only existed between `do` and `end`. `outside` is visible in the block too.',
        },
        {
          type: 'exercise',
          id: 'c1-scope-ex1',
          mode: 'guided',
          kind: 'fix-bug',
          title: 'Capital letters count',
          prompt: 'The code shows `nil` instead of **Speed: 16**. Find the difference and fix it.',
          starter: 'local walkSpeed = 16\nprint("Speed: " .. tostring(WalkSpeed))',
          checks: [{ kind: 'output', lines: ['Speed: 16'], message: 'The Output must be **Speed: 16**.' }],
          hints: ['Compare the name on line 1 and line 2 very carefully, including capital letters.', '`walkSpeed` and `WalkSpeed` are different names.'],
          solution: 'local walkSpeed = 16\nprint("Speed: " .. tostring(walkSpeed))',
          concepts: ['naming'],
          success: 'Fixed. The editor also underlines unknown names like this: watch for the wavy lines.',
        },
      ],
      summary: ['Names: letters, digits and _, not starting with a digit, no spaces.', 'Luau is case-sensitive.', 'Use clear names in camelCase.', 'A local only exists inside the block where you create it.'],
    },

    // ------------------------------------------------------------------ 8
    {
      id: 'c1-warn-errors',
      courseId: 'course-1',
      title: 'warn() and reading error messages',
      objective: 'You use warn() and can read an error message: what, where and why.',
      minutes: 8,
      prerequisites: ['print', 'variables'],
      concepts: ['warn'],
      steps: [
        {
          type: 'explain',
          body: `\`warn\` works like \`print\`, but the message appears in **yellow** in the Output. You use it for things that are not quite right but should not stop your game: "Note: this player has no data."

A real **error** is red and stops the script at that point. Every error message tells you:
1. **where**: which script and which line
2. **what**: a short description of the problem`,
        },
        {
          type: 'code',
          code: 'print("Loading data...")\nwarn("No saved data found, new player")\nprint("Done")',
          runnable: true,
          after: 'The warning is yellow, and the script simply carried on.',
        },
        {
          type: 'code',
          title: 'A real error',
          code: 'print("Before the error")\nlocal coins = nil\nprint(coins + 10)\nprint("This line is never reached")',
          runnable: true,
          after: 'The error on line 3 stops the script. That is why you do not see the last line. The Academy explains the error in plain language below the Output.',
        },
        {
          type: 'exercise',
          id: 'c1-errors-ex1',
          mode: 'guided',
          kind: 'fix-bug',
          title: 'Fix two errors',
          prompt: 'This code has **two** errors. Run the code, fix the first error, run again, and fix the second. In the end the Output is:\n**Round 1**\n**Time: 60**',
          starter: 'print("Round 1"\nlocal time = 60\nprint("Time: " .. tme)',
          checks: [{ kind: 'output', lines: ['Round 1', 'Time: 60'], message: 'The Output must be **Round 1** followed by **Time: 60**.' }],
          hints: ['Error 1 is on line 1: count the brackets.', 'Error 2 is on line 3: is the name spelled right?'],
          solution: 'print("Round 1")\nlocal time = 60\nprint("Time: " .. time)',
          concepts: ['warn', 'naming'],
          success: 'Two errors fixed. This is how you debug: one error at a time, testing again each time.',
        },
        {
          type: 'exercise',
          id: 'c1-warn-ex1',
          mode: 'independent',
          title: 'Give a warning',
          prompt: 'Use `warn` to show the message **Inventory is full**.',
          starter: '',
          checks: [
            { kind: 'warns', message: 'Use `warn(...)` instead of `print`.' },
            { kind: 'uses', sequence: ['warn', '('], message: 'Use `warn( ... )`.' },
          ],
          hints: ['You use `warn` exactly like `print`.'],
          solution: 'warn("Inventory is full")',
          concepts: ['warn'],
          success: 'Good. In the Output of Roblox Studio this message is yellow too.',
        },
      ],
      summary: ['`warn()` shows a yellow warning; the script keeps going.', 'An error is red and stops the script on that line.', 'Read every error: where (line) and what. Fix one error at a time.'],
    },

    // ------------------------------------------------------------------ 9 project
    {
      id: 'c1-project-coins',
      courseId: 'course-1',
      title: 'Project: coin calculator',
      objective: 'You combine everything from this course into a small program of your own.',
      minutes: 15,
      prerequisites: ['variables', 'operators', 'interpolation'],
      concepts: ['variables', 'operators', 'interpolation'],
      steps: [
        {
          type: 'explain',
          title: 'The assignment',
          body: `In a simulator a player earns coins per click, with a bonus for VIP players. You write the calculation.

You build it in three steps. Each step is checked separately.`,
        },
        {
          type: 'exercise',
          id: 'c1-project-ex1',
          mode: 'independent',
          title: 'Step 1: the data',
          prompt: 'Create these variables:\n- `coinsPerClick` = **5**\n- `clicks` = **40**\n- `vipMultiplier` = **2**',
          starter: '-- Coin calculator\n',
          checks: [
            { kind: 'value', expr: 'coinsPerClick', equals: 5, message: '`coinsPerClick` must be 5.' },
            { kind: 'value', expr: 'clicks', equals: 40, message: '`clicks` must be 40.' },
            { kind: 'value', expr: 'vipMultiplier', equals: 2, message: '`vipMultiplier` must be 2.' },
          ],
          hints: ['Three lines, each in the shape `local name = value`.'],
          solution: 'local coinsPerClick = 5\nlocal clicks = 40\nlocal vipMultiplier = 2',
          concepts: ['variables'],
          success: 'The data is ready.',
        },
        {
          type: 'exercise',
          id: 'c1-project-ex2',
          mode: 'independent',
          title: 'Step 2: the calculation',
          prompt: 'Continue with your code. Add:\n- `normalCoins`: coins per click times the number of clicks\n- `vipCoins`: normalCoins times the multiplier\nUse your **variables**, not the numbers themselves.',
          starter: 'local coinsPerClick = 5\nlocal clicks = 40\nlocal vipMultiplier = 2\n',
          checks: [
            { kind: 'value', expr: 'normalCoins', equals: 200, message: '`normalCoins` is not right yet: 5 coins × 40 clicks.' },
            { kind: 'value', expr: 'vipCoins', equals: 400, message: '`vipCoins` is not right yet: normalCoins × the multiplier.' },
            { kind: 'uses', sequence: ['coinsPerClick', '*', 'clicks'], message: 'Calculate `normalCoins` with the variables: `coinsPerClick * clicks`.' },
            { kind: 'uses', sequence: ['*', 'vipMultiplier'], message: 'Use the variable `vipMultiplier` in your calculation of `vipCoins`.' },
          ],
          hints: ['You multiply with `*`.', '`local normalCoins = coinsPerClick * clicks`'],
          solution: 'local coinsPerClick = 5\nlocal clicks = 40\nlocal vipMultiplier = 2\nlocal normalCoins = coinsPerClick * clicks\nlocal vipCoins = normalCoins * vipMultiplier',
          concepts: ['operators', 'variables'],
          success: 'By using variables you can change one number later and everything else stays correct automatically.',
        },
        {
          type: 'exercise',
          id: 'c1-project-ex3',
          mode: 'independent',
          title: 'Step 3: show the result',
          prompt: 'Use string interpolation to show two lines:\n**Normal: 200 coins**\n**VIP: 400 coins**\nUse `{normalCoins}` and `{vipCoins}` in your text.',
          starter: 'local coinsPerClick = 5\nlocal clicks = 40\nlocal vipMultiplier = 2\nlocal normalCoins = coinsPerClick * clicks\nlocal vipCoins = normalCoins * vipMultiplier\n',
          checks: [
            { kind: 'output', lines: ['Normal: 200 coins', 'VIP: 400 coins'], message: 'The Output must be **Normal: 200 coins** and **VIP: 400 coins**.' },
            { kind: 'stringLiteral', contains: '{vipCoins}', message: 'Use `{vipCoins}` in text between backticks.' },
          ],
          hints: ['print(`Normal: {normalCoins} coins`)'],
          solution: 'local coinsPerClick = 5\nlocal clicks = 40\nlocal vipMultiplier = 2\nlocal normalCoins = coinsPerClick * clicks\nlocal vipCoins = normalCoins * vipMultiplier\nprint(`Normal: {normalCoins} coins`)\nprint(`VIP: {vipCoins} coins`)',
          concepts: ['interpolation'],
          success: 'Your first complete program. Try changing `clicks` to 100 and run again: everything recalculates by itself.',
        },
      ],
      summary: ['You combined variables, math and interpolation.', 'When you use variables in calculations, everything adjusts automatically.', 'Next step: making decisions with if statements.'],
    },
  ],
};
