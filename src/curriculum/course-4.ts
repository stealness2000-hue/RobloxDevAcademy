import type { Course } from './types';

export const course4: Course = {
  id: 'course-4',
  number: 4,
  title: 'Functions',
  description: 'Making reusable code with parameters and return values. The basis of every Roblox system.',
  level: 'Beginner',
  planned: [],
  lessons: [
    // ------------------------------------------------------------------ 1
    {
      id: 'c4-functions',
      courseId: 'course-4',
      title: 'What is a function?',
      objective: 'You can create a function with local function and call it.',
      minutes: 9,
      prerequisites: ['variables', 'print'],
      concepts: ['functions'],
      steps: [
        {
          type: 'explain',
          body: `You have been using a function since lesson 2: \`print\`. A **function** is a piece of code with a name, which you can run whenever you want.

Now you will make functions **yourself**. That has two big advantages:
- you write code once and use it often
- you give a piece of code a clear name, like \`resetPlayer\` or \`giveCoins\`

**Creating** a function does nothing yet. Only when you **call** it (with brackets) does the code inside run.`,
        },
        {
          type: 'code',
          code: 'local function sayWelcome()\n    print("Welcome to the game!")\n    print("Have fun")\nend\n\nsayWelcome()\nsayWelcome()',
          runnable: true,
          annotations: [
            { token: 'function', text: '`local function` creates a new function. Just like with variables, you put `local` in front of it.' },
            { token: 'sayWelcome', text: 'The **name** of the function. Choose a verb: what does it do?' },
            { token: '()', text: 'When creating, the **parameters** go here later. When calling, the brackets mean: run it now.' },
            { token: 'end', text: '`end` closes the function.' },
          ],
          after: 'The function is called twice, so you see the two messages twice.',
        },
        {
          type: 'predict',
          id: 'c4-functions-p1',
          question: 'What does this code show?',
          code: 'local function beep()\n    print("beep")\nend\nprint("start")',
          concepts: ['functions'],
          options: [
            { text: 'beep start', feedback: 'The function is created, but never called.' },
            { text: 'start', correct: true, feedback: 'Right. Without `beep()` the code in the function never runs.' },
            { text: 'An error', feedback: 'Creating a function without using it is not an error; it just does nothing.' },
          ],
        },
        {
          type: 'exercise',
          id: 'c4-functions-ex1',
          mode: 'guided',
          title: 'Your first function',
          prompt: 'Create a function `showRules` that prints two lines: **Rule 1: no cheating** and **Rule 2: have fun**. Then call it **once**.',
          starter: '',
          checks: [
            { kind: 'uses', sequence: ['local', 'function', 'showRules'], message: 'Create the function with `local function showRules()`.' },
            { kind: 'uses', sequence: ['showRules', '(', ')'], message: 'Call the function with `showRules()`.' },
            { kind: 'output', lines: ['Rule 1: no cheating', 'Rule 2: have fun'], message: 'The Output must show the two lines exactly once.' },
          ],
          hints: ['local function showRules()\n    ...\nend', 'Call it on a new line, after the `end`.'],
          solution: 'local function showRules()\n    print("Rule 1: no cheating")\n    print("Rule 2: have fun")\nend\n\nshowRules()',
          concepts: ['functions'],
          success: 'Your first function of your own.',
        },
        {
          type: 'exercise',
          id: 'c4-functions-ex2',
          mode: 'independent',
          kind: 'fix-bug',
          title: 'Called too early',
          prompt: 'This code gives an error. Run it, read the explanation and fix it by moving lines.',
          starter: 'startRound()\n\nlocal function startRound()\n    print("Round started")\nend',
          checks: [{ kind: 'output', lines: ['Round started'], message: 'The Output must be **Round started**.' }],
          hints: ['Luau reads from top to bottom. Does `startRound` already exist on line 1?', 'Put the call below the function.'],
          solution: 'local function startRound()\n    print("Round started")\nend\n\nstartRound()',
          concepts: ['functions', 'order'],
          success: 'A local function only exists from the line where you create it. That is why functions go at the top.',
        },
      ],
      summary: ['A function is code with a name that you can reuse.', '`local function name() ... end` creates it; `name()` runs it.', 'A local function only exists after the line where it is created.'],
    },

    // ------------------------------------------------------------------ 2
    {
      id: 'c4-parameters',
      courseId: 'course-4',
      title: 'Parameters and arguments',
      objective: 'You can pass information to a function with parameters.',
      minutes: 10,
      prerequisites: ['functions'],
      concepts: ['parameters'],
      steps: [
        {
          type: 'explain',
          body: `A function becomes much more powerful when you give it information.

- A **parameter** is a variable in the function that gets its value when the function is called. You write it between the brackets when **creating** the function.
- An **argument** is the value you pass when **calling** it.

You separate multiple parameters with commas, just like with \`print\`.`,
        },
        {
          type: 'code',
          code: 'local function greet(playerName, level)\n    print(`Welcome {playerName}, you are level {level}`)\nend\n\ngreet("Nova", 3)\ngreet("Kai", 12)',
          runnable: true,
          annotations: [
            { token: 'playerName', text: '`playerName` is a **parameter**: inside the function it is a variable.' },
            { token: '"Nova"', text: '`"Nova"` is the **argument**: the value that ends up in `playerName` for this call.' },
          ],
          after: 'The same function, two different messages. The first argument goes to the first parameter, the second to the second.',
        },
        {
          type: 'predict',
          id: 'c4-parameters-p1',
          question: 'What does this code show?',
          code: 'local function show(a, b)\n    print(b, a)\nend\nshow("left", "right")',
          concepts: ['parameters'],
          options: [
            { text: 'left right', feedback: 'Look at which parameter print uses first.' },
            { text: 'right left', correct: true, feedback: 'Right. a = "left", b = "right", and the function prints b first.' },
          ],
        },
        {
          type: 'exercise',
          id: 'c4-parameters-ex1',
          mode: 'guided',
          title: 'Reporting damage',
          prompt: 'Create a function `reportDamage(name, amount)` that prints: **Nova took 25 damage** (with the values of the parameters). Call it with `"Nova"` and `25`.',
          starter: '',
          checks: [
            { kind: 'uses', sequence: ['local', 'function', 'reportDamage', '(', 'name', ',', 'amount', ')'], message: 'Create the function with exactly `local function reportDamage(name, amount)`.' },
            { kind: 'output', lines: ['Nova took 25 damage'], message: 'The Output must be **Nova took 25 damage**.' },
            { kind: 'test', harness: 'reportDamage("Kai", 7)\nreturn true', message: '' },
          ],
          hints: ['Use the parameters in the text: print(`{name} took {amount} damage`)'],
          solution: 'local function reportDamage(name, amount)\n    print(`{name} took {amount} damage`)\nend\n\nreportDamage("Nova", 25)',
          concepts: ['parameters'],
          success: 'Good. Now the same function works for every player and every amount of damage.',
        },
        {
          type: 'exercise',
          id: 'c4-parameters-ex2',
          mode: 'independent',
          title: 'Repeating cheer',
          prompt: 'Create `cheer(word, times)`: it prints `word` exactly `times` times, one under the other. Call it with `"Go!"` and `3`.',
          starter: '',
          checks: [
            { kind: 'output', lines: ['Go!', 'Go!', 'Go!'], message: 'The Output must be **Go!** three times.' },
            { kind: 'uses', sequence: ['for'], message: 'Use a for loop in the function.' },
            { kind: 'variants', replace: 'cheer("Go!", 3)', cases: [{ with: 'cheer("Yay", 2)', lines: ['Yay', 'Yay'] }], message: 'Your function does not use `word` or `times` correctly yet.' },
          ],
          hints: ['Use `times` as the end value of a for loop inside the function.'],
          solution: 'local function cheer(word, times)\n    for i = 1, times do\n        print(word)\n    end\nend\n\ncheer("Go!", 3)',
          concepts: ['parameters', 'loops'],
          success: 'Tested with ("Go!", 3) and ("Yay", 2).',
        },
      ],
      summary: ['Parameters go between the brackets when you create a function.', 'Arguments are the values you pass when you call it.', 'The order decides which argument belongs to which parameter.'],
    },

    // ------------------------------------------------------------------ 3
    {
      id: 'c4-return',
      courseId: 'course-4',
      title: 'return: giving back an answer',
      objective: 'You can make a function give back a value and use that value.',
      minutes: 11,
      prerequisites: ['parameters'],
      concepts: ['return-values'],
      steps: [
        {
          type: 'explain',
          body: `So far your functions printed something. Often you actually want to get an **answer** back to keep calculating with. You do that with \`return\`.

\`return value\` stops the function and gives the value back to the place where the function was called. You can store that value in a variable.

**print** shows something. **return** gives something back. That is a big difference: your code cannot do anything else with a printed value.`,
        },
        {
          type: 'code',
          code: 'local function double(number)\n    return number * 2\nend\n\nlocal result = double(21)\nprint(result)\nprint(double(5) + 1)',
          runnable: true,
          annotations: [
            { token: 'return', text: '`return` gives the value back and stops the function immediately.' },
            { token: 'result', text: 'The returned value (42) is stored in `result`.' },
          ],
          after: '`double(5) + 1`: first the function gives back 10, then Luau adds 1.',
        },
        {
          type: 'quiz',
          id: 'c4-return-q1',
          question: 'What is the difference between `print(x)` and `return x` in a function?',
          concepts: ['return-values'],
          options: [
            { text: 'print shows x; return gives x back so you can keep working with it', correct: true, feedback: 'Exactly.' },
            { text: 'There is no difference', feedback: 'Your code cannot do anything more with a printed value; with a returned value it can.' },
            { text: 'return shows x bigger in the Output', feedback: 'return shows nothing at all.' },
          ],
        },
        {
          type: 'exercise',
          id: 'c4-return-ex1',
          mode: 'guided',
          title: 'Price with discount',
          prompt: 'Create `applyDiscount(price, percent)` that returns the price **after the discount**. Example: `applyDiscount(200, 25)` gives `150`.',
          starter: 'local function applyDiscount(price, percent)\n    -- your code\nend\n\nprint(applyDiscount(200, 25))',
          checks: [
            { kind: 'uses', sequence: ['return'], message: 'Use `return` to give back the new price.' },
            { kind: 'test', harness: 'if applyDiscount(200, 25) ~= 150 then return "applyDiscount(200, 25) must return 150." end\nif applyDiscount(80, 50) ~= 40 then return "applyDiscount(80, 50) must return 40." end\nif applyDiscount(99, 0) ~= 99 then return "applyDiscount(99, 0) must return 99." end\nreturn true', message: '' },
          ],
          hints: ['The discount is `price * percent / 100`.', 'return price - price * percent / 100'],
          solution: 'local function applyDiscount(price, percent)\n    return price - price * percent / 100\nend\n\nprint(applyDiscount(200, 25))',
          concepts: ['return-values', 'parameters'],
          success: 'The Academy tested your function with three different prices and discounts. All good.',
        },
        {
          type: 'exercise',
          id: 'c4-return-ex2',
          mode: 'independent',
          title: 'Can I buy this?',
          prompt: 'Create `canAfford(coins, price)` that returns `true` when the player has enough coins (at least the price), and otherwise `false`.',
          starter: '',
          checks: [
            { kind: 'test', harness: 'return typeof(canAfford) == "function" or "Create a function named `canAfford`."', message: '' },
            { kind: 'test', harness: 'if canAfford(100, 100) ~= true then return "canAfford(100, 100) must be true." end\nif canAfford(150, 100) ~= true then return "canAfford(150, 100) must be true." end\nif canAfford(99, 100) ~= false then return "canAfford(99, 100) must be false." end\nreturn true', message: '' },
          ],
          hints: ['A comparison already gives true or false: you can return it directly.', 'return coins >= price'],
          solution: 'local function canAfford(coins, price)\n    return coins >= price\nend',
          concepts: ['return-values', 'comparisons'],
          success: 'Short and correct. Small functions like this make your shop code easy to read.',
        },
      ],
      summary: ['`return value` gives back a value and stops the function.', 'You can store the returned value or use it directly.', 'print shows; return gives back.'],
    },

    // ------------------------------------------------------------------ 4
    {
      id: 'c4-scope-callbacks',
      courseId: 'course-4',
      title: 'Scope, anonymous functions and callbacks',
      objective: 'You understand that variables in a function are local, and that you can pass a function around as a value.',
      minutes: 11,
      prerequisites: ['functions', 'return-values'],
      concepts: ['functions'],
      steps: [
        {
          type: 'explain',
          body: `**Scope inside functions.** A variable you create **inside** a function only exists in that function. The function can still use and change variables from **outside**.

**Functions are values.** You can put a function in a variable, or pass it to another function. A function without a name is called an **anonymous function**: \`function() ... end\`.

A function you pass along to be run later is called a **callback**. This is extremely important in Roblox: with events you say "when this happens, run this function".`,
        },
        {
          type: 'code',
          code: 'local total = 0\n\nlocal function addCoins(amount)\n    local bonus = 5\n    total += amount + bonus\nend\n\naddCoins(10)\naddCoins(20)\nprint(total)\nprint(bonus)',
          runnable: true,
          after: '`total` (from outside) was changed: 40. `bonus` only existed inside the function, so outside it is `nil`.',
        },
        {
          type: 'code',
          title: 'A callback',
          code: 'local function doTwice(callback)\n    callback()\n    callback()\nend\n\ndoTwice(function()\n    print("Hello!")\nend)',
          runnable: true,
          after: 'The anonymous function is passed as an argument, and `doTwice` calls it twice. In Roblox you will soon write `part.Touched:Connect(function() ... end)`. That is exactly this pattern.',
        },
        {
          type: 'predict',
          id: 'c4-scope-p1',
          question: 'What does this code show?',
          code: 'local function setup()\n    local secret = 42\nend\nsetup()\nprint(secret)',
          concepts: ['functions'],
          options: [
            { text: '42', feedback: '`secret` is a local inside the function: outside the function it does not exist.' },
            { text: 'nil', correct: true, feedback: 'Right. `secret` only exists inside `setup`.' },
          ],
        },
        {
          type: 'exercise',
          id: 'c4-callback-ex1',
          mode: 'independent',
          title: 'Do something with every number',
          prompt: 'Create `forEachNumber(count, callback)`: it calls `callback(i)` for i = 1 up to `count`.\nThen call it with `3` and an anonymous function that prints `"Number " .. n`.',
          starter: '',
          checks: [
            { kind: 'output', lines: ['Number 1', 'Number 2', 'Number 3'], message: 'The Output must be Number 1, Number 2, Number 3.' },
            { kind: 'uses', sequence: ['function', '(', 'n', ')'], message: 'Pass an anonymous function with parameter `n`: `function(n) ... end`.' },
            { kind: 'test', harness: 'local seen = 0\nforEachNumber(4, function(x) seen += x end)\nif seen ~= 10 then return "forEachNumber(4, ...) must call the callback with 1, 2, 3 and 4." end\nreturn true', message: '' },
          ],
          hints: ['In forEachNumber: a for loop that calls `callback(i)`.', 'forEachNumber(3, function(n)\n    print("Number " .. n)\nend)'],
          solution: 'local function forEachNumber(count, callback)\n    for i = 1, count do\n        callback(i)\n    end\nend\n\nforEachNumber(3, function(n)\n    print("Number " .. n)\nend)',
          concepts: ['functions', 'parameters'],
          success: 'You wrote a function that calls another function. This is the heart of events in Roblox.',
        },
      ],
      summary: ['Variables in a function are local: they do not exist outside the function.', 'You can pass a function around as a value.', 'A callback is a function that is called for you later, like with Roblox events.'],
    },

    // ------------------------------------------------------------------ 5 project
    {
      id: 'c4-project-damage',
      courseId: 'course-4',
      title: 'Project: damage calculation',
      objective: 'You build a reusable damage function like in a real combat game.',
      minutes: 15,
      prerequisites: ['return-values', 'conditions'],
      concepts: ['functions', 'return-values', 'conditions'],
      steps: [
        {
          type: 'explain',
          body: `In a game with fights, damage has to be calculated the same way everywhere: for swords, arrows and spells. That is why you make one function for it.

Rules of this game:
- damage = \`baseDamage\` × \`multiplier\`
- on a **critical hit** the damage is doubled
- the opponent's armour (\`armor\`) is subtracted after that
- damage is never lower than **0**`,
        },
        {
          type: 'exercise',
          id: 'c4-project-ex1',
          mode: 'independent',
          title: 'calculateDamage',
          prompt: 'Create `calculateDamage(baseDamage, multiplier, isCritical, armor)` that **returns** the damage according to the rules above.\nExamples:\n- `calculateDamage(10, 2, false, 5)` → 15\n- `calculateDamage(10, 2, true, 5)` → 35\n- `calculateDamage(10, 1, false, 50)` → 0',
          starter: 'local function calculateDamage(baseDamage, multiplier, isCritical, armor)\n    -- your code\nend\n\nprint(calculateDamage(10, 2, false, 5))',
          checks: [
            { kind: 'uses', sequence: ['return'], message: 'Give back the damage with `return`.' },
            { kind: 'test', harness: 'local cases = { {10, 2, false, 5, 15}, {10, 2, true, 5, 35}, {10, 1, false, 50, 0}, {7, 3, true, 0, 42}, {1, 1, false, 1, 0} }\nfor _, c in cases do\n    local got = calculateDamage(c[1], c[2], c[3], c[4])\n    if got ~= c[5] then\n        return `calculateDamage({c[1]}, {c[2]}, {tostring(c[3])}, {c[4]}) gave {tostring(got)}, but it must be {c[5]}.`\n    end\nend\nreturn true', message: '' },
          ],
          hints: ['Start with `local damage = baseDamage * multiplier`.', 'Double it with an if: `if isCritical then damage *= 2 end`.', 'Subtract armor and then use `if damage < 0 then damage = 0 end` (or `math.max(0, damage)`).'],
          solution: 'local function calculateDamage(baseDamage, multiplier, isCritical, armor)\n    local damage = baseDamage * multiplier\n    if isCritical then\n        damage *= 2\n    end\n    damage -= armor\n    if damage < 0 then\n        damage = 0\n    end\n    return damage\nend\n\nprint(calculateDamage(10, 2, false, 5))',
          concepts: ['functions', 'return-values', 'conditions'],
          success: 'Your function was tested with five different combat situations. It would fit right into a real Roblox game.',
        },
      ],
      summary: ['One function for one rule of your game: the same calculation everywhere.', 'You combined parameters, if statements and return.', 'Next course: storing lots of data in tables.'],
    },
  ],
};
