import type { Course } from './types';

export const course2: Course = {
  id: 'course-2',
  number: 2,
  title: 'Conditions and logic',
  description: 'Making your code choose: comparisons, if, elseif, else, and, or and not.',
  level: 'Beginner',
  planned: [],
  lessons: [
    // ------------------------------------------------------------------ 1
    {
      id: 'c2-comparisons',
      courseId: 'course-2',
      title: 'Comparing: true or false?',
      objective: 'You can compare two values with ==, ~=, <, >, <= and >=, and know that the result is a boolean.',
      minutes: 8,
      prerequisites: ['booleans', 'variables'],
      concepts: ['comparisons'],
      steps: [
        {
          type: 'explain',
          body: `In a game you ask questions all the time: does the player have enough coins? Is their health gone? Are they on the right team?

You write a question like that as a **comparison**. The answer is always a boolean: \`true\` or \`false\`.

- \`==\` is equal to
- \`~=\` is **not** equal to
- \`<\` less than, \`>\` greater than
- \`<=\` less than or equal to, \`>=\` greater than or equal to`,
        },
        {
          type: 'code',
          code: 'local coins = 120\nprint(coins >= 100)\nprint(coins == 50)\nprint(coins ~= 50)\nprint("red" == "Red")',
          runnable: true,
          annotations: [
            { token: '>=', text: '`>=` asks: is the left side **greater than or equal to** the right side? 120 >= 100 is `true`.' },
            { token: '==', text: '`==` (two equals signs) asks: are these two values **equal**? Careful: one `=` gives a value, two `==` compare.' },
            { token: '~=', text: '`~=` asks: are they **not** equal? In many other languages you write this as `!=`, in Luau as `~=`.' },
          ],
          after: 'The last line is `false`: comparing text is case-sensitive.',
        },
        {
          type: 'quiz',
          id: 'c2-comparisons-q1',
          question: 'What is the difference between `=` and `==`?',
          concepts: ['comparisons'],
          options: [
            { text: '`=` gives a value, `==` compares two values', correct: true, feedback: 'Exactly. `coins = 10` puts 10 in coins; `coins == 10` asks whether coins is 10.' },
            { text: 'There is no difference', feedback: 'There is a big difference: one is an instruction, the other a question.' },
            { text: '`==` is a stronger version of `=`', feedback: 'Not stronger, but different: `==` asks a question and gives back true or false.' },
          ],
        },
        {
          type: 'predict',
          id: 'c2-comparisons-p1',
          question: 'What does this code show?',
          code: 'local level = 10\nprint(level < 10)',
          concepts: ['comparisons'],
          options: [
            { text: 'true', feedback: 'Is 10 less than 10? No, it is exactly equal.' },
            { text: 'false', correct: true, feedback: 'Right. 10 is not less than 10. With `<=` it would be `true`.' },
            { text: '10', feedback: 'A comparison always gives true or false, not a number.' },
          ],
        },
        {
          type: 'exercise',
          id: 'c2-comparisons-ex1',
          mode: 'guided',
          title: 'Is the player strong enough?',
          prompt: 'Create a variable `canEnter` that is `true` when `level` is **at least 5**. Use a comparison; do not type `true` yourself.',
          starter: 'local level = 7\nlocal canEnter = -- your comparison here\nprint(canEnter)',
          checks: [
            { kind: 'value', expr: 'canEnter', type: 'boolean', message: '`canEnter` must be a boolean: the result of a comparison.' },
            { kind: 'output', lines: ['true'], message: 'With level 7, `canEnter` must be `true`.' },
            { kind: 'variants', replace: 'local level = 7', cases: [{ with: 'local level = 5', lines: ['true'] }, { with: 'local level = 4', lines: ['false'] }], message: '`canEnter` is not right for every level. "At least 5" means: 5 counts too.' },
          ],
          hints: ['"At least 5" means greater than or equal to 5.', '`local canEnter = level >= 5`'],
          solution: 'local level = 7\nlocal canEnter = level >= 5\nprint(canEnter)',
          concepts: ['comparisons'],
          success: 'Good. The Academy also tested your code with level 5 and 4: both correct.',
        },
        {
          type: 'exercise',
          id: 'c2-comparisons-ex2',
          mode: 'independent',
          title: 'Same team?',
          prompt: 'There are two variables: `myTeam` and `otherTeam`. Create `isEnemy`: it is `true` when the teams are **not equal**. Print `isEnemy`.',
          starter: 'local myTeam = "Red"\nlocal otherTeam = "Blue"\n',
          checks: [
            { kind: 'value', expr: 'isEnemy', equals: true, message: 'With Red and Blue, `isEnemy` must be `true`.' },
            { kind: 'uses', sequence: ['~='], message: 'Use `~=` (not equal to).' },
            { kind: 'variants', replace: 'local otherTeam = "Blue"', cases: [{ with: 'local otherTeam = "Red"', lines: ['false'] }], message: 'When both teams are Red, `isEnemy` must be `false`.' },
          ],
          hints: ['Which sign means "not equal to" in Luau?'],
          solution: 'local myTeam = "Red"\nlocal otherTeam = "Blue"\nlocal isEnemy = myTeam ~= otherTeam\nprint(isEnemy)',
          concepts: ['comparisons'],
          success: 'Exactly. You will use comparisons like this in every weapon and team system.',
        },
      ],
      summary: ['A comparison gives `true` or `false`.', '`==` equal, `~=` not equal, `<` `>` `<=` `>=` greater/less.', '`=` gives a value, `==` compares.', 'Comparing text is case-sensitive.'],
    },

    // ------------------------------------------------------------------ 2
    {
      id: 'c2-if',
      courseId: 'course-2',
      title: 'If statements',
      objective: 'You can make code run only when a condition is true, with if ... then ... end.',
      minutes: 10,
      prerequisites: ['comparisons'],
      concepts: ['conditions'],
      steps: [
        {
          type: 'explain',
          body: `With an **if statement** code only runs when something is true. You read it like a sentence: "**if** this is true, **then** do this".

The shape is always:
- \`if\` followed by a condition
- \`then\`
- the code that should only run sometimes (indented)
- \`end\` to close the block`,
        },
        {
          type: 'code',
          title: 'Your first if statement',
          code: 'local coins = 120\n\nif coins >= 100 then\n    print("You can buy it!")\nend\n\nprint("Done checking")',
          runnable: true,
          annotations: [
            { token: 'if', text: '`if` starts the question: "if ...".' },
            { token: 'coins >= 100', text: 'The **condition**: a comparison that gives true or false.' },
            { token: 'then', text: '`then` closes the question: "... then". If you forget it, you get an error.' },
            { token: 'end', text: '`end` closes the if block. Everything after it always runs again.' },
          ],
          after: 'Imagine coins is 50: then line 4 is skipped, but "Done checking" always appears.',
        },
        {
          type: 'visual',
          kind: 'condition',
          title: 'Watch Luau decide',
          body: 'Slide the value of `coins` and see when the condition becomes `true` or `false`.',
          code: '',
        },
        {
          type: 'exercise',
          id: 'c2-if-ex1',
          mode: 'guided',
          kind: 'fix-bug',
          title: 'What is missing?',
          prompt: 'This code gives an error. Run it, read the explanation and fix it.',
          starter: 'local health = 0\n\nif health <= 0\n    print("Game over")\nend',
          checks: [
            { kind: 'output', lines: ['Game over'], message: 'The Output must be **Game over**.' },
            { kind: 'variants', replace: 'local health = 0', cases: [{ with: 'local health = 50', lines: [] }], message: 'With health 50 nothing may appear.' },
          ],
          hints: ['Look at line 3. How does an if line always end?'],
          solution: 'local health = 0\n\nif health <= 0 then\n    print("Game over")\nend',
          concepts: ['conditions'],
          success: 'Fixed. A forgotten `then` is the most common if mistake.',
        },
        {
          type: 'exercise',
          id: 'c2-if-ex2',
          mode: 'independent',
          title: 'Level up',
          prompt: 'Write an if statement: if `xp` is **100 or more**, print **Level up!**. Otherwise nothing happens.',
          starter: 'local xp = 130\n',
          checks: [
            { kind: 'uses', sequence: ['if'], message: 'Use an `if` statement.' },
            { kind: 'output', lines: ['Level up!'], message: 'With 130 xp, **Level up!** must appear.' },
            { kind: 'variants', replace: 'local xp = 130', cases: [{ with: 'local xp = 100', lines: ['Level up!'] }, { with: 'local xp = 99', lines: [] }], message: 'Your if statement is not right yet for every value of xp.' },
          ],
          hints: ['The shape: `if condition then` ... `end`', '"100 or more" is written as `xp >= 100`.'],
          solution: 'local xp = 130\nif xp >= 100 then\n    print("Level up!")\nend',
          concepts: ['conditions', 'comparisons'],
          success: 'Works for 130, 100 and 99. This is how every level system works.',
        },
      ],
      summary: ['`if condition then ... end` runs code only when the condition is true.', 'Do not forget `then` and `end`.', 'Indent the code inside the block, so you can see what belongs to it.'],
    },

    // ------------------------------------------------------------------ 3
    {
      id: 'c2-else',
      courseId: 'course-2',
      title: 'else and elseif',
      objective: 'You can choose between several options with else and elseif.',
      minutes: 10,
      prerequisites: ['conditions'],
      concepts: ['conditions'],
      steps: [
        {
          type: 'explain',
          body: `Often you also want to do something when the condition is **not** true. That is what \`else\` ("otherwise") is for.

More than two options? Then you use \`elseif\` ("otherwise if"). Luau checks the conditions **from top to bottom** and only runs the **first** block that is true. Then it skips the rest.

There is only one \`end\`, at the very bottom.`,
        },
        {
          type: 'code',
          code: 'local health = 35\n\nif health > 70 then\n    print("Healthy")\nelseif health > 30 then\n    print("Hurt")\nelse\n    print("Almost dead!")\nend',
          runnable: true,
          after: 'health is 35: the first condition (35 > 70) is false, the second (35 > 30) is true, so you see **Hurt**. The else block is skipped.',
        },
        {
          type: 'predict',
          id: 'c2-else-p1',
          question: 'What does this code show?',
          code: 'local score = 90\nif score > 50 then\n    print("Good")\nelseif score > 80 then\n    print("Great")\nend',
          concepts: ['conditions'],
          options: [
            { text: 'Great', feedback: '90 > 80 is true, but Luau stops at the first block that is true.' },
            { text: 'Good', correct: true, feedback: 'Right. 90 > 50 is already true, so the elseif is not even checked. Order matters!' },
            { text: 'Good Great', feedback: 'Only one block ever runs.' },
          ],
        },
        {
          type: 'exercise',
          id: 'c2-else-ex1',
          mode: 'guided',
          title: 'Buy or not',
          prompt: 'Finish the code: print **Bought!** when `coins` is at least `price`, and otherwise **Not enough coins**.',
          starter: 'local coins = 80\nlocal price = 100\n\nif coins >= price then\n    print("Bought!")\nend',
          checks: [
            { kind: 'uses', sequence: ['else'], message: 'Add an `else` block.' },
            { kind: 'output', lines: ['Not enough coins'], message: 'With 80 coins and price 100, **Not enough coins** must appear.' },
            { kind: 'variants', replace: 'local coins = 80', cases: [{ with: 'local coins = 100', lines: ['Bought!'] }, { with: 'local coins = 500', lines: ['Bought!'] }], message: 'With enough coins, **Bought!** must appear.' },
          ],
          hints: ['`else` comes before the `end`, on its own line.', 'if ... then\n    ...\nelse\n    print("Not enough coins")\nend'],
          solution: 'local coins = 80\nlocal price = 100\n\nif coins >= price then\n    print("Bought!")\nelse\n    print("Not enough coins")\nend',
          concepts: ['conditions'],
          success: 'Good. Every shop in a Roblox game starts with exactly this question.',
        },
        {
          type: 'exercise',
          id: 'c2-else-ex2',
          mode: 'independent',
          title: 'Medals',
          prompt: 'Give a medal based on `time` (seconds for an obby):\n- less than 30 → **Gold**\n- less than 60 → **Silver**\n- otherwise → **Bronze**',
          starter: 'local time = 45\n',
          checks: [
            { kind: 'uses', sequence: ['elseif'], message: 'Use `elseif` for the second option.' },
            { kind: 'output', lines: ['Silver'], message: 'With time 45, **Silver** should appear.' },
            { kind: 'variants', replace: 'local time = 45', cases: [{ with: 'local time = 10', lines: ['Gold'] }, { with: 'local time = 30', lines: ['Silver'] }, { with: 'local time = 60', lines: ['Bronze'] }, { with: 'local time = 200', lines: ['Bronze'] }], message: 'Your medals are not right for every time. Watch the order and "less than".' },
          ],
          hints: ['Start with the strictest condition (Gold) at the top.', '"less than 30" is `time < 30`.'],
          solution: 'local time = 45\nif time < 30 then\n    print("Gold")\nelseif time < 60 then\n    print("Silver")\nelse\n    print("Bronze")\nend',
          concepts: ['conditions'],
          success: 'Tested with 10, 30, 45, 60 and 200 seconds: all correct.',
        },
      ],
      summary: ['`else` runs when no condition is true.', '`elseif` adds extra conditions.', 'Luau only runs the first true block: order matters.', 'One `end` closes the whole if statement.'],
    },

    // ------------------------------------------------------------------ 4
    {
      id: 'c2-logic',
      courseId: 'course-2',
      title: 'and, or and not',
      objective: 'You can combine conditions with and and or, and flip them with not.',
      minutes: 10,
      prerequisites: ['conditions'],
      concepts: ['logic'],
      steps: [
        {
          type: 'explain',
          body: `Sometimes a decision depends on more than one thing:
- \`and\`: **both** sides must be true. "The player has the key **and** is standing at the door."
- \`or\`: **at least one** side must be true. "The player is VIP **or** has paid."
- \`not\`: flips true and false. \`not true\` is \`false\`.`,
        },
        {
          type: 'code',
          code: 'local hasKey = true\nlocal nearDoor = false\nlocal isVip = true\n\nprint(hasKey and nearDoor)\nprint(hasKey or nearDoor)\nprint(not nearDoor)\n\nif hasKey and isVip then\n    print("VIP door opens")\nend',
          runnable: true,
          after: '`true and false` is false, `true or false` is true, `not false` is true.',
        },
        {
          type: 'quiz',
          id: 'c2-logic-q1',
          question: 'A door opens if the player is **level 10 or higher**, **or** has a VIP pass. Which condition is right?',
          concepts: ['logic'],
          options: [
            { text: 'level >= 10 or hasPass', correct: true, feedback: 'Right: one of the two is enough, so `or`.' },
            { text: 'level >= 10 and hasPass', feedback: 'With `and` the player needs both. That is stricter than asked.' },
            { text: 'not level >= 10', feedback: '`not` flips the condition; then the door opens for low levels instead.' },
          ],
        },
        {
          type: 'exercise',
          id: 'c2-logic-ex1',
          mode: 'guided',
          title: 'Can the player attack?',
          prompt: 'A player may only attack when they are **alive** (`health > 0`) **and** **not** in the safe zone. Print **Attack!** if so, and otherwise **Cannot attack**.',
          starter: 'local health = 50\nlocal inSafeZone = false\n',
          checks: [
            { kind: 'uses', sequence: ['and'], message: 'Combine the two conditions with `and`.' },
            { kind: 'uses', sequence: ['not'], message: 'Use `not` for "not in the safe zone".' },
            { kind: 'output', lines: ['Attack!'], message: 'With health 50 and outside the safe zone, **Attack!** must appear.' },
            { kind: 'variants', replace: 'local inSafeZone = false', cases: [{ with: 'local inSafeZone = true', lines: ['Cannot attack'] }], message: 'In the safe zone the player may not attack.' },
            { kind: 'variants', replace: 'local health = 50', cases: [{ with: 'local health = 0', lines: ['Cannot attack'] }], message: 'With health 0 the player may not attack.' },
          ],
          hints: ['The condition has two parts with `and` between them.', '`if health > 0 and not inSafeZone then`'],
          solution: 'local health = 50\nlocal inSafeZone = false\nif health > 0 and not inSafeZone then\n    print("Attack!")\nelse\n    print("Cannot attack")\nend',
          concepts: ['logic', 'conditions'],
          success: 'Tested in the safe zone, outside it and with 0 health: all correct.',
        },
        {
          type: 'exercise',
          id: 'c2-logic-ex2',
          mode: 'independent',
          title: 'Weekend bonus',
          prompt: 'Players get double coins when it `isWeekend` **or** when they are `isVip`. Print **Double coins** or **Normal coins**.',
          starter: 'local isWeekend = false\nlocal isVip = true\n',
          checks: [
            { kind: 'uses', sequence: ['or'], message: 'Use `or`: one of the two is enough.' },
            { kind: 'output', lines: ['Double coins'], message: 'A VIP always gets **Double coins**.' },
            { kind: 'variants', replace: 'local isVip = true', cases: [{ with: 'local isVip = false', lines: ['Normal coins'] }], message: 'No weekend and no VIP: then **Normal coins**.' },
          ],
          hints: ['if isWeekend or isVip then ...'],
          solution: 'local isWeekend = false\nlocal isVip = true\nif isWeekend or isVip then\n    print("Double coins")\nelse\n    print("Normal coins")\nend',
          concepts: ['logic'],
          success: 'Exactly. `or` is perfect for bonuses with several conditions.',
        },
      ],
      summary: ['`and`: both sides true.', '`or`: at least one side true.', '`not`: flips true and false.', 'You can use booleans directly as a condition: `if isVip then`.'],
    },

    // ------------------------------------------------------------------ 5
    {
      id: 'c2-truthy-nested',
      courseId: 'course-2',
      title: 'nil as a condition and nested if statements',
      objective: 'You know which values count as "true" and can put an if statement inside another if statement.',
      minutes: 9,
      prerequisites: ['conditions', 'nil'],
      concepts: ['conditions', 'nil'],
      steps: [
        {
          type: 'explain',
          body: `A condition does not have to be a comparison. Luau only checks: is it **true enough**?

In Luau only \`false\` and \`nil\` count as not true. **All other values count as true**, including \`0\` and empty text \`""\`.

That is handy in Roblox: \`if tool then\` means "if there is a tool (not nil)". You will use that very often to check whether something exists.`,
        },
        {
          type: 'predict',
          id: 'c2-truthy-p1',
          question: 'What does this code show?',
          code: 'local coins = 0\nif coins then\n    print("yes")\nelse\n    print("no")\nend',
          concepts: ['conditions'],
          options: [
            { text: 'no', feedback: 'In many other languages it would, but in Luau 0 is just a value, so "true enough".' },
            { text: 'yes', correct: true, feedback: 'Right. Only `false` and `nil` count as not true. 0 counts as true.' },
          ],
        },
        {
          type: 'explain',
          title: 'Nested if statements',
          body: `You can put an if statement **inside** another if statement. That is called **nesting**.

Indent each level one step further. Every \`if\` gets its own \`end\`.`,
        },
        {
          type: 'code',
          code: 'local hasTicket = true\nlocal age = 9\n\nif hasTicket then\n    if age >= 12 then\n        print("Welcome to the roller coaster")\n    else\n        print("Too young for the roller coaster")\n    end\nelse\n    print("Buy a ticket first")\nend',
          runnable: true,
        },
        {
          type: 'exercise',
          id: 'c2-nested-ex1',
          mode: 'independent',
          title: 'Using a weapon',
          prompt: '`weapon` can contain a name or be `nil`.\n- No weapon (nil)? Print **No weapon**.\n- There is a weapon and `ammo` is greater than 0? Print **Shooting with** followed by the name, for example **Shooting with Blaster**.\n- A weapon but no ammo? Print **Reload**.',
          starter: 'local weapon = "Blaster"\nlocal ammo = 5\n',
          checks: [
            { kind: 'output', lines: ['Shooting with Blaster'], message: 'With a Blaster and 5 ammo, **Shooting with Blaster** should appear.' },
            { kind: 'variants', replace: 'local ammo = 5', cases: [{ with: 'local ammo = 0', lines: ['Reload'] }], message: 'Without ammo, **Reload** must appear.' },
            { kind: 'variants', replace: 'local weapon = "Blaster"', cases: [{ with: 'local weapon = nil', lines: ['No weapon'] }, { with: 'local weapon = "Laser"', lines: ['Shooting with Laser'] }], message: 'Your code does not work yet for every weapon (or no weapon).' },
          ],
          hints: ['First check whether `weapon` exists: `if weapon then`.', 'Put the ammo check inside that first if block.', 'Use `..` or interpolation to show the name of the weapon.'],
          solution: 'local weapon = "Blaster"\nlocal ammo = 5\nif weapon then\n    if ammo > 0 then\n        print("Shooting with " .. weapon)\n    else\n        print("Reload")\n    end\nelse\n    print("No weapon")\nend',
          concepts: ['conditions', 'nil'],
          success: 'Tested with Blaster, Laser, no weapon and no ammo. All good.',
        },
      ],
      summary: ['Only `false` and `nil` count as not true; 0 and "" count as true.', '`if something then` checks whether something exists.', 'You can nest if statements; every if gets its own `end`.'],
    },

    // ------------------------------------------------------------------ 6 project
    {
      id: 'c2-project-shop',
      courseId: 'course-2',
      title: 'Project: the shop check',
      objective: 'You build the decision logic of a Roblox shop all by yourself.',
      minutes: 15,
      prerequisites: ['conditions', 'logic'],
      concepts: ['conditions', 'logic', 'comparisons'],
      steps: [
        {
          type: 'explain',
          body: `A player clicks "Buy" in your shop. Before they get the item, your game has to check three things:
1. Does the player already have the item? Then they cannot buy it again.
2. Is the item VIP-only, and is the player not a VIP? Then it is not allowed.
3. Do they have enough coins?

Later you will learn that this check must always happen on the **server**. You can already write the logic itself now.`,
        },
        {
          type: 'exercise',
          id: 'c2-project-ex1',
          mode: 'independent',
          title: 'The complete check',
          prompt: 'Print exactly one message, and check in this order:\n1. `alreadyOwned` is true → **You already have this**\n2. `vipOnly` is true and `isVip` is false → **VIP only**\n3. `coins` is less than `price` → **Not enough coins**\n4. otherwise → **Bought!** and then on a new line how many coins are left, like **Left: 50**',
          starter: 'local coins = 150\nlocal price = 100\nlocal alreadyOwned = false\nlocal vipOnly = false\nlocal isVip = false\n',
          checks: [
            { kind: 'output', lines: ['Bought!', 'Left: 50'], message: 'With 150 coins, price 100 and no restrictions, **Bought!** and **Left: 50** should appear.' },
            { kind: 'variants', replace: 'local alreadyOwned = false', cases: [{ with: 'local alreadyOwned = true', lines: ['You already have this'] }], message: 'A player who already has the item must see **You already have this**.' },
            { kind: 'variants', replace: 'local vipOnly = false', cases: [{ with: 'local vipOnly = true', lines: ['VIP only'] }], message: 'A VIP item for a non-VIP must give **VIP only**.' },
            { kind: 'variants', replace: 'local isVip = false', cases: [{ with: 'local isVip = true', lines: ['Bought!', 'Left: 50'] }], message: 'A VIP can simply buy.' },
            { kind: 'variants', replace: 'local coins = 150', cases: [{ with: 'local coins = 99', lines: ['Not enough coins'] }, { with: 'local coins = 100', lines: ['Bought!', 'Left: 0'] }], message: 'The coin check is not right for every amount.' },
          ],
          hints: ['Use one if with elseif blocks, in the order of the assignment.', 'For step 2: `elseif vipOnly and not isVip then`', 'For Bought!, first calculate `coins - price`.'],
          solution: 'local coins = 150\nlocal price = 100\nlocal alreadyOwned = false\nlocal vipOnly = false\nlocal isVip = false\n\nif alreadyOwned then\n    print("You already have this")\nelseif vipOnly and not isVip then\n    print("VIP only")\nelseif coins < price then\n    print("Not enough coins")\nelse\n    coins -= price\n    print("Bought!")\n    print(`Left: {coins}`)\nend',
          concepts: ['conditions', 'logic', 'comparisons'],
          success: 'Your shop logic was tested in seven situations and is right everywhere. This is real game code.',
        },
      ],
      summary: ['You combined comparisons, if/elseif/else and and/not.', 'The order of the checks decides which message the player sees.', 'Next course: repeating code with loops.'],
    },
  ],
};
