import type { Course } from '../types';

export const course5: Course = {
  id: 'course-5',
  number: 5,
  title: 'Tabellen',
  description: 'Lijsten en woordenboeken: inventarissen, instellingen en spelersgegevens bewaren.',
  level: 'Beginner',
  planned: [],
  lessons: [
    // ------------------------------------------------------------------ 1
    {
      id: 'c5-arrays',
      courseId: 'course-5',
      title: 'Lijsten (arrays)',
      objective: 'Je kunt een lijst maken, een item ophalen met een index en de lengte opvragen met #.',
      minutes: 10,
      prerequisites: ['variables'],
      concepts: ['tables'],
      steps: [
        {
          type: 'explain',
          body: `Een variabele bewaart één waarde. Maar een inventaris heeft veel items. Daarvoor heeft Luau **tabellen**: één waarde waar veel waarden in passen.

De eenvoudigste tabel is een **lijst** (programmeurs zeggen ook **array**). Je schrijft de waarden tussen **accolades** \`{ }\`, gescheiden door komma's.

Elk item heeft een **index**: zijn plek in de lijst. In Luau begint de eerste plek bij **1** (in veel andere talen bij 0).`,
        },
        {
          type: 'code',
          code: 'local inventory = {"Zwaard", "Schild", "Drank"}\n\nprint(inventory[1])\nprint(inventory[3])\nprint(#inventory)\nprint(inventory[4])',
          runnable: true,
          annotations: [
            { token: '{', text: '`{` begint een tabel; `}` sluit hem af.' },
            { token: '[', text: '`inventory[1]` haalt het item op plek 1 op. Het getal tussen de blokhaken is de **index**.' },
            { token: '#', text: '`#inventory` geeft het aantal items in de lijst: 3.' },
          ],
          after: 'Plek 4 bestaat niet, dus je krijgt `nil`.',
        },
        {
          type: 'explain',
          title: 'Een item veranderen',
          body: 'Met een index kun je ook een item vervangen: `inventory[2] = "IJzeren schild"`. Het oude item is dan weg.',
        },
        {
          type: 'predict',
          id: 'c5-arrays-p1',
          question: 'Wat laat deze code zien?',
          code: 'local scores = {10, 25, 40}\nscores[1] = 99\nprint(scores[1] + scores[3])',
          concepts: ['tables'],
          options: [
            { text: '50', feedback: 'scores[1] is veranderd in 99.' },
            { text: '139', correct: true, feedback: 'Juist: 99 + 40.' },
            { text: '65', feedback: 'scores[3] is 40, niet 25. Index 3 is de derde plek.' },
          ],
        },
        {
          type: 'exercise',
          id: 'c5-arrays-ex1',
          mode: 'guided',
          title: 'Je teamlijst',
          prompt: 'Maak een lijst `team` met de namen **"Mia"**, **"Sam"** en **"Liv"**. Print daarna de **tweede** naam en het **aantal** namen.',
          starter: '',
          checks: [
            { kind: 'test', harness: 'if typeof(team) ~= "table" then return "Maak een tabel `team` met accolades { }." end\nif #team ~= 3 or team[1] ~= "Mia" or team[2] ~= "Sam" or team[3] ~= "Liv" then return "`team` moet precies \\"Mia\\", \\"Sam\\" en \\"Liv\\" bevatten, in die volgorde." end\nreturn true', message: '' },
            { kind: 'output', lines: ['Sam', '3'], message: 'De Output moet eerst **Sam** en dan **3** zijn.' },
            { kind: 'uses', sequence: ['#', 'team'], message: 'Gebruik `#team` voor het aantal.' },
          ],
          hints: ['local team = {"Mia", "Sam", "Liv"}', 'team[2] is de tweede naam.'],
          solution: 'local team = {"Mia", "Sam", "Liv"}\nprint(team[2])\nprint(#team)',
          concepts: ['tables'],
          success: 'Je eerste tabel.',
        },
        {
          type: 'exercise',
          id: 'c5-arrays-ex2',
          mode: 'independent',
          title: 'Laatste item',
          prompt: 'Print het **laatste** item van `queue`, zonder het nummer zelf in te typen. Het moet werken hoe lang de lijst ook is.',
          starter: 'local queue = {"Speler1", "Speler2", "Speler3", "Speler4"}\n',
          checks: [
            { kind: 'output', lines: ['Speler4'], message: 'De Output moet het laatste item zijn: **Speler4**.' },
            { kind: 'variants', replace: 'local queue = {"Speler1", "Speler2", "Speler3", "Speler4"}', cases: [{ with: 'local queue = {"A", "B"}', lines: ['B'] }], message: 'Je code werkt niet voor een lijst van een andere lengte. Gebruik `#queue` als index.' },
          ],
          hints: ['De lengte van de lijst is ook de index van het laatste item.', 'queue[#queue]'],
          solution: 'local queue = {"Speler1", "Speler2", "Speler3", "Speler4"}\nprint(queue[#queue])',
          concepts: ['tables'],
          success: '`lijst[#lijst]` is een patroon dat je vaak gaat gebruiken.',
        },
      ],
      summary: ['Een lijst maak je met `{a, b, c}`.', 'Indexen beginnen bij 1: `lijst[1]` is het eerste item.', '`#lijst` is het aantal items; een index die niet bestaat geeft `nil`.'],
    },

    // ------------------------------------------------------------------ 2
    {
      id: 'c5-insert-remove',
      courseId: 'course-5',
      title: 'Toevoegen en verwijderen',
      objective: 'Je kunt items toevoegen met table.insert en verwijderen met table.remove.',
      minutes: 9,
      prerequisites: ['tables'],
      concepts: ['tables'],
      steps: [
        {
          type: 'explain',
          body: `In een game verandert een inventaris steeds: items komen erbij en gaan weg.

- \`table.insert(lijst, waarde)\` zet een waarde **achteraan** de lijst.
- \`table.insert(lijst, plek, waarde)\` zet hem op een **bepaalde plek**; de rest schuift op.
- \`table.remove(lijst, plek)\` haalt het item op die plek weg en **geeft het terug**; de rest schuift naar voren.
- \`table.remove(lijst)\` zonder plek haalt het **laatste** item weg.`,
        },
        {
          type: 'code',
          code: 'local backpack = {"Zwaard"}\ntable.insert(backpack, "Fakkel")\ntable.insert(backpack, 1, "Kaart")\nprint(table.concat(backpack, ", "))\n\nlocal removed = table.remove(backpack, 2)\nprint("Weggegooid: " .. removed)\nprint(table.concat(backpack, ", "))',
          runnable: true,
          after: '`table.concat(lijst, ", ")` plakt alle items aan elkaar met een komma ertussen: handig om een lijst te bekijken.',
        },
        {
          type: 'exercise',
          id: 'c5-insert-ex1',
          mode: 'guided',
          title: 'Loot oppakken',
          prompt: 'Voeg **"Diamant"** achteraan toe aan `loot` en verwijder daarna het **eerste** item. Print de lijst met `table.concat(loot, ", ")`.',
          starter: 'local loot = {"Steen", "Goud"}\n',
          checks: [
            { kind: 'uses', sequence: ['table', '.', 'insert'], message: 'Gebruik `table.insert`.' },
            { kind: 'uses', sequence: ['table', '.', 'remove'], message: 'Gebruik `table.remove`.' },
            { kind: 'output', lines: ['Goud, Diamant'], message: 'Na het toevoegen en verwijderen moet de lijst **Goud, Diamant** zijn.' },
          ],
          hints: ['table.insert(loot, "Diamant")', 'table.remove(loot, 1)'],
          solution: 'local loot = {"Steen", "Goud"}\ntable.insert(loot, "Diamant")\ntable.remove(loot, 1)\nprint(table.concat(loot, ", "))',
          concepts: ['tables'],
          success: 'Precies zo werkt een inventaris achter de schermen.',
        },
        {
          type: 'exercise',
          id: 'c5-insert-ex2',
          mode: 'independent',
          title: 'Wachtrij',
          prompt: 'In een minigame wacht `queue` op een ronde. Haal de **eerste** speler uit de wachtrij met `table.remove`, sla hem op in `nextPlayer` en print **Aan de beurt:** gevolgd door de naam. Print daarna hoeveel spelers er nog wachten.',
          starter: 'local queue = {"Ava", "Ben", "Cas"}\n',
          checks: [
            { kind: 'value', expr: 'nextPlayer', equals: 'Ava', message: '`nextPlayer` moet de eerste speler zijn: "Ava".' },
            { kind: 'output', lines: ['Aan de beurt: Ava', '2'], message: 'De Output moet **Aan de beurt: Ava** en daarna **2** zijn.' },
          ],
          hints: ['table.remove geeft het verwijderde item terug: `local nextPlayer = table.remove(queue, 1)`'],
          solution: 'local queue = {"Ava", "Ben", "Cas"}\nlocal nextPlayer = table.remove(queue, 1)\nprint("Aan de beurt: " .. nextPlayer)\nprint(#queue)',
          concepts: ['tables'],
          success: 'Een echte wachtrij, zoals in ronde-gebaseerde games.',
        },
      ],
      summary: ['`table.insert(lijst, waarde)` voegt achteraan toe.', '`table.remove(lijst, plek)` verwijdert en geeft het item terug.', '`table.concat(lijst, ", ")` maakt van een lijst één tekst.'],
    },

    // ------------------------------------------------------------------ 3
    {
      id: 'c5-iterate',
      courseId: 'course-5',
      title: 'Door een tabel lopen',
      objective: 'Je kunt met een for-lus elk item van een tabel langsgaan.',
      minutes: 10,
      prerequisites: ['tables', 'loops'],
      concepts: ['tables', 'loops'],
      steps: [
        {
          type: 'explain',
          body: `Wil je iets doen met **elk** item in een lijst? Dan loop je erdoorheen met een for-lus die twee variabelen krijgt:

\`for index, value in lijst do\`

- \`index\` is de plek (1, 2, 3, ...)
- \`value\` is het item op die plek

Heb je de index niet nodig, dan schrijf je \`_\` (een liggend streepje). Dat betekent: deze waarde negeer ik.

In oudere Roblox-code zie je \`in ipairs(lijst)\` of \`in pairs(lijst)\`. Dat werkt ook, maar in Luau mag je de tabel ook direct gebruiken.`,
        },
        {
          type: 'code',
          code: 'local items = {"Zwaard", "Schild", "Drank"}\nfor index, item in items do\n    print(index, item)\nend\n\nlocal prices = {50, 120, 30}\nlocal total = 0\nfor _, price in prices do\n    total += price\nend\nprint("Totaal: " .. total)',
          runnable: true,
        },
        {
          type: 'exercise',
          id: 'c5-iterate-ex1',
          mode: 'guided',
          title: 'Hoogste score',
          prompt: 'Zoek met een for-lus de **hoogste** score in `scores` en sla hem op in `best`. Print `best`.',
          starter: 'local scores = {40, 95, 12, 77}\nlocal best = 0\n',
          checks: [
            { kind: 'uses', sequence: ['for'], message: 'Loop met een for-lus door de scores.' },
            { kind: 'value', expr: 'best', equals: 95, message: '`best` moet 95 zijn.' },
            { kind: 'variants', replace: 'local scores = {40, 95, 12, 77}', cases: [{ with: 'local scores = {3, 8, 150}', lines: ['150'] }, { with: 'local scores = {7}', lines: ['7'] }], message: 'Je code vindt niet in elke lijst de hoogste score.' },
          ],
          hints: ['Vergelijk elke score met `best`: is hij hoger, dan wordt hij de nieuwe `best`.', 'for _, score in scores do\n    if score > best then\n        best = score\n    end\nend'],
          solution: 'local scores = {40, 95, 12, 77}\nlocal best = 0\nfor _, score in scores do\n    if score > best then\n        best = score\n    end\nend\nprint(best)',
          concepts: ['tables', 'loops'],
          success: 'Getest met drie verschillende lijsten. Zo maak je een leaderboard.',
        },
        {
          type: 'exercise',
          id: 'c5-iterate-ex2',
          mode: 'independent',
          title: 'Heb ik de sleutel?',
          prompt: 'Zoek in `inventory` of er een **"Sleutel"** in zit. Print **Deur open** als die erin zit, en anders **Deur op slot**. Stop met zoeken zodra je hem gevonden hebt.',
          starter: 'local inventory = {"Fakkel", "Sleutel", "Brood"}\n',
          checks: [
            { kind: 'output', lines: ['Deur open'], message: 'Met een Sleutel in de inventaris: **Deur open**.' },
            { kind: 'variants', replace: 'local inventory = {"Fakkel", "Sleutel", "Brood"}', cases: [{ with: 'local inventory = {"Fakkel", "Brood"}', lines: ['Deur op slot'] }, { with: 'local inventory = {}', lines: ['Deur op slot'] }, { with: 'local inventory = {"Sleutel", "Sleutel"}', lines: ['Deur open'] }], message: 'Je code werkt niet voor elke inventaris. Print maar één bericht, na het zoeken.' },
          ],
          hints: ['Gebruik een variabele `hasKey = false` vóór de lus.', 'Zet hem op true als je de sleutel vindt, en gebruik `break`.', 'Print het bericht pas ná de lus.'],
          solution: 'local inventory = {"Fakkel", "Sleutel", "Brood"}\nlocal hasKey = false\nfor _, item in inventory do\n    if item == "Sleutel" then\n        hasKey = true\n        break\n    end\nend\nif hasKey then\n    print("Deur open")\nelse\n    print("Deur op slot")\nend',
          concepts: ['tables', 'loops', 'conditions'],
          success: 'Getest met vier verschillende inventarissen, ook een lege.',
        },
      ],
      summary: ['`for index, value in lijst do` loopt door elk item.', 'Gebruik `_` voor een waarde die je niet nodig hebt.', 'Zoeken: variabele vóór de lus, `break` als je het gevonden hebt.'],
    },

    // ------------------------------------------------------------------ 4
    {
      id: 'c5-dictionaries',
      courseId: 'course-5',
      title: 'Dictionaries: sleutels en waarden',
      objective: 'Je kunt gegevens opslaan onder een naam (sleutel) en die opvragen, aanpassen en verwijderen.',
      minutes: 11,
      prerequisites: ['tables'],
      concepts: ['dictionaries'],
      steps: [
        {
          type: 'explain',
          body: `Een lijst gebruikt nummers als index. Maar soms wil je gegevens onder een **naam** opslaan: de health, de coins en het level van een speler.

Zo'n tabel heet een **dictionary** (woordenboek). Elke **sleutel** (key) heeft een **waarde** (value).

- maken: \`{ coins = 100, level = 3 }\`
- ophalen: \`player.coins\` of \`player["coins"]\`
- aanpassen of toevoegen: \`player.coins = 150\`
- verwijderen: \`player.coins = nil\``,
        },
        {
          type: 'code',
          code: 'local player = {\n    name = "Nova",\n    coins = 100,\n    level = 3,\n}\n\nprint(player.name)\nplayer.coins += 50\nplayer.isVip = true\nprint(player.coins, player.isVip)\nprint(player["level"])',
          runnable: true,
          annotations: [
            { token: 'name', text: '`name` is een **sleutel**; `"Nova"` is de **waarde** die erbij hoort.' },
            { token: '.', text: 'Met een punt haal je de waarde van een sleutel op: `player.name`.' },
          ],
          after: '`player.isVip = true` voegt een nieuwe sleutel toe die er eerst nog niet was.',
        },
        {
          type: 'code',
          title: 'Door een dictionary lopen',
          code: 'local prices = { Zwaard = 100, Schild = 80 }\nfor itemName, price in prices do\n    print(itemName, price)\nend',
          runnable: true,
          after: 'Bij een dictionary krijg je in de lus de sleutel en de waarde. Let op: de **volgorde** is bij dictionaries niet gegarandeerd.',
        },
        {
          type: 'exercise',
          id: 'c5-dict-ex1',
          mode: 'guided',
          title: 'Spelersprofiel',
          prompt: 'Maak een dictionary `stats` met de sleutels `health` (**100**), `speed` (**16**) en `team` (**"Rood"**). Verlaag daarna `health` met 30 en print `stats.health`.',
          starter: '',
          checks: [
            { kind: 'test', harness: 'if typeof(stats) ~= "table" then return "Maak een tabel `stats`." end\nif stats.speed ~= 16 then return "`stats.speed` moet 16 zijn." end\nif stats.team ~= "Rood" then return "`stats.team` moet \\"Rood\\" zijn." end\nif stats.health ~= 70 then return "Na het verlagen moet `stats.health` 70 zijn." end\nreturn true', message: '' },
            { kind: 'output', lines: ['70'], message: 'De Output moet **70** zijn.' },
          ],
          hints: ['local stats = { health = 100, speed = 16, team = "Rood" }', 'stats.health -= 30'],
          solution: 'local stats = { health = 100, speed = 16, team = "Rood" }\nstats.health -= 30\nprint(stats.health)',
          concepts: ['dictionaries'],
          success: 'Zo bewaren Roblox-games de gegevens van elke speler.',
        },
        {
          type: 'exercise',
          id: 'c5-dict-ex2',
          mode: 'independent',
          title: 'Prijs opzoeken',
          prompt: '`prices` is een dictionary met itemnamen en prijzen. Print de prijs van het item in `wanted`. Bestaat het item niet (de prijs is `nil`), print dan **Item bestaat niet**.',
          starter: 'local prices = { Zwaard = 100, Schild = 80, Drank = 15 }\nlocal wanted = "Schild"\n',
          checks: [
            { kind: 'output', lines: ['80'], message: 'De prijs van een Schild is **80**.' },
            { kind: 'variants', replace: 'local wanted = "Schild"', cases: [{ with: 'local wanted = "Drank"', lines: ['15'] }, { with: 'local wanted = "Draak"', lines: ['Item bestaat niet'] }], message: 'Je code werkt niet voor elk item. Gebruik `prices[wanted]`.' },
          ],
          hints: ['Met een variabele als sleutel gebruik je blokhaken: `prices[wanted]`.', 'Sla de prijs op en controleer met `if price then`.'],
          solution: 'local prices = { Zwaard = 100, Schild = 80, Drank = 15 }\nlocal wanted = "Schild"\nlocal price = prices[wanted]\nif price then\n    print(price)\nelse\n    print("Item bestaat niet")\nend',
          concepts: ['dictionaries', 'nil'],
          success: '`tabel[variabele]` gebruik je straks overal, bijvoorbeeld om op de server prijzen op te zoeken.',
        },
      ],
      summary: ['Een dictionary bewaart waarden onder een sleutel: `{ coins = 100 }`.', 'Ophalen met `t.sleutel`, of met `t[variabele]` als de sleutel in een variabele staat.', 'Een sleutel op `nil` zetten verwijdert hem.'],
    },

    // ------------------------------------------------------------------ 5
    {
      id: 'c5-nested',
      courseId: 'course-5',
      title: 'Tabellen in tabellen',
      objective: 'Je kunt geneste tabellen gebruiken voor configuratie en lijsten van objecten.',
      minutes: 10,
      prerequisites: ['dictionaries', 'tables'],
      concepts: ['dictionaries', 'tables'],
      steps: [
        {
          type: 'explain',
          body: `Een waarde in een tabel mag zelf ook een tabel zijn. Zo kun je complexe gegevens netjes ordenen.

Twee veelgebruikte vormen in Roblox-games:
- een **configuratie**: alle instellingen van je game in één tabel
- een **lijst van objecten**: bijvoorbeeld een lijst items, waarbij elk item een dictionary is met naam, prijs en zeldzaamheid`,
        },
        {
          type: 'code',
          code: 'local shop = {\n    { name = "Zwaard", price = 100, rarity = "Zeldzaam" },\n    { name = "Fakkel", price = 10, rarity = "Gewoon" },\n}\n\nprint(shop[1].name)\nprint(shop[2].price)\n\nfor _, item in shop do\n    print(`{item.name} kost {item.price} ({item.rarity})`)\nend',
          runnable: true,
          after: '`shop[1]` is het eerste item (een dictionary); `.name` haalt de naam daaruit.',
        },
        {
          type: 'predict',
          id: 'c5-nested-p1',
          question: 'Wat laat deze code zien?',
          code: 'local config = { round = { length = 120, minPlayers = 2 } }\nprint(config.round.minPlayers)',
          concepts: ['dictionaries'],
          options: [
            { text: '120', feedback: 'Dat is `length`.' },
            { text: '2', correct: true, feedback: 'Juist: eerst `round`, daarin `minPlayers`.' },
            { text: 'nil', feedback: '`minPlayers` zit in `config.round`, en die bestaat.' },
          ],
        },
        {
          type: 'exercise',
          id: 'c5-nested-ex1',
          mode: 'independent',
          title: 'Wat kan ik betalen?',
          prompt: 'Loop door de lijst `shop` en print de **naam** van elk item dat de speler kan betalen (prijs ≤ `coins`).',
          starter: 'local coins = 60\nlocal shop = {\n    { name = "Zwaard", price = 100 },\n    { name = "Fakkel", price = 10 },\n    { name = "Boog", price = 60 },\n}\n',
          checks: [
            { kind: 'output', lines: ['Fakkel', 'Boog'], message: 'Met 60 coins kan de speler een **Fakkel** en een **Boog** kopen.' },
            { kind: 'variants', replace: 'local coins = 60', cases: [{ with: 'local coins = 5', lines: [] }, { with: 'local coins = 1000', lines: ['Zwaard', 'Fakkel', 'Boog'] }], message: 'Je code klopt niet voor elk aantal coins.' },
          ],
          hints: ['for _, item in shop do ... end', 'Binnen de lus: if item.price <= coins then print(item.name) end'],
          solution: 'local coins = 60\nlocal shop = {\n    { name = "Zwaard", price = 100 },\n    { name = "Fakkel", price = 10 },\n    { name = "Boog", price = 60 },\n}\nfor _, item in shop do\n    if item.price <= coins then\n        print(item.name)\n    end\nend',
          concepts: ['tables', 'dictionaries', 'loops'],
          success: 'Getest met 5, 60 en 1000 coins.',
        },
      ],
      summary: ['Een waarde in een tabel mag ook een tabel zijn.', 'Je leest geneste waarden stap voor stap: `config.round.length`.', 'Een lijst van dictionaries is perfect voor winkels en inventarissen.'],
    },

    // ------------------------------------------------------------------ 6 project
    {
      id: 'c5-project-inventory',
      courseId: 'course-5',
      title: 'Project: inventarissysteem',
      objective: 'Je bouwt een werkend inventarissysteem met tabellen en functies.',
      minutes: 18,
      prerequisites: ['dictionaries', 'functions', 'return-values'],
      concepts: ['dictionaries', 'functions', 'tables'],
      steps: [
        {
          type: 'explain',
          body: `Je bouwt de kern van een inventaris zoals in een echte Roblox-game. De inventaris is een dictionary: de **sleutel** is de itemnaam, de **waarde** is hoeveel de speler ervan heeft, bijvoorbeeld \`{ Appel = 3, Zwaard = 1 }\`.

Je maakt drie functies die samen het systeem vormen.`,
        },
        {
          type: 'exercise',
          id: 'c5-project-ex1',
          mode: 'independent',
          title: 'Drie inventarisfuncties',
          prompt: 'Maak deze drie functies:\n1. `addItem(inventory, name, amount)`: telt `amount` op bij het item (bestaat het nog niet, dan begint het bij 0).\n2. `removeItem(inventory, name, amount)`: haalt `amount` weg en geeft `true` terug. Heeft de speler te weinig, verander dan niets en geef `false` terug. Komt het aantal op 0, verwijder dan de sleutel (zet hem op `nil`).\n3. `countItems(inventory)`: geeft het **totaal** aantal items terug (alle aantallen opgeteld).',
          starter: 'local function addItem(inventory, name, amount)\n    -- 1\nend\n\nlocal function removeItem(inventory, name, amount)\n    -- 2\nend\n\nlocal function countItems(inventory)\n    -- 3\nend\n\nlocal bag = {}\naddItem(bag, "Appel", 3)\naddItem(bag, "Zwaard", 1)\naddItem(bag, "Appel", 2)\nprint(countItems(bag))',
          checks: [
            { kind: 'output', lines: ['6'], message: 'Na 3 + 1 + 2 items moet `countItems(bag)` **6** zijn.' },
            { kind: 'test', harness: 'local b = {}\naddItem(b, "Hout", 4)\nif b.Hout ~= 4 then return "addItem(b, \\"Hout\\", 4) op een lege inventaris moet Hout op 4 zetten." end\naddItem(b, "Hout", 1)\nif b.Hout ~= 5 then return "Nog 1 Hout toevoegen moet 5 geven." end\nif removeItem(b, "Hout", 9) ~= false then return "removeItem met te weinig items moet false teruggeven." end\nif b.Hout ~= 5 then return "Als er te weinig is, mag removeItem niets veranderen." end\nif removeItem(b, "Hout", 2) ~= true then return "removeItem(b, \\"Hout\\", 2) moet true teruggeven." end\nif b.Hout ~= 3 then return "Na 2 weghalen moet er 3 Hout over zijn." end\nremoveItem(b, "Hout", 3)\nif b.Hout ~= nil then return "Als het aantal 0 wordt, moet de sleutel verwijderd worden (nil)." end\nif removeItem(b, "Goud", 1) ~= false then return "Een item dat niet bestaat weghalen moet false teruggeven." end\nif countItems({}) ~= 0 then return "countItems van een lege inventaris moet 0 zijn." end\nif countItems({ A = 2, B = 5 }) ~= 7 then return "countItems({ A = 2, B = 5 }) moet 7 zijn." end\nreturn true', message: '' },
          ],
          hints: [
            'addItem: `inventory[name] = (inventory[name] or 0) + amount`. `x or 0` geeft 0 als x nil is.',
            'removeItem: haal eerst `local current = inventory[name] or 0` op en vergelijk met `amount`.',
            'countItems: loop met `for _, count in inventory do` en tel op.',
          ],
          solution: 'local function addItem(inventory, name, amount)\n    inventory[name] = (inventory[name] or 0) + amount\nend\n\nlocal function removeItem(inventory, name, amount)\n    local current = inventory[name] or 0\n    if current < amount then\n        return false\n    end\n    current -= amount\n    if current == 0 then\n        inventory[name] = nil\n    else\n        inventory[name] = current\n    end\n    return true\nend\n\nlocal function countItems(inventory)\n    local total = 0\n    for _, count in inventory do\n        total += count\n    end\n    return total\nend\n\nlocal bag = {}\naddItem(bag, "Appel", 3)\naddItem(bag, "Zwaard", 1)\naddItem(bag, "Appel", 2)\nprint(countItems(bag))',
          concepts: ['dictionaries', 'functions', 'return-values'],
          success: 'Je inventarissysteem doorstond elf tests. Dit is dezelfde logica die je later met een ModuleScript en DataStores in een echte game gebruikt.',
        },
      ],
      summary: ['Je combineerde dictionaries, functies, return en lussen tot één systeem.', '`x or 0` is een handig patroon voor waarden die nog niet bestaan.', 'Je beheerst nu de volledige Luau-basis. Daarna volgt de Roblox-engine zelf.'],
    },
  ],
};
