import type { Course } from '../types';

export const course3: Course = {
  id: 'course-3',
  number: 3,
  title: 'Lussen',
  description: 'Code herhalen met for, while en repeat, zonder je game te laten vastlopen.',
  level: 'Beginner',
  planned: [],
  lessons: [
    // ------------------------------------------------------------------ 1
    {
      id: 'c3-for',
      courseId: 'course-3',
      title: 'De for-lus',
      objective: 'Je kunt code een vast aantal keer herhalen met een for-lus en de teller gebruiken.',
      minutes: 10,
      prerequisites: ['variables', 'operators'],
      concepts: ['loops'],
      steps: [
        {
          type: 'explain',
          body: `Stel: je wilt 10 munten in je game zetten. Je kunt 10 keer bijna dezelfde regel schrijven, maar dat is veel werk en lastig aan te passen.

Een **lus** (in het Engels: loop) herhaalt code voor je. De **for-lus** herhaalt een vast aantal keer en houdt bij hoe vaak hij al geweest is in een **teller**.`,
        },
        {
          type: 'code',
          code: 'for i = 1, 3 do\n    print(i)\nend',
          runnable: true,
          annotations: [
            { token: 'for', text: '`for` begint de lus.' },
            { token: 'i', text: '`i` is de **teller**: een variabele die bij elke herhaling een nieuwe waarde krijgt. Je mag hem ook anders noemen, zoals `ronde` of `nummer`.' },
            { token: '1', text: 'De **beginwaarde**: de teller begint bij 1.' },
            { token: '3', text: 'De **eindwaarde**: de laatste ronde is als de teller 3 is. 3 telt dus mee.' },
            { token: 'do', text: '`do` betekent: hier begint de code die herhaald wordt.' },
            { token: 'end', text: '`end` sluit de lus af.' },
          ],
          after: 'De code tussen `do` en `end` draait drie keer: met i = 1, i = 2 en i = 3.',
        },
        {
          type: 'visual',
          kind: 'loop',
          title: 'Bekijk elke herhaling',
          body: 'Verander het aantal herhalingen en kijk hoe de teller meeloopt.',
          code: '',
        },
        {
          type: 'predict',
          id: 'c3-for-p1',
          question: 'Hoeveel regels laat deze code zien?',
          code: 'for ronde = 2, 5 do\n    print("Ronde " .. ronde)\nend',
          concepts: ['loops'],
          options: [
            { text: '5', feedback: 'De teller begint niet bij 1, maar bij 2.' },
            { text: '4', correct: true, feedback: 'Juist: ronde 2, 3, 4 en 5.' },
            { text: '3', feedback: 'Let op: de eindwaarde 5 telt ook mee.' },
          ],
        },
        {
          type: 'exercise',
          id: 'c3-for-ex1',
          mode: 'guided',
          title: 'Munten plaatsen',
          prompt: 'Gebruik een for-lus die **Munt 1** tot en met **Munt 5** laat zien (5 regels).',
          starter: '',
          checks: [
            { kind: 'uses', sequence: ['for'], message: 'Gebruik een `for`-lus in plaats van vijf losse prints.' },
            { kind: 'outputCount', min: 5, max: 5, message: 'Er moeten precies 5 regels verschijnen.' },
            { kind: 'output', lines: ['Munt 1', 'Munt 2', 'Munt 3', 'Munt 4', 'Munt 5'], message: 'De regels moeten **Munt 1** tot en met **Munt 5** zijn.' },
          ],
          hints: ['`for i = 1, 5 do` ... `end`', 'Binnen de lus: `print("Munt " .. i)`'],
          solution: 'for i = 1, 5 do\n    print("Munt " .. i)\nend',
          concepts: ['loops'],
          success: 'Vijf munten met drie regels code. Wil je er 100? Verander alleen de 5.',
        },
        {
          type: 'exercise',
          id: 'c3-for-ex2',
          mode: 'independent',
          title: 'Tafel van 7',
          prompt: 'Laat de tafel van een getal zien. Met `number = 7` is de output:\n**1 x 7 = 7** tot en met **5 x 7 = 35** (5 regels). Gebruik de variabele `number`, zodat het ook werkt voor andere getallen.',
          starter: 'local number = 7\n',
          checks: [
            { kind: 'uses', sequence: ['for'], message: 'Gebruik een `for`-lus.' },
            { kind: 'output', lines: ['1 x 7 = 7', '2 x 7 = 14', '3 x 7 = 21', '4 x 7 = 28', '5 x 7 = 35'], message: 'De output moet 1 x 7 = 7 tot en met 5 x 7 = 35 zijn.' },
            { kind: 'variants', replace: 'local number = 7', cases: [{ with: 'local number = 3', lines: ['1 x 3 = 3', '2 x 3 = 6', '3 x 3 = 9', '4 x 3 = 12', '5 x 3 = 15'] }], message: 'Je code werkt alleen voor 7. Gebruik de variabele `number` in plaats van het getal 7.' },
          ],
          hints: ['Interpolation helpt: print(`{i} x {number} = {i * number}`)'],
          solution: 'local number = 7\nfor i = 1, 5 do\n    print(`{i} x {number} = {i * number}`)\nend',
          concepts: ['loops', 'interpolation'],
          success: 'Werkt voor 7 én voor 3. Je gebruikte de teller in een berekening.',
        },
      ],
      summary: ['`for i = begin, eind do ... end` herhaalt code.', 'De teller `i` krijgt elke ronde de volgende waarde; de eindwaarde telt mee.', 'Gebruik de teller in je code, bijvoorbeeld in tekst of berekeningen.'],
    },

    // ------------------------------------------------------------------ 2
    {
      id: 'c3-for-step',
      courseId: 'course-3',
      title: 'Aftellen en optellen',
      objective: 'Je kunt aftellen met een stapgrootte en een totaal bijhouden in een lus.',
      minutes: 10,
      prerequisites: ['loops'],
      concepts: ['loops'],
      steps: [
        {
          type: 'explain',
          body: `Een for-lus kan een derde getal krijgen: de **stapgrootte**. Die zegt hoeveel de teller per ronde verandert.

- \`for i = 10, 0, -2 do\`: 10, 8, 6, 4, 2, 0
- \`for i = 3, 1, -1 do\`: 3, 2, 1. Zo tel je af.

Zonder derde getal is de stap altijd 1.`,
        },
        {
          type: 'code',
          code: 'for i = 3, 1, -1 do\n    print(i)\nend\nprint("Start!")',
          runnable: true,
        },
        {
          type: 'explain',
          title: 'Een totaal bijhouden',
          body: `Een veelgebruikt patroon: maak **vóór** de lus een variabele, en tel er **in** de lus steeds iets bij op.

Na de lus heb je het totaal. Maak de variabele niet ín de lus aan, want dan begint hij elke ronde opnieuw.`,
        },
        {
          type: 'code',
          code: 'local total = 0\nfor wave = 1, 4 do\n    total += wave * 10\nend\nprint("Totaal verdiend: " .. total)',
          runnable: true,
          after: '10 + 20 + 30 + 40 = 100.',
        },
        {
          type: 'exercise',
          id: 'c3-step-ex1',
          mode: 'guided',
          title: 'Raketlancering',
          prompt: 'Tel af van **10** naar **1** met een for-lus en een negatieve stap, en print daarna **Lancering!**',
          starter: '',
          checks: [
            { kind: 'uses', sequence: ['for'], message: 'Gebruik een `for`-lus.' },
            { kind: 'uses', sequence: [',', '-', '1', 'do'], message: 'Gebruik `-1` als stapgrootte om af te tellen.' },
            { kind: 'output', lines: ['10', '9', '8', '7', '6', '5', '4', '3', '2', '1', 'Lancering!'], message: 'De output moet 10 tot en met 1 zijn, en daarna **Lancering!**' },
          ],
          hints: ['`for i = 10, 1, -1 do`', 'Zet de laatste print **na** de `end` van de lus.'],
          solution: 'for i = 10, 1, -1 do\n    print(i)\nend\nprint("Lancering!")',
          concepts: ['loops'],
          success: 'Perfect afgeteld.',
        },
        {
          type: 'exercise',
          id: 'c3-step-ex2',
          mode: 'independent',
          title: 'Coins verzamelen',
          prompt: 'Een speler speelt `days` dagen. Op dag 1 krijgt hij 5 coins, op dag 2 10 coins, op dag 3 15 coins, enzovoort (dag × 5). Reken het totaal uit in de variabele `total` en print het.',
          starter: 'local days = 4\n',
          checks: [
            { kind: 'uses', sequence: ['for'], message: 'Gebruik een `for`-lus.' },
            { kind: 'value', expr: 'total', equals: 50, message: 'Met 4 dagen moet `total` 50 zijn (5 + 10 + 15 + 20).' },
            { kind: 'variants', replace: 'local days = 4', cases: [{ with: 'local days = 1', lines: ['5'] }, { with: 'local days = 10', lines: ['275'] }], message: 'Je totaal klopt niet voor elk aantal dagen. Gebruik `days` als eindwaarde.' },
          ],
          hints: ['Begin met `local total = 0` vóór de lus.', 'In de lus: `total += day * 5`'],
          solution: 'local days = 4\nlocal total = 0\nfor day = 1, days do\n    total += day * 5\nend\nprint(total)',
          concepts: ['loops', 'operators'],
          success: 'Getest met 1, 4 en 10 dagen. Dit is precies hoe een daily-reward-systeem rekent.',
        },
      ],
      summary: ['Een derde getal is de stapgrootte; `-1` telt af.', 'Totaal bijhouden: variabele vóór de lus maken, ín de lus ophogen.', 'Code na `end` draait één keer, na de hele lus.'],
    },

    // ------------------------------------------------------------------ 3
    {
      id: 'c3-while',
      courseId: 'course-3',
      title: 'while en repeat',
      objective: 'Je kunt herhalen zolang een voorwaarde waar is, en weet hoe je een oneindige lus voorkomt.',
      minutes: 11,
      prerequisites: ['loops', 'conditions'],
      concepts: ['while-loops'],
      steps: [
        {
          type: 'explain',
          body: `Een for-lus weet vooraf hoe vaak hij draait. Soms weet je dat niet. Dan gebruik je een **while-lus**: "herhaal **zolang** iets waar is".

\`while voorwaarde do ... end\`

Belangrijk: binnen de lus moet iets veranderen waardoor de voorwaarde ooit \`false\` wordt. Anders stopt de lus **nooit**. Dat heet een **oneindige lus**, en in Roblox laat die je game vastlopen.`,
        },
        {
          type: 'code',
          code: 'local health = 100\nlocal hits = 0\nwhile health > 0 do\n    health -= 30\n    hits += 1\nend\nprint(`Na {hits} treffers is health {health}`)',
          runnable: true,
          after: 'Elke ronde daalt health. Na 4 treffers is health -20; dan is `health > 0` false en stopt de lus.',
        },
        {
          type: 'code',
          title: 'Wat gebeurt er bij een oneindige lus?',
          body: 'Deze lus verandert `coins` nooit. Run hem: de Academy stopt hem na een paar seconden en legt uit wat er misging.',
          code: 'local coins = 0\nwhile coins < 10 do\n    print("Bijna...")\nend',
          runnable: true,
          after: 'In Roblox Studio zou dit je game laten vastlopen (fout). Elke while-lus moet iets veranderen dat de voorwaarde beïnvloedt.',
        },
        {
          type: 'explain',
          title: 'repeat ... until',
          body: `\`repeat ... until voorwaarde\` lijkt op while, met twee verschillen:
- de code draait **altijd minstens één keer**
- hij stopt **zodra** de voorwaarde waar is (bij while is het andersom: doorgaan zolang hij waar is)`,
        },
        {
          type: 'code',
          code: 'local tries = 0\nrepeat\n    tries += 1\n    print("Poging " .. tries)\nuntil tries >= 3',
          runnable: true,
        },
        {
          type: 'exercise',
          id: 'c3-while-ex1',
          mode: 'guided',
          kind: 'fix-bug',
          title: 'Repareer de oneindige lus',
          prompt: 'Deze lus stopt nooit. Run hem en voeg **één regel** toe, zodat hij **3, 2, 1** laat zien en dan stopt.',
          starter: 'local count = 3\nwhile count > 0 do\n    print(count)\nend',
          checks: [{ kind: 'output', lines: ['3', '2', '1'], message: 'De output moet 3, 2, 1 zijn.' }],
          hints: ['Wat moet er elke ronde met `count` gebeuren zodat `count > 0` ooit false wordt?', 'Voeg `count -= 1` toe binnen de lus.'],
          solution: 'local count = 3\nwhile count > 0 do\n    print(count)\n    count -= 1\nend',
          concepts: ['while-loops'],
          success: 'Opgelost. Controleer bij elke while-lus: wat zorgt ervoor dat hij stopt?',
        },
        {
          type: 'exercise',
          id: 'c3-while-ex2',
          mode: 'independent',
          title: 'Sparen voor een zwaard',
          prompt: 'Een speler heeft `coins` en verdient **15 coins per ronde**. Gebruik een while-lus om uit te rekenen hoeveel rondes (`rounds`) hij moet spelen tot hij minstens `price` coins heeft. Print `rounds`.',
          starter: 'local coins = 20\nlocal price = 100\nlocal rounds = 0\n',
          checks: [
            { kind: 'uses', sequence: ['while'], message: 'Gebruik een `while`-lus.' },
            { kind: 'value', expr: 'rounds', equals: 6, message: 'Met 20 coins en prijs 100 zijn het 6 rondes (20 → 35 → 50 → 65 → 80 → 95 → 110).' },
            { kind: 'variants', replace: 'local coins = 20', cases: [{ with: 'local coins = 100', lines: ['0'] }, { with: 'local coins = 99', lines: ['1'] }], message: 'Je antwoord klopt niet voor elk startbedrag. Heeft de speler al genoeg, dan zijn het 0 rondes.' },
          ],
          hints: ['Herhaal zolang `coins < price`.', 'In de lus: `coins += 15` en `rounds += 1`.'],
          solution: 'local coins = 20\nlocal price = 100\nlocal rounds = 0\nwhile coins < price do\n    coins += 15\n    rounds += 1\nend\nprint(rounds)',
          concepts: ['while-loops'],
          success: 'Klopt voor 20, 99 en 100 coins.',
        },
      ],
      summary: ['`while voorwaarde do ... end` herhaalt zolang de voorwaarde waar is.', '`repeat ... until voorwaarde` draait minstens één keer en stopt als de voorwaarde waar wordt.', 'Zorg altijd dat er in de lus iets verandert, anders loopt hij oneindig.'],
    },

    // ------------------------------------------------------------------ 4
    {
      id: 'c3-break-continue',
      courseId: 'course-3',
      title: 'break en continue',
      objective: 'Je kunt een lus vroegtijdig stoppen met break en een ronde overslaan met continue.',
      minutes: 8,
      prerequisites: ['loops', 'conditions'],
      concepts: ['loops'],
      steps: [
        {
          type: 'explain',
          body: `Twee handige woorden binnen lussen:
- \`break\` stopt de hele lus **meteen**. De code na de lus gaat verder.
- \`continue\` slaat **de rest van deze ronde** over en gaat door met de volgende ronde.

Je gebruikt ze bijna altijd binnen een if-statement.`,
        },
        {
          type: 'code',
          code: 'for i = 1, 10 do\n    if i == 4 then\n        break\n    end\n    print(i)\nend\nprint("Lus gestopt")',
          runnable: true,
          after: 'Bij i = 4 stopt de lus helemaal: je ziet 1, 2, 3.',
        },
        {
          type: 'predict',
          id: 'c3-continue-p1',
          question: 'Wat laat deze code zien?',
          code: 'for i = 1, 5 do\n    if i == 3 then\n        continue\n    end\n    print(i)\nend',
          concepts: ['loops'],
          options: [
            { text: '1 2', feedback: 'Dat zou bij `break` zo zijn. `continue` slaat alleen deze ronde over.' },
            { text: '1 2 4 5', correct: true, feedback: 'Juist. Ronde 3 wordt overgeslagen, daarna gaat de lus gewoon verder.' },
            { text: '3', feedback: 'Bij i = 3 wordt juist de print overgeslagen.' },
          ],
        },
        {
          type: 'exercise',
          id: 'c3-break-ex1',
          mode: 'independent',
          title: 'Eerste vrije plek',
          prompt: 'Een server heeft plekken 1 tot en met 10. Plekken tot en met `taken` zijn bezet. Zoek met een for-lus en `break` de eerste vrije plek en print **Vrije plek:** gevolgd door het nummer, bijvoorbeeld **Vrije plek: 4**.',
          starter: 'local taken = 3\n',
          checks: [
            { kind: 'uses', sequence: ['break'], message: 'Gebruik `break` zodra je een vrije plek gevonden hebt.' },
            { kind: 'output', lines: ['Vrije plek: 4'], message: 'Met 3 bezette plekken is plek 4 de eerste vrije.' },
            { kind: 'variants', replace: 'local taken = 3', cases: [{ with: 'local taken = 0', lines: ['Vrije plek: 1'] }, { with: 'local taken = 8', lines: ['Vrije plek: 9'] }], message: 'Je code vindt niet voor elke situatie de juiste plek.' },
          ],
          hints: ['Loop van 1 tot 10. Een plek is vrij als het nummer groter is dan `taken`.', 'Print het nummer en zet daarna direct `break`.'],
          solution: 'local taken = 3\nfor spot = 1, 10 do\n    if spot > taken then\n        print("Vrije plek: " .. spot)\n        break\n    end\nend',
          concepts: ['loops', 'conditions'],
          success: 'Zonder break zou je alle vrije plekken printen. Met break stop je bij de eerste.',
        },
        {
          type: 'exercise',
          id: 'c3-continue-ex1',
          mode: 'independent',
          title: 'Alleen even levels',
          prompt: 'Print de levels 1 tot en met 10, maar sla de **oneven** levels over met `continue`. (Een getal is oneven als `level % 2 == 1`.)',
          starter: '',
          checks: [
            { kind: 'uses', sequence: ['continue'], message: 'Gebruik `continue` om oneven levels over te slaan.' },
            { kind: 'output', lines: ['2', '4', '6', '8', '10'], message: 'De output moet 2, 4, 6, 8, 10 zijn.' },
          ],
          hints: ['if level % 2 == 1 then continue end'],
          solution: 'for level = 1, 10 do\n    if level % 2 == 1 then\n        continue\n    end\n    print(level)\nend',
          concepts: ['loops'],
          success: 'Goed. `continue` is een Luau-extra; in gewoon Lua bestaat het niet.',
        },
      ],
      summary: ['`break` stopt de hele lus.', '`continue` slaat de rest van deze ronde over.', 'Gebruik ze binnen een if-statement in de lus.'],
    },

    // ------------------------------------------------------------------ 5
    {
      id: 'c3-nested',
      courseId: 'course-3',
      title: 'Lussen in lussen',
      objective: 'Je begrijpt geneste lussen en kunt er een raster mee maken.',
      minutes: 8,
      prerequisites: ['loops'],
      concepts: ['loops'],
      steps: [
        {
          type: 'explain',
          body: `Een lus binnen een andere lus heet een **geneste lus**. Voor **elke** ronde van de buitenste lus draait de binnenste lus helemaal.

In Roblox gebruik je dit bijvoorbeeld om een raster van tegels te bouwen: rijen × kolommen.

Gebruik verschillende namen voor de tellers, zoals \`row\` en \`col\`, anders raak je in de war.`,
        },
        {
          type: 'code',
          code: 'for row = 1, 2 do\n    for col = 1, 3 do\n        print(`Tegel {row}-{col}`)\n    end\nend',
          runnable: true,
          after: '2 rijen × 3 kolommen = 6 tegels.',
        },
        {
          type: 'predict',
          id: 'c3-nested-p1',
          question: 'Hoe vaak wordt "x" geprint?',
          code: 'for a = 1, 4 do\n    for b = 1, 5 do\n        print("x")\n    end\nend',
          concepts: ['loops'],
          options: [
            { text: '9', feedback: 'Niet optellen: voor elke a draait de hele b-lus.' },
            { text: '20', correct: true, feedback: 'Juist: 4 × 5 = 20.' },
            { text: '5', feedback: 'De binnenste lus draait 4 keer helemaal.' },
          ],
        },
        {
          type: 'exercise',
          id: 'c3-nested-ex1',
          mode: 'independent',
          title: 'Bouw een raster',
          prompt: 'Maak met geneste lussen een raster van `rows` rijen en `cols` kolommen. Print per rij **één regel** met een `#` per kolom. Met 2 rijen en 4 kolommen:\n**####**\n**####**',
          starter: 'local rows = 2\nlocal cols = 4\n',
          checks: [
            { kind: 'output', lines: ['####', '####'], message: 'Met 2 rijen en 4 kolommen: twee regels met elk ####.' },
            { kind: 'variants', replace: 'local cols = 4', cases: [{ with: 'local cols = 1', lines: ['#', '#'] }], message: 'Je raster gebruikt `cols` nog niet goed.' },
            { kind: 'variants', replace: 'local rows = 2', cases: [{ with: 'local rows = 3', lines: ['####', '####', '####'] }], message: 'Je raster gebruikt `rows` nog niet goed.' },
          ],
          hints: ['Maak in de buitenste lus een lege tekst: `local line = ""`', 'In de binnenste lus: `line ..= "#"`. Print `line` na de binnenste lus.'],
          solution: 'local rows = 2\nlocal cols = 4\nfor row = 1, rows do\n    local line = ""\n    for col = 1, cols do\n        line ..= "#"\n    end\n    print(line)\nend',
          concepts: ['loops', 'concatenation'],
          success: 'Zo bouw je straks ook echte rasters van Parts in Roblox.',
        },
      ],
      summary: ['Een geneste lus draait volledig voor elke ronde van de buitenste lus.', 'Totaal aantal rondes = buiten × binnen.', 'Gebruik duidelijke, verschillende tellernamen.'],
    },

    // ------------------------------------------------------------------ 6 project
    {
      id: 'c3-project-countdown',
      courseId: 'course-3',
      title: 'Project: ronde-aftelklok',
      objective: 'Je bouwt de aftellogica voor een ronde in een minigame.',
      minutes: 14,
      prerequisites: ['loops', 'conditions', 'interpolation'],
      concepts: ['loops', 'conditions'],
      steps: [
        {
          type: 'explain',
          body: `In een ronde-gebaseerde game zie je vaak: "Ronde begint over 5... 4... 3...". In Roblox wacht je tussen elke stap één seconde met \`task.wait(1)\`.

**Let op:** in de speeltuin van deze app wacht \`task.wait\` niet echt; de code loopt meteen door. In Roblox Studio wacht hij wel. De logica is precies hetzelfde.`,
        },
        {
          type: 'exercise',
          id: 'c3-project-ex1',
          mode: 'independent',
          title: 'De aftelklok',
          prompt: 'Tel af van `seconds` naar 1. Gebruik `task.wait(1)` in de lus.\n- Print bij elke seconde **Ronde begint over X**\n- Maar bij de laatste 3 seconden (3, 2, 1) print je alleen het getal, zoals **3**\n- Print daarna **GO!**',
          starter: 'local seconds = 5\n',
          checks: [
            { kind: 'uses', sequence: ['task', '.', 'wait', '('], message: 'Gebruik `task.wait(1)` in de lus, zoals in Roblox.' },
            { kind: 'output', lines: ['Ronde begint over 5', 'Ronde begint over 4', '3', '2', '1', 'GO!'], message: 'Met 5 seconden: twee keer "Ronde begint over X", dan 3, 2, 1 en GO!' },
            { kind: 'variants', replace: 'local seconds = 5', cases: [{ with: 'local seconds = 2', lines: ['2', '1', 'GO!'] }, { with: 'local seconds = 4', lines: ['Ronde begint over 4', '3', '2', '1', 'GO!'] }], message: 'Je aftelklok klopt niet voor elk aantal seconden.' },
          ],
          hints: ['for i = seconds, 1, -1 do', 'Binnen de lus: if i > 3 then ... else ... end', 'Print GO! na de lus.'],
          solution: 'local seconds = 5\nfor i = seconds, 1, -1 do\n    if i > 3 then\n        print(`Ronde begint over {i}`)\n    else\n        print(i)\n    end\n    task.wait(1)\nend\nprint("GO!")',
          concepts: ['loops', 'conditions'],
          success: 'Je aftelklok werkt voor 2, 4 en 5 seconden. In Studio wacht hij echt één seconde per stap.',
        },
        {
          type: 'studio',
          title: 'Probeer het in Roblox Studio',
          steps: [
            { text: 'Zet een **Script** in **ServerScriptService**.' },
            { text: 'Plak of typ je aftelcode erin.' },
            { text: 'Klik op **Play** en kijk in de **Output**: nu verschijnt elke regel één seconde na de vorige.' },
          ],
          expected: 'Je ziet de aftelling seconde voor seconde in de Output, eindigend met GO!',
        },
      ],
      summary: ['Je combineerde een aftellende for-lus met if/else.', '`task.wait()` laat een script in Roblox wachten; in de speeltuin is het gesimuleerd.', 'Volgende cursus: je eigen functies maken.'],
    },
  ],
};
