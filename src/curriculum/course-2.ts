import type { Course } from './types';

export const course2: Course = {
  id: 'course-2',
  number: 2,
  title: 'Voorwaarden en logica',
  description: 'Je code keuzes laten maken: vergelijken, if, elseif, else, and, or en not.',
  level: 'Beginner',
  planned: [],
  lessons: [
    // ------------------------------------------------------------------ 1
    {
      id: 'c2-comparisons',
      courseId: 'course-2',
      title: 'Vergelijken: waar of niet waar?',
      objective: 'Je kunt twee waarden vergelijken met ==, ~=, <, >, <= en >=, en weet dat de uitkomst een boolean is.',
      minutes: 8,
      prerequisites: ['booleans', 'variables'],
      concepts: ['comparisons'],
      steps: [
        {
          type: 'explain',
          body: `In een game stel je steeds vragen: heeft de speler genoeg coins? Is zijn health op? Zit hij in het goede team?

Zo'n vraag schrijf je als een **vergelijking**. Het antwoord is altijd een boolean: \`true\` (waar) of \`false\` (niet waar).

- \`==\` is gelijk aan
- \`~=\` is **niet** gelijk aan
- \`<\` kleiner dan, \`>\` groter dan
- \`<=\` kleiner dan of gelijk aan, \`>=\` groter dan of gelijk aan`,
        },
        {
          type: 'code',
          code: 'local coins = 120\nprint(coins >= 100)\nprint(coins == 50)\nprint(coins ~= 50)\nprint("rood" == "Rood")',
          runnable: true,
          annotations: [
            { token: '>=', text: '`>=` vraagt: is de linkerkant **groter dan of gelijk aan** de rechterkant? 120 >= 100 is `true`.' },
            { token: '==', text: '`==` (twee is-tekens) vraagt: zijn deze twee waarden **gelijk**? Let op: één `=` geeft een waarde, twee `==` vergelijkt.' },
            { token: '~=', text: '`~=` vraagt: zijn ze **niet** gelijk? In veel andere talen schrijf je dit als `!=`, in Luau als `~=`.' },
          ],
          after: 'De laatste regel is `false`: tekst vergelijken is hoofdlettergevoelig.',
        },
        {
          type: 'quiz',
          id: 'c2-comparisons-q1',
          question: 'Wat is het verschil tussen `=` en `==`?',
          concepts: ['comparisons'],
          options: [
            { text: '`=` geeft een waarde, `==` vergelijkt twee waarden', correct: true, feedback: 'Precies. `coins = 10` stopt 10 in coins; `coins == 10` vraagt of coins 10 is.' },
            { text: 'Er is geen verschil', feedback: 'Er is een groot verschil: het ene is een opdracht, het andere een vraag.' },
            { text: '`==` is een sterkere versie van `=`', feedback: 'Niet sterker, maar iets anders: `==` stelt een vraag en geeft true of false terug.' },
          ],
        },
        {
          type: 'predict',
          id: 'c2-comparisons-p1',
          question: 'Wat laat deze code zien?',
          code: 'local level = 10\nprint(level < 10)',
          concepts: ['comparisons'],
          options: [
            { text: 'true', feedback: 'Is 10 kleiner dan 10? Nee, het is precies gelijk.' },
            { text: 'false', correct: true, feedback: 'Juist. 10 is niet kleiner dan 10. Met `<=` zou het wel `true` zijn.' },
            { text: '10', feedback: 'Een vergelijking geeft altijd true of false, niet een getal.' },
          ],
        },
        {
          type: 'exercise',
          id: 'c2-comparisons-ex1',
          mode: 'guided',
          title: 'Is de speler sterk genoeg?',
          prompt: 'Maak een variabele `canEnter` die `true` is als `level` **minstens 5** is. Gebruik een vergelijking, niet zelf `true` typen.',
          starter: 'local level = 7\nlocal canEnter = -- jouw vergelijking hier\nprint(canEnter)',
          checks: [
            { kind: 'value', expr: 'canEnter', type: 'boolean', message: '`canEnter` moet een boolean zijn: het resultaat van een vergelijking.' },
            { kind: 'output', lines: ['true'], message: 'Met level 7 moet `canEnter` `true` zijn.' },
            { kind: 'variants', replace: 'local level = 7', cases: [{ with: 'local level = 5', lines: ['true'] }, { with: 'local level = 4', lines: ['false'] }], message: '`canEnter` klopt niet voor elk level. "Minstens 5" betekent: 5 telt ook mee.' },
          ],
          hints: ['"Minstens 5" betekent groter dan of gelijk aan 5.', '`local canEnter = level >= 5`'],
          solution: 'local level = 7\nlocal canEnter = level >= 5\nprint(canEnter)',
          concepts: ['comparisons'],
          success: 'Goed. De Academy testte je code ook met level 5 en 4: allebei correct.',
        },
        {
          type: 'exercise',
          id: 'c2-comparisons-ex2',
          mode: 'independent',
          title: 'Zelfde team?',
          prompt: 'Er zijn twee variabelen: `myTeam` en `otherTeam`. Maak `isEnemy`: die is `true` als de teams **niet gelijk** zijn. Print `isEnemy`.',
          starter: 'local myTeam = "Rood"\nlocal otherTeam = "Blauw"\n',
          checks: [
            { kind: 'value', expr: 'isEnemy', equals: true, message: 'Met Rood en Blauw moet `isEnemy` `true` zijn.' },
            { kind: 'uses', sequence: ['~='], message: 'Gebruik `~=` (niet gelijk aan).' },
            { kind: 'variants', replace: 'local otherTeam = "Blauw"', cases: [{ with: 'local otherTeam = "Rood"', lines: ['false'] }], message: 'Als beide teams Rood zijn, moet `isEnemy` `false` zijn.' },
          ],
          hints: ['Welk teken betekent "niet gelijk aan" in Luau?'],
          solution: 'local myTeam = "Rood"\nlocal otherTeam = "Blauw"\nlocal isEnemy = myTeam ~= otherTeam\nprint(isEnemy)',
          concepts: ['comparisons'],
          success: 'Precies. Dit soort vergelijkingen gebruik je straks in elk wapen- en teamsysteem.',
        },
      ],
      summary: ['Een vergelijking geeft `true` of `false`.', '`==` gelijk, `~=` niet gelijk, `<` `>` `<=` `>=` groter/kleiner.', '`=` geeft een waarde, `==` vergelijkt.', 'Tekst vergelijken is hoofdlettergevoelig.'],
    },

    // ------------------------------------------------------------------ 2
    {
      id: 'c2-if',
      courseId: 'course-2',
      title: 'If-statements',
      objective: 'Je kunt code alleen laten uitvoeren als een voorwaarde waar is, met if ... then ... end.',
      minutes: 10,
      prerequisites: ['comparisons'],
      concepts: ['conditions'],
      steps: [
        {
          type: 'explain',
          body: `Met een **if-statement** laat je code alleen draaien als iets waar is. Je leest het als een zin: "**als** dit waar is, **dan** doe je dit".

De vorm is altijd:
- \`if\` gevolgd door een voorwaarde
- \`then\`
- de code die alleen soms moet draaien (ingesprongen)
- \`end\` om het blok af te sluiten`,
        },
        {
          type: 'code',
          title: 'Je eerste if-statement',
          code: 'local coins = 120\n\nif coins >= 100 then\n    print("Je kunt het kopen!")\nend\n\nprint("Klaar met controleren")',
          runnable: true,
          annotations: [
            { token: 'if', text: '`if` begint de vraag: "als ...".' },
            { token: 'coins >= 100', text: 'De **voorwaarde**: een vergelijking die true of false oplevert.' },
            { token: 'then', text: '`then` sluit de vraag af: "... dan". Vergeet je hem, dan krijg je een fout.' },
            { token: 'end', text: '`end` sluit het if-blok af. Alles daarna draait altijd weer.' },
          ],
          after: 'Zet coins eens op 50 in je hoofd: dan wordt regel 4 overgeslagen, maar "Klaar met controleren" verschijnt altijd.',
        },
        {
          type: 'visual',
          kind: 'condition',
          title: 'Kijk hoe Luau beslist',
          body: 'Schuif met de waarde van `coins` en zie wanneer de voorwaarde `true` of `false` wordt.',
          code: '',
        },
        {
          type: 'exercise',
          id: 'c2-if-ex1',
          mode: 'guided',
          kind: 'fix-bug',
          title: 'Wat ontbreekt?',
          prompt: 'Deze code geeft een fout. Run hem, lees de uitleg en repareer hem.',
          starter: 'local health = 0\n\nif health <= 0\n    print("Game over")\nend',
          checks: [
            { kind: 'output', lines: ['Game over'], message: 'De Output moet **Game over** zijn.' },
            { kind: 'variants', replace: 'local health = 0', cases: [{ with: 'local health = 50', lines: [] }], message: 'Met health 50 mag er niets verschijnen.' },
          ],
          hints: ['Kijk naar regel 3. Hoe eindigt een if-regel altijd?'],
          solution: 'local health = 0\n\nif health <= 0 then\n    print("Game over")\nend',
          concepts: ['conditions'],
          success: 'Gerepareerd. Een vergeten `then` is de meest gemaakte if-fout.',
        },
        {
          type: 'exercise',
          id: 'c2-if-ex2',
          mode: 'independent',
          title: 'Level omhoog',
          prompt: 'Schrijf een if-statement: als `xp` **100 of meer** is, print dan **Level up!**. Anders gebeurt er niets.',
          starter: 'local xp = 130\n',
          checks: [
            { kind: 'uses', sequence: ['if'], message: 'Gebruik een `if`-statement.' },
            { kind: 'output', lines: ['Level up!'], message: 'Met 130 xp moet **Level up!** verschijnen.' },
            { kind: 'variants', replace: 'local xp = 130', cases: [{ with: 'local xp = 100', lines: ['Level up!'] }, { with: 'local xp = 99', lines: [] }], message: 'Je if-statement klopt nog niet voor elke waarde van xp.' },
          ],
          hints: ['De vorm: `if voorwaarde then` ... `end`', '"100 of meer" schrijf je als `xp >= 100`.'],
          solution: 'local xp = 130\nif xp >= 100 then\n    print("Level up!")\nend',
          concepts: ['conditions', 'comparisons'],
          success: 'Werkt voor 130, 100 en 99. Zo werken alle level-systemen.',
        },
      ],
      summary: ['`if voorwaarde then ... end` draait code alleen als de voorwaarde waar is.', 'Vergeet `then` en `end` niet.', 'Spring de code binnen het blok in, zodat je ziet wat erbij hoort.'],
    },

    // ------------------------------------------------------------------ 3
    {
      id: 'c2-else',
      courseId: 'course-2',
      title: 'else en elseif',
      objective: 'Je kunt kiezen tussen meerdere mogelijkheden met else en elseif.',
      minutes: 10,
      prerequisites: ['conditions'],
      concepts: ['conditions'],
      steps: [
        {
          type: 'explain',
          body: `Vaak wil je ook iets doen als de voorwaarde **niet** waar is. Daarvoor is \`else\` ("anders").

Heb je meer dan twee mogelijkheden? Dan gebruik je \`elseif\` ("anders als"). Luau controleert de voorwaarden **van boven naar beneden** en voert alleen het **eerste** blok uit dat waar is. Daarna slaat hij de rest over.

Er is maar één \`end\`, helemaal onderaan.`,
        },
        {
          type: 'code',
          code: 'local health = 35\n\nif health > 70 then\n    print("Gezond")\nelseif health > 30 then\n    print("Gewond")\nelse\n    print("Bijna dood!")\nend',
          runnable: true,
          after: 'health is 35: de eerste voorwaarde (35 > 70) is false, de tweede (35 > 30) is true, dus je ziet **Gewond**. Het else-blok wordt overgeslagen.',
        },
        {
          type: 'predict',
          id: 'c2-else-p1',
          question: 'Wat laat deze code zien?',
          code: 'local score = 90\nif score > 50 then\n    print("Goed")\nelseif score > 80 then\n    print("Super")\nend',
          concepts: ['conditions'],
          options: [
            { text: 'Super', feedback: '90 > 80 is wel waar, maar Luau stopt bij het eerste blok dat waar is.' },
            { text: 'Goed', correct: true, feedback: 'Juist. 90 > 50 is al waar, dus de elseif wordt niet eens bekeken. De volgorde doet ertoe!' },
            { text: 'Goed Super', feedback: 'Er wordt altijd maar één blok uitgevoerd.' },
          ],
        },
        {
          type: 'exercise',
          id: 'c2-else-ex1',
          mode: 'guided',
          title: 'Kopen of niet',
          prompt: 'Maak de code af: print **Gekocht!** als `coins` minstens `price` is, en anders **Te weinig coins**.',
          starter: 'local coins = 80\nlocal price = 100\n\nif coins >= price then\n    print("Gekocht!")\nend',
          checks: [
            { kind: 'uses', sequence: ['else'], message: 'Voeg een `else`-blok toe.' },
            { kind: 'output', lines: ['Te weinig coins'], message: 'Met 80 coins en prijs 100 moet **Te weinig coins** verschijnen.' },
            { kind: 'variants', replace: 'local coins = 80', cases: [{ with: 'local coins = 100', lines: ['Gekocht!'] }, { with: 'local coins = 500', lines: ['Gekocht!'] }], message: 'Met genoeg coins moet **Gekocht!** verschijnen.' },
          ],
          hints: ['`else` komt vóór de `end`, op een eigen regel.', 'if ... then\n    ...\nelse\n    print("Te weinig coins")\nend'],
          solution: 'local coins = 80\nlocal price = 100\n\nif coins >= price then\n    print("Gekocht!")\nelse\n    print("Te weinig coins")\nend',
          concepts: ['conditions'],
          success: 'Goed. Elke winkel in een Roblox-game begint met precies deze vraag.',
        },
        {
          type: 'exercise',
          id: 'c2-else-ex2',
          mode: 'independent',
          title: 'Medailles',
          prompt: 'Geef een medaille op basis van `time` (seconden voor een obby):\n- minder dan 30 → **Goud**\n- minder dan 60 → **Zilver**\n- anders → **Brons**',
          starter: 'local time = 45\n',
          checks: [
            { kind: 'uses', sequence: ['elseif'], message: 'Gebruik `elseif` voor de tweede mogelijkheid.' },
            { kind: 'output', lines: ['Zilver'], message: 'Met time 45 hoort **Zilver** te verschijnen.' },
            { kind: 'variants', replace: 'local time = 45', cases: [{ with: 'local time = 10', lines: ['Goud'] }, { with: 'local time = 30', lines: ['Zilver'] }, { with: 'local time = 60', lines: ['Brons'] }, { with: 'local time = 200', lines: ['Brons'] }], message: 'Je medailles kloppen niet voor alle tijden. Let op de volgorde en op "minder dan".' },
          ],
          hints: ['Begin met de strengste voorwaarde (Goud) bovenaan.', '"minder dan 30" is `time < 30`.'],
          solution: 'local time = 45\nif time < 30 then\n    print("Goud")\nelseif time < 60 then\n    print("Zilver")\nelse\n    print("Brons")\nend',
          concepts: ['conditions'],
          success: 'Getest met 10, 30, 45, 60 en 200 seconden: alles klopt.',
        },
      ],
      summary: ['`else` draait als geen enkele voorwaarde waar is.', '`elseif` voegt extra voorwaarden toe.', 'Luau voert alleen het eerste ware blok uit: de volgorde doet ertoe.', 'Eén `end` sluit het hele if-statement af.'],
    },

    // ------------------------------------------------------------------ 4
    {
      id: 'c2-logic',
      courseId: 'course-2',
      title: 'and, or en not',
      objective: 'Je kunt voorwaarden combineren met and en or, en omdraaien met not.',
      minutes: 10,
      prerequisites: ['conditions'],
      concepts: ['logic'],
      steps: [
        {
          type: 'explain',
          body: `Soms hangt een beslissing af van meer dan één ding:
- \`and\` (en): **beide** kanten moeten waar zijn. "De speler heeft de sleutel **en** staat bij de deur."
- \`or\` (of): **minstens één** kant moet waar zijn. "De speler is VIP **of** heeft betaald."
- \`not\` (niet): draait waar en niet waar om. \`not true\` is \`false\`.`,
        },
        {
          type: 'code',
          code: 'local hasKey = true\nlocal nearDoor = false\nlocal isVip = true\n\nprint(hasKey and nearDoor)\nprint(hasKey or nearDoor)\nprint(not nearDoor)\n\nif hasKey and isVip then\n    print("VIP-deur gaat open")\nend',
          runnable: true,
          after: '`true and false` is false, `true or false` is true, `not false` is true.',
        },
        {
          type: 'quiz',
          id: 'c2-logic-q1',
          question: 'Een deur opent als de speler **level 10 of hoger** is, **of** een VIP-pas heeft. Welke voorwaarde klopt?',
          concepts: ['logic'],
          options: [
            { text: 'level >= 10 or hasPass', correct: true, feedback: 'Juist: één van beide is genoeg, dus `or`.' },
            { text: 'level >= 10 and hasPass', feedback: 'Met `and` moet de speler allebei hebben. Dat is strenger dan gevraagd.' },
            { text: 'not level >= 10', feedback: '`not` draait de voorwaarde om; dan gaat de deur juist open voor lage levels.' },
          ],
        },
        {
          type: 'exercise',
          id: 'c2-logic-ex1',
          mode: 'guided',
          title: 'Mag de speler aanvallen?',
          prompt: 'Een speler mag alleen aanvallen als hij **leeft** (`health > 0`) **en** **niet** in de safezone staat. Print **Aanval!** als dat zo is, en anders **Kan niet aanvallen**.',
          starter: 'local health = 50\nlocal inSafeZone = false\n',
          checks: [
            { kind: 'uses', sequence: ['and'], message: 'Combineer de twee voorwaarden met `and`.' },
            { kind: 'uses', sequence: ['not'], message: 'Gebruik `not` voor "niet in de safezone".' },
            { kind: 'output', lines: ['Aanval!'], message: 'Met health 50 en buiten de safezone moet **Aanval!** verschijnen.' },
            { kind: 'variants', replace: 'local inSafeZone = false', cases: [{ with: 'local inSafeZone = true', lines: ['Kan niet aanvallen'] }], message: 'In de safezone mag de speler niet aanvallen.' },
            { kind: 'variants', replace: 'local health = 50', cases: [{ with: 'local health = 0', lines: ['Kan niet aanvallen'] }], message: 'Met health 0 mag de speler niet aanvallen.' },
          ],
          hints: ['De voorwaarde bestaat uit twee delen met `and` ertussen.', '`if health > 0 and not inSafeZone then`'],
          solution: 'local health = 50\nlocal inSafeZone = false\nif health > 0 and not inSafeZone then\n    print("Aanval!")\nelse\n    print("Kan niet aanvallen")\nend',
          concepts: ['logic', 'conditions'],
          success: 'Getest in de safezone, erbuiten en met 0 health: alles klopt.',
        },
        {
          type: 'exercise',
          id: 'c2-logic-ex2',
          mode: 'independent',
          title: 'Weekendbonus',
          prompt: 'Spelers krijgen dubbele coins als het `isWeekend` is **of** als ze `isVip` zijn. Print **Dubbele coins** of **Normale coins**.',
          starter: 'local isWeekend = false\nlocal isVip = true\n',
          checks: [
            { kind: 'uses', sequence: ['or'], message: 'Gebruik `or`: één van beide is genoeg.' },
            { kind: 'output', lines: ['Dubbele coins'], message: 'Een VIP krijgt altijd **Dubbele coins**.' },
            { kind: 'variants', replace: 'local isVip = true', cases: [{ with: 'local isVip = false', lines: ['Normale coins'] }], message: 'Geen weekend en geen VIP: dan **Normale coins**.' },
          ],
          hints: ['if isWeekend or isVip then ...'],
          solution: 'local isWeekend = false\nlocal isVip = true\nif isWeekend or isVip then\n    print("Dubbele coins")\nelse\n    print("Normale coins")\nend',
          concepts: ['logic'],
          success: 'Precies. `or` is ideaal voor bonussen met meerdere voorwaarden.',
        },
      ],
      summary: ['`and`: beide kanten waar.', '`or`: minstens één kant waar.', '`not`: draait true en false om.', 'Booleans kun je direct als voorwaarde gebruiken: `if isVip then`.'],
    },

    // ------------------------------------------------------------------ 5
    {
      id: 'c2-truthy-nested',
      courseId: 'course-2',
      title: 'nil als voorwaarde en geneste if-statements',
      objective: 'Je weet welke waarden als "waar" tellen en kunt een if-statement in een ander if-statement zetten.',
      minutes: 9,
      prerequisites: ['conditions', 'nil'],
      concepts: ['conditions', 'nil'],
      steps: [
        {
          type: 'explain',
          body: `Een voorwaarde hoeft geen vergelijking te zijn. Luau kijkt alleen: is het **waar genoeg**?

In Luau tellen alleen \`false\` en \`nil\` als niet waar. **Alle andere waarden tellen als waar**, ook \`0\` en lege tekst \`""\`.

Dat is handig in Roblox: \`if tool then\` betekent "als er een tool is (niet nil)". Dat gebruik je straks heel vaak om te controleren of iets bestaat.`,
        },
        {
          type: 'predict',
          id: 'c2-truthy-p1',
          question: 'Wat laat deze code zien?',
          code: 'local coins = 0\nif coins then\n    print("ja")\nelse\n    print("nee")\nend',
          concepts: ['conditions'],
          options: [
            { text: 'nee', feedback: 'In veel andere talen wel, maar in Luau is 0 gewoon een waarde, dus "waar genoeg".' },
            { text: 'ja', correct: true, feedback: 'Juist. Alleen `false` en `nil` tellen als niet waar. 0 telt als waar.' },
          ],
        },
        {
          type: 'explain',
          title: 'Geneste if-statements',
          body: `Je mag een if-statement **binnen** een ander if-statement zetten. Dat heet **nesten**.

Spring elk niveau een stap verder in. Elk \`if\` krijgt zijn eigen \`end\`.`,
        },
        {
          type: 'code',
          code: 'local hasTicket = true\nlocal age = 9\n\nif hasTicket then\n    if age >= 12 then\n        print("Welkom in de achtbaan")\n    else\n        print("Te jong voor de achtbaan")\n    end\nelse\n    print("Koop eerst een ticket")\nend',
          runnable: true,
        },
        {
          type: 'exercise',
          id: 'c2-nested-ex1',
          mode: 'independent',
          title: 'Wapen gebruiken',
          prompt: '`weapon` kan een naam bevatten of `nil` zijn.\n- Is er geen wapen (nil)? Print **Geen wapen**.\n- Is er wel een wapen, en is `ammo` groter dan 0? Print **Schieten met** gevolgd door de naam, bijvoorbeeld **Schieten met Blaster**.\n- Wapen maar geen ammo? Print **Herladen**.',
          starter: 'local weapon = "Blaster"\nlocal ammo = 5\n',
          checks: [
            { kind: 'output', lines: ['Schieten met Blaster'], message: 'Met een Blaster en 5 ammo hoort **Schieten met Blaster** te verschijnen.' },
            { kind: 'variants', replace: 'local ammo = 5', cases: [{ with: 'local ammo = 0', lines: ['Herladen'] }], message: 'Zonder ammo moet **Herladen** verschijnen.' },
            { kind: 'variants', replace: 'local weapon = "Blaster"', cases: [{ with: 'local weapon = nil', lines: ['Geen wapen'] }, { with: 'local weapon = "Laser"', lines: ['Schieten met Laser'] }], message: 'Je code werkt nog niet voor elk wapen (of geen wapen).' },
          ],
          hints: ['Controleer eerst of `weapon` bestaat: `if weapon then`.', 'Zet de ammo-controle binnen dat eerste if-blok.', 'Gebruik `..` of interpolation om de naam van het wapen te tonen.'],
          solution: 'local weapon = "Blaster"\nlocal ammo = 5\nif weapon then\n    if ammo > 0 then\n        print("Schieten met " .. weapon)\n    else\n        print("Herladen")\n    end\nelse\n    print("Geen wapen")\nend',
          concepts: ['conditions', 'nil'],
          success: 'Getest met Blaster, Laser, geen wapen en geen ammo. Allemaal goed.',
        },
      ],
      summary: ['Alleen `false` en `nil` tellen als niet waar; 0 en "" tellen als waar.', '`if iets then` controleert of iets bestaat.', 'Je kunt if-statements nesten; elk if krijgt een eigen `end`.'],
    },

    // ------------------------------------------------------------------ 6 project
    {
      id: 'c2-project-shop',
      courseId: 'course-2',
      title: 'Project: de winkelcontrole',
      objective: 'Je bouwt de beslislogica van een Roblox-winkel helemaal zelf.',
      minutes: 15,
      prerequisites: ['conditions', 'logic'],
      concepts: ['conditions', 'logic', 'comparisons'],
      steps: [
        {
          type: 'explain',
          body: `Een speler klikt in je winkel op "Koop". Voordat hij het item krijgt, moet je game drie dingen controleren:
1. Heeft de speler het item al? Dan kan hij het niet nog eens kopen.
2. Is het item alleen voor VIP's, en is de speler geen VIP? Dan mag het niet.
3. Heeft hij genoeg coins?

Later leer je dat deze controle altijd op de **server** moet gebeuren. De logica zelf schrijf je nu al.`,
        },
        {
          type: 'exercise',
          id: 'c2-project-ex1',
          mode: 'independent',
          title: 'De volledige controle',
          prompt: 'Print precies één bericht, en controleer in deze volgorde:\n1. `alreadyOwned` is true → **Je hebt dit al**\n2. `vipOnly` is true en `isVip` is false → **Alleen voor VIP**\n3. `coins` is minder dan `price` → **Te weinig coins**\n4. anders → **Gekocht!** en daarna op een nieuwe regel hoeveel coins er over zijn, zoals **Over: 50**',
          starter: 'local coins = 150\nlocal price = 100\nlocal alreadyOwned = false\nlocal vipOnly = false\nlocal isVip = false\n',
          checks: [
            { kind: 'output', lines: ['Gekocht!', 'Over: 50'], message: 'Met 150 coins, prijs 100 en geen beperkingen hoort **Gekocht!** en **Over: 50** te verschijnen.' },
            { kind: 'variants', replace: 'local alreadyOwned = false', cases: [{ with: 'local alreadyOwned = true', lines: ['Je hebt dit al'] }], message: 'Een speler die het item al heeft, moet **Je hebt dit al** zien.' },
            { kind: 'variants', replace: 'local vipOnly = false', cases: [{ with: 'local vipOnly = true', lines: ['Alleen voor VIP'] }], message: 'Een VIP-item voor een niet-VIP moet **Alleen voor VIP** geven.' },
            { kind: 'variants', replace: 'local isVip = false', cases: [{ with: 'local isVip = true', lines: ['Gekocht!', 'Over: 50'] }], message: 'Een VIP mag gewoon kopen.' },
            { kind: 'variants', replace: 'local coins = 150', cases: [{ with: 'local coins = 99', lines: ['Te weinig coins'] }, { with: 'local coins = 100', lines: ['Gekocht!', 'Over: 0'] }], message: 'De coin-controle klopt niet voor elk bedrag.' },
          ],
          hints: ['Gebruik één if met elseif-blokken, in de volgorde van de opdracht.', 'Voor stap 2: `elseif vipOnly and not isVip then`', 'Reken bij Gekocht! eerst `coins - price` uit.'],
          solution: 'local coins = 150\nlocal price = 100\nlocal alreadyOwned = false\nlocal vipOnly = false\nlocal isVip = false\n\nif alreadyOwned then\n    print("Je hebt dit al")\nelseif vipOnly and not isVip then\n    print("Alleen voor VIP")\nelseif coins < price then\n    print("Te weinig coins")\nelse\n    coins -= price\n    print("Gekocht!")\n    print(`Over: {coins}`)\nend',
          concepts: ['conditions', 'logic', 'comparisons'],
          success: 'Je winkellogica is getest in zeven situaties en klopt overal. Dit is echte gamecode.',
        },
      ],
      summary: ['Je combineerde vergelijkingen, if/elseif/else en and/not.', 'De volgorde van controles bepaalt welk bericht de speler ziet.', 'Volgende cursus: code herhalen met lussen.'],
    },
  ],
};
