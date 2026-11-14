import type { Course } from '../types';

export const course4: Course = {
  id: 'course-4',
  number: 4,
  title: 'Functies',
  description: 'Herbruikbare code maken met parameters en return-waarden. De basis van elk Roblox-systeem.',
  level: 'Beginner',
  planned: [],
  lessons: [
    // ------------------------------------------------------------------ 1
    {
      id: 'c4-functions',
      courseId: 'course-4',
      title: 'Wat is een functie?',
      objective: 'Je kunt een functie maken met local function en hem aanroepen.',
      minutes: 9,
      prerequisites: ['variables', 'print'],
      concepts: ['functions'],
      steps: [
        {
          type: 'explain',
          body: `Je gebruikt al vanaf les 2 een functie: \`print\`. Een **functie** is een stuk code met een naam, dat je kunt uitvoeren wanneer je wilt.

Nu ga je **zelf** functies maken. Dat heeft twee grote voordelen:
- je schrijft code één keer en gebruikt hem vaak
- je geeft een stuk code een duidelijke naam, zoals \`resetPlayer\` of \`giveCoins\`

Een functie **maken** doet nog niets. Pas als je hem **aanroept** (met haakjes), draait de code erin.`,
        },
        {
          type: 'code',
          code: 'local function sayWelcome()\n    print("Welkom in de game!")\n    print("Veel plezier")\nend\n\nsayWelcome()\nsayWelcome()',
          runnable: true,
          annotations: [
            { token: 'function', text: '`local function` maakt een nieuwe functie. Net als bij variabelen zet je er `local` voor.' },
            { token: 'sayWelcome', text: 'De **naam** van de functie. Kies een werkwoord: wat doet hij?' },
            { token: '()', text: 'Bij het maken staan hier later de **parameters**. Bij het aanroepen betekenen de haakjes: voer nu uit.' },
            { token: 'end', text: '`end` sluit de functie af.' },
          ],
          after: 'De functie wordt twee keer aangeroepen, dus je ziet de twee berichten twee keer.',
        },
        {
          type: 'predict',
          id: 'c4-functions-p1',
          question: 'Wat laat deze code zien?',
          code: 'local function beep()\n    print("beep")\nend\nprint("start")',
          concepts: ['functions'],
          options: [
            { text: 'beep start', feedback: 'De functie is gemaakt, maar nergens aangeroepen.' },
            { text: 'start', correct: true, feedback: 'Juist. Zonder `beep()` draait de code in de functie nooit.' },
            { text: 'Een fout', feedback: 'Een functie maken zonder hem te gebruiken is geen fout; hij doet alleen niets.' },
          ],
        },
        {
          type: 'exercise',
          id: 'c4-functions-ex1',
          mode: 'guided',
          title: 'Je eerste functie',
          prompt: 'Maak een functie `showRules` die twee regels print: **Regel 1: niet vals spelen** en **Regel 2: heb plezier**. Roep hem daarna **één keer** aan.',
          starter: '',
          checks: [
            { kind: 'uses', sequence: ['local', 'function', 'showRules'], message: 'Maak de functie met `local function showRules()`.' },
            { kind: 'uses', sequence: ['showRules', '(', ')'], message: 'Roep de functie aan met `showRules()`.' },
            { kind: 'output', lines: ['Regel 1: niet vals spelen', 'Regel 2: heb plezier'], message: 'De Output moet de twee regels precies één keer laten zien.' },
          ],
          hints: ['local function showRules()\n    ...\nend', 'Roep hem aan op een nieuwe regel, na de `end`.'],
          solution: 'local function showRules()\n    print("Regel 1: niet vals spelen")\n    print("Regel 2: heb plezier")\nend\n\nshowRules()',
          concepts: ['functions'],
          success: 'Je eerste eigen functie.',
        },
        {
          type: 'exercise',
          id: 'c4-functions-ex2',
          mode: 'independent',
          kind: 'fix-bug',
          title: 'Te vroeg aangeroepen',
          prompt: 'Deze code geeft een fout. Run hem, lees de uitleg en repareer hem door regels te verplaatsen.',
          starter: 'startRound()\n\nlocal function startRound()\n    print("Ronde gestart")\nend',
          checks: [{ kind: 'output', lines: ['Ronde gestart'], message: 'De Output moet **Ronde gestart** zijn.' }],
          hints: ['Luau leest van boven naar beneden. Bestaat `startRound` al op regel 1?', 'Zet de aanroep onder de functie.'],
          solution: 'local function startRound()\n    print("Ronde gestart")\nend\n\nstartRound()',
          concepts: ['functions', 'order'],
          success: 'Een local function bestaat pas vanaf de regel waar je hem maakt. Zet functies daarom bovenaan.',
        },
      ],
      summary: ['Een functie is code met een naam die je kunt hergebruiken.', '`local function naam() ... end` maakt hem; `naam()` voert hem uit.', 'Een local function bestaat pas na de regel waarop hij gemaakt is.'],
    },

    // ------------------------------------------------------------------ 2
    {
      id: 'c4-parameters',
      courseId: 'course-4',
      title: 'Parameters en argumenten',
      objective: 'Je kunt informatie aan een functie meegeven met parameters.',
      minutes: 10,
      prerequisites: ['functions'],
      concepts: ['parameters'],
      steps: [
        {
          type: 'explain',
          body: `Een functie wordt veel krachtiger als je er informatie aan meegeeft.

- Een **parameter** is een variabele in de functie die zijn waarde krijgt bij het aanroepen. Je schrijft hem tussen de haakjes bij het **maken**.
- Een **argument** is de waarde die je meegeeft bij het **aanroepen**.

Meerdere parameters scheid je met komma's, net als bij \`print\`.`,
        },
        {
          type: 'code',
          code: 'local function greet(playerName, level)\n    print(`Welkom {playerName}, je bent level {level}`)\nend\n\ngreet("Nova", 3)\ngreet("Kai", 12)',
          runnable: true,
          annotations: [
            { token: 'playerName', text: '`playerName` is een **parameter**: binnen de functie is het een variabele.' },
            { token: '"Nova"', text: '`"Nova"` is het **argument**: de waarde die in `playerName` terechtkomt bij deze aanroep.' },
          ],
          after: 'Dezelfde functie, twee verschillende berichten. Het eerste argument gaat naar de eerste parameter, het tweede naar de tweede.',
        },
        {
          type: 'predict',
          id: 'c4-parameters-p1',
          question: 'Wat laat deze code zien?',
          code: 'local function show(a, b)\n    print(b, a)\nend\nshow("links", "rechts")',
          concepts: ['parameters'],
          options: [
            { text: 'links rechts', feedback: 'Kijk welke parameter print als eerste gebruikt.' },
            { text: 'rechts links', correct: true, feedback: 'Juist. a = "links", b = "rechts", en de functie print eerst b.' },
          ],
        },
        {
          type: 'exercise',
          id: 'c4-parameters-ex1',
          mode: 'guided',
          title: 'Schade melden',
          prompt: 'Maak een functie `reportDamage(name, amount)` die print: **Nova kreeg 25 schade** (met de waarden van de parameters). Roep hem aan met `"Nova"` en `25`.',
          starter: '',
          checks: [
            { kind: 'uses', sequence: ['local', 'function', 'reportDamage', '(', 'name', ',', 'amount', ')'], message: 'Maak de functie met precies `local function reportDamage(name, amount)`.' },
            { kind: 'output', lines: ['Nova kreeg 25 schade'], message: 'De Output moet **Nova kreeg 25 schade** zijn.' },
            { kind: 'test', harness: 'reportDamage("Kai", 7)\nreturn true', message: '' },
          ],
          hints: ['Gebruik de parameters in de tekst: print(`{name} kreeg {amount} schade`)'],
          solution: 'local function reportDamage(name, amount)\n    print(`{name} kreeg {amount} schade`)\nend\n\nreportDamage("Nova", 25)',
          concepts: ['parameters'],
          success: 'Goed. Nu werkt dezelfde functie voor elke speler en elke hoeveelheid schade.',
        },
        {
          type: 'exercise',
          id: 'c4-parameters-ex2',
          mode: 'independent',
          title: 'Herhalende groet',
          prompt: 'Maak `cheer(word, times)`: die print `word` precies `times` keer onder elkaar. Roep hem aan met `"Go!"` en `3`.',
          starter: '',
          checks: [
            { kind: 'output', lines: ['Go!', 'Go!', 'Go!'], message: 'De Output moet drie keer **Go!** zijn.' },
            { kind: 'uses', sequence: ['for'], message: 'Gebruik een for-lus in de functie.' },
            { kind: 'variants', replace: 'cheer("Go!", 3)', cases: [{ with: 'cheer("Hup", 2)', lines: ['Hup', 'Hup'] }], message: 'Je functie gebruikt `word` of `times` nog niet goed.' },
          ],
          hints: ['Gebruik `times` als eindwaarde van een for-lus binnen de functie.'],
          solution: 'local function cheer(word, times)\n    for i = 1, times do\n        print(word)\n    end\nend\n\ncheer("Go!", 3)',
          concepts: ['parameters', 'loops'],
          success: 'Getest met ("Go!", 3) en ("Hup", 2).',
        },
      ],
      summary: ['Parameters staan tussen de haakjes bij het maken van een functie.', 'Argumenten zijn de waarden die je meegeeft bij het aanroepen.', 'De volgorde bepaalt welk argument bij welke parameter hoort.'],
    },

    // ------------------------------------------------------------------ 3
    {
      id: 'c4-return',
      courseId: 'course-4',
      title: 'return: een antwoord teruggeven',
      objective: 'Je kunt een functie een waarde laten teruggeven en die waarde gebruiken.',
      minutes: 11,
      prerequisites: ['parameters'],
      concepts: ['return-values'],
      steps: [
        {
          type: 'explain',
          body: `Tot nu toe printten je functies iets. Vaak wil je juist een **antwoord** terugkrijgen om verder mee te rekenen. Dat doe je met \`return\`.

\`return waarde\` stopt de functie en geeft de waarde terug aan de plek waar de functie werd aangeroepen. Die waarde kun je opslaan in een variabele.

**print** laat iets zien. **return** geeft iets terug. Dat is een groot verschil: met een geprinte waarde kan je code verder niets.`,
        },
        {
          type: 'code',
          code: 'local function double(number)\n    return number * 2\nend\n\nlocal result = double(21)\nprint(result)\nprint(double(5) + 1)',
          runnable: true,
          annotations: [
            { token: 'return', text: '`return` geeft de waarde terug en stopt de functie meteen.' },
            { token: 'result', text: 'De teruggegeven waarde (42) wordt opgeslagen in `result`.' },
          ],
          after: '`double(5) + 1`: eerst geeft de functie 10 terug, daarna telt Luau er 1 bij op.',
        },
        {
          type: 'quiz',
          id: 'c4-return-q1',
          question: 'Wat is het verschil tussen `print(x)` en `return x` in een functie?',
          concepts: ['return-values'],
          options: [
            { text: 'print laat x zien; return geeft x terug zodat je ermee verder kunt', correct: true, feedback: 'Precies.' },
            { text: 'Er is geen verschil', feedback: 'Met een geprinte waarde kan je code niets meer doen; met een teruggegeven waarde wel.' },
            { text: 'return laat x groter zien in de Output', feedback: 'return laat helemaal niets zien.' },
          ],
        },
        {
          type: 'exercise',
          id: 'c4-return-ex1',
          mode: 'guided',
          title: 'Prijs met korting',
          prompt: 'Maak `applyDiscount(price, percent)` die de prijs **na korting** teruggeeft. Voorbeeld: `applyDiscount(200, 25)` geeft `150`.',
          starter: 'local function applyDiscount(price, percent)\n    -- jouw code\nend\n\nprint(applyDiscount(200, 25))',
          checks: [
            { kind: 'uses', sequence: ['return'], message: 'Gebruik `return` om de nieuwe prijs terug te geven.' },
            { kind: 'test', harness: 'if applyDiscount(200, 25) ~= 150 then return "applyDiscount(200, 25) moet 150 teruggeven." end\nif applyDiscount(80, 50) ~= 40 then return "applyDiscount(80, 50) moet 40 teruggeven." end\nif applyDiscount(99, 0) ~= 99 then return "applyDiscount(99, 0) moet 99 teruggeven." end\nreturn true', message: '' },
          ],
          hints: ['De korting is `price * percent / 100`.', 'return price - price * percent / 100'],
          solution: 'local function applyDiscount(price, percent)\n    return price - price * percent / 100\nend\n\nprint(applyDiscount(200, 25))',
          concepts: ['return-values', 'parameters'],
          success: 'De Academy testte je functie met drie verschillende prijzen en kortingen. Allemaal goed.',
        },
        {
          type: 'exercise',
          id: 'c4-return-ex2',
          mode: 'independent',
          title: 'Mag ik dit kopen?',
          prompt: 'Maak `canAfford(coins, price)` die `true` teruggeeft als de speler genoeg coins heeft (minstens de prijs), en anders `false`.',
          starter: '',
          checks: [
            { kind: 'test', harness: 'return typeof(canAfford) == "function" or "Maak een functie met de naam `canAfford`."', message: '' },
            { kind: 'test', harness: 'if canAfford(100, 100) ~= true then return "canAfford(100, 100) moet true zijn." end\nif canAfford(150, 100) ~= true then return "canAfford(150, 100) moet true zijn." end\nif canAfford(99, 100) ~= false then return "canAfford(99, 100) moet false zijn." end\nreturn true', message: '' },
          ],
          hints: ['Een vergelijking geeft al true of false: je kunt hem direct teruggeven.', 'return coins >= price'],
          solution: 'local function canAfford(coins, price)\n    return coins >= price\nend',
          concepts: ['return-values', 'comparisons'],
          success: 'Kort en correct. Zulke kleine functies maken je winkelcode leesbaar.',
        },
      ],
      summary: ['`return waarde` geeft een waarde terug en stopt de functie.', 'De teruggegeven waarde kun je opslaan of direct gebruiken.', 'print laat zien; return geeft terug.'],
    },

    // ------------------------------------------------------------------ 4
    {
      id: 'c4-scope-callbacks',
      courseId: 'course-4',
      title: 'Scope, anonieme functies en callbacks',
      objective: 'Je begrijpt dat variabelen in een functie lokaal zijn, en dat je een functie kunt doorgeven als waarde.',
      minutes: 11,
      prerequisites: ['functions', 'return-values'],
      concepts: ['functions'],
      steps: [
        {
          type: 'explain',
          body: `**Scope binnen functies.** Een variabele die je **in** een functie maakt, bestaat alleen in die functie. Variabelen van **buiten** kan de functie wel gebruiken en veranderen.

**Functies zijn waarden.** Je kunt een functie in een variabele stoppen, of aan een andere functie meegeven. Een functie zonder naam heet een **anonieme functie**: \`function() ... end\`.

Een functie die je meegeeft om later uit te voeren, heet een **callback**. Dit is extreem belangrijk in Roblox: bij events zeg je "als dit gebeurt, voer dán deze functie uit".`,
        },
        {
          type: 'code',
          code: 'local total = 0\n\nlocal function addCoins(amount)\n    local bonus = 5\n    total += amount + bonus\nend\n\naddCoins(10)\naddCoins(20)\nprint(total)\nprint(bonus)',
          runnable: true,
          after: '`total` (van buiten) is aangepast: 40. `bonus` bestond alleen in de functie, dus buiten is hij `nil`.',
        },
        {
          type: 'code',
          title: 'Een callback',
          code: 'local function doTwice(callback)\n    callback()\n    callback()\nend\n\ndoTwice(function()\n    print("Hallo!")\nend)',
          runnable: true,
          after: 'De anonieme functie wordt meegegeven als argument, en `doTwice` roept hem twee keer aan. In Roblox schrijf je straks: `part.Touched:Connect(function() ... end)`. Dat is precies dit patroon.',
        },
        {
          type: 'predict',
          id: 'c4-scope-p1',
          question: 'Wat laat deze code zien?',
          code: 'local function setup()\n    local secret = 42\nend\nsetup()\nprint(secret)',
          concepts: ['functions'],
          options: [
            { text: '42', feedback: '`secret` is een local binnen de functie: buiten de functie bestaat hij niet.' },
            { text: 'nil', correct: true, feedback: 'Juist. `secret` bestaat alleen binnen `setup`.' },
          ],
        },
        {
          type: 'exercise',
          id: 'c4-callback-ex1',
          mode: 'independent',
          title: 'Doe iets met elk getal',
          prompt: 'Maak `forEachNumber(count, callback)`: die roept `callback(i)` aan voor i = 1 tot en met `count`.\nRoep hem daarna aan met `3` en een anonieme functie die `"Getal " .. n` print.',
          starter: '',
          checks: [
            { kind: 'output', lines: ['Getal 1', 'Getal 2', 'Getal 3'], message: 'De Output moet Getal 1, Getal 2, Getal 3 zijn.' },
            { kind: 'uses', sequence: ['function', '(', 'n', ')'], message: 'Geef een anonieme functie met parameter `n` mee: `function(n) ... end`.' },
            { kind: 'test', harness: 'local seen = 0\nforEachNumber(4, function(x) seen += x end)\nif seen ~= 10 then return "forEachNumber(4, ...) moet de callback aanroepen met 1, 2, 3 en 4." end\nreturn true', message: '' },
          ],
          hints: ['In forEachNumber: een for-lus die `callback(i)` aanroept.', 'forEachNumber(3, function(n)\n    print("Getal " .. n)\nend)'],
          solution: 'local function forEachNumber(count, callback)\n    for i = 1, count do\n        callback(i)\n    end\nend\n\nforEachNumber(3, function(n)\n    print("Getal " .. n)\nend)',
          concepts: ['functions', 'parameters'],
          success: 'Je schreef een functie die een andere functie aanroept. Dit is de kern van events in Roblox.',
        },
      ],
      summary: ['Variabelen in een functie zijn lokaal: buiten de functie bestaan ze niet.', 'Een functie kun je als waarde doorgeven.', 'Een callback is een functie die later voor je wordt aangeroepen, zoals bij Roblox-events.'],
    },

    // ------------------------------------------------------------------ 5 project
    {
      id: 'c4-project-damage',
      courseId: 'course-4',
      title: 'Project: schadeberekening',
      objective: 'Je bouwt een herbruikbare schadefunctie zoals in een echte combat-game.',
      minutes: 15,
      prerequisites: ['return-values', 'conditions'],
      concepts: ['functions', 'return-values', 'conditions'],
      steps: [
        {
          type: 'explain',
          body: `In een game met gevechten moet schade overal op dezelfde manier berekend worden: bij zwaarden, pijlen en spreuken. Daarom maak je er één functie voor.

Regels van deze game:
- schade = \`baseDamage\` × \`multiplier\`
- bij een **critical hit** wordt de schade verdubbeld
- het pantser van de tegenstander (\`armor\`) gaat er daarna vanaf
- schade is nooit lager dan **0**`,
        },
        {
          type: 'exercise',
          id: 'c4-project-ex1',
          mode: 'independent',
          title: 'calculateDamage',
          prompt: 'Maak `calculateDamage(baseDamage, multiplier, isCritical, armor)` die de schade **teruggeeft** volgens de regels hierboven.\nVoorbeelden:\n- `calculateDamage(10, 2, false, 5)` → 15\n- `calculateDamage(10, 2, true, 5)` → 35\n- `calculateDamage(10, 1, false, 50)` → 0',
          starter: 'local function calculateDamage(baseDamage, multiplier, isCritical, armor)\n    -- jouw code\nend\n\nprint(calculateDamage(10, 2, false, 5))',
          checks: [
            { kind: 'uses', sequence: ['return'], message: 'Geef de schade terug met `return`.' },
            { kind: 'test', harness: 'local cases = { {10, 2, false, 5, 15}, {10, 2, true, 5, 35}, {10, 1, false, 50, 0}, {7, 3, true, 0, 42}, {1, 1, false, 1, 0} }\nfor _, c in cases do\n    local got = calculateDamage(c[1], c[2], c[3], c[4])\n    if got ~= c[5] then\n        return `calculateDamage({c[1]}, {c[2]}, {tostring(c[3])}, {c[4]}) gaf {tostring(got)}, maar moet {c[5]} zijn.`\n    end\nend\nreturn true', message: '' },
          ],
          hints: ['Begin met `local damage = baseDamage * multiplier`.', 'Verdubbel met een if: `if isCritical then damage *= 2 end`.', 'Trek armor af en gebruik daarna `if damage < 0 then damage = 0 end` (of `math.max(0, damage)`).'],
          solution: 'local function calculateDamage(baseDamage, multiplier, isCritical, armor)\n    local damage = baseDamage * multiplier\n    if isCritical then\n        damage *= 2\n    end\n    damage -= armor\n    if damage < 0 then\n        damage = 0\n    end\n    return damage\nend\n\nprint(calculateDamage(10, 2, false, 5))',
          concepts: ['functions', 'return-values', 'conditions'],
          success: 'Je functie is getest met vijf verschillende gevechtssituaties. Deze functie zou zo in een echte Roblox-game passen.',
        },
      ],
      summary: ['Eén functie voor één regel van je game: overal dezelfde berekening.', 'Je combineerde parameters, if-statements en return.', 'Volgende cursus: veel gegevens bewaren in tabellen.'],
    },
  ],
};
