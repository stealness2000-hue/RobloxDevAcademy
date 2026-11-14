import type { Course } from './types';

export const course5: Course = {
  id: 'course-5',
  number: 5,
  title: 'Tables',
  description: 'Lists and dictionaries: storing inventories, settings and player data.',
  level: 'Beginner',
  planned: [],
  lessons: [
    // ------------------------------------------------------------------ 1
    {
      id: 'c5-arrays',
      courseId: 'course-5',
      title: 'Lists (arrays)',
      objective: 'You can create a list, get an item with an index and ask for the length with #.',
      minutes: 10,
      prerequisites: ['variables'],
      concepts: ['tables'],
      steps: [
        {
          type: 'explain',
          body: `A variable holds one value. But an inventory has lots of items. For that Luau has **tables**: one value that many values fit into.

The simplest table is a **list** (programmers also say **array**). You write the values between **curly braces** \`{ }\`, separated by commas.

Every item has an **index**: its spot in the list. In Luau the first spot is **1** (in many other languages it is 0).`,
        },
        {
          type: 'code',
          code: 'local inventory = {"Sword", "Shield", "Potion"}\n\nprint(inventory[1])\nprint(inventory[3])\nprint(#inventory)\nprint(inventory[4])',
          runnable: true,
          annotations: [
            { token: '{', text: '`{` starts a table; `}` closes it.' },
            { token: '[', text: '`inventory[1]` gets the item in spot 1. The number between the square brackets is the **index**.' },
            { token: '#', text: '`#inventory` gives the number of items in the list: 3.' },
          ],
          after: 'Spot 4 does not exist, so you get `nil`.',
        },
        {
          type: 'explain',
          title: 'Changing an item',
          body: 'With an index you can also replace an item: `inventory[2] = "Iron shield"`. The old item is then gone.',
        },
        {
          type: 'predict',
          id: 'c5-arrays-p1',
          question: 'What does this code show?',
          code: 'local scores = {10, 25, 40}\nscores[1] = 99\nprint(scores[1] + scores[3])',
          concepts: ['tables'],
          options: [
            { text: '50', feedback: 'scores[1] was changed to 99.' },
            { text: '139', correct: true, feedback: 'Right: 99 + 40.' },
            { text: '65', feedback: 'scores[3] is 40, not 25. Index 3 is the third spot.' },
          ],
        },
        {
          type: 'exercise',
          id: 'c5-arrays-ex1',
          mode: 'guided',
          title: 'Your team list',
          prompt: 'Create a list `team` with the names **"Mia"**, **"Sam"** and **"Liv"**. Then print the **second** name and the **number** of names.',
          starter: '',
          checks: [
            { kind: 'test', harness: 'if typeof(team) ~= "table" then return "Create a table `team` with curly braces { }." end\nif #team ~= 3 or team[1] ~= "Mia" or team[2] ~= "Sam" or team[3] ~= "Liv" then return "`team` must contain exactly \\"Mia\\", \\"Sam\\" and \\"Liv\\", in that order." end\nreturn true', message: '' },
            { kind: 'output', lines: ['Sam', '3'], message: 'The Output must be **Sam** first and then **3**.' },
            { kind: 'uses', sequence: ['#', 'team'], message: 'Use `#team` for the number.' },
          ],
          hints: ['local team = {"Mia", "Sam", "Liv"}', 'team[2] is the second name.'],
          solution: 'local team = {"Mia", "Sam", "Liv"}\nprint(team[2])\nprint(#team)',
          concepts: ['tables'],
          success: 'Your first table.',
        },
        {
          type: 'exercise',
          id: 'c5-arrays-ex2',
          mode: 'independent',
          title: 'Last item',
          prompt: 'Print the **last** item of `queue`, without typing the number yourself. It must work however long the list is.',
          starter: 'local queue = {"Player1", "Player2", "Player3", "Player4"}\n',
          checks: [
            { kind: 'output', lines: ['Player4'], message: 'The Output must be the last item: **Player4**.' },
            { kind: 'variants', replace: 'local queue = {"Player1", "Player2", "Player3", "Player4"}', cases: [{ with: 'local queue = {"A", "B"}', lines: ['B'] }], message: 'Your code does not work for a list of a different length. Use `#queue` as the index.' },
          ],
          hints: ['The length of the list is also the index of the last item.', 'queue[#queue]'],
          solution: 'local queue = {"Player1", "Player2", "Player3", "Player4"}\nprint(queue[#queue])',
          concepts: ['tables'],
          success: '`list[#list]` is a pattern you will use a lot.',
        },
      ],
      summary: ['You create a list with `{a, b, c}`.', 'Indexes start at 1: `list[1]` is the first item.', '`#list` is the number of items; an index that does not exist gives `nil`.'],
    },

    // ------------------------------------------------------------------ 2
    {
      id: 'c5-insert-remove',
      courseId: 'course-5',
      title: 'Adding and removing',
      objective: 'You can add items with table.insert and remove them with table.remove.',
      minutes: 9,
      prerequisites: ['tables'],
      concepts: ['tables'],
      steps: [
        {
          type: 'explain',
          body: `In a game an inventory changes all the time: items come in and go out.

- \`table.insert(list, value)\` puts a value at the **end** of the list.
- \`table.insert(list, position, value)\` puts it at a **specific spot**; the rest moves up.
- \`table.remove(list, position)\` takes the item at that spot out and **gives it back**; the rest moves forward.
- \`table.remove(list)\` without a position removes the **last** item.`,
        },
        {
          type: 'code',
          code: 'local backpack = {"Sword"}\ntable.insert(backpack, "Torch")\ntable.insert(backpack, 1, "Map")\nprint(table.concat(backpack, ", "))\n\nlocal removed = table.remove(backpack, 2)\nprint("Thrown away: " .. removed)\nprint(table.concat(backpack, ", "))',
          runnable: true,
          after: '`table.concat(list, ", ")` joins all items together with a comma in between: handy for looking at a list.',
        },
        {
          type: 'exercise',
          id: 'c5-insert-ex1',
          mode: 'guided',
          title: 'Picking up loot',
          prompt: 'Add **"Diamond"** to the end of `loot` and then remove the **first** item. Print the list with `table.concat(loot, ", ")`.',
          starter: 'local loot = {"Stone", "Gold"}\n',
          checks: [
            { kind: 'uses', sequence: ['table', '.', 'insert'], message: 'Use `table.insert`.' },
            { kind: 'uses', sequence: ['table', '.', 'remove'], message: 'Use `table.remove`.' },
            { kind: 'output', lines: ['Gold, Diamond'], message: 'After adding and removing, the list must be **Gold, Diamond**.' },
          ],
          hints: ['table.insert(loot, "Diamond")', 'table.remove(loot, 1)'],
          solution: 'local loot = {"Stone", "Gold"}\ntable.insert(loot, "Diamond")\ntable.remove(loot, 1)\nprint(table.concat(loot, ", "))',
          concepts: ['tables'],
          success: 'This is exactly how an inventory works behind the scenes.',
        },
        {
          type: 'exercise',
          id: 'c5-insert-ex2',
          mode: 'independent',
          title: 'Queue',
          prompt: 'In a minigame, `queue` is waiting for a round. Take the **first** player out of the queue with `table.remove`, store them in `nextPlayer` and print **Your turn:** followed by the name. Then print how many players are still waiting.',
          starter: 'local queue = {"Ava", "Ben", "Cas"}\n',
          checks: [
            { kind: 'value', expr: 'nextPlayer', equals: 'Ava', message: '`nextPlayer` must be the first player: "Ava".' },
            { kind: 'output', lines: ['Your turn: Ava', '2'], message: 'The Output must be **Your turn: Ava** and then **2**.' },
          ],
          hints: ['table.remove gives back the removed item: `local nextPlayer = table.remove(queue, 1)`'],
          solution: 'local queue = {"Ava", "Ben", "Cas"}\nlocal nextPlayer = table.remove(queue, 1)\nprint("Your turn: " .. nextPlayer)\nprint(#queue)',
          concepts: ['tables'],
          success: 'A real queue, like in round-based games.',
        },
      ],
      summary: ['`table.insert(list, value)` adds to the end.', '`table.remove(list, position)` removes and gives back the item.', '`table.concat(list, ", ")` turns a list into one text.'],
    },

    // ------------------------------------------------------------------ 3
    {
      id: 'c5-iterate',
      courseId: 'course-5',
      title: 'Looping through a table',
      objective: 'You can go through every item of a table with a for loop.',
      minutes: 10,
      prerequisites: ['tables', 'loops'],
      concepts: ['tables', 'loops'],
      steps: [
        {
          type: 'explain',
          body: `Want to do something with **every** item in a list? Then you loop through it with a for loop that gets two variables:

\`for index, value in list do\`

- \`index\` is the spot (1, 2, 3, ...)
- \`value\` is the item at that spot

If you do not need the index, write \`_\` (an underscore). That means: I ignore this value.

In older Roblox code you will see \`in ipairs(list)\` or \`in pairs(list)\`. That works too, but in Luau you can also use the table directly.`,
        },
        {
          type: 'code',
          code: 'local items = {"Sword", "Shield", "Potion"}\nfor index, item in items do\n    print(index, item)\nend\n\nlocal prices = {50, 120, 30}\nlocal total = 0\nfor _, price in prices do\n    total += price\nend\nprint("Total: " .. total)',
          runnable: true,
        },
        {
          type: 'exercise',
          id: 'c5-iterate-ex1',
          mode: 'guided',
          title: 'Highest score',
          prompt: 'Use a for loop to find the **highest** score in `scores` and store it in `best`. Print `best`.',
          starter: 'local scores = {40, 95, 12, 77}\nlocal best = 0\n',
          checks: [
            { kind: 'uses', sequence: ['for'], message: 'Loop through the scores with a for loop.' },
            { kind: 'value', expr: 'best', equals: 95, message: '`best` must be 95.' },
            { kind: 'variants', replace: 'local scores = {40, 95, 12, 77}', cases: [{ with: 'local scores = {3, 8, 150}', lines: ['150'] }, { with: 'local scores = {7}', lines: ['7'] }], message: 'Your code does not find the highest score in every list.' },
          ],
          hints: ['Compare each score with `best`: if it is higher, it becomes the new `best`.', 'for _, score in scores do\n    if score > best then\n        best = score\n    end\nend'],
          solution: 'local scores = {40, 95, 12, 77}\nlocal best = 0\nfor _, score in scores do\n    if score > best then\n        best = score\n    end\nend\nprint(best)',
          concepts: ['tables', 'loops'],
          success: 'Tested with three different lists. This is how you make a leaderboard.',
        },
        {
          type: 'exercise',
          id: 'c5-iterate-ex2',
          mode: 'independent',
          title: 'Do I have the key?',
          prompt: 'Search `inventory` for a **"Key"**. Print **Door open** if it is there, and otherwise **Door locked**. Stop searching as soon as you have found it.',
          starter: 'local inventory = {"Torch", "Key", "Bread"}\n',
          checks: [
            { kind: 'output', lines: ['Door open'], message: 'With a Key in the inventory: **Door open**.' },
            { kind: 'variants', replace: 'local inventory = {"Torch", "Key", "Bread"}', cases: [{ with: 'local inventory = {"Torch", "Bread"}', lines: ['Door locked'] }, { with: 'local inventory = {}', lines: ['Door locked'] }, { with: 'local inventory = {"Key", "Key"}', lines: ['Door open'] }], message: 'Your code does not work for every inventory. Print only one message, after searching.' },
          ],
          hints: ['Use a variable `hasKey = false` before the loop.', 'Set it to true when you find the key, and use `break`.', 'Print the message only after the loop.'],
          solution: 'local inventory = {"Torch", "Key", "Bread"}\nlocal hasKey = false\nfor _, item in inventory do\n    if item == "Key" then\n        hasKey = true\n        break\n    end\nend\nif hasKey then\n    print("Door open")\nelse\n    print("Door locked")\nend',
          concepts: ['tables', 'loops', 'conditions'],
          success: 'Tested with four different inventories, including an empty one.',
        },
      ],
      summary: ['`for index, value in list do` goes through every item.', 'Use `_` for a value you do not need.', 'Searching: variable before the loop, `break` when you have found it.'],
    },

    // ------------------------------------------------------------------ 4
    {
      id: 'c5-dictionaries',
      courseId: 'course-5',
      title: 'Dictionaries: keys and values',
      objective: 'You can store data under a name (key) and read, change and remove it.',
      minutes: 11,
      prerequisites: ['tables'],
      concepts: ['dictionaries'],
      steps: [
        {
          type: 'explain',
          body: `A list uses numbers as the index. But sometimes you want to store data under a **name**: a player's health, coins and level.

A table like that is called a **dictionary**. Every **key** has a **value**.

- create: \`{ coins = 100, level = 3 }\`
- read: \`player.coins\` or \`player["coins"]\`
- change or add: \`player.coins = 150\`
- remove: \`player.coins = nil\``,
        },
        {
          type: 'code',
          code: 'local player = {\n    name = "Nova",\n    coins = 100,\n    level = 3,\n}\n\nprint(player.name)\nplayer.coins += 50\nplayer.isVip = true\nprint(player.coins, player.isVip)\nprint(player["level"])',
          runnable: true,
          annotations: [
            { token: 'name', text: '`name` is a **key**; `"Nova"` is the **value** that belongs to it.' },
            { token: '.', text: 'With a dot you read the value of a key: `player.name`.' },
          ],
          after: '`player.isVip = true` adds a new key that was not there before.',
        },
        {
          type: 'code',
          title: 'Looping through a dictionary',
          code: 'local prices = { Sword = 100, Shield = 80 }\nfor itemName, price in prices do\n    print(itemName, price)\nend',
          runnable: true,
          after: 'With a dictionary the loop gives you the key and the value. Careful: the **order** is not guaranteed for dictionaries.',
        },
        {
          type: 'exercise',
          id: 'c5-dict-ex1',
          mode: 'guided',
          title: 'Player profile',
          prompt: 'Create a dictionary `stats` with the keys `health` (**100**), `speed` (**16**) and `team` (**"Red"**). Then lower `health` by 30 and print `stats.health`.',
          starter: '',
          checks: [
            { kind: 'test', harness: 'if typeof(stats) ~= "table" then return "Create a table `stats`." end\nif stats.speed ~= 16 then return "`stats.speed` must be 16." end\nif stats.team ~= "Red" then return "`stats.team` must be \\"Red\\"." end\nif stats.health ~= 70 then return "After lowering it, `stats.health` must be 70." end\nreturn true', message: '' },
            { kind: 'output', lines: ['70'], message: 'The Output must be **70**.' },
          ],
          hints: ['local stats = { health = 100, speed = 16, team = "Red" }', 'stats.health -= 30'],
          solution: 'local stats = { health = 100, speed = 16, team = "Red" }\nstats.health -= 30\nprint(stats.health)',
          concepts: ['dictionaries'],
          success: 'This is how Roblox games store the data of every player.',
        },
        {
          type: 'exercise',
          id: 'c5-dict-ex2',
          mode: 'independent',
          title: 'Looking up a price',
          prompt: '`prices` is a dictionary of item names and prices. Print the price of the item in `wanted`. If the item does not exist (the price is `nil`), print **Item does not exist**.',
          starter: 'local prices = { Sword = 100, Shield = 80, Potion = 15 }\nlocal wanted = "Shield"\n',
          checks: [
            { kind: 'output', lines: ['80'], message: 'The price of a Shield is **80**.' },
            { kind: 'variants', replace: 'local wanted = "Shield"', cases: [{ with: 'local wanted = "Potion"', lines: ['15'] }, { with: 'local wanted = "Dragon"', lines: ['Item does not exist'] }], message: 'Your code does not work for every item. Use `prices[wanted]`.' },
          ],
          hints: ['With a variable as the key you use square brackets: `prices[wanted]`.', 'Store the price and check it with `if price then`.'],
          solution: 'local prices = { Sword = 100, Shield = 80, Potion = 15 }\nlocal wanted = "Shield"\nlocal price = prices[wanted]\nif price then\n    print(price)\nelse\n    print("Item does not exist")\nend',
          concepts: ['dictionaries', 'nil'],
          success: 'You will use `table[variable]` everywhere, for example to look up prices on the server.',
        },
      ],
      summary: ['A dictionary stores values under a key: `{ coins = 100 }`.', 'Read with `t.key`, or with `t[variable]` when the key is in a variable.', 'Setting a key to `nil` removes it.'],
    },

    // ------------------------------------------------------------------ 5
    {
      id: 'c5-nested',
      courseId: 'course-5',
      title: 'Tables inside tables',
      objective: 'You can use nested tables for configuration and lists of objects.',
      minutes: 10,
      prerequisites: ['dictionaries', 'tables'],
      concepts: ['dictionaries', 'tables'],
      steps: [
        {
          type: 'explain',
          body: `A value in a table can itself be a table. That lets you organise complex data neatly.

Two common shapes in Roblox games:
- a **configuration**: all settings of your game in one table
- a **list of objects**: for example a list of items, where each item is a dictionary with a name, price and rarity`,
        },
        {
          type: 'code',
          code: 'local shop = {\n    { name = "Sword", price = 100, rarity = "Rare" },\n    { name = "Torch", price = 10, rarity = "Common" },\n}\n\nprint(shop[1].name)\nprint(shop[2].price)\n\nfor _, item in shop do\n    print(`{item.name} costs {item.price} ({item.rarity})`)\nend',
          runnable: true,
          after: '`shop[1]` is the first item (a dictionary); `.name` gets the name out of it.',
        },
        {
          type: 'predict',
          id: 'c5-nested-p1',
          question: 'What does this code show?',
          code: 'local config = { round = { length = 120, minPlayers = 2 } }\nprint(config.round.minPlayers)',
          concepts: ['dictionaries'],
          options: [
            { text: '120', feedback: 'That is `length`.' },
            { text: '2', correct: true, feedback: 'Right: first `round`, inside it `minPlayers`.' },
            { text: 'nil', feedback: '`minPlayers` is inside `config.round`, and that exists.' },
          ],
        },
        {
          type: 'exercise',
          id: 'c5-nested-ex1',
          mode: 'independent',
          title: 'What can I afford?',
          prompt: 'Loop through the list `shop` and print the **name** of every item the player can afford (price ≤ `coins`).',
          starter: 'local coins = 60\nlocal shop = {\n    { name = "Sword", price = 100 },\n    { name = "Torch", price = 10 },\n    { name = "Bow", price = 60 },\n}\n',
          checks: [
            { kind: 'output', lines: ['Torch', 'Bow'], message: 'With 60 coins the player can buy a **Torch** and a **Bow**.' },
            { kind: 'variants', replace: 'local coins = 60', cases: [{ with: 'local coins = 5', lines: [] }, { with: 'local coins = 1000', lines: ['Sword', 'Torch', 'Bow'] }], message: 'Your code is not right for every number of coins.' },
          ],
          hints: ['for _, item in shop do ... end', 'Inside the loop: if item.price <= coins then print(item.name) end'],
          solution: 'local coins = 60\nlocal shop = {\n    { name = "Sword", price = 100 },\n    { name = "Torch", price = 10 },\n    { name = "Bow", price = 60 },\n}\nfor _, item in shop do\n    if item.price <= coins then\n        print(item.name)\n    end\nend',
          concepts: ['tables', 'dictionaries', 'loops'],
          success: 'Tested with 5, 60 and 1000 coins.',
        },
      ],
      summary: ['A value in a table can also be a table.', 'You read nested values step by step: `config.round.length`.', 'A list of dictionaries is perfect for shops and inventories.'],
    },

    // ------------------------------------------------------------------ 6 project
    {
      id: 'c5-project-inventory',
      courseId: 'course-5',
      title: 'Project: inventory system',
      objective: 'You build a working inventory system with tables and functions.',
      minutes: 18,
      prerequisites: ['dictionaries', 'functions', 'return-values'],
      concepts: ['dictionaries', 'functions', 'tables'],
      steps: [
        {
          type: 'explain',
          body: `You build the core of an inventory like in a real Roblox game. The inventory is a dictionary: the **key** is the item name, the **value** is how many the player has, for example \`{ Apple = 3, Sword = 1 }\`.

You make three functions that together form the system.`,
        },
        {
          type: 'exercise',
          id: 'c5-project-ex1',
          mode: 'independent',
          title: 'Three inventory functions',
          prompt: 'Create these three functions:\n1. `addItem(inventory, name, amount)`: adds `amount` to the item (if it does not exist yet, it starts at 0).\n2. `removeItem(inventory, name, amount)`: takes `amount` away and returns `true`. If the player has too few, change nothing and return `false`. If the count reaches 0, remove the key (set it to `nil`).\n3. `countItems(inventory)`: returns the **total** number of items (all counts added up).',
          starter: 'local function addItem(inventory, name, amount)\n    -- 1\nend\n\nlocal function removeItem(inventory, name, amount)\n    -- 2\nend\n\nlocal function countItems(inventory)\n    -- 3\nend\n\nlocal bag = {}\naddItem(bag, "Apple", 3)\naddItem(bag, "Sword", 1)\naddItem(bag, "Apple", 2)\nprint(countItems(bag))',
          checks: [
            { kind: 'output', lines: ['6'], message: 'After 3 + 1 + 2 items, `countItems(bag)` must be **6**.' },
            { kind: 'test', harness: 'local b = {}\naddItem(b, "Wood", 4)\nif b.Wood ~= 4 then return "addItem(b, \\"Wood\\", 4) on an empty inventory must set Wood to 4." end\naddItem(b, "Wood", 1)\nif b.Wood ~= 5 then return "Adding 1 more Wood must give 5." end\nif removeItem(b, "Wood", 9) ~= false then return "removeItem with too few items must return false." end\nif b.Wood ~= 5 then return "When there are too few, removeItem must not change anything." end\nif removeItem(b, "Wood", 2) ~= true then return "removeItem(b, \\"Wood\\", 2) must return true." end\nif b.Wood ~= 3 then return "After removing 2, 3 Wood must be left." end\nremoveItem(b, "Wood", 3)\nif b.Wood ~= nil then return "When the count reaches 0, the key must be removed (nil)." end\nif removeItem(b, "Gold", 1) ~= false then return "Removing an item that does not exist must return false." end\nif countItems({}) ~= 0 then return "countItems of an empty inventory must be 0." end\nif countItems({ A = 2, B = 5 }) ~= 7 then return "countItems({ A = 2, B = 5 }) must be 7." end\nreturn true', message: '' },
          ],
          hints: [
            'addItem: `inventory[name] = (inventory[name] or 0) + amount`. `x or 0` gives 0 when x is nil.',
            'removeItem: first get `local current = inventory[name] or 0` and compare it with `amount`.',
            'countItems: loop with `for _, count in inventory do` and add up.',
          ],
          solution: 'local function addItem(inventory, name, amount)\n    inventory[name] = (inventory[name] or 0) + amount\nend\n\nlocal function removeItem(inventory, name, amount)\n    local current = inventory[name] or 0\n    if current < amount then\n        return false\n    end\n    current -= amount\n    if current == 0 then\n        inventory[name] = nil\n    else\n        inventory[name] = current\n    end\n    return true\nend\n\nlocal function countItems(inventory)\n    local total = 0\n    for _, count in inventory do\n        total += count\n    end\n    return total\nend\n\nlocal bag = {}\naddItem(bag, "Apple", 3)\naddItem(bag, "Sword", 1)\naddItem(bag, "Apple", 2)\nprint(countItems(bag))',
          concepts: ['dictionaries', 'functions', 'return-values'],
          success: 'Your inventory system passed eleven tests. This is the same logic you will later use with a ModuleScript and DataStores in a real game.',
        },
      ],
      summary: ['You combined dictionaries, functions, return and loops into one system.', '`x or 0` is a handy pattern for values that do not exist yet.', 'You now know all the Luau basics. Next up is the Roblox engine itself.'],
    },
  ],
};
