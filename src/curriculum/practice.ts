import type { PracticeExercise } from './types';

/**
 * Practice bank: extra exercises per concept (used for adaptive practice and review),
 * and challenges (independent, no hints).
 */
export const PRACTICE: PracticeExercise[] = [
  // ---------------------------------------------------------------- print & strings
  {
    id: 'p-print-1', title: 'Three lines', difficulty: 1, kind: 'write', concepts: ['print'], prerequisites: ['print'],
    prompt: 'Show three lines: **Ready**, **Set**, **Go**', starter: '',
    checks: [{ kind: 'output', lines: ['Ready', 'Set', 'Go'], message: 'Three lines: Ready, Set, Go.' }],
    hints: ['One print per line.'], solution: 'print("Ready")\nprint("Set")\nprint("Go")',
    explanation: 'Every print instruction makes one new line in the Output, from top to bottom.',
  },
  {
    id: 'p-strings-1', title: 'Quotes inside text', difficulty: 2, kind: 'write', concepts: ['strings'], prerequisites: ['strings'],
    prompt: "Show exactly this: **She said \"Go!\"** (with the double quotes inside).", starter: '',
    checks: [{ kind: 'output', lines: ['She said "Go!"'], message: 'The Output must be exactly She said "Go!", with quotes.' }],
    hints: ['Put single quotes around your text, then you can use double quotes inside it.'], solution: "print('She said \"Go!\"')",
    explanation: "By wrapping the text in ', you can use \" inside it freely.",
  },
  {
    id: 'p-strings-bug', title: 'Broken greeting', difficulty: 1, kind: 'fix-bug', concepts: ['strings', 'arguments'], prerequisites: ['strings'],
    prompt: 'Fix the code so it shows **Hello player**.', starter: 'print(Hello player")',
    checks: [{ kind: 'output', lines: ['Hello player'], message: 'The Output must be Hello player.' }],
    hints: ['Where does the text start?'], solution: 'print("Hello player")', explanation: 'The text was missing an opening quote.',
  },
  {
    id: 'p-args-1', title: 'Commas', difficulty: 1, kind: 'write', concepts: ['arguments'], prerequisites: ['arguments'],
    prompt: 'Use one print with **two** arguments (text and number) for: **Kills: 3**', starter: '',
    checks: [
      { kind: 'output', lines: ['Kills: 3'], message: 'The Output must be Kills: 3.' },
      { kind: 'uses', sequence: [',', '3'], message: 'Pass the number 3 as a separate argument after a comma.' },
    ],
    hints: ['print("Kills:", ...)'], solution: 'print("Kills:", 3)', explanation: 'print puts a space between arguments.',
  },
  // ---------------------------------------------------------------- variables
  {
    id: 'p-var-1', title: 'Team name', difficulty: 1, kind: 'write', concepts: ['variables'], prerequisites: ['variables'],
    prompt: 'Create a variable `team` with the text **"Red"**, and print it.', starter: '',
    checks: [
      { kind: 'value', expr: 'team', equals: 'Red', message: '`team` must be "Red".' },
      { kind: 'output', lines: ['Red'], message: 'Print the value of team.' },
    ],
    hints: ['local team = ...'], solution: 'local team = "Red"\nprint(team)', explanation: 'A variable stores a value under a name.',
  },
  {
    id: 'p-var-2', title: 'Replacing a value', difficulty: 1, kind: 'write', concepts: ['variables'], prerequisites: ['variables'],
    prompt: 'Create `lives` with value **3**. On the next line give it the new value **2** (without `local`). Print `lives`.', starter: '',
    checks: [
      { kind: 'output', lines: ['2'], message: 'The Output must be 2.' },
      { kind: 'uses', sequence: ['local', 'lives', '=', '3'], message: 'First create lives with value 3.' },
      { kind: 'uses', sequence: ['lives', '=', '2'], message: 'Then give lives the value 2.' },
    ],
    hints: ['The second line starts with the name, not with local.'], solution: 'local lives = 3\nlives = 2\nprint(lives)',
    explanation: 'Without local you change an existing variable.',
  },
  {
    id: 'p-var-bug', title: 'Unknown variable', difficulty: 2, kind: 'fix-bug', concepts: ['variables', 'naming'], prerequisites: ['variables'],
    prompt: 'The Output shows `nil`. Fix it so it shows **Lava**.', starter: 'local obstacle = "Lava"\nprint(obstacel)',
    checks: [{ kind: 'output', lines: ['Lava'], message: 'The Output must be Lava.' }],
    hints: ['Compare the spelling of both names.'], solution: 'local obstacle = "Lava"\nprint(obstacle)',
    explanation: 'A misspelled name is a new, empty (nil) variable.',
  },
  // ---------------------------------------------------------------- numbers
  {
    id: 'p-num-1', title: 'Damage', difficulty: 1, kind: 'write', concepts: ['operators'], prerequisites: ['operators'],
    prompt: 'Create `health` = **100**. Subtract **35** from it with `-=`. Print health.', starter: '',
    checks: [
      { kind: 'output', lines: ['65'], message: 'The Output must be 65.' },
      { kind: 'uses', sequence: ['-='], message: 'Use -=.' },
    ],
    hints: ['health -= 35'], solution: 'local health = 100\nhealth -= 35\nprint(health)', explanation: '`-=` subtracts from the current value.',
  },
  {
    id: 'p-num-2', title: 'Order of operations', difficulty: 2, kind: 'write', concepts: ['operators'], prerequisites: ['operators'],
    prompt: 'Put brackets in the calculation so the Output becomes **20**.', starter: 'print(2 + 3 * 4)',
    checks: [{ kind: 'output', lines: ['20'], message: 'The result must be 20.' }, { kind: 'uses', sequence: ['('], message: 'Use brackets.' }],
    hints: ['Which part has to go first?'], solution: 'print((2 + 3) * 4)', explanation: 'Brackets go before * and /.',
  },
  {
    id: 'p-num-3', title: 'Average', difficulty: 2, kind: 'write', concepts: ['operators', 'variables'], prerequisites: ['operators'],
    prompt: 'Create `a` = 8, `b` = 12 and `average` = the average of a and b.', starter: '',
    checks: [{ kind: 'value', expr: 'average', equals: 10, message: '`average` must be 10.' }, { kind: 'uses', sequence: ['/'], message: 'Divide by 2 with /.' }],
    hints: ['First add, then divide. Remember brackets.'], solution: 'local a = 8\nlocal b = 12\nlocal average = (a + b) / 2',
    explanation: 'Without brackets, b would be divided by 2 first.',
  },
  // ---------------------------------------------------------------- concat / interpolation
  {
    id: 'p-concat-1', title: 'Leaderboard line', difficulty: 2, kind: 'write', concepts: ['concatenation'], prerequisites: ['concatenation'],
    prompt: 'Create `rank` = 1 and `name` = "Zara". Print with `..`: **#1 Zara**', starter: '',
    checks: [{ kind: 'output', lines: ['#1 Zara'], message: 'The Output must be #1 Zara.' }, { kind: 'uses', sequence: ['..'], message: 'Use ..' }],
    hints: ['"#" .. rank .. " " .. name'], solution: 'local rank = 1\nlocal name = "Zara"\nprint("#" .. rank .. " " .. name)',
    explanation: 'You have to add spaces yourself with ..',
  },
  {
    id: 'p-interp-1', title: 'Timer text', difficulty: 1, kind: 'write', concepts: ['interpolation'], prerequisites: ['interpolation'],
    prompt: 'Create `seconds` = 30 and print with backticks: **30 seconds left**', starter: '',
    checks: [{ kind: 'output', lines: ['30 seconds left'], message: 'The Output must be 30 seconds left.' }, { kind: 'stringLiteral', contains: '{seconds}', message: 'Use {seconds} in backticks.' }],
    hints: ['print(`{seconds} seconds left`)'], solution: 'local seconds = 30\nprint(`{seconds} seconds left`)',
    explanation: 'Interpolation puts the value straight into the text.',
  },
  // ---------------------------------------------------------------- booleans / typeof
  {
    id: 'p-bool-1', title: 'Door closed', difficulty: 1, kind: 'write', concepts: ['booleans'], prerequisites: ['booleans'],
    prompt: 'Create `doorOpen` with the value **false** and `hasKey` with **true**.', starter: '',
    checks: [{ kind: 'value', expr: 'doorOpen', equals: false, message: 'doorOpen must be false.' }, { kind: 'value', expr: 'hasKey', equals: true, message: 'hasKey must be true.' }],
    hints: ['Without quotes.'], solution: 'local doorOpen = false\nlocal hasKey = true', explanation: 'Booleans are true or false, without quotes.',
  },
  {
    id: 'p-typeof-1', title: 'Which type?', difficulty: 1, kind: 'predict', concepts: ['typeof'], prerequisites: ['typeof'],
    prompt: 'What does this code show?', starter: 'local x = "10"\nprint(typeof(x))', checks: [], hints: [], solution: '',
    explanation: '"10" is between quotes, so it is a string.',
    options: [{ text: 'number', feedback: 'Look at the quotes.' }, { text: 'string', correct: true, feedback: 'Right.' }, { text: '10', feedback: 'typeof gives the type, not the value.' }],
  },
  // ---------------------------------------------------------------- challenges (independent, no hints)
  {
    id: 'ch-shop-total', title: 'Shopping cart', difficulty: 2, kind: 'write', concepts: ['variables', 'operators', 'interpolation'], prerequisites: ['interpolation'], challenge: true,
    prompt: 'A player buys **3 swords at 120** and **2 shields at 80** coins. Create a variable `total` with the total price and print **Total: 520 coins** with interpolation.',
    starter: '',
    checks: [
      { kind: 'value', expr: 'total', equals: 520, message: '`total` is not right yet.' },
      { kind: 'output', lines: ['Total: 520 coins'], message: 'The Output must be Total: 520 coins.' },
      { kind: 'notUses', sequence: ['=', '520'], message: 'Let Luau calculate the total price.' },
    ],
    hints: [], solution: 'local total = 3 * 120 + 2 * 80\nprint(`Total: {total} coins`)', explanation: '* goes before +, so 3*120 + 2*80 = 520.',
  },
  {
    id: 'ch-fix-three', title: 'Three bugs', difficulty: 3, kind: 'fix-bug', concepts: ['strings', 'naming', 'concatenation'], prerequisites: ['concatenation'], challenge: true,
    prompt: 'This code contains three mistakes. Fix them all. The Output must be: **Checkpoint 4 reached by Mia**',
    starter: 'local checkpoint = 4\nlocal player = "Mia\nprint("Checkpoint " + checkpoint .. " reached by " .. Player)',
    checks: [{ kind: 'output', lines: ['Checkpoint 4 reached by Mia'], message: 'The Output must be Checkpoint 4 reached by Mia.' }],
    hints: [], solution: 'local checkpoint = 4\nlocal player = "Mia"\nprint("Checkpoint " .. checkpoint .. " reached by " .. player)',
    explanation: 'Mistake 1: unfinished string. Mistake 2: + instead of ... Mistake 3: Player with a capital letter.',
  },
  {
    id: 'ch-seconds', title: 'Minutes and seconds', difficulty: 3, kind: 'write', concepts: ['operators', 'interpolation'], prerequisites: ['operators'], challenge: true,
    prompt: 'Create `totalSeconds` = **135**. Calculate `minutes` and `seconds` (with `//` for whole-number division and `%`) and print **2:15**.',
    starter: '',
    checks: [
      { kind: 'value', expr: 'minutes', equals: 2, message: '`minutes` is not right yet.' },
      { kind: 'value', expr: 'seconds', equals: 15, message: '`seconds` is not right yet.' },
      { kind: 'output', lines: ['2:15'], message: 'The Output must be 2:15.' },
    ],
    hints: [], solution: 'local totalSeconds = 135\nlocal minutes = totalSeconds // 60\nlocal seconds = totalSeconds % 60\nprint(`{minutes}:{seconds}`)',
    explanation: '`//` divides and rounds down; `%` gives the remainder. That is how you make a timer display.',
  },
  // ---------------------------------------------------------------- conditions
  {
    id: 'p-if-1', title: 'Negative number', difficulty: 1, kind: 'write', concepts: ['conditions', 'comparisons'], prerequisites: ['conditions'],
    prompt: 'Print **Negative** if `n` is less than 0, and otherwise **Not negative**.', starter: 'local n = -4\n',
    checks: [
      { kind: 'output', lines: ['Negative'], message: 'With -4, **Negative** should appear.' },
      { kind: 'variants', replace: 'local n = -4', cases: [{ with: 'local n = 0', lines: ['Not negative'] }, { with: 'local n = 7', lines: ['Not negative'] }], message: 'Your code is not right for 0 or positive numbers.' },
    ],
    hints: ['if n < 0 then ... else ... end'], solution: 'local n = -4\nif n < 0 then\n    print("Negative")\nelse\n    print("Not negative")\nend',
    explanation: '0 is not negative: that is why it is `n < 0` and not `n <= 0`.',
  },
  {
    id: 'p-if-bug', title: 'One = too few', difficulty: 1, kind: 'fix-bug', concepts: ['conditions', 'comparisons'], prerequisites: ['conditions'],
    prompt: 'Fix the comparison. The Output must be **Red team wins**.', starter: 'local winner = "Red"\nif winner = "Red" then\n    print("Red team wins")\nend',
    checks: [{ kind: 'output', lines: ['Red team wins'], message: 'The Output must be Red team wins.' }],
    hints: ['You compare with two equals signs.'], solution: 'local winner = "Red"\nif winner == "Red" then\n    print("Red team wins")\nend',
    explanation: '`=` gives a value; in a condition you compare with `==`.',
  },
  {
    id: 'p-logic-1', title: 'Teleport allowed?', difficulty: 2, kind: 'write', concepts: ['logic'], prerequisites: ['logic'],
    prompt: 'Teleporting is allowed when the player is **not** `inCombat` **and** `level` is at least 5. Print **Teleport** or **Not now**.', starter: 'local inCombat = false\nlocal level = 8\n',
    checks: [
      { kind: 'output', lines: ['Teleport'], message: 'Out of combat and level 8: **Teleport**.' },
      { kind: 'variants', replace: 'local inCombat = false', cases: [{ with: 'local inCombat = true', lines: ['Not now'] }], message: 'During combat it is not allowed.' },
      { kind: 'variants', replace: 'local level = 8', cases: [{ with: 'local level = 4', lines: ['Not now'] }, { with: 'local level = 5', lines: ['Teleport'] }], message: 'The level check is not right.' },
    ],
    hints: ['if not inCombat and level >= 5 then'], solution: 'local inCombat = false\nlocal level = 8\nif not inCombat and level >= 5 then\n    print("Teleport")\nelse\n    print("Not now")\nend',
    explanation: '`not` works on the value right after it; `and` combines both conditions.',
  },
  // ---------------------------------------------------------------- loops
  {
    id: 'p-loop-1', title: 'Even numbers', difficulty: 1, kind: 'write', concepts: ['loops'], prerequisites: ['loops'],
    prompt: 'Print the numbers 2, 4, 6, 8, 10 with **one** for loop and a step size.', starter: '',
    checks: [
      { kind: 'output', lines: ['2', '4', '6', '8', '10'], message: 'The Output must be 2, 4, 6, 8, 10.' },
      { kind: 'uses', sequence: [',', '2', 'do'], message: 'Use 2 as the step size: `for i = 2, 10, 2 do`.' },
    ],
    hints: ['for i = 2, 10, 2 do'], solution: 'for i = 2, 10, 2 do\n    print(i)\nend', explanation: 'The third number of a for loop is the step.',
  },
  {
    id: 'p-loop-sum', title: 'Sum up to n', difficulty: 2, kind: 'write', concepts: ['loops', 'operators'], prerequisites: ['loops'],
    prompt: 'Calculate the sum 1 + 2 + ... + `n` in `sum` and print it.', starter: 'local n = 10\n',
    checks: [
      { kind: 'value', expr: 'sum', equals: 55, message: 'With n = 10, `sum` must be 55.' },
      { kind: 'variants', replace: 'local n = 10', cases: [{ with: 'local n = 1', lines: ['1'] }, { with: 'local n = 100', lines: ['5050'] }], message: 'Your sum is not right for every n.' },
    ],
    hints: ['local sum = 0 before the loop, sum += i inside it.'], solution: 'local n = 10\nlocal sum = 0\nfor i = 1, n do\n    sum += i\nend\nprint(sum)',
    explanation: 'Keeping a total: start at 0 and add something every round.',
  },
  {
    id: 'p-while-bug', title: 'Stuck loop', difficulty: 2, kind: 'fix-bug', concepts: ['while-loops'], prerequisites: ['while-loops'],
    prompt: 'This loop never stops. Fix it so the Output is **Done after 4 steps**.', starter: 'local energy = 100\nlocal steps = 0\nwhile energy > 0 do\n    steps += 1\nend\nprint(`Done after {steps} steps`)',
    checks: [{ kind: 'output', lines: ['Done after 4 steps'], message: 'The Output must be Done after 4 steps.' }],
    hints: ['What has to happen to energy? 100 / 4 = 25.'], solution: 'local energy = 100\nlocal steps = 0\nwhile energy > 0 do\n    energy -= 25\n    steps += 1\nend\nprint(`Done after {steps} steps`)',
    explanation: 'In a while loop the condition must become false at some point.',
  },
  {
    id: 'p-loop-predict', title: 'Where does the loop start?', difficulty: 1, kind: 'predict', concepts: ['loops'], prerequisites: ['loops'],
    prompt: 'What is the first line this code shows?', starter: 'for i = 10, 1, -3 do\n    print(i)\nend', checks: [], hints: [], solution: '',
    explanation: 'The loop starts at the start value: 10, then 7, 4 and 1.',
    options: [{ text: '10', correct: true, feedback: 'Right.' }, { text: '1', feedback: 'With a negative step the loop starts at the biggest number.' }, { text: '7', feedback: 'The first round uses the start value itself.' }],
  },
  // ---------------------------------------------------------------- functions
  {
    id: 'p-func-1', title: 'Square', difficulty: 1, kind: 'write', concepts: ['functions', 'return-values'], prerequisites: ['return-values'],
    prompt: 'Create `square(n)` that returns n × n.', starter: '',
    checks: [{ kind: 'test', harness: 'if square(3) ~= 9 then return "square(3) must be 9." end\nif square(0) ~= 0 then return "square(0) must be 0." end\nif square(-4) ~= 16 then return "square(-4) must be 16." end\nreturn true', message: '' }],
    hints: ['local function square(n)\n    return n * n\nend'], solution: 'local function square(n)\n    return n * n\nend', explanation: 'return gives the answer back to the caller.',
  },
  {
    id: 'p-func-bug', title: 'No answer', difficulty: 2, kind: 'fix-bug', concepts: ['return-values'], prerequisites: ['return-values'],
    prompt: 'The Output is `nil` instead of **30**. Fix the function.', starter: 'local function addBonus(coins)\n    local result = coins + 10\nend\nprint(addBonus(20))',
    checks: [{ kind: 'output', lines: ['30'], message: 'The Output must be 30.' }],
    hints: ['The function calculates it, but gives nothing back.'], solution: 'local function addBonus(coins)\n    local result = coins + 10\n    return result\nend\nprint(addBonus(20))',
    explanation: 'Without `return` a function gives back `nil`.',
  },
  {
    id: 'p-func-clamp', title: 'Clamping', difficulty: 2, kind: 'write', concepts: ['functions', 'conditions'], prerequisites: ['return-values', 'conditions'],
    prompt: 'Create `clamp(value, min, max)` that returns `value`, but never lower than `min` and never higher than `max`. Handy for health between 0 and 100.', starter: '',
    checks: [{ kind: 'test', harness: 'local c = { {50, 0, 100, 50}, {-5, 0, 100, 0}, {130, 0, 100, 100}, {0, 0, 100, 0} }\nfor _, t in c do\n    if clamp(t[1], t[2], t[3]) ~= t[4] then return `clamp({t[1]}, {t[2]}, {t[3]}) must be {t[4]}.` end\nend\nreturn true', message: '' }],
    hints: ['Two if statements: too low, too high.'], solution: 'local function clamp(value, min, max)\n    if value < min then\n        return min\n    elseif value > max then\n        return max\n    end\n    return value\nend',
    explanation: 'Luau also has `math.clamp(value, min, max)` built in.',
  },
  // ---------------------------------------------------------------- tables
  {
    id: 'p-table-1', title: 'Average score', difficulty: 2, kind: 'write', concepts: ['tables', 'loops'], prerequisites: ['tables'],
    prompt: 'Calculate the average of `scores` in `average`. Use `#scores`.', starter: 'local scores = {10, 20, 60}\n',
    checks: [
      { kind: 'value', expr: 'average', equals: 30, message: '`average` must be 30.' },
      { kind: 'uses', sequence: ['#', 'scores'], message: 'Divide by `#scores`.' },
    ],
    hints: ['First add everything up in a loop, then divide by #scores.'], solution: 'local scores = {10, 20, 60}\nlocal total = 0\nfor _, s in scores do\n    total += s\nend\nlocal average = total / #scores',
    explanation: 'Sum divided by the count.',
  },
  {
    id: 'p-dict-1', title: 'Level up', difficulty: 1, kind: 'write', concepts: ['dictionaries'], prerequisites: ['dictionaries'],
    prompt: 'Raise `player.level` by 1 and set `player.xp` to 0. Then print `player.level`.', starter: 'local player = { name = "Nova", level = 4, xp = 120 }\n',
    checks: [
      { kind: 'output', lines: ['5'], message: 'The Output must be 5.' },
      { kind: 'test', harness: 'return player.xp == 0 or "player.xp must be 0."', message: '' },
    ],
    hints: ['player.level += 1'], solution: 'local player = { name = "Nova", level = 4, xp = 120 }\nplayer.level += 1\nplayer.xp = 0\nprint(player.level)',
    explanation: 'With the dot you change one field of a dictionary.',
  },
  {
    id: 'p-dict-bug', title: 'Wrong key', difficulty: 2, kind: 'fix-bug', concepts: ['dictionaries'], prerequisites: ['dictionaries'],
    prompt: 'The code gives an error. Fix it so it shows **Price: 80**.', starter: 'local prices = { Shield = 80 }\nlocal item = "Shield"\nprint("Price: " .. prices.item)',
    checks: [{ kind: 'output', lines: ['Price: 80'], message: 'The Output must be Price: 80.' }],
    hints: ['prices.item looks for a key literally called "item". Use square brackets.'], solution: 'local prices = { Shield = 80 }\nlocal item = "Shield"\nprint("Price: " .. prices[item])',
    explanation: '`t.item` means `t["item"]`. With a variable as the key you write `t[item]`.',
  },
  // ---------------------------------------------------------------- challenges for courses 2-5
  {
    id: 'ch-fizz', title: 'Coin rhythm', difficulty: 3, kind: 'write', concepts: ['loops', 'conditions'], prerequisites: ['loops', 'conditions'], challenge: true,
    prompt: 'Loop from 1 up to `n`. For each number print:\n- **Coin** if it is divisible by 3\n- **Gem** if it is divisible by 5\n- **Jackpot** if it is divisible by 3 **and** 5\n- otherwise the number itself.',
    starter: 'local n = 15\n',
    checks: [
      { kind: 'output', lines: ['1', '2', 'Coin', '4', 'Gem', 'Coin', '7', '8', 'Coin', 'Gem', '11', 'Coin', '13', '14', 'Jackpot'], message: 'The output for n = 15 is not right yet.' },
      { kind: 'variants', replace: 'local n = 15', cases: [{ with: 'local n = 5', lines: ['1', '2', 'Coin', '4', 'Gem'] }], message: 'Your code does not work for other values of n.' },
    ],
    hints: [], solution: 'local n = 15\nfor i = 1, n do\n    if i % 15 == 0 then\n        print("Jackpot")\n    elseif i % 3 == 0 then\n        print("Coin")\n    elseif i % 5 == 0 then\n        print("Gem")\n    else\n        print(i)\n    end\nend',
    explanation: 'Check the strictest condition (divisible by 3 and 5) first.',
  },
  {
    id: 'ch-leaderboard', title: 'Leaderboard', difficulty: 3, kind: 'write', concepts: ['tables', 'dictionaries', 'functions'], prerequisites: ['dictionaries', 'return-values'], challenge: true,
    prompt: 'Create `getWinner(players)`: `players` is a list of dictionaries with `name` and `score`. Return the **name** of the player with the highest score. If the list is empty, return `nil`.',
    starter: '',
    checks: [{ kind: 'test', harness: 'if getWinner({ { name = "A", score = 5 }, { name = "B", score = 9 }, { name = "C", score = 2 } }) ~= "B" then return "With scores 5, 9, 2, B must win." end\nif getWinner({ { name = "Solo", score = 0 } }) ~= "Solo" then return "With one player, that player wins, even with score 0." end\nif getWinner({}) ~= nil then return "An empty list must return nil." end\nreturn true', message: '' }],
    hints: [], solution: 'local function getWinner(players)\n    local best = nil\n    for _, p in players do\n        if best == nil or p.score > best.score then\n            best = p\n        end\n    end\n    if best then\n        return best.name\n    end\n    return nil\nend',
    explanation: 'Start with `nil` as the best, so a score of 0 can also win.',
  },
  {
    id: 'ch-inventory-merge', title: 'Merging inventories', difficulty: 3, kind: 'write', concepts: ['dictionaries', 'functions', 'loops'], prerequisites: ['dictionaries', 'return-values'], challenge: true,
    prompt: 'Create `merge(a, b)` that returns a **new** inventory with the counts of `a` and `b` added up. `a` and `b` themselves must not change.',
    starter: '',
    checks: [{ kind: 'test', harness: 'local a = { Wood = 3, Stone = 1 }\nlocal b = { Wood = 2, Gold = 5 }\nlocal m = merge(a, b)\nif m.Wood ~= 5 or m.Stone ~= 1 or m.Gold ~= 5 then return "merge must give Wood = 5, Stone = 1 and Gold = 5." end\nif a.Wood ~= 3 or a.Gold ~= nil or b.Wood ~= 2 then return "a and b themselves must not change: make a new table." end\nreturn true', message: '' }],
    hints: [], solution: 'local function merge(a, b)\n    local result = {}\n    for name, count in a do\n        result[name] = (result[name] or 0) + count\n    end\n    for name, count in b do\n        result[name] = (result[name] or 0) + count\n    end\n    return result\nend',
    explanation: 'Making a new table stops you from accidentally changing the original data.',
  },
];
