import type { Course } from './types';

export const course3: Course = {
  id: 'course-3',
  number: 3,
  title: 'Loops',
  description: 'Repeating code with for, while and repeat, without freezing your game.',
  level: 'Beginner',
  planned: [],
  lessons: [
    // ------------------------------------------------------------------ 1
    {
      id: 'c3-for',
      courseId: 'course-3',
      title: 'The for loop',
      objective: 'You can repeat code a fixed number of times with a for loop and use the counter.',
      minutes: 10,
      prerequisites: ['variables', 'operators'],
      concepts: ['loops'],
      steps: [
        {
          type: 'explain',
          body: `Say you want to place 10 coins in your game. You could write almost the same line 10 times, but that is a lot of work and hard to change.

A **loop** repeats code for you. The **for loop** repeats a fixed number of times and keeps track of how many times it has run in a **counter**.`,
        },
        {
          type: 'code',
          code: 'for i = 1, 3 do\n    print(i)\nend',
          runnable: true,
          annotations: [
            { token: 'for', text: '`for` starts the loop.' },
            { token: 'i', text: '`i` is the **counter**: a variable that gets a new value every repetition. You can also give it another name, like `round` or `number`.' },
            { token: '1', text: 'The **start value**: the counter starts at 1.' },
            { token: '3', text: 'The **end value**: the last round is when the counter is 3. So 3 counts too.' },
            { token: 'do', text: '`do` means: here starts the code that is repeated.' },
            { token: 'end', text: '`end` closes the loop.' },
          ],
          after: 'The code between `do` and `end` runs three times: with i = 1, i = 2 and i = 3.',
        },
        {
          type: 'visual',
          kind: 'loop',
          title: 'Watch every repetition',
          body: 'Change the number of repetitions and watch the counter follow along.',
          code: '',
        },
        {
          type: 'predict',
          id: 'c3-for-p1',
          question: 'How many lines does this code show?',
          code: 'for round = 2, 5 do\n    print("Round " .. round)\nend',
          concepts: ['loops'],
          options: [
            { text: '5', feedback: 'The counter does not start at 1, but at 2.' },
            { text: '4', correct: true, feedback: 'Right: round 2, 3, 4 and 5.' },
            { text: '3', feedback: 'Careful: the end value 5 counts too.' },
          ],
        },
        {
          type: 'exercise',
          id: 'c3-for-ex1',
          mode: 'guided',
          title: 'Placing coins',
          prompt: 'Use a for loop that shows **Coin 1** up to and including **Coin 5** (5 lines).',
          starter: '',
          checks: [
            { kind: 'uses', sequence: ['for'], message: 'Use a `for` loop instead of five separate prints.' },
            { kind: 'outputCount', min: 5, max: 5, message: 'Exactly 5 lines must appear.' },
            { kind: 'output', lines: ['Coin 1', 'Coin 2', 'Coin 3', 'Coin 4', 'Coin 5'], message: 'The lines must be **Coin 1** up to **Coin 5**.' },
          ],
          hints: ['`for i = 1, 5 do` ... `end`', 'Inside the loop: `print("Coin " .. i)`'],
          solution: 'for i = 1, 5 do\n    print("Coin " .. i)\nend',
          concepts: ['loops'],
          success: 'Five coins with three lines of code. Want 100? Just change the 5.',
        },
        {
          type: 'exercise',
          id: 'c3-for-ex2',
          mode: 'independent',
          title: 'Times table of 7',
          prompt: 'Show the times table of a number. With `number = 7` the output is:\n**1 x 7 = 7** up to **5 x 7 = 35** (5 lines). Use the variable `number`, so it also works for other numbers.',
          starter: 'local number = 7\n',
          checks: [
            { kind: 'uses', sequence: ['for'], message: 'Use a `for` loop.' },
            { kind: 'output', lines: ['1 x 7 = 7', '2 x 7 = 14', '3 x 7 = 21', '4 x 7 = 28', '5 x 7 = 35'], message: 'The output must be 1 x 7 = 7 up to 5 x 7 = 35.' },
            { kind: 'variants', replace: 'local number = 7', cases: [{ with: 'local number = 3', lines: ['1 x 3 = 3', '2 x 3 = 6', '3 x 3 = 9', '4 x 3 = 12', '5 x 3 = 15'] }], message: 'Your code only works for 7. Use the variable `number` instead of the number 7.' },
          ],
          hints: ['Interpolation helps: print(`{i} x {number} = {i * number}`)'],
          solution: 'local number = 7\nfor i = 1, 5 do\n    print(`{i} x {number} = {i * number}`)\nend',
          concepts: ['loops', 'interpolation'],
          success: 'Works for 7 and for 3. You used the counter in a calculation.',
        },
      ],
      summary: ['`for i = start, finish do ... end` repeats code.', 'The counter `i` gets the next value every round; the end value counts too.', 'Use the counter in your code, for example in text or calculations.'],
    },

    // ------------------------------------------------------------------ 2
    {
      id: 'c3-for-step',
      courseId: 'course-3',
      title: 'Counting down and adding up',
      objective: 'You can count down with a step size and keep a total in a loop.',
      minutes: 10,
      prerequisites: ['loops'],
      concepts: ['loops'],
      steps: [
        {
          type: 'explain',
          body: `A for loop can get a third number: the **step size**. It says how much the counter changes each round.

- \`for i = 10, 0, -2 do\`: 10, 8, 6, 4, 2, 0
- \`for i = 3, 1, -1 do\`: 3, 2, 1. That is how you count down.

Without a third number the step is always 1.`,
        },
        {
          type: 'code',
          code: 'for i = 3, 1, -1 do\n    print(i)\nend\nprint("Start!")',
          runnable: true,
        },
        {
          type: 'explain',
          title: 'Keeping a total',
          body: `A common pattern: create a variable **before** the loop, and keep adding something to it **inside** the loop.

After the loop you have the total. Do not create the variable inside the loop, because then it starts over every round.`,
        },
        {
          type: 'code',
          code: 'local total = 0\nfor wave = 1, 4 do\n    total += wave * 10\nend\nprint("Total earned: " .. total)',
          runnable: true,
          after: '10 + 20 + 30 + 40 = 100.',
        },
        {
          type: 'exercise',
          id: 'c3-step-ex1',
          mode: 'guided',
          title: 'Rocket launch',
          prompt: 'Count down from **10** to **1** with a for loop and a negative step, and then print **Liftoff!**',
          starter: '',
          checks: [
            { kind: 'uses', sequence: ['for'], message: 'Use a `for` loop.' },
            { kind: 'uses', sequence: [',', '-', '1', 'do'], message: 'Use `-1` as the step size to count down.' },
            { kind: 'output', lines: ['10', '9', '8', '7', '6', '5', '4', '3', '2', '1', 'Liftoff!'], message: 'The output must be 10 down to 1, followed by **Liftoff!**' },
          ],
          hints: ['`for i = 10, 1, -1 do`', 'Put the last print **after** the `end` of the loop.'],
          solution: 'for i = 10, 1, -1 do\n    print(i)\nend\nprint("Liftoff!")',
          concepts: ['loops'],
          success: 'Perfect countdown.',
        },
        {
          type: 'exercise',
          id: 'c3-step-ex2',
          mode: 'independent',
          title: 'Collecting coins',
          prompt: 'A player plays for `days` days. On day 1 they get 5 coins, on day 2 10 coins, on day 3 15 coins, and so on (day × 5). Calculate the total in the variable `total` and print it.',
          starter: 'local days = 4\n',
          checks: [
            { kind: 'uses', sequence: ['for'], message: 'Use a `for` loop.' },
            { kind: 'value', expr: 'total', equals: 50, message: 'With 4 days, `total` must be 50 (5 + 10 + 15 + 20).' },
            { kind: 'variants', replace: 'local days = 4', cases: [{ with: 'local days = 1', lines: ['5'] }, { with: 'local days = 10', lines: ['275'] }], message: 'Your total is not right for every number of days. Use `days` as the end value.' },
          ],
          hints: ['Start with `local total = 0` before the loop.', 'Inside the loop: `total += day * 5`'],
          solution: 'local days = 4\nlocal total = 0\nfor day = 1, days do\n    total += day * 5\nend\nprint(total)',
          concepts: ['loops', 'operators'],
          success: 'Tested with 1, 4 and 10 days. This is exactly how a daily reward system calculates.',
        },
      ],
      summary: ['A third number is the step size; `-1` counts down.', 'Keeping a total: create the variable before the loop, add to it inside the loop.', 'Code after `end` runs once, after the whole loop.'],
    },

    // ------------------------------------------------------------------ 3
    {
      id: 'c3-while',
      courseId: 'course-3',
      title: 'while and repeat',
      objective: 'You can repeat while a condition is true, and know how to avoid an infinite loop.',
      minutes: 11,
      prerequisites: ['loops', 'conditions'],
      concepts: ['while-loops'],
      steps: [
        {
          type: 'explain',
          body: `A for loop knows beforehand how often it will run. Sometimes you do not know that. Then you use a **while loop**: "repeat **as long as** something is true".

\`while condition do ... end\`

Important: inside the loop something must change so the condition eventually becomes \`false\`. Otherwise the loop **never** stops. That is called an **infinite loop**, and in Roblox it freezes your game.`,
        },
        {
          type: 'code',
          code: 'local health = 100\nlocal hits = 0\nwhile health > 0 do\n    health -= 30\n    hits += 1\nend\nprint(`After {hits} hits health is {health}`)',
          runnable: true,
          after: 'Every round health goes down. After 4 hits health is -20; then `health > 0` is false and the loop stops.',
        },
        {
          type: 'code',
          title: 'What happens with an infinite loop?',
          body: 'This loop never changes `coins`. Run it: the Academy stops it after a few seconds and explains what went wrong.',
          code: 'local coins = 0\nwhile coins < 10 do\n    print("Almost...")\nend',
          runnable: true,
          after: 'In Roblox Studio this would freeze your game (an error). Every while loop must change something that affects the condition.',
        },
        {
          type: 'explain',
          title: 'repeat ... until',
          body: `\`repeat ... until condition\` looks like while, with two differences:
- the code **always runs at least once**
- it stops **as soon as** the condition is true (with while it is the other way round: keep going while it is true)`,
        },
        {
          type: 'code',
          code: 'local tries = 0\nrepeat\n    tries += 1\n    print("Try " .. tries)\nuntil tries >= 3',
          runnable: true,
        },
        {
          type: 'exercise',
          id: 'c3-while-ex1',
          mode: 'guided',
          kind: 'fix-bug',
          title: 'Fix the infinite loop',
          prompt: 'This loop never stops. Run it and add **one line**, so it shows **3, 2, 1** and then stops.',
          starter: 'local count = 3\nwhile count > 0 do\n    print(count)\nend',
          checks: [{ kind: 'output', lines: ['3', '2', '1'], message: 'The output must be 3, 2, 1.' }],
          hints: ['What has to happen to `count` every round so that `count > 0` eventually becomes false?', 'Add `count -= 1` inside the loop.'],
          solution: 'local count = 3\nwhile count > 0 do\n    print(count)\n    count -= 1\nend',
          concepts: ['while-loops'],
          success: 'Fixed. For every while loop, check: what makes it stop?',
        },
        {
          type: 'exercise',
          id: 'c3-while-ex2',
          mode: 'independent',
          title: 'Saving up for a sword',
          prompt: 'A player has `coins` and earns **15 coins per round**. Use a while loop to work out how many rounds (`rounds`) they need to play until they have at least `price` coins. Print `rounds`.',
          starter: 'local coins = 20\nlocal price = 100\nlocal rounds = 0\n',
          checks: [
            { kind: 'uses', sequence: ['while'], message: 'Use a `while` loop.' },
            { kind: 'value', expr: 'rounds', equals: 6, message: 'With 20 coins and price 100 it takes 6 rounds (20 → 35 → 50 → 65 → 80 → 95 → 110).' },
            { kind: 'variants', replace: 'local coins = 20', cases: [{ with: 'local coins = 100', lines: ['0'] }, { with: 'local coins = 99', lines: ['1'] }], message: 'Your answer is not right for every starting amount. If the player already has enough, it takes 0 rounds.' },
          ],
          hints: ['Repeat as long as `coins < price`.', 'Inside the loop: `coins += 15` and `rounds += 1`.'],
          solution: 'local coins = 20\nlocal price = 100\nlocal rounds = 0\nwhile coins < price do\n    coins += 15\n    rounds += 1\nend\nprint(rounds)',
          concepts: ['while-loops'],
          success: 'Correct for 20, 99 and 100 coins.',
        },
      ],
      summary: ['`while condition do ... end` repeats as long as the condition is true.', '`repeat ... until condition` runs at least once and stops when the condition becomes true.', 'Always make sure something changes in the loop, or it runs forever.'],
    },

    // ------------------------------------------------------------------ 4
    {
      id: 'c3-break-continue',
      courseId: 'course-3',
      title: 'break and continue',
      objective: 'You can stop a loop early with break and skip a round with continue.',
      minutes: 8,
      prerequisites: ['loops', 'conditions'],
      concepts: ['loops'],
      steps: [
        {
          type: 'explain',
          body: `Two handy words inside loops:
- \`break\` stops the whole loop **immediately**. The code after the loop carries on.
- \`continue\` skips **the rest of this round** and goes on with the next round.

You almost always use them inside an if statement.`,
        },
        {
          type: 'code',
          code: 'for i = 1, 10 do\n    if i == 4 then\n        break\n    end\n    print(i)\nend\nprint("Loop stopped")',
          runnable: true,
          after: 'At i = 4 the loop stops completely: you see 1, 2, 3.',
        },
        {
          type: 'predict',
          id: 'c3-continue-p1',
          question: 'What does this code show?',
          code: 'for i = 1, 5 do\n    if i == 3 then\n        continue\n    end\n    print(i)\nend',
          concepts: ['loops'],
          options: [
            { text: '1 2', feedback: 'That would be the case with `break`. `continue` only skips this round.' },
            { text: '1 2 4 5', correct: true, feedback: 'Right. Round 3 is skipped, then the loop simply continues.' },
            { text: '3', feedback: 'At i = 3 the print is exactly what gets skipped.' },
          ],
        },
        {
          type: 'exercise',
          id: 'c3-break-ex1',
          mode: 'independent',
          title: 'First free spot',
          prompt: 'A server has spots 1 to 10. Spots up to and including `taken` are occupied. Use a for loop and `break` to find the first free spot and print **Free spot:** followed by the number, for example **Free spot: 4**.',
          starter: 'local taken = 3\n',
          checks: [
            { kind: 'uses', sequence: ['break'], message: 'Use `break` as soon as you have found a free spot.' },
            { kind: 'output', lines: ['Free spot: 4'], message: 'With 3 occupied spots, spot 4 is the first free one.' },
            { kind: 'variants', replace: 'local taken = 3', cases: [{ with: 'local taken = 0', lines: ['Free spot: 1'] }, { with: 'local taken = 8', lines: ['Free spot: 9'] }], message: 'Your code does not find the right spot in every situation.' },
          ],
          hints: ['Loop from 1 to 10. A spot is free when its number is greater than `taken`.', 'Print the number and put `break` right after it.'],
          solution: 'local taken = 3\nfor spot = 1, 10 do\n    if spot > taken then\n        print("Free spot: " .. spot)\n        break\n    end\nend',
          concepts: ['loops', 'conditions'],
          success: 'Without break you would print every free spot. With break you stop at the first one.',
        },
        {
          type: 'exercise',
          id: 'c3-continue-ex1',
          mode: 'independent',
          title: 'Only even levels',
          prompt: 'Print the levels 1 up to 10, but skip the **odd** levels with `continue`. (A number is odd when `level % 2 == 1`.)',
          starter: '',
          checks: [
            { kind: 'uses', sequence: ['continue'], message: 'Use `continue` to skip odd levels.' },
            { kind: 'output', lines: ['2', '4', '6', '8', '10'], message: 'The output must be 2, 4, 6, 8, 10.' },
          ],
          hints: ['if level % 2 == 1 then continue end'],
          solution: 'for level = 1, 10 do\n    if level % 2 == 1 then\n        continue\n    end\n    print(level)\nend',
          concepts: ['loops'],
          success: 'Good. `continue` is a Luau extra; plain Lua does not have it.',
        },
      ],
      summary: ['`break` stops the whole loop.', '`continue` skips the rest of this round.', 'Use them inside an if statement in the loop.'],
    },

    // ------------------------------------------------------------------ 5
    {
      id: 'c3-nested',
      courseId: 'course-3',
      title: 'Loops inside loops',
      objective: 'You understand nested loops and can build a grid with them.',
      minutes: 8,
      prerequisites: ['loops'],
      concepts: ['loops'],
      steps: [
        {
          type: 'explain',
          body: `A loop inside another loop is called a **nested loop**. For **every** round of the outer loop, the inner loop runs completely.

In Roblox you use this, for example, to build a grid of tiles: rows × columns.

Use different names for the counters, like \`row\` and \`col\`, or you will get confused.`,
        },
        {
          type: 'code',
          code: 'for row = 1, 2 do\n    for col = 1, 3 do\n        print(`Tile {row}-{col}`)\n    end\nend',
          runnable: true,
          after: '2 rows × 3 columns = 6 tiles.',
        },
        {
          type: 'predict',
          id: 'c3-nested-p1',
          question: 'How many times is "x" printed?',
          code: 'for a = 1, 4 do\n    for b = 1, 5 do\n        print("x")\n    end\nend',
          concepts: ['loops'],
          options: [
            { text: '9', feedback: 'Do not add: for every a, the whole b loop runs.' },
            { text: '20', correct: true, feedback: 'Right: 4 × 5 = 20.' },
            { text: '5', feedback: 'The inner loop runs completely 4 times.' },
          ],
        },
        {
          type: 'exercise',
          id: 'c3-nested-ex1',
          mode: 'independent',
          title: 'Build a grid',
          prompt: 'Use nested loops to make a grid of `rows` rows and `cols` columns. Print **one line** per row with a `#` for each column. With 2 rows and 4 columns:\n**####**\n**####**',
          starter: 'local rows = 2\nlocal cols = 4\n',
          checks: [
            { kind: 'output', lines: ['####', '####'], message: 'With 2 rows and 4 columns: two lines, each ####.' },
            { kind: 'variants', replace: 'local cols = 4', cases: [{ with: 'local cols = 1', lines: ['#', '#'] }], message: 'Your grid does not use `cols` correctly yet.' },
            { kind: 'variants', replace: 'local rows = 2', cases: [{ with: 'local rows = 3', lines: ['####', '####', '####'] }], message: 'Your grid does not use `rows` correctly yet.' },
          ],
          hints: ['In the outer loop, make an empty text: `local line = ""`', 'In the inner loop: `line ..= "#"`. Print `line` after the inner loop.'],
          solution: 'local rows = 2\nlocal cols = 4\nfor row = 1, rows do\n    local line = ""\n    for col = 1, cols do\n        line ..= "#"\n    end\n    print(line)\nend',
          concepts: ['loops', 'concatenation'],
          success: 'This is also how you will build real grids of Parts in Roblox.',
        },
      ],
      summary: ['A nested loop runs completely for every round of the outer loop.', 'Total number of rounds = outer × inner.', 'Use clear, different counter names.'],
    },

    // ------------------------------------------------------------------ 6 project
    {
      id: 'c3-project-countdown',
      courseId: 'course-3',
      title: 'Project: round countdown',
      objective: 'You build the countdown logic for a round in a minigame.',
      minutes: 14,
      prerequisites: ['loops', 'conditions', 'interpolation'],
      concepts: ['loops', 'conditions'],
      steps: [
        {
          type: 'explain',
          body: `In a round-based game you often see: "Round starts in 5... 4... 3...". In Roblox you wait one second between each step with \`task.wait(1)\`.

**Note:** in this app's playground \`task.wait\` does not really wait; the code continues straight away. In Roblox Studio it does wait. The logic is exactly the same.`,
        },
        {
          type: 'exercise',
          id: 'c3-project-ex1',
          mode: 'independent',
          title: 'The countdown',
          prompt: 'Count down from `seconds` to 1. Use `task.wait(1)` in the loop.\n- Every second, print **Round starts in X**\n- But for the last 3 seconds (3, 2, 1) print only the number, like **3**\n- Then print **GO!**',
          starter: 'local seconds = 5\n',
          checks: [
            { kind: 'uses', sequence: ['task', '.', 'wait', '('], message: 'Use `task.wait(1)` in the loop, like in Roblox.' },
            { kind: 'output', lines: ['Round starts in 5', 'Round starts in 4', '3', '2', '1', 'GO!'], message: 'With 5 seconds: "Round starts in X" twice, then 3, 2, 1 and GO!' },
            { kind: 'variants', replace: 'local seconds = 5', cases: [{ with: 'local seconds = 2', lines: ['2', '1', 'GO!'] }, { with: 'local seconds = 4', lines: ['Round starts in 4', '3', '2', '1', 'GO!'] }], message: 'Your countdown is not right for every number of seconds.' },
          ],
          hints: ['for i = seconds, 1, -1 do', 'Inside the loop: if i > 3 then ... else ... end', 'Print GO! after the loop.'],
          solution: 'local seconds = 5\nfor i = seconds, 1, -1 do\n    if i > 3 then\n        print(`Round starts in {i}`)\n    else\n        print(i)\n    end\n    task.wait(1)\nend\nprint("GO!")',
          concepts: ['loops', 'conditions'],
          success: 'Your countdown works for 2, 4 and 5 seconds. In Studio it really waits one second per step.',
        },
        {
          type: 'studio',
          title: 'Try it in Roblox Studio',
          steps: [
            { text: 'Put a **Script** in **ServerScriptService**.' },
            { text: 'Paste or type your countdown code in it.' },
            { text: 'Click **Play** and look at the **Output**: now each line appears one second after the previous one.' },
          ],
          expected: 'You see the countdown second by second in the Output, ending with GO!',
        },
      ],
      summary: ['You combined a counting-down for loop with if/else.', '`task.wait()` makes a script wait in Roblox; in the playground it is simulated.', 'Next course: making your own functions.'],
    },
  ],
};
