import type { Course } from './types';

export const course0: Course = {
  id: 'course-0',
  number: 0,
  title: 'Before you code',
  description: 'What code is, what Luau looks like and where your scripts go in Roblox Studio. No experience needed.',
  level: 'Absolute beginner',
  planned: [],
  lessons: [
    // ------------------------------------------------------------------ 1
    {
      id: 'c0-what-is-code',
      courseId: 'course-0',
      title: 'What is code?',
      objective: 'You know what programming and code are, and why a computer does exactly what it says.',
      minutes: 5,
      prerequisites: [],
      concepts: ['code-basics'],
      steps: [
        {
          type: 'explain',
          title: 'Programming = giving instructions',
          body: `A computer is very fast, but it can't decide by itself what to do. Someone has to tell it, step by step, what should happen. That is called **programming**.

Think of a recipe: "Crack two eggs. Whisk them. Fry them for three minutes." A recipe is a list of instructions that you follow from top to bottom.

**Code** is such a list of instructions, written in a language the computer understands. That language is called a **programming language**.`,
        },
        {
          type: 'explain',
          title: 'A computer does exactly what it says',
          body: `A person understands what you mean, even if you make a typo. A computer doesn't. It reads your code literally.

That's why programming at the start is mostly about writing **precisely**. A forgotten bracket or a wrong capital letter is enough to make something fail.

> That's completely normal. Every programmer makes mistakes like that every day. The Academy explains every mistake in plain language.`,
        },
        {
          type: 'quiz',
          id: 'c0-what-is-code-q1',
          question: 'What is code?',
          concepts: ['code-basics'],
          options: [
            { text: 'A list of instructions that a computer carries out', correct: true, feedback: 'Exactly. Code tells the computer step by step what to do.' },
            { text: 'A secret language for encrypting messages', feedback: 'That is also called "a code", but in programming we mean instructions for the computer.' },
            { text: 'A picture from a game', feedback: 'Pictures and models are parts of a game, but code is what makes them move and react.' },
          ],
        },
        {
          type: 'explain',
          title: 'Code in Roblox',
          body: `Everything that **happens** in a Roblox game is caused by code: a door that opens, coins you collect, a timer that counts down, a shop where you buy something.

You create the building blocks (parts, colors, models) in Roblox Studio. Code gives them behavior. In Roblox you write that code in the language **Luau**.`,
        },
        {
          type: 'quiz',
          id: 'c0-what-is-code-q2',
          question: 'You accidentally type a small mistake in your code. What does the computer do?',
          concepts: ['code-basics'],
          options: [
            { text: 'It understands what you mean and fixes it', feedback: "If only. A computer doesn't guess what you mean; it follows exactly what is written." },
            { text: 'It follows exactly what is written, and often reports an error', correct: true, feedback: 'Right. That is why this Academy teaches you to read and fix errors.' },
            { text: 'It breaks', feedback: "Don't worry: a typo in your code doesn't break anything. At worst you get an error message." },
          ],
        },
        {
          type: 'code',
          title: 'This is what code looks like',
          body: "Below is a line of real Luau code. You don't need to understand it yet: that's the next lesson. Click **Run Code** and see what happens.",
          code: 'print("Welcome to Lumora Academy!")',
          runnable: true,
          after: 'The text appeared in the **Output** window. You just ran code.',
        },
      ],
      summary: [
        'Programming means giving a computer instructions, step by step.',
        'Code is that list of instructions, written in a programming language.',
        'A computer does exactly what is written; mistakes are normal and you can learn to fix them.',
        'In Roblox you write code in the language Luau.',
      ],
    },

    // ------------------------------------------------------------------ 2 (acceptance lesson)
    {
      id: 'c0-first-script',
      courseId: 'course-0',
      title: 'Your first Luau script',
      objective: 'You can show text with print(), and you understand what the brackets and quotation marks do.',
      minutes: 8,
      prerequisites: ['code-basics'],
      concepts: ['print', 'strings'],
      steps: [
        {
          type: 'explain',
          body: `With code you give instructions to your program.

The first instruction almost every programmer learns is: **show something on the screen**. In Luau you do that with \`print\`.`,
        },
        {
          type: 'code',
          title: 'Look at this line of code',
          body: 'Click the parts below to see what each piece does.',
          code: 'print("Hello Roblox!")',
          runnable: true,
          annotations: [
            { token: 'print', text: '`print` is a **function**: a ready-made instruction that does something for you. `print` shows information in the **Output**: the window where your program shows messages.' },
            { token: '(', text: 'The **opening bracket** starts the information you give to `print`. Everything between `(` and `)` is what `print` should show.' },
            { token: '"Hello Roblox!"', text: 'The **quotation marks** `" "` tell Luau: this is plain **text**, not code. Programmers call text a **string**.' },
            { token: ')', text: 'The **closing bracket** says: the information for `print` ends here. Every `(` needs a `)`.' },
          ],
          after: 'After **Run Code**, `Hello Roblox!` appears in the Output. Notice that you don\'t see the quotation marks themselves. They only tell Luau where the text starts and ends.',
        },
        {
          type: 'quiz',
          id: 'c0-first-script-q1',
          question: 'Why is "Hello Roblox!" between quotation marks?',
          concepts: ['strings'],
          options: [
            { text: 'So Luau knows it is plain text', correct: true, feedback: 'Right. Without quotation marks Luau would think Hello is a piece of code.' },
            { text: 'Because then it appears bigger on the screen', feedback: "Quotation marks don't change how big text looks. They only mark the start and end of text." },
            { text: "It's just decoration", feedback: "No, they're needed. Try it later without them: you'll get an error." },
          ],
        },
        {
          type: 'exercise',
          id: 'c0-first-script-ex1',
          mode: 'guided',
          title: 'Change the text',
          prompt: "Change the text so the program shows **I'm learning Luau!** Then click **Run Code**.",
          starter: 'print("Hello Roblox!")',
          checks: [
            { kind: 'uses', sequence: ['print', '('], message: 'Keep using `print( ... )` to show the text.' },
            { kind: 'output', lines: ["I'm learning Luau!"], message: "Your program doesn't show exactly **I'm learning Luau!** yet. Check the capital letters, the apostrophe, the spaces and the exclamation mark." },
          ],
          hints: [
            'You only need to change the text between the quotation marks. Everything else stays the same.',
            "Remove `Hello Roblox!` and type `I'm learning Luau!` in its place. Keep the quotation marks.",
          ],
          solution: 'print("I\'m learning Luau!")',
          concepts: ['print', 'strings'],
          success: 'Well done! You changed and ran your first Luau code.',
        },
        {
          type: 'predict',
          id: 'c0-first-script-p1',
          question: 'What does this code show in the Output?',
          code: 'print("1 + 1")',
          concepts: ['strings'],
          options: [
            { text: '2', feedback: "Almost logical, but look at the quotation marks: everything between them is text, so Luau doesn't calculate." },
            { text: '1 + 1', correct: true, feedback: 'Exactly. Between quotation marks it is just text. Luau shows it literally.' },
            { text: 'An error', feedback: 'This code is valid. Text may contain any character, including + and digits.' },
          ],
        },
        {
          type: 'exercise',
          id: 'c0-first-script-ex2',
          mode: 'independent',
          title: 'Now on your own',
          prompt: 'The editor is empty. Write a line of code yourself that shows **I will be a Roblox developer**',
          starter: '',
          checks: [
            { kind: 'uses', sequence: ['print', '('], message: 'Use `print` with brackets to show something.' },
            { kind: 'output', lines: ['I will be a Roblox developer'], message: 'The Output must be exactly **I will be a Roblox developer** (no full stop or exclamation mark).' },
          ],
          hints: ['Look back at the previous exercise: the same shape, different text.', 'The shape is: `print("your text")`'],
          solution: 'print("I will be a Roblox developer")',
          concepts: ['print', 'strings'],
          success: 'Written completely by yourself. This is how every Roblox developer starts.',
        },
      ],
      summary: [
        '`print( )` shows information in the Output.',
        'Between the brackets you put what `print` should show.',
        'Text (a string) goes between quotation marks: `"like this"`.',
        'Between quotation marks Luau doesn\'t calculate: `"1 + 1"` stays text.',
      ],
    },

    // ------------------------------------------------------------------ 3
    {
      id: 'c0-what-is-luau',
      courseId: 'course-0',
      title: 'What is Luau? (and Lua)',
      objective: 'You know what Luau is, how it differs from Lua, and what this app can and cannot run.',
      minutes: 6,
      prerequisites: ['print'],
      concepts: ['code-basics'],
      steps: [
        {
          type: 'explain',
          title: 'Lua and Luau',
          body: `**Lua** is an existing programming language, known for being small and fast. Roblox used to use Lua.

Roblox then made its own version: **Luau** (pronounced "loo-ow"). Luau is very similar to Lua, but has extras:
- it is faster
- you can use shorter forms, such as \`coins += 10\`
- you can combine text with values using backticks: \`\`Coins: {coins}\`\`
- you can add **types**, so mistakes are found earlier (you'll learn that much later)

Luau is open source: anyone may use it, also outside Roblox.`,
        },
        {
          type: 'code',
          title: 'A few Luau extras',
          body: "You don't need to be able to write this code yet. Look at it and click **Run Code**.",
          code: 'local coins = 10\ncoins += 5\nprint(`You have {coins} coins`)',
          runnable: true,
          after: 'In plain Lua, `+=` and the text with `{coins}` don\'t work. In Luau they do. You see `You have 15 coins`.',
        },
        {
          type: 'explain',
          title: 'Luau is not the same as "Roblox"',
          body: `This difference is important:

- **Luau** is the language: words like \`print\`, \`local\`, \`if\` and calculating with numbers.
- **The Roblox engine** adds parts to it, such as \`workspace\`, \`game\`, \`Instance\` and players. Those only exist inside Roblox.

The playground in this app runs **real Luau**. Roblox parts don't work here; you test those in Roblox Studio. The Academy always tells you clearly when something needs Studio.`,
        },
        {
          type: 'quiz',
          id: 'c0-what-is-luau-q1',
          question: 'Which of these lines can the Luau playground in this app run?',
          concepts: ['code-basics'],
          options: [
            { text: 'print("Hello")', correct: true, feedback: 'Yes: `print` belongs to Luau itself.' },
            { text: 'workspace.Baseplate.Color = Color3.new(1, 0, 0)', feedback: '`workspace` and `Color3` belong to the Roblox engine. You test this in Roblox Studio.' },
            { text: 'Instance.new("Part")', feedback: '`Instance` only exists in Roblox. You need Roblox Studio for this.' },
          ],
        },
        {
          type: 'exercise',
          id: 'c0-what-is-luau-ex1',
          mode: 'guided',
          title: 'Run the Luau code yourself',
          prompt: 'Change the number `5` into `20`, so the Output shows **You have 30 coins**.',
          starter: 'local coins = 10\ncoins += 5\nprint(`You have {coins} coins`)',
          checks: [{ kind: 'output', lines: ['You have 30 coins'], message: 'The Output must be **You have 30 coins**. Which number do you add to the 10 now?' }],
          hints: ['Look at line 2: something is added to `coins` there.', 'Change `coins += 5` into `coins += 20`.'],
          solution: 'local coins = 10\ncoins += 20\nprint(`You have {coins} coins`)',
          concepts: ['code-basics'],
          success: "Good. You changed code you don't fully know yet, and predicted the result.",
        },
      ],
      summary: [
        'Luau is the programming language of Roblox, based on Lua, with extra features.',
        'Luau (the language) is different from the Roblox engine (workspace, game, Instance).',
        'This app runs real Luau; you test Roblox parts in Roblox Studio.',
      ],
    },

    // ------------------------------------------------------------------ 4
    {
      id: 'c0-strings',
      courseId: 'course-0',
      title: 'Text and quotation marks',
      objective: 'You can write text correctly, know " and \', and recognise an unfinished string.',
      minutes: 7,
      prerequisites: ['print'],
      concepts: ['strings'],
      steps: [
        {
          type: 'explain',
          body: `Text in code is called a **string**. You recognise a string by the quotation marks around it.

You may use **double** \`"text"\` or **single** \`'text'\` quotation marks. They do the same thing. The start and end must be the same kind.

In Roblox code you mostly see double quotation marks. We use those too.`,
        },
        {
          type: 'code',
          title: 'Two kinds, same result',
          code: 'print("Double quotation marks")\nprint(\'Single quotation marks\')\nprint("I said: \'hi\'")',
          runnable: true,
          after: 'Line 3 shows why there are two kinds: you can use one kind inside your text.',
        },
        {
          type: 'predict',
          id: 'c0-strings-p1',
          question: 'What happens with this code?',
          code: 'print("Hello)',
          concepts: ['strings'],
          options: [
            { text: 'It shows Hello', feedback: "Look closely: the text starts with `\"` but doesn't end with `\"`. Luau doesn't know where the text stops." },
            { text: 'Luau gives an error: the text is not closed', correct: true, feedback: 'Right. The closing quotation mark is missing, so Luau thinks `)` also belongs to the text.' },
            { text: 'It shows Hello)', feedback: 'Good thinking, but because the text is never closed, Luau also misses the closing bracket. The result is an error.' },
          ],
        },
        {
          type: 'exercise',
          id: 'c0-strings-ex1',
          mode: 'guided',
          kind: 'fix-bug',
          title: 'Fix the code',
          prompt: "This code doesn't work. First click **Run Code** to see the error. Then fix it so it shows **Welcome to my obby**.",
          starter: 'print("Welcome to my obby)',
          checks: [{ kind: 'output', lines: ['Welcome to my obby'], message: 'The Output must be exactly **Welcome to my obby**.' }],
          hints: ['Where does the text end? Is there a quotation mark there?', 'Put a `"` right after the word obby, before the bracket.'],
          solution: 'print("Welcome to my obby")',
          concepts: ['strings'],
          success: 'Fixed. An unfinished string is one of the most common mistakes; now you recognise it.',
        },
        {
          type: 'exercise',
          id: 'c0-strings-ex2',
          mode: 'independent',
          title: 'Two lines of text',
          prompt: 'Write code that shows two lines:\n1. **Level 1**\n2. **Start!**',
          starter: '',
          checks: [{ kind: 'output', lines: ['Level 1', 'Start!'], message: 'The Output must have two lines: first **Level 1**, then **Start!**' }],
          hints: ['Each `print` shows one line. How many `print` lines do you need?', 'Write two lines below each other, each with its own `print("...")`.'],
          solution: 'print("Level 1")\nprint("Start!")',
          concepts: ['strings', 'print'],
          success: 'Nice. Each print is its own line in the Output.',
        },
      ],
      summary: [
        'A string is text between quotation marks.',
        '"double" and \'single\' quotation marks work the same; start and end must match.',
        'If you forget the closing quotation mark, Luau gives an error.',
      ],
    },

    // ------------------------------------------------------------------ 5
    {
      id: 'c0-brackets-commas',
      courseId: 'course-0',
      title: 'Brackets and commas',
      objective: "You understand why functions have brackets and how to pass several things with commas.",
      minutes: 7,
      prerequisites: ['print', 'strings'],
      concepts: ['arguments'],
      steps: [
        {
          type: 'explain',
          body: `After \`print\` there are always brackets. Those brackets mean: **run this function now, with this information**.

Programmers call the information between the brackets an **argument**. In \`print("Hi")\`, \`"Hi"\` is the argument.

Want to pass several things? Put a **comma** between them. \`print\` then shows them next to each other, with a space in between.`,
        },
        {
          type: 'code',
          title: 'Several arguments',
          code: 'print("Coins:", 100)\nprint("Player", "Level", 7)',
          runnable: true,
          annotations: [
            { token: ',', text: 'The **comma** separates two arguments. Each argument is a separate piece of information.' },
            { token: '100', text: "A **number** doesn't need quotation marks. Luau knows by itself that `100` is a number." },
          ],
          after: "Output: `Coins: 100` and `Player Level 7`. You don't see the comma itself; `print` puts a space in its place.",
        },
        {
          type: 'quiz',
          id: 'c0-brackets-q1',
          question: 'What do the brackets in `print("Hi")` mean?',
          concepts: ['arguments'],
          options: [
            { text: 'Run print, with the information between the brackets', correct: true, feedback: 'Exactly. The brackets "start" the function and contain the arguments.' },
            { text: "It's a note for yourself", feedback: 'You write notes (comments) with `--`. Brackets belong to running a function.' },
            { text: 'They make the text bold', feedback: 'Brackets have nothing to do with formatting.' },
          ],
        },
        {
          type: 'exercise',
          id: 'c0-brackets-ex1',
          mode: 'guided',
          kind: 'fix-bug',
          title: 'Forgotten bracket',
          prompt: 'Click **Run Code** and read the explanation of the error. Then fix the code.',
          starter: 'print("Score:", 250',
          checks: [{ kind: 'output', lines: ['Score: 250'], message: 'After the fix, the Output should be **Score: 250**.' }],
          hints: ['Every `(` needs a `)`. Count them in this line.', 'Put a `)` at the very end of the line.'],
          solution: 'print("Score:", 250)',
          concepts: ['arguments'],
          success: 'Well fixed. A forgotten bracket is the best-known beginner mistake.',
        },
        {
          type: 'exercise',
          id: 'c0-brackets-ex2',
          mode: 'independent',
          title: 'Three arguments',
          prompt: "Write one `print` with **three** arguments, separated by commas, so the Output is **Gems: 12 total**. Use a number for 12 (without quotation marks).",
          starter: '',
          checks: [
            { kind: 'outputCount', min: 1, max: 1, message: 'Use exactly one `print`.' },
            { kind: 'output', lines: ['Gems: 12 total'], message: 'The Output must be exactly **Gems: 12 total**.' },
            { kind: 'uses', sequence: [',', '12', ','], message: 'Put the number `12` as a separate argument between two commas, without quotation marks.' },
          ],
          hints: ['The first argument is the text `"Gems:"`, the second the number, the third the text `"total"`.', 'The shape is: `print(text, number, text)`'],
          solution: 'print("Gems:", 12, "total")',
          concepts: ['arguments'],
          success: 'Exactly. Three arguments, one line of Output.',
        },
      ],
      summary: [
        'Brackets after a function name mean: run the function now.',
        'The information between the brackets is called an argument.',
        'Commas separate several arguments. print puts a space between them.',
        "Numbers don't need quotation marks.",
      ],
    },

    // ------------------------------------------------------------------ 6
    {
      id: 'c0-comments',
      courseId: 'course-0',
      title: 'Comments: notes in your code',
      objective: 'You can write comments and know that Luau skips them.',
      minutes: 5,
      prerequisites: ['print'],
      concepts: ['comments'],
      steps: [
        {
          type: 'explain',
          body: `A **comment** is a note for people. Luau skips comments completely.

A comment starts with two dashes: \`--\`. Everything after that on the same line is ignored.

For a comment over several lines you use \`--[[\` and \`]]\`.

Good comments explain **why** code is there. In bigger Roblox projects they help you (and others) understand later what you meant.`,
        },
        {
          type: 'code',
          code: '-- This is a comment: Luau skips this line\nprint("This line is run")\n\n--[[\n  A comment over\n  several lines\n]]\nprint("Done") -- a comment after code is fine too',
          runnable: true,
          after: 'Only the two `print` lines show something. The comments do nothing.',
        },
        {
          type: 'predict',
          id: 'c0-comments-p1',
          question: 'How many lines appear in the Output?',
          code: 'print("One")\n-- print("Two")\nprint("Three")',
          concepts: ['comments'],
          options: [
            { text: '3', feedback: "Look at line 2: it starts with `--`. What does Luau do with a line like that?" },
            { text: '2', correct: true, feedback: 'Right. Line 2 is a comment and is skipped: you see One and Three.' },
            { text: '1', feedback: 'Only line 2 is a comment. Lines 1 and 3 run normally.' },
          ],
        },
        {
          type: 'exercise',
          id: 'c0-comments-ex1',
          mode: 'guided',
          title: 'Turn a line "off"',
          prompt: 'Programmers sometimes temporarily turn code off by making it a comment. Make sure the Output only shows **Player spawned**, by turning the other line into a comment. Don\'t delete anything.',
          starter: 'print("Player spawned")\nprint("DEBUG: position 0, 5, 0")',
          checks: [
            { kind: 'output', lines: ['Player spawned'], message: 'The Output must only be **Player spawned**.' },
            { kind: 'hasComment', message: 'Turn the debug line into a comment with `--` instead of deleting it.' },
          ],
          hints: ['Which characters do you put in front of a line to make it a comment?', 'Put `--` at the start of line 2.'],
          solution: 'print("Player spawned")\n-- print("DEBUG: position 0, 5, 0")',
          concepts: ['comments'],
          success: 'Handy trick: this way you can test code without throwing anything away.',
        },
      ],
      summary: ['A comment starts with `--` and is skipped by Luau.', '`--[[ ... ]]` makes a comment over several lines.', 'Comments are notes for people: mostly explain why.'],
    },

    // ------------------------------------------------------------------ 7
    {
      id: 'c0-lines-order',
      courseId: 'course-0',
      title: 'Why is code on separate lines?',
      objective: 'You know that Luau runs lines from top to bottom and that the order matters.',
      minutes: 5,
      prerequisites: ['print'],
      concepts: ['order'],
      steps: [
        {
          type: 'explain',
          body: `Luau runs your code **from top to bottom**, line by line. Just like a recipe.

Each line is usually one instruction. You could put instructions on one line, but separate lines make code much easier to read.

Because the order is fixed, it matters **where** you put a line. That becomes important soon: for example, you have to create something before you can use it.`,
        },
        {
          type: 'predict',
          id: 'c0-order-p1',
          question: 'What is the first line in the Output?',
          code: 'print("Round start")\nprint("3")\nprint("2")\nprint("1")',
          concepts: ['order'],
          options: [
            { text: 'Round start', correct: true, feedback: 'Yes: the top line runs first.' },
            { text: '1', feedback: 'Luau starts at the top, not at the bottom.' },
            { text: 'All lines at the same time', feedback: "It's lightning fast, but neatly one by one, from top to bottom." },
          ],
        },
        {
          type: 'exercise',
          id: 'c0-order-ex1',
          mode: 'independent',
          title: 'Put the countdown in order',
          prompt: 'The lines are mixed up. Put them in the right order so the Output is:\n**3**, **2**, **1**, **Start!**',
          starter: 'print("1")\nprint("Start!")\nprint("3")\nprint("2")',
          checks: [{ kind: 'output', lines: ['3', '2', '1', 'Start!'], message: 'The order in the Output must be 3, 2, 1, Start!' }],
          hints: ['Which line should be at the top?', 'Tip: with Alt + arrow up/down you move a line in the editor.'],
          solution: 'print("3")\nprint("2")\nprint("1")\nprint("Start!")',
          concepts: ['order'],
          success: 'Perfectly in order. Now you know how Luau reads your code.',
        },
      ],
      summary: ['Luau runs code from top to bottom.', 'One instruction per line keeps code readable.', 'The order of lines decides the order of what happens.'],
    },

    // ------------------------------------------------------------------ 8
    {
      id: 'c0-roblox-studio',
      courseId: 'course-0',
      title: 'Roblox Studio: Explorer, Properties and Output',
      objective: 'You can open Roblox Studio and find the Explorer, Properties, Workspace and Output.',
      minutes: 10,
      prerequisites: ['code-basics'],
      concepts: ['studio-basics'],
      steps: [
        {
          type: 'explain',
          title: 'What is Roblox Studio?',
          body: `**Roblox Studio** is the free program you use to build Roblox games. You place parts in a 3D world there, and you write your scripts.

You use four windows all the time:
- **Explorer**: a list of everything in your game, like a folder structure.
- **Properties**: the properties of what you selected, such as color, size and name.
- **Output**: messages from \`print\` and error messages appear here.
- **Workspace**: not a window, but a folder in the Explorer. Everything visible in the 3D world is in Workspace.`,
        },
        {
          type: 'studio',
          title: 'Open Roblox Studio and find the windows',
          body: 'You do these steps yourself in Roblox Studio. Tick each step when it worked.',
          steps: [
            { text: 'Open Roblox Studio and log in.', detail: "Don't have it yet? Download it for free from create.roblox.com." },
            { text: 'Choose a new **Baseplate** template.', detail: 'That is an empty world with a grey floor: perfect for practising.' },
            { text: 'Find the **Explorer** window.', detail: "Can't see it? Open it from the **Window** menu or tab (in the older layout: the **View** tab)." },
            { text: 'Expand **Workspace** in the Explorer and click **Baseplate**.' },
            { text: 'Look at the **Properties** window: you now see the properties of the Baseplate, such as Color and Size.' },
            { text: 'Open the **Output** window the same way as the Explorer.', detail: 'Always keep this window open while testing scripts.' },
          ],
          expected: 'You see the Explorer, Properties and Output, and the Baseplate is selected.',
        },
        {
          type: 'quiz',
          id: 'c0-studio-q1',
          question: 'You want to change the color of a part without code. Which window do you use?',
          concepts: ['studio-basics'],
          options: [
            { text: 'Properties', correct: true, feedback: 'Right. Properties shows all properties of the selected part.' },
            { text: 'Output', feedback: 'Output shows messages and errors from scripts, not properties.' },
            { text: 'Explorer', feedback: 'In the Explorer you select the part; you change the color itself in Properties.' },
          ],
        },
        {
          type: 'quiz',
          id: 'c0-studio-q2',
          question: 'Where does the text of `print("Hello")` appear when your game runs in Studio?',
          concepts: ['studio-basics', 'print'],
          options: [
            { text: 'In the Output window', correct: true, feedback: 'Yes. That is why you keep the Output open while testing.' },
            { text: 'As text above your avatar', feedback: "No, `print` is for you as a developer. Players don't see these messages." },
            { text: 'In the Explorer', feedback: 'The Explorer shows the parts of your game, not messages.' },
          ],
        },
      ],
      summary: ['Roblox Studio is the program where you build games and write scripts.', 'Explorer = everything in your game; Properties = properties of what is selected.', 'Output shows print messages and errors.', 'Workspace contains everything visible in the 3D world.'],
    },

    // ------------------------------------------------------------------ 9
    {
      id: 'c0-script-types',
      courseId: 'course-0',
      title: 'Script, LocalScript and ModuleScript',
      objective: 'You know the three kinds of scripts and where to put a normal Script.',
      minutes: 8,
      prerequisites: ['studio-basics'],
      concepts: ['script-types'],
      steps: [
        {
          type: 'explain',
          title: 'Three kinds of scripts',
          body: `In Roblox you write code in a **script**: an item in the Explorer that contains code. There are three kinds:

- **Script**: runs on the **server**, the Roblox computer that keeps track of the game for everyone. You use it for things that apply to all players, such as giving coins.
- **LocalScript**: runs on the device of **one player** (the **client**). You use it for things only that player sees, such as menus and buttons.
- **ModuleScript**: does nothing by itself. It contains code that other scripts can reuse.

You'll learn about server and client in depth later. For now: always start with a normal **Script**.`,
        },
        {
          type: 'explain',
          title: 'Where do you put a Script?',
          body: `The place in the Explorer decides whether a script runs.

**ServerScriptService** is the fixed place for Scripts that run on the server. Players can't see or download what is inside. That makes it the safest place for your game rules.

You put a LocalScript for example in **StarterPlayerScripts** or in an interface under **StarterGui**.`,
        },
        {
          type: 'quiz',
          id: 'c0-script-types-q1',
          question: 'You make a script that gives players coins. Which kind of script and where?',
          concepts: ['script-types'],
          options: [
            { text: 'A Script in ServerScriptService', correct: true, feedback: "Right. Coins should be tracked on the server, so players can't cheat." },
            { text: 'A LocalScript in StarterGui', feedback: "A LocalScript runs on the player's device. Handling coins there is unsafe; you'll learn why in the client and server course." },
            { text: 'A ModuleScript, it does everything automatically', feedback: 'A ModuleScript does nothing by itself; another script has to use it.' },
          ],
        },
        {
          type: 'quiz',
          id: 'c0-script-types-q2',
          question: 'What does a ModuleScript do when nobody uses it?',
          concepts: ['script-types'],
          options: [
            { text: 'Nothing', correct: true, feedback: 'Right. A ModuleScript is a toolbox: its code is only used when another script opens it.' },
            { text: 'It runs on the server by itself', feedback: 'A normal Script does that. A ModuleScript waits until another script uses it.' },
            { text: 'It runs for every player by itself', feedback: 'That is more like a LocalScript.' },
          ],
        },
      ],
      summary: ['Script = server; LocalScript = device of one player; ModuleScript = reusable code.', 'Server Scripts go in ServerScriptService.', 'When in doubt, start with a normal Script.'],
    },

    // ------------------------------------------------------------------ 10
    {
      id: 'c0-first-studio-script',
      courseId: 'course-0',
      title: 'Your first working script in Studio',
      objective: 'You create a Script in ServerScriptService, change it and see the result in the Output.',
      minutes: 10,
      prerequisites: ['studio-basics', 'script-types', 'print'],
      concepts: ['studio-basics', 'print'],
      steps: [
        {
          type: 'explain',
          body: `Time to put it all together: you write a script in Roblox Studio and run it in your own game.

First you practise the code here. Then you put exactly the same code in Studio.`,
        },
        {
          type: 'exercise',
          id: 'c0-first-studio-ex1',
          mode: 'independent',
          title: 'Practise the code',
          prompt: 'Write two lines:\n1. a `print` that shows **Server started**\n2. a `print` that shows **Welcome to my game**',
          starter: '',
          checks: [{ kind: 'output', lines: ['Server started', 'Welcome to my game'], message: 'The Output must have two lines: **Server started** and then **Welcome to my game**.' }],
          hints: ['Two lines of Output = two times `print`.'],
          solution: 'print("Server started")\nprint("Welcome to my game")',
          concepts: ['print'],
          success: "The code works. Now you'll use it in Roblox Studio.",
        },
        {
          type: 'studio',
          title: 'Put your script in Roblox Studio',
          steps: [
            { text: 'Open your Baseplate in Roblox Studio, with the Explorer and Output visible.' },
            { text: 'In the Explorer, hover over **ServerScriptService** and click the **+** button that appears.' },
            { text: 'Choose **Script**.', detail: 'An editor opens with the line `print("Hello world!")`. Roblox puts that there by default.' },
            { text: 'Replace that line with your two lines from the exercise above.', detail: 'Type them yourself. That is good practice.' },
            { text: 'Click **Play** (or press F5) to start your game.' },
            { text: 'Look at the **Output** window.', detail: 'After your text it says something like "Server - Script:1": who sent the message and from which line.' },
            { text: 'Stop the test with **Stop** (Shift + F5).' },
          ],
          expected: 'In the Output you see "Server started" and "Welcome to my game".',
        },
        {
          type: 'quiz',
          id: 'c0-first-studio-q1',
          question: 'In the Output it says "Server - Script:2" after your text. What does the 2 mean?',
          concepts: ['studio-basics'],
          options: [
            { text: 'The message came from line 2 of the script', correct: true, feedback: 'Exactly. That is very handy for finding mistakes.' },
            { text: "It's the second script in your game", feedback: 'The number after the colon is the line number in that script.' },
            { text: 'There are two players', feedback: 'No, that number is the line number.' },
          ],
        },
      ],
      summary: ['You create a server Script with + on ServerScriptService.', 'Play starts a test; the Output shows your print messages.', 'The Output also tells you which script and which line sent a message.'],
    },
  ],
};
