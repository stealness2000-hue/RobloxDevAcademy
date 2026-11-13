import type { PracticeExercise } from './types';

/**
 * Practice bank: extra exercises per concept (used for adaptive practice and review),
 * and challenges (independent, no hints).
 */
export const PRACTICE: PracticeExercise[] = [
  // ---------------------------------------------------------------- print & strings
  {
    id: 'p-print-1', title: 'Drie regels', difficulty: 1, kind: 'write', concepts: ['print'], prerequisites: ['print'],
    prompt: 'Laat drie regels zien: **Klaar**, **Voor**, **De start**', starter: '',
    checks: [{ kind: 'output', lines: ['Klaar', 'Voor', 'De start'], message: 'Drie regels: Klaar, Voor, De start.' }],
    hints: ['Eén print per regel.'], solution: 'print("Klaar")\nprint("Voor")\nprint("De start")',
    explanation: 'Elke print-opdracht maakt één nieuwe regel in de Output, van boven naar beneden.',
  },
  {
    id: 'p-strings-1', title: 'Aanhalingsteken in tekst', difficulty: 2, kind: 'write', concepts: ['strings'], prerequisites: ['strings'],
    prompt: "Laat precies dit zien: **Ze zei \"Go!\"** (met de dubbele aanhalingstekens erin).", starter: '',
    checks: [{ kind: 'output', lines: ['Ze zei "Go!"'], message: 'De Output moet precies Ze zei "Go!" zijn, met aanhalingstekens.' }],
    hints: ['Gebruik enkele aanhalingstekens om je tekst, dan mag je dubbele erin gebruiken.'], solution: "print('Ze zei \"Go!\"')",
    explanation: "Door de tekst met ' te omringen, kun je \" er gewoon in gebruiken.",
  },
  {
    id: 'p-strings-bug', title: 'Kapotte groet', difficulty: 1, kind: 'fix-bug', concepts: ['strings', 'arguments'], prerequisites: ['strings'],
    prompt: 'Repareer de code zodat hij **Hallo speler** laat zien.', starter: 'print(Hallo speler")',
    checks: [{ kind: 'output', lines: ['Hallo speler'], message: 'De Output moet Hallo speler zijn.' }],
    hints: ['Waar begint de tekst?'], solution: 'print("Hallo speler")', explanation: 'De tekst miste een openend aanhalingsteken.',
  },
  {
    id: 'p-args-1', title: 'Komma\'s', difficulty: 1, kind: 'write', concepts: ['arguments'], prerequisites: ['arguments'],
    prompt: 'Gebruik één print met **twee** argumenten (tekst en getal) voor: **Kills: 3**', starter: '',
    checks: [
      { kind: 'output', lines: ['Kills: 3'], message: 'De Output moet Kills: 3 zijn.' },
      { kind: 'uses', sequence: [',', '3'], message: 'Geef het getal 3 als apart argument na een komma.' },
    ],
    hints: ['print("Kills:", ...)'], solution: 'print("Kills:", 3)', explanation: 'print zet een spatie tussen argumenten.',
  },
  // ---------------------------------------------------------------- variables
  {
    id: 'p-var-1', title: 'Spelersnaam', difficulty: 1, kind: 'write', concepts: ['variables'], prerequisites: ['variables'],
    prompt: 'Maak een variabele `team` met de tekst **"Rood"**, en print hem.', starter: '',
    checks: [
      { kind: 'value', expr: 'team', equals: 'Rood', message: '`team` moet "Rood" zijn.' },
      { kind: 'output', lines: ['Rood'], message: 'Print de waarde van team.' },
    ],
    hints: ['local team = ...'], solution: 'local team = "Rood"\nprint(team)', explanation: 'Een variabele bewaart een waarde onder een naam.',
  },
  {
    id: 'p-var-2', title: 'Waarde vervangen', difficulty: 1, kind: 'write', concepts: ['variables'], prerequisites: ['variables'],
    prompt: 'Maak `lives` met waarde **3**. Geef hem op de volgende regel de nieuwe waarde **2** (zonder `local`). Print `lives`.', starter: '',
    checks: [
      { kind: 'output', lines: ['2'], message: 'De Output moet 2 zijn.' },
      { kind: 'uses', sequence: ['local', 'lives', '=', '3'], message: 'Maak lives eerst met waarde 3.' },
      { kind: 'uses', sequence: ['lives', '=', '2'], message: 'Geef lives daarna de waarde 2.' },
    ],
    hints: ['De tweede regel begint met de naam, niet met local.'], solution: 'local lives = 3\nlives = 2\nprint(lives)',
    explanation: 'Zonder local verander je een bestaande variabele.',
  },
  {
    id: 'p-var-bug', title: 'Onbekende variabele', difficulty: 2, kind: 'fix-bug', concepts: ['variables', 'naming'], prerequisites: ['variables'],
    prompt: 'De Output toont `nil`. Repareer het zodat hij **Lava** laat zien.', starter: 'local obstacle = "Lava"\nprint(obstakel)',
    checks: [{ kind: 'output', lines: ['Lava'], message: 'De Output moet Lava zijn.' }],
    hints: ['Vergelijk de spelling van beide namen.'], solution: 'local obstacle = "Lava"\nprint(obstacle)',
    explanation: 'Een verkeerd gespelde naam is een nieuwe, lege (nil) variabele.',
  },
  // ---------------------------------------------------------------- numbers
  {
    id: 'p-num-1', title: 'Schade', difficulty: 1, kind: 'write', concepts: ['operators'], prerequisites: ['operators'],
    prompt: 'Maak `health` = **100**. Trek er met `-=` **35** vanaf. Print health.', starter: '',
    checks: [
      { kind: 'output', lines: ['65'], message: 'De Output moet 65 zijn.' },
      { kind: 'uses', sequence: ['-='], message: 'Gebruik -=.' },
    ],
    hints: ['health -= 35'], solution: 'local health = 100\nhealth -= 35\nprint(health)', explanation: '`-=` trekt af van de huidige waarde.',
  },
  {
    id: 'p-num-2', title: 'Volgorde van rekenen', difficulty: 2, kind: 'write', concepts: ['operators'], prerequisites: ['operators'],
    prompt: 'Zet haakjes in de berekening zodat de Output **20** wordt.', starter: 'print(2 + 3 * 4)',
    checks: [{ kind: 'output', lines: ['20'], message: 'De uitkomst moet 20 zijn.' }, { kind: 'uses', sequence: ['('], message: 'Gebruik haakjes.' }],
    hints: ['Welk deel moet eerst?'], solution: 'print((2 + 3) * 4)', explanation: 'Haakjes gaan voor * en /.',
  },
  {
    id: 'p-num-3', title: 'Gemiddelde', difficulty: 2, kind: 'write', concepts: ['operators', 'variables'], prerequisites: ['operators'],
    prompt: 'Maak `a` = 8, `b` = 12 en `average` = het gemiddelde van a en b.', starter: '',
    checks: [{ kind: 'value', expr: 'average', equals: 10, message: '`average` moet 10 zijn.' }, { kind: 'uses', sequence: ['/'], message: 'Deel door 2 met /.' }],
    hints: ['Eerst optellen, dan delen. Denk aan haakjes.'], solution: 'local a = 8\nlocal b = 12\nlocal average = (a + b) / 2',
    explanation: 'Zonder haakjes zou b eerst door 2 gedeeld worden.',
  },
  // ---------------------------------------------------------------- concat / interpolation
  {
    id: 'p-concat-1', title: 'Leaderboard-regel', difficulty: 2, kind: 'write', concepts: ['concatenation'], prerequisites: ['concatenation'],
    prompt: 'Maak `rank` = 1 en `name` = "Zara". Print met `..`: **#1 Zara**', starter: '',
    checks: [{ kind: 'output', lines: ['#1 Zara'], message: 'De Output moet #1 Zara zijn.' }, { kind: 'uses', sequence: ['..'], message: 'Gebruik ..' }],
    hints: ['"#" .. rank .. " " .. name'], solution: 'local rank = 1\nlocal name = "Zara"\nprint("#" .. rank .. " " .. name)',
    explanation: 'Spaties moet je zelf toevoegen bij ..',
  },
  {
    id: 'p-interp-1', title: 'Timer-tekst', difficulty: 1, kind: 'write', concepts: ['interpolation'], prerequisites: ['interpolation'],
    prompt: 'Maak `seconds` = 30 en print met backticks: **Nog 30 seconden**', starter: '',
    checks: [{ kind: 'output', lines: ['Nog 30 seconden'], message: 'De Output moet Nog 30 seconden zijn.' }, { kind: 'stringLiteral', contains: '{seconds}', message: 'Gebruik {seconds} in backticks.' }],
    hints: ['print(`Nog {seconds} seconden`)'], solution: 'local seconds = 30\nprint(`Nog {seconds} seconden`)',
    explanation: 'Interpolation zet de waarde direct in de tekst.',
  },
  // ---------------------------------------------------------------- booleans / typeof
  {
    id: 'p-bool-1', title: 'Deur dicht', difficulty: 1, kind: 'write', concepts: ['booleans'], prerequisites: ['booleans'],
    prompt: 'Maak `doorOpen` met de waarde **false** en `hasKey` met **true**.', starter: '',
    checks: [{ kind: 'value', expr: 'doorOpen', equals: false, message: 'doorOpen moet false zijn.' }, { kind: 'value', expr: 'hasKey', equals: true, message: 'hasKey moet true zijn.' }],
    hints: ['Zonder aanhalingstekens.'], solution: 'local doorOpen = false\nlocal hasKey = true', explanation: 'Booleans zijn true of false, zonder aanhalingstekens.',
  },
  {
    id: 'p-typeof-1', title: 'Welk type?', difficulty: 1, kind: 'predict', concepts: ['typeof'], prerequisites: ['typeof'],
    prompt: 'Wat laat deze code zien?', starter: 'local x = "10"\nprint(typeof(x))', checks: [], hints: [], solution: '',
    explanation: '"10" staat tussen aanhalingstekens, dus het is een string.',
    options: [{ text: 'number', feedback: 'Kijk naar de aanhalingstekens.' }, { text: 'string', correct: true, feedback: 'Juist.' }, { text: '10', feedback: 'typeof geeft het type, niet de waarde.' }],
  },
  // ---------------------------------------------------------------- challenges (independent, no hints)
  {
    id: 'ch-shop-total', title: 'Winkelmandje', difficulty: 2, kind: 'write', concepts: ['variables', 'operators', 'interpolation'], prerequisites: ['interpolation'], challenge: true,
    prompt: 'Een speler koopt **3 zwaarden van 120** en **2 schilden van 80** coins. Maak een variabele `total` met de totaalprijs en print **Totaal: 520 coins** met interpolation.',
    starter: '',
    checks: [
      { kind: 'value', expr: 'total', equals: 520, message: '`total` klopt nog niet.' },
      { kind: 'output', lines: ['Totaal: 520 coins'], message: 'De Output moet Totaal: 520 coins zijn.' },
      { kind: 'notUses', sequence: ['=', '520'], message: 'Laat Luau de totaalprijs uitrekenen.' },
    ],
    hints: [], solution: 'local total = 3 * 120 + 2 * 80\nprint(`Totaal: {total} coins`)', explanation: '* gaat voor +, dus 3*120 + 2*80 = 520.',
  },
  {
    id: 'ch-fix-three', title: 'Drie bugs', difficulty: 3, kind: 'fix-bug', concepts: ['strings', 'naming', 'concatenation'], prerequisites: ['concatenation'], challenge: true,
    prompt: 'Deze code bevat drie fouten. Repareer ze allemaal. De Output moet zijn: **Checkpoint 4 bereikt door Mia**',
    starter: 'local checkpoint = 4\nlocal player = "Mia\nprint("Checkpoint " + checkpoint .. " bereikt door " .. Player)',
    checks: [{ kind: 'output', lines: ['Checkpoint 4 bereikt door Mia'], message: 'De Output moet Checkpoint 4 bereikt door Mia zijn.' }],
    hints: [], solution: 'local checkpoint = 4\nlocal player = "Mia"\nprint("Checkpoint " .. checkpoint .. " bereikt door " .. player)',
    explanation: 'Fout 1: niet-afgesloten string. Fout 2: + in plaats van ... Fout 3: Player met een hoofdletter.',
  },
  {
    id: 'ch-seconds', title: 'Minuten en seconden', difficulty: 3, kind: 'write', concepts: ['operators', 'interpolation'], prerequisites: ['operators'], challenge: true,
    prompt: 'Maak `totalSeconds` = **135**. Reken `minutes` en `seconds` uit (met `//` voor heeltallig delen en `%`) en print **2:15**.',
    starter: '',
    checks: [
      { kind: 'value', expr: 'minutes', equals: 2, message: '`minutes` klopt nog niet.' },
      { kind: 'value', expr: 'seconds', equals: 15, message: '`seconds` klopt nog niet.' },
      { kind: 'output', lines: ['2:15'], message: 'De Output moet 2:15 zijn.' },
    ],
    hints: [], solution: 'local totalSeconds = 135\nlocal minutes = totalSeconds // 60\nlocal seconds = totalSeconds % 60\nprint(`{minutes}:{seconds}`)',
    explanation: '`//` deelt en rondt naar beneden af; `%` geeft de rest. Zo maak je een timer-weergave.',
  },
  // ---------------------------------------------------------------- conditions
  {
    id: 'p-if-1', title: 'Negatief getal', difficulty: 1, kind: 'write', concepts: ['conditions', 'comparisons'], prerequisites: ['conditions'],
    prompt: 'Print **Negatief** als `n` kleiner is dan 0, en anders **Niet negatief**.', starter: 'local n = -4\n',
    checks: [
      { kind: 'output', lines: ['Negatief'], message: 'Met -4 hoort **Negatief** te verschijnen.' },
      { kind: 'variants', replace: 'local n = -4', cases: [{ with: 'local n = 0', lines: ['Niet negatief'] }, { with: 'local n = 7', lines: ['Niet negatief'] }], message: 'Je code klopt niet voor 0 of positieve getallen.' },
    ],
    hints: ['if n < 0 then ... else ... end'], solution: 'local n = -4\nif n < 0 then\n    print("Negatief")\nelse\n    print("Niet negatief")\nend',
    explanation: '0 is niet negatief: daarom is het `n < 0` en niet `n <= 0`.',
  },
  {
    id: 'p-if-bug', title: 'Eén = te weinig', difficulty: 1, kind: 'fix-bug', concepts: ['conditions', 'comparisons'], prerequisites: ['conditions'],
    prompt: 'Repareer de vergelijking. De Output moet **Rood team wint** zijn.', starter: 'local winner = "Rood"\nif winner = "Rood" then\n    print("Rood team wint")\nend',
    checks: [{ kind: 'output', lines: ['Rood team wint'], message: 'De Output moet Rood team wint zijn.' }],
    hints: ['Vergelijken doe je met twee is-tekens.'], solution: 'local winner = "Rood"\nif winner == "Rood" then\n    print("Rood team wint")\nend',
    explanation: '`=` geeft een waarde; in een voorwaarde vergelijk je met `==`.',
  },
  {
    id: 'p-logic-1', title: 'Teleport toegestaan?', difficulty: 2, kind: 'write', concepts: ['logic'], prerequisites: ['logic'],
    prompt: 'Teleporteren mag als de speler **niet** `inCombat` is **en** `level` minstens 5 is. Print **Teleport** of **Niet nu**.', starter: 'local inCombat = false\nlocal level = 8\n',
    checks: [
      { kind: 'output', lines: ['Teleport'], message: 'Buiten gevecht en level 8: **Teleport**.' },
      { kind: 'variants', replace: 'local inCombat = false', cases: [{ with: 'local inCombat = true', lines: ['Niet nu'] }], message: 'Tijdens een gevecht mag het niet.' },
      { kind: 'variants', replace: 'local level = 8', cases: [{ with: 'local level = 4', lines: ['Niet nu'] }, { with: 'local level = 5', lines: ['Teleport'] }], message: 'De level-controle klopt niet.' },
    ],
    hints: ['if not inCombat and level >= 5 then'], solution: 'local inCombat = false\nlocal level = 8\nif not inCombat and level >= 5 then\n    print("Teleport")\nelse\n    print("Niet nu")\nend',
    explanation: '`not` werkt op de waarde direct erachter; `and` combineert beide voorwaarden.',
  },
  // ---------------------------------------------------------------- loops
  {
    id: 'p-loop-1', title: 'Even getallen', difficulty: 1, kind: 'write', concepts: ['loops'], prerequisites: ['loops'],
    prompt: 'Print met **één** for-lus en een stapgrootte de getallen 2, 4, 6, 8, 10.', starter: '',
    checks: [
      { kind: 'output', lines: ['2', '4', '6', '8', '10'], message: 'De Output moet 2, 4, 6, 8, 10 zijn.' },
      { kind: 'uses', sequence: [',', '2', 'do'], message: 'Gebruik 2 als stapgrootte: `for i = 2, 10, 2 do`.' },
    ],
    hints: ['for i = 2, 10, 2 do'], solution: 'for i = 2, 10, 2 do\n    print(i)\nend', explanation: 'Het derde getal van een for-lus is de stap.',
  },
  {
    id: 'p-loop-sum', title: 'Som tot n', difficulty: 2, kind: 'write', concepts: ['loops', 'operators'], prerequisites: ['loops'],
    prompt: 'Reken de som 1 + 2 + ... + `n` uit in `sum` en print hem.', starter: 'local n = 10\n',
    checks: [
      { kind: 'value', expr: 'sum', equals: 55, message: 'Met n = 10 moet `sum` 55 zijn.' },
      { kind: 'variants', replace: 'local n = 10', cases: [{ with: 'local n = 1', lines: ['1'] }, { with: 'local n = 100', lines: ['5050'] }], message: 'Je som klopt niet voor elke n.' },
    ],
    hints: ['local sum = 0 vóór de lus, sum += i erin.'], solution: 'local n = 10\nlocal sum = 0\nfor i = 1, n do\n    sum += i\nend\nprint(sum)',
    explanation: 'Een totaal bijhouden: begin bij 0 en tel er elke ronde iets bij.',
  },
  {
    id: 'p-while-bug', title: 'Vastgelopen lus', difficulty: 2, kind: 'fix-bug', concepts: ['while-loops'], prerequisites: ['while-loops'],
    prompt: 'Deze lus stopt nooit. Repareer hem zodat de Output **Klaar na 4 stappen** is.', starter: 'local energy = 100\nlocal steps = 0\nwhile energy > 0 do\n    steps += 1\nend\nprint(`Klaar na {steps} stappen`)',
    checks: [{ kind: 'output', lines: ['Klaar na 4 stappen'], message: 'De Output moet Klaar na 4 stappen zijn.' }],
    hints: ['Wat moet er met energy gebeuren? 100 / 4 = 25.'], solution: 'local energy = 100\nlocal steps = 0\nwhile energy > 0 do\n    energy -= 25\n    steps += 1\nend\nprint(`Klaar na {steps} stappen`)',
    explanation: 'In een while-lus moet de voorwaarde ooit false worden.',
  },
  {
    id: 'p-loop-predict', title: 'Waar begint de lus?', difficulty: 1, kind: 'predict', concepts: ['loops'], prerequisites: ['loops'],
    prompt: 'Wat is de eerste regel die deze code laat zien?', starter: 'for i = 10, 1, -3 do\n    print(i)\nend', checks: [], hints: [], solution: '',
    explanation: 'De lus begint bij de beginwaarde: 10, daarna 7, 4 en 1.',
    options: [{ text: '10', correct: true, feedback: 'Juist.' }, { text: '1', feedback: 'Met een negatieve stap begint de lus bij het grootste getal.' }, { text: '7', feedback: 'De eerste ronde gebruikt de beginwaarde zelf.' }],
  },
  // ---------------------------------------------------------------- functions
  {
    id: 'p-func-1', title: 'Kwadraat', difficulty: 1, kind: 'write', concepts: ['functions', 'return-values'], prerequisites: ['return-values'],
    prompt: 'Maak `square(n)` die n × n teruggeeft.', starter: '',
    checks: [{ kind: 'test', harness: 'if square(3) ~= 9 then return "square(3) moet 9 zijn." end\nif square(0) ~= 0 then return "square(0) moet 0 zijn." end\nif square(-4) ~= 16 then return "square(-4) moet 16 zijn." end\nreturn true', message: '' }],
    hints: ['local function square(n)\n    return n * n\nend'], solution: 'local function square(n)\n    return n * n\nend', explanation: 'return geeft het antwoord terug aan de aanroeper.',
  },
  {
    id: 'p-func-bug', title: 'Geen antwoord', difficulty: 2, kind: 'fix-bug', concepts: ['return-values'], prerequisites: ['return-values'],
    prompt: 'De Output is `nil` in plaats van **30**. Repareer de functie.', starter: 'local function addBonus(coins)\n    local result = coins + 10\nend\nprint(addBonus(20))',
    checks: [{ kind: 'output', lines: ['30'], message: 'De Output moet 30 zijn.' }],
    hints: ['De functie rekent het uit, maar geeft niets terug.'], solution: 'local function addBonus(coins)\n    local result = coins + 10\n    return result\nend\nprint(addBonus(20))',
    explanation: 'Zonder `return` geeft een functie `nil` terug.',
  },
  {
    id: 'p-func-clamp', title: 'Begrenzen', difficulty: 2, kind: 'write', concepts: ['functions', 'conditions'], prerequisites: ['return-values', 'conditions'],
    prompt: 'Maak `clamp(value, min, max)` die `value` teruggeeft, maar nooit lager dan `min` en nooit hoger dan `max`. Handig voor health tussen 0 en 100.', starter: '',
    checks: [{ kind: 'test', harness: 'local c = { {50, 0, 100, 50}, {-5, 0, 100, 0}, {130, 0, 100, 100}, {0, 0, 100, 0} }\nfor _, t in c do\n    if clamp(t[1], t[2], t[3]) ~= t[4] then return `clamp({t[1]}, {t[2]}, {t[3]}) moet {t[4]} zijn.` end\nend\nreturn true', message: '' }],
    hints: ['Twee if-statements: te laag, te hoog.'], solution: 'local function clamp(value, min, max)\n    if value < min then\n        return min\n    elseif value > max then\n        return max\n    end\n    return value\nend',
    explanation: 'Luau heeft ook `math.clamp(value, min, max)` ingebouwd.',
  },
  // ---------------------------------------------------------------- tables
  {
    id: 'p-table-1', title: 'Gemiddelde score', difficulty: 2, kind: 'write', concepts: ['tables', 'loops'], prerequisites: ['tables'],
    prompt: 'Reken het gemiddelde van `scores` uit in `average`. Gebruik `#scores`.', starter: 'local scores = {10, 20, 60}\n',
    checks: [
      { kind: 'value', expr: 'average', equals: 30, message: '`average` moet 30 zijn.' },
      { kind: 'uses', sequence: ['#', 'scores'], message: 'Deel door `#scores`.' },
    ],
    hints: ['Tel eerst alles op in een lus, deel daarna door #scores.'], solution: 'local scores = {10, 20, 60}\nlocal total = 0\nfor _, s in scores do\n    total += s\nend\nlocal average = total / #scores',
    explanation: 'Som gedeeld door het aantal.',
  },
  {
    id: 'p-dict-1', title: 'Level omhoog', difficulty: 1, kind: 'write', concepts: ['dictionaries'], prerequisites: ['dictionaries'],
    prompt: 'Verhoog `player.level` met 1 en zet `player.xp` op 0. Print daarna `player.level`.', starter: 'local player = { name = "Nova", level = 4, xp = 120 }\n',
    checks: [
      { kind: 'output', lines: ['5'], message: 'De Output moet 5 zijn.' },
      { kind: 'test', harness: 'return player.xp == 0 or "player.xp moet 0 zijn."', message: '' },
    ],
    hints: ['player.level += 1'], solution: 'local player = { name = "Nova", level = 4, xp = 120 }\nplayer.level += 1\nplayer.xp = 0\nprint(player.level)',
    explanation: 'Met de punt pas je één veld van een dictionary aan.',
  },
  {
    id: 'p-dict-bug', title: 'Verkeerde sleutel', difficulty: 2, kind: 'fix-bug', concepts: ['dictionaries'], prerequisites: ['dictionaries'],
    prompt: 'De code geeft een fout. Repareer hem zodat hij **Prijs: 80** laat zien.', starter: 'local prices = { Schild = 80 }\nlocal item = "Schild"\nprint("Prijs: " .. prices.item)',
    checks: [{ kind: 'output', lines: ['Prijs: 80'], message: 'De Output moet Prijs: 80 zijn.' }],
    hints: ['prices.item zoekt naar een sleutel die letterlijk "item" heet. Gebruik blokhaken.'], solution: 'local prices = { Schild = 80 }\nlocal item = "Schild"\nprint("Prijs: " .. prices[item])',
    explanation: '`t.item` betekent `t["item"]`. Met een variabele als sleutel schrijf je `t[item]`.',
  },
  // ---------------------------------------------------------------- challenges for courses 2-5
  {
    id: 'ch-fizz', title: 'Coin-ritme', difficulty: 3, kind: 'write', concepts: ['loops', 'conditions'], prerequisites: ['loops', 'conditions'], challenge: true,
    prompt: 'Loop van 1 tot en met `n`. Print voor elk getal:\n- **Coin** als het deelbaar is door 3\n- **Gem** als het deelbaar is door 5\n- **Jackpot** als het deelbaar is door 3 **en** 5\n- anders het getal zelf.',
    starter: 'local n = 15\n',
    checks: [
      { kind: 'output', lines: ['1', '2', 'Coin', '4', 'Gem', 'Coin', '7', '8', 'Coin', 'Gem', '11', 'Coin', '13', '14', 'Jackpot'], message: 'De output voor n = 15 klopt nog niet.' },
      { kind: 'variants', replace: 'local n = 15', cases: [{ with: 'local n = 5', lines: ['1', '2', 'Coin', '4', 'Gem'] }], message: 'Je code werkt niet voor andere waarden van n.' },
    ],
    hints: [], solution: 'local n = 15\nfor i = 1, n do\n    if i % 15 == 0 then\n        print("Jackpot")\n    elseif i % 3 == 0 then\n        print("Coin")\n    elseif i % 5 == 0 then\n        print("Gem")\n    else\n        print(i)\n    end\nend',
    explanation: 'Controleer de strengste voorwaarde (deelbaar door 3 én 5) als eerste.',
  },
  {
    id: 'ch-leaderboard', title: 'Leaderboard', difficulty: 3, kind: 'write', concepts: ['tables', 'dictionaries', 'functions'], prerequisites: ['dictionaries', 'return-values'], challenge: true,
    prompt: 'Maak `getWinner(players)`: `players` is een lijst van dictionaries met `name` en `score`. Geef de **naam** terug van de speler met de hoogste score. Is de lijst leeg, geef dan `nil` terug.',
    starter: '',
    checks: [{ kind: 'test', harness: 'if getWinner({ { name = "A", score = 5 }, { name = "B", score = 9 }, { name = "C", score = 2 } }) ~= "B" then return "Bij scores 5, 9, 2 moet B winnen." end\nif getWinner({ { name = "Solo", score = 0 } }) ~= "Solo" then return "Met één speler wint die speler, ook met score 0." end\nif getWinner({}) ~= nil then return "Een lege lijst moet nil teruggeven." end\nreturn true', message: '' }],
    hints: [], solution: 'local function getWinner(players)\n    local best = nil\n    for _, p in players do\n        if best == nil or p.score > best.score then\n            best = p\n        end\n    end\n    if best then\n        return best.name\n    end\n    return nil\nend',
    explanation: 'Begin met `nil` als beste, zodat ook een score van 0 kan winnen.',
  },
  {
    id: 'ch-inventory-merge', title: 'Inventarissen samenvoegen', difficulty: 3, kind: 'write', concepts: ['dictionaries', 'functions', 'loops'], prerequisites: ['dictionaries', 'return-values'], challenge: true,
    prompt: 'Maak `merge(a, b)` die een **nieuwe** inventaris teruggeeft met de aantallen van `a` en `b` opgeteld. `a` en `b` zelf mogen niet veranderen.',
    starter: '',
    checks: [{ kind: 'test', harness: 'local a = { Hout = 3, Steen = 1 }\nlocal b = { Hout = 2, Goud = 5 }\nlocal m = merge(a, b)\nif m.Hout ~= 5 or m.Steen ~= 1 or m.Goud ~= 5 then return "merge moet Hout = 5, Steen = 1 en Goud = 5 geven." end\nif a.Hout ~= 3 or a.Goud ~= nil or b.Hout ~= 2 then return "a en b zelf mogen niet veranderen: maak een nieuwe tabel." end\nreturn true', message: '' }],
    hints: [], solution: 'local function merge(a, b)\n    local result = {}\n    for name, count in a do\n        result[name] = (result[name] or 0) + count\n    end\n    for name, count in b do\n        result[name] = (result[name] or 0) + count\n    end\n    return result\nend',
    explanation: 'Een nieuwe tabel maken voorkomt dat je per ongeluk de originele gegevens verandert.',
  },
];

export const practiceForConcept = (conceptId: string) => PRACTICE.filter((p) => !p.challenge && p.concepts.includes(conceptId));
