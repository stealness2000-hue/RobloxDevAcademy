import type { Course } from './types';

export const course1: Course = {
  id: 'course-1',
  number: 1,
  title: 'Luau-fundamenten',
  description: 'Variabelen, getallen, tekst, true/false en nil. De bouwstenen van elk Roblox-script.',
  level: 'Beginner',
  planned: [],
  lessons: [
    // ------------------------------------------------------------------ 1
    {
      id: 'c1-variables',
      courseId: 'course-1',
      title: 'Wat is een variabele?',
      objective: 'Je kunt met local een variabele maken, een waarde opslaan en die later gebruiken.',
      minutes: 10,
      prerequisites: ['print', 'strings'],
      concepts: ['variables'],
      steps: [
        {
          type: 'explain',
          body: `Een **variabele** is een soort doosje waarin je informatie bewaart. Het doosje heeft een **naam**, en erin zit een **waarde**.

In een game bewaar je zo bijvoorbeeld hoeveel coins een speler heeft, hoe snel hij loopt of hoe zijn level heet. Later kun je die waarde gebruiken of veranderen.`,
        },
        {
          type: 'code',
          title: 'Een variabele maken',
          body: 'Klik op de onderdelen om te zien wat ze betekenen.',
          code: 'local coins = 100',
          annotations: [
            { token: 'local', text: '`local` betekent: maak een **nieuwe** variabele. Het woord zegt ook dat de variabele alleen in dit deel van je code bestaat; dat leer je later precies.' },
            { token: 'coins', text: '`coins` is de **naam** van de variabele. Die kies je zelf. Kies een naam die zegt wat erin zit.' },
            { token: '=', text: 'Het `=`-teken betekent hier **"krijgt de waarde"**. Het is geen vraag of iets gelijk is, maar een opdracht: stop deze waarde in het doosje.' },
            { token: '100', text: '`100` is de **waarde** die wordt opgeslagen: een getal.' },
          ],
        },
        {
          type: 'visual',
          kind: 'variable',
          title: 'Kijk in de doosjes',
          body: 'Verander de waarden in de code hieronder (bijvoorbeeld 100 naar 200) en zie de doosjes veranderen.',
          code: 'local coins = 100\nlocal playerName = "Builder"',
        },
        {
          type: 'code',
          title: 'Een variabele gebruiken',
          body: 'Als je de naam van een variabele gebruikt, zonder aanhalingstekens, krijg je de waarde die erin zit.',
          code: 'local coins = 100\nprint(coins)\nprint("coins")',
          runnable: true,
          after: 'Regel 2 laat `100` zien: de waarde in het doosje. Regel 3 laat het woord `coins` zien, want met aanhalingstekens is het gewoon tekst.',
        },
        {
          type: 'exercise',
          id: 'c1-variables-ex1',
          mode: 'guided',
          title: 'Maak je eerste variabele',
          prompt: 'Maak zelf een variabele genaamd **score** met de waarde **50**.',
          starter: '',
          checks: [
            { kind: 'uses', sequence: ['local', 'score'], message: 'Begin met `local`, gevolgd door de naam `score`.' },
            { kind: 'uses', sequence: ['score', '='], message: 'Gebruik `=` om de variabele een waarde te geven.' },
            { kind: 'value', expr: 'score', equals: 50, message: 'De variabele `score` bestaat, maar de waarde is nog niet 50.' },
          ],
          hints: ['Kijk naar het voorbeeld `local coins = 100`. Wat moet je veranderen?', 'De vorm is: `local naam = waarde`'],
          solution: 'local score = 50',
          concepts: ['variables'],
          success: 'Je eerste variabele. In vrijwel elk Roblox-script gebruik je er tientallen.',
        },
        {
          type: 'exercise',
          id: 'c1-variables-ex2',
          mode: 'independent',
          title: 'Opslaan en laten zien',
          prompt: 'Maak een variabele **playerName** met de tekst **Builder** erin. Laat daarna met `print` de **waarde** van die variabele zien.',
          starter: '',
          checks: [
            { kind: 'uses', sequence: ['local', 'playerName', '='], message: 'Maak de variabele met `local playerName = ...`' },
            { kind: 'value', expr: 'playerName', equals: 'Builder', message: '`playerName` moet de tekst "Builder" bevatten. Vergeet de aanhalingstekens niet.' },
            { kind: 'uses', sequence: ['print', '(', 'playerName', ')'], message: 'Laat de variabele zien met `print(playerName)`, zonder aanhalingstekens om de naam.' },
            { kind: 'output', lines: ['Builder'], message: 'De Output moet **Builder** zijn.' },
          ],
          hints: ['Tekst als waarde zet je tussen aanhalingstekens; de naam van de variabele niet.', 'Twee regels: eerst de variabele maken, dan printen.'],
          solution: 'local playerName = "Builder"\nprint(playerName)',
          concepts: ['variables', 'strings'],
          success: 'Precies: je bewaarde informatie en gebruikte het later.',
        },
        {
          type: 'code',
          title: 'Een waarde veranderen',
          body: 'Een variabele kun je later een nieuwe waarde geven. Dan schrijf je `local` **niet** opnieuw: de variabele bestaat al.',
          code: 'local coins = 100\ncoins = 150\nprint(coins)',
          runnable: true,
          after: 'Na regel 2 zit er `150` in `coins`. De oude waarde is weg.',
        },
        {
          type: 'predict',
          id: 'c1-variables-p1',
          question: 'Wat laat deze code zien?',
          code: 'local level = 1\nlevel = 2\nlevel = 3\nprint(level)',
          concepts: ['variables'],
          options: [
            { text: '1', feedback: 'Dat was de eerste waarde, maar daarna kreeg `level` twee keer een nieuwe waarde.' },
            { text: '3', correct: true, feedback: 'Juist. Elke nieuwe toewijzing vervangt de oude waarde; de laatste was 3.' },
            { text: '1 2 3', feedback: 'Een variabele bewaart maar één waarde tegelijk.' },
          ],
        },
      ],
      summary: ['Een variabele is een doosje met een naam en een waarde.', '`local naam = waarde` maakt een nieuwe variabele.', '`=` betekent "krijgt de waarde".', 'Een nieuwe waarde geven doe je zonder `local`: `coins = 150`.'],
    },

    // ------------------------------------------------------------------ 2
    {
      id: 'c1-numbers',
      courseId: 'course-1',
      title: 'Getallen en rekenen',
      objective: 'Je kunt rekenen met + - * / en %, en waarden in variabelen bijwerken.',
      minutes: 10,
      prerequisites: ['variables'],
      concepts: ['numbers', 'operators'],
      steps: [
        {
          type: 'explain',
          body: `Getallen (in het Engels **numbers**) schrijf je zonder aanhalingstekens. Ze mogen een komma-getal zijn, maar dan met een **punt**: \`1.5\`.

Rekentekens heten **operators**:
- \`+\` optellen en \`-\` aftrekken
- \`*\` vermenigvuldigen (geen x!)
- \`/\` delen
- \`%\` de **rest** na delen: \`10 % 3\` is \`1\`
- \`^\` machtsverheffen: \`2 ^ 3\` is \`8\`

Net als op school gaat \`*\` en \`/\` vóór \`+\` en \`-\`. Met haakjes bepaal je zelf de volgorde.`,
        },
        {
          type: 'code',
          code: 'local coins = 100\nlocal prijs = 30\nprint(coins - prijs)\nprint(2 + 3 * 4)\nprint((2 + 3) * 4)\nprint(10 % 3)',
          runnable: true,
          after: 'Je ziet 70, 14, 20 en 1. Let op regel 4 en 5: de haakjes veranderen de uitkomst.',
        },
        {
          type: 'explain',
          title: 'Bijwerken met += en -=',
          body: `In games verander je vaak een waarde op basis van zichzelf: "geef 10 coins erbij".

De lange vorm is \`coins = coins + 10\`: neem de huidige waarde, tel 10 op, en bewaar het resultaat weer in \`coins\`.

Luau heeft een kortere vorm: \`coins += 10\`. Er bestaan ook \`-=\`, \`*=\` en \`/=\`.`,
        },
        {
          type: 'predict',
          id: 'c1-numbers-p1',
          question: 'Wat laat deze code zien?',
          code: 'local health = 100\nhealth -= 25\nhealth -= 25\nprint(health)',
          concepts: ['operators'],
          options: [
            { text: '75', feedback: 'Er wordt twee keer 25 afgetrokken.' },
            { text: '50', correct: true, feedback: 'Juist: 100 - 25 - 25 = 50.' },
            { text: '-25', feedback: '`-=` trekt iets af van de huidige waarde; het vervangt de waarde niet door -25.' },
          ],
        },
        {
          type: 'exercise',
          id: 'c1-numbers-ex1',
          mode: 'guided',
          title: 'Coins verdienen',
          prompt: 'Een speler heeft 40 coins en verzamelt **3 munten van 15 coins**. Laat de code `coins` met de juiste berekening bijwerken, zodat de Output **85** is.',
          starter: 'local coins = 40\n-- werk coins hier bij\n\nprint(coins)',
          checks: [
            { kind: 'output', lines: ['85'], message: 'De Output moet **85** zijn. Hoeveel is 3 munten van 15 samen?' },
            { kind: 'notUses', sequence: ['local', 'coins', '=', '85'], message: 'Laat Luau het rekenwerk doen in plaats van het antwoord zelf in te typen.' },
          ],
          hints: ['3 munten van 15 is `3 * 15`.', 'Gebruik `coins += 3 * 15` op regel 2.'],
          solution: 'local coins = 40\ncoins += 3 * 15\n\nprint(coins)',
          concepts: ['operators', 'numbers'],
          success: 'Goed. Zo werkt bijna elk beloningssysteem in Roblox-games.',
        },
        {
          type: 'exercise',
          id: 'c1-numbers-ex2',
          mode: 'independent',
          title: 'Hoeveel kun je kopen?',
          prompt: 'Een zwaard kost **25** coins. De speler heeft **110** coins.\nMaak variabelen `coins` en `price`, en een variabele `rest` die uitrekent hoeveel coins er overblijven na het kopen van zoveel mogelijk zwaarden. Gebruik `%`.',
          starter: '',
          checks: [
            { kind: 'value', expr: 'coins', equals: 110, message: 'Maak een variabele `coins` met de waarde 110.' },
            { kind: 'value', expr: 'price', equals: 25, message: 'Maak een variabele `price` met de waarde 25.' },
            { kind: 'uses', sequence: ['%'], message: 'Gebruik de rest-operator `%`.' },
            { kind: 'value', expr: 'rest', equals: 10, message: '`rest` klopt nog niet. Wat blijft er over als je 110 door 25 deelt?' },
          ],
          hints: ['De rest na delen schrijf je als `a % b`.', '`local rest = coins % price`'],
          solution: 'local coins = 110\nlocal price = 25\nlocal rest = coins % price\nprint(rest)',
          concepts: ['operators', 'variables'],
          success: 'Precies: na 4 zwaarden blijven er 10 coins over.',
        },
      ],
      summary: ['Getallen schrijf je zonder aanhalingstekens; decimalen met een punt.', '+ - * / % ^ zijn de rekenoperators.', '`coins += 10` is kort voor `coins = coins + 10`.'],
    },

    // ------------------------------------------------------------------ 3
    {
      id: 'c1-concat',
      courseId: 'course-1',
      title: 'Tekst aan elkaar plakken',
      objective: 'Je kunt tekst en waarden combineren met .. en weet wanneer je tostring nodig hebt.',
      minutes: 8,
      prerequisites: ['variables', 'strings'],
      concepts: ['concatenation'],
      steps: [
        {
          type: 'explain',
          body: `Met twee puntjes \`..\` plak je tekst aan elkaar. Programmeurs noemen dat **concatenation**.

\`"Hallo " .. "wereld"\` wordt \`"Hallo wereld"\`. Let op: \`..\` voegt **geen** spatie toe. Die moet je zelf in de tekst zetten.

Getallen worden automatisch tekst als je ze plakt: \`"Coins: " .. 100\` wordt \`"Coins: 100"\`.`,
        },
        {
          type: 'code',
          code: 'local naam = "Builder"\nlocal coins = 250\nprint("Welkom, " .. naam .. "!")\nprint(naam .. " heeft " .. coins .. " coins")',
          runnable: true,
        },
        {
          type: 'predict',
          id: 'c1-concat-p1',
          question: 'Wat laat deze code zien?',
          code: 'print("Level" .. 5)',
          concepts: ['concatenation'],
          options: [
            { text: 'Level 5', feedback: 'Kijk goed: `..` voegt geen spatie toe.' },
            { text: 'Level5', correct: true, feedback: 'Juist. Zonder spatie in de tekst plakt `..` alles direct aan elkaar.' },
            { text: 'Een fout', feedback: 'Een getal plakken aan tekst mag. Luau maakt van 5 automatisch de tekst "5".' },
          ],
        },
        {
          type: 'exercise',
          id: 'c1-concat-ex1',
          mode: 'guided',
          kind: 'fix-bug',
          title: 'Plus of puntjes?',
          prompt: 'Deze code probeert tekst te plakken met `+`. Dat werkt niet in Luau. Klik op **Run Code**, lees de uitleg en repareer de code zodat de Output **Speler: Nova** is.',
          starter: 'local naam = "Nova"\nprint("Speler: " + naam)',
          checks: [
            { kind: 'output', lines: ['Speler: Nova'], message: 'De Output moet **Speler: Nova** zijn.' },
            { kind: 'uses', sequence: ['..'], message: 'Gebruik `..` om tekst aan elkaar te plakken.' },
          ],
          hints: ['In Luau is `+` alleen voor rekenen. Voor tekst gebruik je een ander teken.', 'Vervang `+` door `..`'],
          solution: 'local naam = "Nova"\nprint("Speler: " .. naam)',
          concepts: ['concatenation'],
          success: 'Opgelost. In sommige andere talen werkt + voor tekst, in Luau is het altijd `..`.',
        },
        {
          type: 'exercise',
          id: 'c1-concat-ex2',
          mode: 'independent',
          title: 'Een welkomstbericht',
          prompt: 'Maak variabelen `playerName` (**"Kai"**) en `wins` (**7**). Print met `..` precies: **Kai heeft 7 overwinningen**',
          starter: '',
          checks: [
            { kind: 'value', expr: 'playerName', equals: 'Kai', message: '`playerName` moet "Kai" zijn.' },
            { kind: 'value', expr: 'wins', equals: 7, message: '`wins` moet het getal 7 zijn (zonder aanhalingstekens).' },
            { kind: 'uses', sequence: ['..'], message: 'Plak de tekst aan elkaar met `..`' },
            { kind: 'output', lines: ['Kai heeft 7 overwinningen'], message: 'De Output moet precies **Kai heeft 7 overwinningen** zijn. Let op de spaties.' },
          ],
          hints: ['Je hebt drie stukken: de naam, de tekst " heeft ", en `wins` met " overwinningen" erachter.', '`playerName .. " heeft " .. wins .. " overwinningen"`'],
          solution: 'local playerName = "Kai"\nlocal wins = 7\nprint(playerName .. " heeft " .. wins .. " overwinningen")',
          concepts: ['concatenation', 'variables'],
          success: 'Mooi. Dit soort berichten maak je straks voor je eigen interface.',
        },
      ],
      summary: ['`..` plakt tekst aan elkaar, zonder automatische spatie.', 'Getallen worden automatisch tekst bij `..`.', '`+` is alleen voor rekenen, niet voor tekst.'],
    },

    // ------------------------------------------------------------------ 4
    {
      id: 'c1-interpolation',
      courseId: 'course-1',
      title: 'String interpolation',
      objective: 'Je kunt waarden in tekst zetten met backticks en {}.',
      minutes: 6,
      prerequisites: ['concatenation'],
      concepts: ['interpolation'],
      steps: [
        {
          type: 'explain',
          body: `Veel \`..\` achter elkaar wordt snel onoverzichtelijk. Luau heeft daarom **string interpolation**: tekst tussen **backticks** (het teken \` ) waarin je waarden tussen \`{ }\` zet.

De backtick vind je meestal links bovenaan je toetsenbord, onder Esc.`,
        },
        {
          type: 'code',
          code: 'local naam = "Kai"\nlocal wins = 7\nprint(`{naam} heeft {wins} overwinningen`)\nprint(`Over 3 rondes heeft {naam} er {wins + 3}`)',
          runnable: true,
          after: 'Tussen `{ }` mag zelfs een berekening staan, zoals `{wins + 3}`.',
        },
        {
          type: 'exercise',
          id: 'c1-interp-ex1',
          mode: 'independent',
          title: 'Herschrijf met interpolation',
          prompt: 'Herschrijf de `print` zodat hij **backticks en { }** gebruikt in plaats van `..`. De Output moet hetzelfde blijven.',
          starter: 'local item = "Zwaard"\nlocal prijs = 250\nprint("Een " .. item .. " kost " .. prijs .. " coins")',
          checks: [
            { kind: 'output', lines: ['Een Zwaard kost 250 coins'], message: 'De Output moet **Een Zwaard kost 250 coins** blijven.' },
            { kind: 'notUses', sequence: ['..'], message: 'Gebruik geen `..` meer: zet de waarden tussen `{ }` in een tekst met backticks.' },
            { kind: 'stringLiteral', contains: '{item}', message: 'Zet `{item}` in je tekst tussen backticks.' },
          ],
          hints: ['Begin en eindig je tekst met een backtick ` in plaats van een "', 'print(`Een {item} kost ... coins`)'],
          solution: 'local item = "Zwaard"\nlocal prijs = 250\nprint(`Een {item} kost {prijs} coins`)',
          concepts: ['interpolation'],
          success: 'Leesbaarder, toch? De meeste moderne Roblox-code gebruikt deze vorm.',
        },
      ],
      summary: ['Tekst tussen backticks ` mag waarden bevatten tussen { }.', 'Tussen { } mag ook een berekening.', 'Interpolation is vaak leesbaarder dan veel `..`.'],
    },

    // ------------------------------------------------------------------ 5
    {
      id: 'c1-booleans-nil',
      courseId: 'course-1',
      title: 'true, false en nil',
      objective: 'Je kent booleans en nil, en herkent de fout als je met nil rekent.',
      minutes: 8,
      prerequisites: ['variables', 'numbers'],
      concepts: ['booleans', 'nil'],
      steps: [
        {
          type: 'explain',
          body: `Een **boolean** heeft maar twee mogelijke waarden: \`true\` (waar) of \`false\` (niet waar). Ideaal voor ja/nee-vragen in een game: is de deur open? Heeft de speler de sleutel?

\`nil\` betekent **"niets"** of "geen waarde". Een variabele die nooit een waarde kreeg, is \`nil\`. Ook een tikfout in een naam geeft \`nil\`, want die naam bestaat niet.

Let op: \`true\`, \`false\` en \`nil\` schrijf je **zonder** aanhalingstekens. \`"true"\` is gewoon tekst.`,
        },
        {
          type: 'code',
          code: 'local deurOpen = false\nlocal heeftSleutel = true\nlocal bonus\nprint(deurOpen, heeftSleutel, bonus)',
          runnable: true,
          after: '`bonus` kreeg geen waarde, dus print toont `nil`.',
        },
        {
          type: 'exercise',
          id: 'c1-nil-ex1',
          mode: 'guided',
          kind: 'fix-bug',
          title: 'Rekenen met niets',
          prompt: 'Deze code geeft een fout. Klik op **Run Code** en lees de uitleg. Repareer de code zodat de Output **110** is.',
          starter: 'local coins = 100\nlocal beloning = 10\nprint(coins + belonig)',
          checks: [{ kind: 'output', lines: ['110'], message: 'De Output moet **110** zijn.' }],
          hints: ['Welke variabele is `nil`? Vergelijk de namen letter voor letter.', 'Op regel 3 staat `belonig`; de variabele heet `beloning`.'],
          solution: 'local coins = 100\nlocal beloning = 10\nprint(coins + beloning)',
          concepts: ['nil', 'variables'],
          success: 'Gevonden. Een tikfout in een naam is de meest voorkomende oorzaak van nil-fouten.',
        },
        {
          type: 'exercise',
          id: 'c1-booleans-ex1',
          mode: 'independent',
          title: 'Spelstatus',
          prompt: 'Maak twee variabelen:\n- `isVip` met de waarde **true**\n- `isBanned` met de waarde **false**',
          starter: '',
          checks: [
            { kind: 'value', expr: 'isVip', equals: true, message: '`isVip` moet de boolean `true` zijn, zonder aanhalingstekens.' },
            { kind: 'value', expr: 'isBanned', equals: false, message: '`isBanned` moet de boolean `false` zijn, zonder aanhalingstekens.' },
          ],
          hints: ['Booleans schrijf je zonder aanhalingstekens: `true` of `false`.'],
          solution: 'local isVip = true\nlocal isBanned = false',
          concepts: ['booleans'],
          success: 'Goed. In de volgende cursus gebruik je zulke booleans om keuzes te maken met if.',
        },
      ],
      summary: ['Een boolean is `true` of `false`.', '`nil` betekent: geen waarde.', 'Rekenen met nil geeft een fout; vaak is een tikfout in een naam de oorzaak.'],
    },

    // ------------------------------------------------------------------ 6
    {
      id: 'c1-typeof',
      courseId: 'course-1',
      title: 'Soorten waarden en typeof()',
      objective: 'Je kunt met typeof() opvragen wat voor soort waarde iets is.',
      minutes: 6,
      prerequisites: ['booleans', 'nil', 'strings', 'numbers'],
      concepts: ['typeof'],
      steps: [
        {
          type: 'explain',
          body: `Elke waarde heeft een **soort** (programmeurs zeggen: een **type**):
- \`"Hallo"\` is een \`string\`
- \`42\` is een \`number\`
- \`true\` is een \`boolean\`
- \`nil\` is \`nil\`

Met \`typeof(waarde)\` vraag je het type op. Dat helpt bij het zoeken naar fouten: "is dit nu een getal of tekst?"`,
        },
        {
          type: 'code',
          code: 'print(typeof("Hallo"))\nprint(typeof(42))\nprint(typeof(true))\nprint(typeof(nil))\nprint(typeof("42"))',
          runnable: true,
          after: 'Let op de laatste: `"42"` is een string, ook al zijn het cijfers.',
        },
        {
          type: 'predict',
          id: 'c1-typeof-p1',
          question: 'Wat laat `print(typeof("false"))` zien?',
          code: 'print(typeof("false"))',
          concepts: ['typeof', 'booleans'],
          options: [
            { text: 'boolean', feedback: 'Kijk naar de aanhalingstekens rond false.' },
            { text: 'string', correct: true, feedback: 'Juist. Tussen aanhalingstekens is het tekst.' },
            { text: 'nil', feedback: 'nil is alleen als er helemaal geen waarde is.' },
          ],
        },
        {
          type: 'exercise',
          id: 'c1-typeof-ex1',
          mode: 'independent',
          title: 'Juiste types',
          prompt: 'Maak drie variabelen zodat:\n- `a` een **number** is\n- `b` een **string** is\n- `c` een **boolean** is\nDe waarden kies je zelf.',
          starter: '',
          checks: [
            { kind: 'value', expr: 'a', type: 'number', message: '`a` moet een getal zijn (zonder aanhalingstekens).' },
            { kind: 'value', expr: 'b', type: 'string', message: '`b` moet tekst zijn (met aanhalingstekens).' },
            { kind: 'value', expr: 'c', type: 'boolean', message: '`c` moet `true` of `false` zijn.' },
          ],
          hints: ['Bijvoorbeeld: een getal zoals 5, tekst zoals "hoi", en true of false.'],
          solution: 'local a = 5\nlocal b = "hoi"\nlocal c = true',
          concepts: ['typeof', 'variables'],
          success: 'Precies. Je kunt nu de vier basistypes herkennen én maken.',
        },
      ],
      summary: ['Waarden hebben een type: string, number, boolean of nil.', '`typeof(x)` geeft het type als tekst.', 'Cijfers tussen aanhalingstekens zijn een string.'],
    },

    // ------------------------------------------------------------------ 7
    {
      id: 'c1-naming-scope',
      courseId: 'course-1',
      title: 'Goede namen en scope',
      objective: 'Je kiest geldige, duidelijke namen en weet dat een local alleen binnen zijn blok bestaat.',
      minutes: 9,
      prerequisites: ['variables'],
      concepts: ['naming', 'variables'],
      steps: [
        {
          type: 'explain',
          title: 'Regels voor namen',
          body: `Een naam van een variabele:
- mag letters, cijfers en \`_\` bevatten
- mag **niet** met een cijfer beginnen (\`2coins\` mag niet)
- mag geen spaties bevatten
- is **hoofdlettergevoelig**: \`coins\` en \`Coins\` zijn twee verschillende variabelen
- mag geen woord zijn dat Luau zelf gebruikt, zoals \`local\`, \`end\` of \`if\`

In Roblox schrijf je namen meestal in **camelCase**: aan elkaar, elk nieuw woord met een hoofdletter: \`playerCoins\`, \`maxHealth\`.`,
        },
        {
          type: 'quiz',
          id: 'c1-naming-q1',
          question: 'Welke naam is geldig én duidelijk?',
          concepts: ['naming'],
          options: [
            { text: 'maxHealth', correct: true, feedback: 'Geldig, en je ziet meteen wat erin zit.' },
            { text: '2ndPlayer', feedback: 'Een naam mag niet met een cijfer beginnen.' },
            { text: 'max health', feedback: 'Spaties mogen niet in een naam.' },
            { text: 'x', feedback: 'Geldig, maar onduidelijk. Over een week weet je niet meer wat x betekende.' },
          ],
        },
        {
          type: 'explain',
          title: 'Scope: waar een variabele bestaat',
          body: `**Scope** betekent: het deel van je code waar een variabele bestaat.

Een \`local\`-variabele bestaat vanaf de regel waar je hem maakt, tot het einde van het **blok** waarin hij staat. Een blok begint bijvoorbeeld met \`do\` en eindigt met \`end\`. Later zie je dat \`if\`, lussen en functies ook blokken zijn.

Buiten het blok bestaat de variabele niet meer: hij is dan \`nil\`.`,
        },
        {
          type: 'code',
          code: 'local buiten = "zichtbaar"\ndo\n    local binnen = "alleen in het blok"\n    print(binnen)\n    print(buiten)\nend\nprint(binnen)',
          runnable: true,
          after: 'Regel 7 laat `nil` zien: `binnen` bestond alleen tussen `do` en `end`. `buiten` is ook in het blok zichtbaar.',
        },
        {
          type: 'exercise',
          id: 'c1-scope-ex1',
          mode: 'guided',
          kind: 'fix-bug',
          title: 'Hoofdletters tellen',
          prompt: 'De code laat `nil` zien in plaats van **Snelheid: 16**. Zoek het verschil en repareer het.',
          starter: 'local walkSpeed = 16\nprint("Snelheid: " .. tostring(WalkSpeed))',
          checks: [{ kind: 'output', lines: ['Snelheid: 16'], message: 'De Output moet **Snelheid: 16** zijn.' }],
          hints: ['Vergelijk de naam op regel 1 en op regel 2 heel precies, ook de hoofdletters.', '`walkSpeed` en `WalkSpeed` zijn verschillende namen.'],
          solution: 'local walkSpeed = 16\nprint("Snelheid: " .. tostring(walkSpeed))',
          concepts: ['naming'],
          success: 'Opgelost. De editor onderstreept zulke onbekende namen ook: let op de golvende lijntjes.',
        },
      ],
      summary: ['Namen: letters, cijfers en _, niet beginnen met een cijfer, geen spaties.', 'Luau is hoofdlettergevoelig.', 'Gebruik duidelijke namen in camelCase.', 'Een local bestaat alleen binnen het blok waarin je hem maakt.'],
    },

    // ------------------------------------------------------------------ 8
    {
      id: 'c1-warn-errors',
      courseId: 'course-1',
      title: 'warn() en foutmeldingen lezen',
      objective: 'Je gebruikt warn() en kunt een foutmelding lezen: wat, waar en waarom.',
      minutes: 8,
      prerequisites: ['print', 'variables'],
      concepts: ['warn'],
      steps: [
        {
          type: 'explain',
          body: `\`warn\` werkt als \`print\`, maar het bericht verschijnt in het **geel** in de Output. Je gebruikt het voor dingen die niet goed gaan, maar je game niet laten stoppen: "Let op: deze speler heeft geen data."

Een echte **fout** (error) is rood en stopt het script op die plek. Elke foutmelding vertelt je:
1. **waar**: welk script en welke regel
2. **wat**: een korte beschrijving van het probleem`,
        },
        {
          type: 'code',
          code: 'print("Data laden...")\nwarn("Geen opgeslagen data gevonden, nieuwe speler")\nprint("Klaar")',
          runnable: true,
          after: 'De waarschuwing is geel, en het script ging gewoon verder.',
        },
        {
          type: 'code',
          title: 'Een echte fout',
          code: 'print("Voor de fout")\nlocal coins = nil\nprint(coins + 10)\nprint("Deze regel wordt nooit bereikt")',
          runnable: true,
          after: 'De fout op regel 3 stopt het script. Daarom zie je de laatste regel niet. De Academy legt de fout onder de Output in gewone taal uit.',
        },
        {
          type: 'exercise',
          id: 'c1-errors-ex1',
          mode: 'guided',
          kind: 'fix-bug',
          title: 'Repareer twee fouten',
          prompt: 'Deze code heeft **twee** fouten. Run de code, repareer de eerste fout, run opnieuw, en repareer de tweede. Uiteindelijk is de Output:\n**Ronde 1**\n**Tijd: 60**',
          starter: 'print("Ronde 1"\nlocal tijd = 60\nprint("Tijd: " .. tjd)',
          checks: [{ kind: 'output', lines: ['Ronde 1', 'Tijd: 60'], message: 'De Output moet **Ronde 1** en daarna **Tijd: 60** zijn.' }],
          hints: ['Fout 1 zit op regel 1: tel de haakjes.', 'Fout 2 zit op regel 3: is de naam goed gespeld?'],
          solution: 'print("Ronde 1")\nlocal tijd = 60\nprint("Tijd: " .. tijd)',
          concepts: ['warn', 'naming'],
          success: 'Twee fouten opgelost. Zo debug je: één fout per keer, steeds opnieuw testen.',
        },
        {
          type: 'exercise',
          id: 'c1-warn-ex1',
          mode: 'independent',
          title: 'Een waarschuwing geven',
          prompt: 'Laat met `warn` het bericht **Inventaris is vol** zien.',
          starter: '',
          checks: [
            { kind: 'warns', message: 'Gebruik `warn(...)` in plaats van `print`.' },
            { kind: 'uses', sequence: ['warn', '('], message: 'Gebruik `warn( ... )`.' },
          ],
          hints: ['`warn` gebruik je precies zoals `print`.'],
          solution: 'warn("Inventaris is vol")',
          concepts: ['warn'],
          success: 'Goed. In de Output van Roblox Studio is dit bericht ook geel.',
        },
      ],
      summary: ['`warn()` toont een gele waarschuwing; het script gaat door.', 'Een error is rood en stopt het script op die regel.', 'Lees elke fout: waar (regel) en wat. Los één fout per keer op.'],
    },

    // ------------------------------------------------------------------ 9 project
    {
      id: 'c1-project-coins',
      courseId: 'course-1',
      title: 'Project: coin-calculator',
      objective: 'Je combineert alles uit deze cursus in een klein, zelfstandig programma.',
      minutes: 15,
      prerequisites: ['variables', 'operators', 'interpolation'],
      concepts: ['variables', 'operators', 'interpolation'],
      steps: [
        {
          type: 'explain',
          title: 'De opdracht',
          body: `In een simulator verdient een speler coins per klik, met een bonus voor VIP-spelers. Jij maakt de berekening.

Je bouwt het in drie stappen. Elke stap wordt apart gecontroleerd.`,
        },
        {
          type: 'exercise',
          id: 'c1-project-ex1',
          mode: 'independent',
          title: 'Stap 1: de gegevens',
          prompt: 'Maak deze variabelen:\n- `coinsPerClick` = **5**\n- `clicks` = **40**\n- `vipMultiplier` = **2**',
          starter: '-- Coin-calculator\n',
          checks: [
            { kind: 'value', expr: 'coinsPerClick', equals: 5, message: '`coinsPerClick` moet 5 zijn.' },
            { kind: 'value', expr: 'clicks', equals: 40, message: '`clicks` moet 40 zijn.' },
            { kind: 'value', expr: 'vipMultiplier', equals: 2, message: '`vipMultiplier` moet 2 zijn.' },
          ],
          hints: ['Drie regels, elk in de vorm `local naam = waarde`.'],
          solution: 'local coinsPerClick = 5\nlocal clicks = 40\nlocal vipMultiplier = 2',
          concepts: ['variables'],
          success: 'De gegevens staan klaar.',
        },
        {
          type: 'exercise',
          id: 'c1-project-ex2',
          mode: 'independent',
          title: 'Stap 2: de berekening',
          prompt: 'Ga verder met je code. Voeg toe:\n- `normalCoins`: coins per klik keer het aantal klikken\n- `vipCoins`: normalCoins keer de multiplier\nGebruik je **variabelen**, niet de getallen zelf.',
          starter: 'local coinsPerClick = 5\nlocal clicks = 40\nlocal vipMultiplier = 2\n',
          checks: [
            { kind: 'value', expr: 'normalCoins', equals: 200, message: '`normalCoins` klopt nog niet: 5 coins × 40 klikken.' },
            { kind: 'value', expr: 'vipCoins', equals: 400, message: '`vipCoins` klopt nog niet: normalCoins × de multiplier.' },
            { kind: 'uses', sequence: ['coinsPerClick', '*', 'clicks'], message: 'Reken `normalCoins` uit met de variabelen: `coinsPerClick * clicks`.' },
            { kind: 'uses', sequence: ['*', 'vipMultiplier'], message: 'Gebruik de variabele `vipMultiplier` in je berekening van `vipCoins`.' },
          ],
          hints: ['Vermenigvuldigen doe je met `*`.', '`local normalCoins = coinsPerClick * clicks`'],
          solution: 'local coinsPerClick = 5\nlocal clicks = 40\nlocal vipMultiplier = 2\nlocal normalCoins = coinsPerClick * clicks\nlocal vipCoins = normalCoins * vipMultiplier',
          concepts: ['operators', 'variables'],
          success: 'Door variabelen te gebruiken kun je later één getal aanpassen en klopt de rest automatisch.',
        },
        {
          type: 'exercise',
          id: 'c1-project-ex3',
          mode: 'independent',
          title: 'Stap 3: het resultaat tonen',
          prompt: 'Laat met string interpolation twee regels zien:\n**Normaal: 200 coins**\n**VIP: 400 coins**\nGebruik `{normalCoins}` en `{vipCoins}` in je tekst.',
          starter: 'local coinsPerClick = 5\nlocal clicks = 40\nlocal vipMultiplier = 2\nlocal normalCoins = coinsPerClick * clicks\nlocal vipCoins = normalCoins * vipMultiplier\n',
          checks: [
            { kind: 'output', lines: ['Normaal: 200 coins', 'VIP: 400 coins'], message: 'De Output moet **Normaal: 200 coins** en **VIP: 400 coins** zijn.' },
            { kind: 'stringLiteral', contains: '{vipCoins}', message: 'Gebruik `{vipCoins}` in een tekst tussen backticks.' },
          ],
          hints: ['print(`Normaal: {normalCoins} coins`)'],
          solution: 'local coinsPerClick = 5\nlocal clicks = 40\nlocal vipMultiplier = 2\nlocal normalCoins = coinsPerClick * clicks\nlocal vipCoins = normalCoins * vipMultiplier\nprint(`Normaal: {normalCoins} coins`)\nprint(`VIP: {vipCoins} coins`)',
          concepts: ['interpolation'],
          success: 'Je eerste complete programma. Verander eens `clicks` naar 100 en run opnieuw: alles rekent vanzelf mee.',
        },
      ],
      summary: ['Je hebt variabelen, rekenen en interpolation gecombineerd.', 'Door variabelen te gebruiken in berekeningen, past alles zich automatisch aan.', 'Volgende stap: beslissingen maken met if-statements.'],
    },
  ],
};
