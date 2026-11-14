import type { Course } from '../types';

export const course0: Course = {
  id: 'course-0',
  number: 0,
  title: 'Voordat je codeert',
  description: 'Wat code is, hoe Luau eruitziet en waar je scripts in Roblox Studio zet. Geen voorkennis nodig.',
  level: 'Absolute beginner',
  planned: [],
  lessons: [
    // ------------------------------------------------------------------ 1
    {
      id: 'c0-what-is-code',
      courseId: 'course-0',
      title: 'Wat is code?',
      objective: 'Je weet wat programmeren en code zijn, en waarom een computer precies doet wat er staat.',
      minutes: 5,
      prerequisites: [],
      concepts: ['code-basics'],
      steps: [
        {
          type: 'explain',
          title: 'Programmeren = instructies geven',
          body: `Een computer is heel snel, maar kan zelf niet bedenken wat hij moet doen. Iemand moet hem stap voor stap vertellen wat er moet gebeuren. Dat noemen we **programmeren**.

Vergelijk het met een recept: "Breek twee eieren. Klop ze los. Bak ze drie minuten." Een recept is een lijst instructies die je van boven naar beneden uitvoert.

**Code** is zo'n lijst instructies, maar dan geschreven in een taal die de computer begrijpt. Zo'n taal heet een **programmeertaal**.`,
        },
        {
          type: 'explain',
          title: 'Een computer doet precies wat er staat',
          body: `Een mens begrijpt wat je bedoelt, ook als je een tikfout maakt. Een computer niet. Hij leest je code letterlijk.

Daarom is programmeren in het begin vooral: **precies** leren schrijven. Een vergeten haakje of een verkeerde hoofdletter is genoeg om iets te laten mislukken.

> Dat is normaal. Iedere programmeur maakt dagelijks zulke fouten. De Academy legt elke fout in gewone taal uit.`,
        },
        {
          type: 'quiz',
          id: 'c0-what-is-code-q1',
          question: 'Wat is code?',
          concepts: ['code-basics'],
          options: [
            { text: 'Een lijst instructies die een computer uitvoert', correct: true, feedback: 'Precies. Code vertelt de computer stap voor stap wat hij moet doen.' },
            { text: 'Een geheime taal om berichten te versleutelen', feedback: 'Dat heet ook wel "een code", maar bij programmeren bedoelen we instructies voor de computer.' },
            { text: 'Een plaatje van een spel', feedback: 'Plaatjes en modellen zijn onderdelen van een spel, maar code is wat ze laat bewegen en reageren.' },
          ],
        },
        {
          type: 'explain',
          title: 'Code in Roblox',
          body: `Alles wat in een Roblox-game **gebeurt**, komt door code: een deur die opengaat, coins die je verzamelt, een timer die aftelt, een winkel waar je iets koopt.

De bouwstenen (onderdelen, kleuren, modellen) maak je in Roblox Studio. Met code geef je ze gedrag. In Roblox schrijf je die code in de taal **Luau**.`,
        },
        {
          type: 'quiz',
          id: 'c0-what-is-code-q2',
          question: 'Je typt per ongeluk een kleine fout in je code. Wat doet de computer?',
          concepts: ['code-basics'],
          options: [
            { text: 'Hij snapt wat je bedoelt en verbetert het zelf', feedback: 'Was het maar zo. Een computer raadt niet wat je bedoelt; hij volgt letterlijk wat er staat.' },
            { text: 'Hij volgt letterlijk wat er staat, en meldt vaak een fout', correct: true, feedback: 'Klopt. Daarom leer je in deze Academy fouten lezen en oplossen.' },
            { text: 'Hij gaat kapot', feedback: 'Geen zorgen: van een tikfout in je code gaat niets kapot. Je krijgt hooguit een foutmelding.' },
          ],
        },
        {
          type: 'code',
          title: 'Zo ziet code eruit',
          body: 'Hieronder staat een regel echte Luau-code. Je hoeft hem nog niet te begrijpen: dat leer je in de volgende les. Klik op **Run Code** en kijk wat er gebeurt.',
          code: 'print("Welkom bij Lumora Academy!")',
          runnable: true,
          after: 'De tekst verscheen in het venster **Output**. Je hebt zojuist code laten uitvoeren.',
        },
      ],
      summary: [
        'Programmeren is een computer stap voor stap instructies geven.',
        'Code is die lijst instructies, in een programmeertaal.',
        'Een computer doet letterlijk wat er staat; fouten zijn normaal en kun je leren oplossen.',
        'In Roblox schrijf je code in de taal Luau.',
      ],
    },

    // ------------------------------------------------------------------ 2 (acceptance lesson)
    {
      id: 'c0-first-script',
      courseId: 'course-0',
      title: 'Je eerste Luau-script',
      objective: 'Je kunt met print() tekst laten zien, en je begrijpt wat de haakjes en aanhalingstekens doen.',
      minutes: 8,
      prerequisites: ['code-basics'],
      concepts: ['print', 'strings'],
      steps: [
        {
          type: 'explain',
          body: `Met code geef je instructies aan je programma.

De eerste instructie die bijna iedere programmeur leert, is: **laat iets zien op het scherm**. In Luau doe je dat met \`print\`.`,
        },
        {
          type: 'code',
          title: 'Bekijk deze regel code',
          body: 'Klik op de onderdelen hieronder om te zien wat elk stukje doet.',
          code: 'print("Hallo Roblox!")',
          runnable: true,
          annotations: [
            { token: 'print', text: '`print` is een **functie**: een kant-en-klare opdracht die iets voor je doet. `print` laat informatie zien in de **Output**: het venster waarin je programma berichten toont.' },
            { token: '(', text: 'Het **openende haakje** begint de informatie die je aan `print` geeft. Alles tussen `(` en `)` is wat `print` moet laten zien.' },
            { token: '"Hallo Roblox!"', text: 'De **aanhalingstekens** `" "` vertellen Luau: dit is gewone **tekst**, geen code. Programmeurs noemen tekst een **string**.' },
            { token: ')', text: 'Het **sluitende haakje** zegt: hier stopt de informatie voor `print`. Elk `(` heeft een `)` nodig.' },
          ],
          after: 'Na **Run Code** verschijnt `Hallo Roblox!` in de Output. Merk op: de aanhalingstekens zelf zie je niet. Die vertellen Luau alleen waar de tekst begint en eindigt.',
        },
        {
          type: 'quiz',
          id: 'c0-first-script-q1',
          question: 'Waarom staat "Hallo Roblox!" tussen aanhalingstekens?',
          concepts: ['strings'],
          options: [
            { text: 'Zodat Luau weet dat het gewone tekst is', correct: true, feedback: 'Juist. Zonder aanhalingstekens zou Luau denken dat Hallo een stukje code is.' },
            { text: 'Omdat het dan groter op het scherm komt', feedback: 'Aanhalingstekens veranderen niets aan hoe groot tekst eruitziet. Ze markeren alleen begin en einde van tekst.' },
            { text: 'Dat is alleen versiering', feedback: 'Nee, ze zijn nodig. Probeer het later maar eens zonder: dan krijg je een fout.' },
          ],
        },
        {
          type: 'exercise',
          id: 'c0-first-script-ex1',
          mode: 'guided',
          title: 'Pas de tekst aan',
          prompt: "Verander de tekst zodat het programma **Ik leer Luau!** laat zien. Klik daarna op **Run Code**.",
          starter: 'print("Hallo Roblox!")',
          checks: [
            { kind: 'uses', sequence: ['print', '('], message: 'Gebruik nog steeds `print( ... )` om de tekst te laten zien.' },
            { kind: 'output', lines: ['Ik leer Luau!'], message: 'Je programma laat nog niet precies **Ik leer Luau!** zien. Let op hoofdletters, spaties en het uitroepteken.' },
          ],
          hints: [
            'Je hoeft alleen de tekst tussen de aanhalingstekens te veranderen. De rest blijft hetzelfde.',
            'Haal `Hallo Roblox!` weg en typ op die plek `Ik leer Luau!`. Laat de aanhalingstekens staan.',
          ],
          solution: 'print("Ik leer Luau!")',
          concepts: ['print', 'strings'],
          success: 'Goed gedaan! Je hebt je eerste Luau-code aangepast en uitgevoerd.',
        },
        {
          type: 'predict',
          id: 'c0-first-script-p1',
          question: 'Wat laat deze code zien in de Output?',
          code: 'print("1 + 1")',
          concepts: ['strings'],
          options: [
            { text: '2', feedback: 'Bijna logisch, maar kijk naar de aanhalingstekens: alles daartussen is tekst, dus Luau rekent niet.' },
            { text: '1 + 1', correct: true, feedback: 'Precies. Tussen aanhalingstekens is het gewoon tekst. Luau laat het letterlijk zien.' },
            { text: 'Een foutmelding', feedback: 'Deze code is geldig. Tekst mag alle tekens bevatten, ook + en cijfers.' },
          ],
        },
        {
          type: 'exercise',
          id: 'c0-first-script-ex2',
          mode: 'independent',
          title: 'Nu helemaal zelf',
          prompt: 'De editor is leeg. Schrijf zelf een regel code die **Ik word Roblox-developer** laat zien.',
          starter: '',
          checks: [
            { kind: 'uses', sequence: ['print', '('], message: 'Gebruik `print` met haakjes om iets te laten zien.' },
            { kind: 'output', lines: ['Ik word Roblox-developer'], message: 'De Output moet precies **Ik word Roblox-developer** zijn (zonder punt of uitroepteken).' },
          ],
          hints: ['Kijk terug naar de vorige oefening: dezelfde vorm, andere tekst.', 'De vorm is: `print("jouw tekst")`'],
          solution: 'print("Ik word Roblox-developer")',
          concepts: ['print', 'strings'],
          success: 'Helemaal zelf geschreven. Zo begint iedere Roblox-developer.',
        },
      ],
      summary: [
        '`print( )` laat informatie zien in de Output.',
        'Tussen de haakjes zet je wat `print` moet laten zien.',
        'Tekst (een string) zet je tussen aanhalingstekens: `"zo"`.',
        'Tussen aanhalingstekens rekent Luau niet: `"1 + 1"` blijft tekst.',
      ],
    },

    // ------------------------------------------------------------------ 3
    {
      id: 'c0-what-is-luau',
      courseId: 'course-0',
      title: 'Wat is Luau? (en Lua)',
      objective: 'Je weet wat Luau is, hoe het verschilt van Lua, en wat deze app wel en niet kan uitvoeren.',
      minutes: 6,
      prerequisites: ['print'],
      concepts: ['code-basics'],
      steps: [
        {
          type: 'explain',
          title: 'Lua en Luau',
          body: `**Lua** is een bestaande programmeertaal, bekend omdat hij klein en snel is. Roblox gebruikte vroeger Lua.

Roblox heeft daarna een eigen versie gemaakt: **Luau** (spreek uit: "loe-au"). Luau lijkt heel erg op Lua, maar heeft extra's:
- het is sneller
- je kunt kortere schrijfwijzen gebruiken, zoals \`coins += 10\`
- je kunt tekst met waarden combineren met backticks: \`\`Coins: {coins}\`\`
- je kunt **types** aangeven, zodat fouten eerder opvallen (dat leer je veel later)

Luau is open source: iedereen mag het gebruiken, ook buiten Roblox.`,
        },
        {
          type: 'code',
          title: 'Een paar Luau-extra\'s',
          body: 'Je hoeft deze code nog niet te kunnen schrijven. Bekijk het en klik op **Run Code**.',
          code: 'local coins = 10\ncoins += 5\nprint(`Je hebt {coins} coins`)',
          runnable: true,
          after: 'In gewoon Lua werkt `+=` en de tekst met `{coins}` niet. In Luau wel. Je ziet `Je hebt 15 coins`.',
        },
        {
          type: 'explain',
          title: 'Luau is niet hetzelfde als "Roblox"',
          body: `Dit onderscheid is belangrijk:

- **Luau** is de taal: woorden zoals \`print\`, \`local\`, \`if\` en rekenen met getallen.
- **De Roblox-engine** voegt daar onderdelen aan toe, zoals \`workspace\`, \`game\`, \`Instance\` en spelers. Die bestaan alleen binnen Roblox.

De speeltuin in deze app voert **echte Luau** uit. Roblox-onderdelen werken hier niet; die test je in Roblox Studio. De Academy vertelt je altijd duidelijk wanneer iets Studio nodig heeft.`,
        },
        {
          type: 'quiz',
          id: 'c0-what-is-luau-q1',
          question: 'Welke van deze regels kan de Luau-speeltuin in deze app uitvoeren?',
          concepts: ['code-basics'],
          options: [
            { text: 'print("Hallo")', correct: true, feedback: 'Ja: `print` hoort bij Luau zelf.' },
            { text: 'workspace.Baseplate.Color = Color3.new(1, 0, 0)', feedback: '`workspace` en `Color3` horen bij de Roblox-engine. Dit test je in Roblox Studio.' },
            { text: 'Instance.new("Part")', feedback: '`Instance` bestaat alleen in Roblox. Hiervoor heb je Roblox Studio nodig.' },
          ],
        },
        {
          type: 'exercise',
          id: 'c0-what-is-luau-ex1',
          mode: 'guided',
          title: 'Draai de Luau-code zelf',
          prompt: 'Verander het getal `5` in `20`, zodat de Output **Je hebt 30 coins** laat zien.',
          starter: 'local coins = 10\ncoins += 5\nprint(`Je hebt {coins} coins`)',
          checks: [{ kind: 'output', lines: ['Je hebt 30 coins'], message: 'De Output moet **Je hebt 30 coins** zijn. Welk getal tel je nu bij de 10 op?' }],
          hints: ['Kijk naar regel 2: daar wordt iets bij `coins` opgeteld.', 'Maak van `coins += 5` de regel `coins += 20`.'],
          solution: 'local coins = 10\ncoins += 20\nprint(`Je hebt {coins} coins`)',
          concepts: ['code-basics'],
          success: 'Goed. Je paste code aan die je nog niet helemaal kent, en voorspelde het resultaat.',
        },
      ],
      summary: [
        'Luau is de programmeertaal van Roblox, gebaseerd op Lua, met extra mogelijkheden.',
        'Luau (de taal) is iets anders dan de Roblox-engine (workspace, game, Instance).',
        'Deze app voert echte Luau uit; Roblox-onderdelen test je in Roblox Studio.',
      ],
    },

    // ------------------------------------------------------------------ 4
    {
      id: 'c0-strings',
      courseId: 'course-0',
      title: 'Tekst en aanhalingstekens',
      objective: 'Je kunt tekst correct schrijven, kent " en \', en herkent een niet-afgesloten string.',
      minutes: 7,
      prerequisites: ['print'],
      concepts: ['strings'],
      steps: [
        {
          type: 'explain',
          body: `Tekst in code heet een **string**. Je herkent een string aan de aanhalingstekens eromheen.

Je mag **dubbele** \`"tekst"\` of **enkele** \`'tekst'\` aanhalingstekens gebruiken. Ze doen hetzelfde. Begin en einde moeten wel hetzelfde soort zijn.

In Roblox-code zie je meestal dubbele aanhalingstekens. Die gebruiken wij ook.`,
        },
        {
          type: 'code',
          title: 'Twee soorten, hetzelfde resultaat',
          code: 'print("Dubbele aanhalingstekens")\nprint(\'Enkele aanhalingstekens\')\nprint("Ik zei: \'hoi\'")',
          runnable: true,
          after: 'Regel 3 laat zien waarom er twee soorten zijn: zo kun je het ene soort ín je tekst gebruiken.',
        },
        {
          type: 'predict',
          id: 'c0-strings-p1',
          question: 'Wat gebeurt er met deze code?',
          code: 'print("Hallo)',
          concepts: ['strings'],
          options: [
            { text: 'Hij laat Hallo zien', feedback: 'Kijk goed: de tekst begint met `"` maar eindigt niet met `"`. Luau weet niet waar de tekst stopt.' },
            { text: 'Luau geeft een fout: de tekst is niet afgesloten', correct: true, feedback: 'Klopt. Het sluitende aanhalingsteken ontbreekt, dus denkt Luau dat `)` ook nog bij de tekst hoort.' },
            { text: 'Hij laat Hallo) zien', feedback: 'Logisch gedacht, maar omdat de tekst nooit wordt afgesloten, mist Luau daarna ook het sluitende haakje. Het resultaat is een fout.' },
          ],
        },
        {
          type: 'exercise',
          id: 'c0-strings-ex1',
          mode: 'guided',
          kind: 'fix-bug',
          title: 'Repareer de code',
          prompt: 'Deze code werkt niet. Klik eerst op **Run Code** om de foutmelding te zien. Repareer hem daarna zodat hij **Welkom in mijn obby** laat zien.',
          starter: 'print("Welkom in mijn obby)',
          checks: [{ kind: 'output', lines: ['Welkom in mijn obby'], message: 'De Output moet precies **Welkom in mijn obby** zijn.' }],
          hints: ['Waar eindigt de tekst? Staat daar een aanhalingsteken?', 'Zet een `"` direct na het woord obby, vóór het haakje.'],
          solution: 'print("Welkom in mijn obby")',
          concepts: ['strings'],
          success: 'Opgelost. Een niet-afgesloten string is een van de meest voorkomende fouten; nu herken je hem.',
        },
        {
          type: 'exercise',
          id: 'c0-strings-ex2',
          mode: 'independent',
          title: 'Twee regels tekst',
          prompt: 'Schrijf code die twee regels laat zien:\n1. **Level 1**\n2. **Start!**',
          starter: '',
          checks: [{ kind: 'output', lines: ['Level 1', 'Start!'], message: 'De Output moet twee regels hebben: eerst **Level 1**, dan **Start!**' }],
          hints: ['Elke `print` laat één regel zien. Hoeveel `print`-regels heb je nodig?', 'Schrijf twee regels onder elkaar, elk met een eigen `print("...")`.'],
          solution: 'print("Level 1")\nprint("Start!")',
          concepts: ['strings', 'print'],
          success: 'Mooi. Elke print is een eigen regel in de Output.',
        },
      ],
      summary: [
        'Een string is tekst tussen aanhalingstekens.',
        '"dubbele" en \'enkele\' aanhalingstekens werken hetzelfde; begin en einde moeten gelijk zijn.',
        'Vergeet je het sluitende aanhalingsteken, dan geeft Luau een fout.',
      ],
    },

    // ------------------------------------------------------------------ 5
    {
      id: 'c0-brackets-commas',
      courseId: 'course-0',
      title: "Haakjes en komma's",
      objective: 'Je begrijpt waarom functies haakjes hebben en hoe je met komma\'s meerdere dingen meegeeft.',
      minutes: 7,
      prerequisites: ['print', 'strings'],
      concepts: ['arguments'],
      steps: [
        {
          type: 'explain',
          body: `Achter \`print\` staan altijd haakjes. Die haakjes betekenen: **voer deze functie nu uit, met deze informatie**.

De informatie tussen de haakjes noemen programmeurs een **argument**. Bij \`print("Hoi")\` is \`"Hoi"\` het argument.

Wil je meerdere dingen meegeven? Zet er een **komma** tussen. \`print\` laat ze dan naast elkaar zien, met een spatie ertussen.`,
        },
        {
          type: 'code',
          title: 'Meerdere argumenten',
          code: 'print("Coins:", 100)\nprint("Speler", "Level", 7)',
          runnable: true,
          annotations: [
            { token: ',', text: 'De **komma** scheidt twee argumenten. Elk argument is een los stukje informatie.' },
            { token: '100', text: 'Een **getal** heeft geen aanhalingstekens nodig. Luau weet zelf dat `100` een getal is.' },
          ],
          after: 'Output: `Coins: 100` en `Speler Level 7`. De komma zelf zie je niet; `print` zet er een spatie voor in de plaats.',
        },
        {
          type: 'quiz',
          id: 'c0-brackets-q1',
          question: 'Wat betekenen de haakjes in `print("Hoi")`?',
          concepts: ['arguments'],
          options: [
            { text: 'Voer print uit, met de informatie tussen de haakjes', correct: true, feedback: 'Precies. De haakjes "starten" de functie en bevatten de argumenten.' },
            { text: 'Het is een opmerking voor jezelf', feedback: 'Opmerkingen (comments) schrijf je met `--`. Haakjes horen bij het uitvoeren van een functie.' },
            { text: 'Ze maken de tekst vetgedrukt', feedback: 'Haakjes hebben niets met opmaak te maken.' },
          ],
        },
        {
          type: 'exercise',
          id: 'c0-brackets-ex1',
          mode: 'guided',
          kind: 'fix-bug',
          title: 'Vergeten haakje',
          prompt: 'Klik op **Run Code** en lees de uitleg van de fout. Repareer de code daarna.',
          starter: 'print("Score:", 250',
          checks: [{ kind: 'output', lines: ['Score: 250'], message: 'Na het repareren hoort de Output **Score: 250** te zijn.' }],
          hints: ['Elk `(` heeft een `)` nodig. Tel ze in deze regel.', 'Zet een `)` helemaal aan het einde van de regel.'],
          solution: 'print("Score:", 250)',
          concepts: ['arguments'],
          success: 'Goed gerepareerd. Een vergeten haakje is de bekendste beginnersfout.',
        },
        {
          type: 'exercise',
          id: 'c0-brackets-ex2',
          mode: 'independent',
          title: 'Drie argumenten',
          prompt: 'Schrijf één `print` met **drie** argumenten, gescheiden door komma\'s, zodat de Output **Gems: 12 totaal** is. Gebruik voor 12 een getal (zonder aanhalingstekens).',
          starter: '',
          checks: [
            { kind: 'outputCount', min: 1, max: 1, message: 'Gebruik precies één `print`.' },
            { kind: 'output', lines: ['Gems: 12 totaal'], message: 'De Output moet precies **Gems: 12 totaal** zijn.' },
            { kind: 'uses', sequence: [',', '12', ','], message: 'Zet het getal `12` als een los argument tussen twee komma\'s, zonder aanhalingstekens.' },
          ],
          hints: ['Het eerste argument is de tekst `"Gems:"`, het tweede het getal, het derde de tekst `"totaal"`.', 'De vorm is: `print(tekst, getal, tekst)`'],
          solution: 'print("Gems:", 12, "totaal")',
          concepts: ['arguments'],
          success: 'Precies. Drie argumenten, één regel Output.',
        },
      ],
      summary: [
        'Haakjes achter een functienaam betekenen: voer de functie nu uit.',
        'De informatie tussen de haakjes heet een argument.',
        "Komma's scheiden meerdere argumenten. print zet er een spatie tussen.",
        'Getallen hebben geen aanhalingstekens nodig.',
      ],
    },

    // ------------------------------------------------------------------ 6
    {
      id: 'c0-comments',
      courseId: 'course-0',
      title: 'Comments: notities in je code',
      objective: 'Je kunt comments schrijven en weet dat Luau ze overslaat.',
      minutes: 5,
      prerequisites: ['print'],
      concepts: ['comments'],
      steps: [
        {
          type: 'explain',
          body: `Een **comment** is een notitie voor mensen. Luau slaat comments volledig over.

Een comment begint met twee streepjes: \`--\`. Alles daarna op dezelfde regel wordt genegeerd.

Voor een comment over meerdere regels gebruik je \`--[[\` en \`]]\`.

Goede comments leggen uit **waarom** code er staat. In grotere Roblox-projecten helpen ze jou (en anderen) om later te begrijpen wat je bedoelde.`,
        },
        {
          type: 'code',
          code: '-- Dit is een comment: Luau slaat deze regel over\nprint("Deze regel wordt wel uitgevoerd")\n\n--[[\n  Een comment over\n  meerdere regels\n]]\nprint("Klaar") -- ook achter code mag een comment',
          runnable: true,
          after: 'Alleen de twee `print`-regels laten iets zien. De comments doen niets.',
        },
        {
          type: 'predict',
          id: 'c0-comments-p1',
          question: 'Hoeveel regels verschijnen er in de Output?',
          code: 'print("Een")\n-- print("Twee")\nprint("Drie")',
          concepts: ['comments'],
          options: [
            { text: '3', feedback: 'Kijk naar regel 2: die begint met `--`. Wat doet Luau met zo\'n regel?' },
            { text: '2', correct: true, feedback: 'Juist. Regel 2 is een comment en wordt overgeslagen: je ziet Een en Drie.' },
            { text: '1', feedback: 'Alleen regel 2 is een comment. Regels 1 en 3 worden gewoon uitgevoerd.' },
          ],
        },
        {
          type: 'exercise',
          id: 'c0-comments-ex1',
          mode: 'guided',
          title: 'Zet een regel "uit"',
          prompt: 'Programmeurs zetten code soms tijdelijk uit door er een comment van te maken. Zorg dat de Output alleen **Speler gespawnd** laat zien, door van de andere regel een comment te maken. Verwijder niets.',
          starter: 'print("Speler gespawnd")\nprint("DEBUG: positie 0, 5, 0")',
          checks: [
            { kind: 'output', lines: ['Speler gespawnd'], message: 'De Output moet alleen **Speler gespawnd** zijn.' },
            { kind: 'hasComment', message: 'Maak van de debug-regel een comment met `--` in plaats van hem te verwijderen.' },
          ],
          hints: ['Welk teken zet je vóór een regel om hem een comment te maken?', 'Zet `--` aan het begin van regel 2.'],
          solution: 'print("Speler gespawnd")\n-- print("DEBUG: positie 0, 5, 0")',
          concepts: ['comments'],
          success: 'Handig trucje: zo kun je code testen zonder iets weg te gooien.',
        },
      ],
      summary: ['Een comment begint met `--` en wordt door Luau overgeslagen.', '`--[[ ... ]]` maakt een comment over meerdere regels.', 'Comments zijn notities voor mensen: leg vooral uit waarom.'],
    },

    // ------------------------------------------------------------------ 7
    {
      id: 'c0-lines-order',
      courseId: 'course-0',
      title: 'Waarom staat code op regels?',
      objective: 'Je weet dat Luau regels van boven naar beneden uitvoert en dat de volgorde ertoe doet.',
      minutes: 5,
      prerequisites: ['print'],
      concepts: ['order'],
      steps: [
        {
          type: 'explain',
          body: `Luau voert je code **van boven naar beneden** uit, regel voor regel. Net als een recept.

Elke regel is meestal één instructie. Je zou instructies ook op één regel kunnen zetten, maar aparte regels maken code veel beter leesbaar.

Omdat de volgorde vastligt, maakt het uit wáár je een regel zet. Dat wordt straks belangrijk: je moet bijvoorbeeld iets eerst maken voordat je het kunt gebruiken.`,
        },
        {
          type: 'predict',
          id: 'c0-order-p1',
          question: 'Wat is de eerste regel in de Output?',
          code: 'print("Ronde start")\nprint("3")\nprint("2")\nprint("1")',
          concepts: ['order'],
          options: [
            { text: 'Ronde start', correct: true, feedback: 'Ja: de bovenste regel wordt als eerste uitgevoerd.' },
            { text: '1', feedback: 'Luau begint bovenaan, niet onderaan.' },
            { text: 'Alle regels tegelijk', feedback: 'Het gaat razendsnel, maar wel netjes één voor één, van boven naar beneden.' },
          ],
        },
        {
          type: 'exercise',
          id: 'c0-order-ex1',
          mode: 'independent',
          title: 'Zet de aftelling op volgorde',
          prompt: 'De regels staan door elkaar. Zet ze in de goede volgorde, zodat de Output dit is:\n**3**, **2**, **1**, **Start!**',
          starter: 'print("1")\nprint("Start!")\nprint("3")\nprint("2")',
          checks: [{ kind: 'output', lines: ['3', '2', '1', 'Start!'], message: 'De volgorde in de Output moet 3, 2, 1, Start! zijn.' }],
          hints: ['Welke regel moet bovenaan staan?', 'Tip: met Alt + pijltje omhoog/omlaag verplaats je een regel in de editor.'],
          solution: 'print("3")\nprint("2")\nprint("1")\nprint("Start!")',
          concepts: ['order'],
          success: 'Precies op volgorde. Je weet nu hoe Luau je code leest.',
        },
      ],
      summary: ['Luau voert code van boven naar beneden uit.', 'Eén instructie per regel maakt code leesbaar.', 'De volgorde van regels bepaalt de volgorde van wat er gebeurt.'],
    },

    // ------------------------------------------------------------------ 8
    {
      id: 'c0-roblox-studio',
      courseId: 'course-0',
      title: 'Roblox Studio: Explorer, Properties en Output',
      objective: 'Je kunt Roblox Studio openen en vindt de Explorer, Properties, Workspace en Output.',
      minutes: 10,
      prerequisites: ['code-basics'],
      concepts: ['studio-basics'],
      steps: [
        {
          type: 'explain',
          title: 'Wat is Roblox Studio?',
          body: `**Roblox Studio** is het gratis programma waarmee je Roblox-games bouwt. Je plaatst er onderdelen in een 3D-wereld én je schrijft er je scripts.

Vier vensters gebruik je constant:
- **Explorer**: een lijst van alles in je game, zoals een mappenstructuur.
- **Properties**: de eigenschappen van wat je hebt geselecteerd, zoals kleur, grootte en naam.
- **Output**: hier verschijnen berichten van \`print\` en foutmeldingen.
- **Workspace**: geen venster, maar een map in de Explorer. Alles wat in de 3D-wereld zichtbaar is, staat in Workspace.`,
        },
        {
          type: 'studio',
          title: 'Open Roblox Studio en vind de vensters',
          body: 'Deze stappen doe je zelf in Roblox Studio. Vink elke stap af als het gelukt is.',
          steps: [
            { text: 'Open Roblox Studio en log in.', detail: 'Heb je het nog niet? Download het gratis via create.roblox.com.' },
            { text: 'Kies een nieuwe **Baseplate**-template.', detail: 'Dat is een lege wereld met een grijze vloer: perfect om te oefenen.' },
            { text: 'Zoek het venster **Explorer**.', detail: 'Zie je het niet? Open het via het menu of tabblad **Window** (in de oudere indeling: tabblad **View**).' },
            { text: 'Klap **Workspace** open in de Explorer en klik op **Baseplate**.' },
            { text: 'Kijk in het venster **Properties**: je ziet nu de eigenschappen van de Baseplate, zoals Color en Size.' },
            { text: 'Open het venster **Output** op dezelfde manier als de Explorer.', detail: 'Laat dit venster altijd open staan als je scripts test.' },
          ],
          expected: 'Je ziet de Explorer, Properties en Output, en de Baseplate is geselecteerd.',
        },
        {
          type: 'quiz',
          id: 'c0-studio-q1',
          question: 'Je wilt de kleur van een onderdeel veranderen zonder code. Welk venster gebruik je?',
          concepts: ['studio-basics'],
          options: [
            { text: 'Properties', correct: true, feedback: 'Juist. Properties toont alle eigenschappen van het geselecteerde onderdeel.' },
            { text: 'Output', feedback: 'Output laat berichten en fouten van scripts zien, geen eigenschappen.' },
            { text: 'Explorer', feedback: 'In de Explorer selecteer je het onderdeel; de kleur zelf verander je in Properties.' },
          ],
        },
        {
          type: 'quiz',
          id: 'c0-studio-q2',
          question: 'Waar verschijnt de tekst van `print("Hallo")` als je game draait in Studio?',
          concepts: ['studio-basics', 'print'],
          options: [
            { text: 'In het Output-venster', correct: true, feedback: 'Ja. Daarom laat je Output altijd open tijdens het testen.' },
            { text: 'Als tekst boven je avatar', feedback: 'Nee, `print` is voor jou als developer. Spelers zien deze berichten niet.' },
            { text: 'In de Explorer', feedback: 'De Explorer toont onderdelen van je game, geen berichten.' },
          ],
        },
      ],
      summary: ['Roblox Studio is het programma waarin je games bouwt en scripts schrijft.', 'Explorer = alles in je game; Properties = eigenschappen van wat geselecteerd is.', 'Output toont print-berichten en fouten.', 'Workspace bevat alles wat zichtbaar is in de 3D-wereld.'],
    },

    // ------------------------------------------------------------------ 9
    {
      id: 'c0-script-types',
      courseId: 'course-0',
      title: 'Script, LocalScript en ModuleScript',
      objective: 'Je kent de drie soorten scripts en weet waar je een gewoon Script neerzet.',
      minutes: 8,
      prerequisites: ['studio-basics'],
      concepts: ['script-types'],
      steps: [
        {
          type: 'explain',
          title: 'Drie soorten scripts',
          body: `In Roblox schrijf je code in een **script**: een onderdeel in de Explorer dat code bevat. Er zijn drie soorten:

- **Script**: draait op de **server**, de computer van Roblox die het spel voor iedereen bijhoudt. Hiermee regel je dingen die voor alle spelers gelden, zoals coins geven.
- **LocalScript**: draait op het apparaat van **één speler** (de **client**). Hiermee regel je dingen die alleen die speler ziet, zoals menu's en knoppen.
- **ModuleScript**: doet uit zichzelf niets. Het bevat code die andere scripts kunnen hergebruiken.

Server en client leer je later heel grondig. Voor nu: begin altijd met een gewoon **Script**.`,
        },
        {
          type: 'explain',
          title: 'Waar zet je een Script?',
          body: `De plek in de Explorer bepaalt of een script draait.

**ServerScriptService** is de vaste plek voor Scripts die op de server draaien. Spelers kunnen de inhoud daarvan niet zien of downloaden. Dat maakt het de veiligste plek voor je spelregels.

Een LocalScript zet je bijvoorbeeld in **StarterPlayerScripts** of in een interface onder **StarterGui**.`,
        },
        {
          type: 'quiz',
          id: 'c0-script-types-q1',
          question: 'Je maakt een script dat spelers coins geeft. Welke soort script en waar?',
          concepts: ['script-types'],
          options: [
            { text: 'Een Script in ServerScriptService', correct: true, feedback: 'Juist. Coins horen op de server bijgehouden te worden, zodat spelers niet kunnen valsspelen.' },
            { text: 'Een LocalScript in StarterGui', feedback: 'Een LocalScript draait op het apparaat van de speler. Coins daar regelen is onveilig; dat leer je in de cursus over client en server.' },
            { text: 'Een ModuleScript, dat doet alles automatisch', feedback: 'Een ModuleScript doet uit zichzelf niets; een ander script moet het gebruiken.' },
          ],
        },
        {
          type: 'quiz',
          id: 'c0-script-types-q2',
          question: 'Wat doet een ModuleScript als niemand het gebruikt?',
          concepts: ['script-types'],
          options: [
            { text: 'Niets', correct: true, feedback: 'Klopt. Een ModuleScript is een gereedschapskist: pas als een ander script hem opent, wordt de code gebruikt.' },
            { text: 'Het draait vanzelf op de server', feedback: 'Dat doet een gewoon Script. Een ModuleScript wacht tot een ander script het gebruikt.' },
            { text: 'Het draait vanzelf bij elke speler', feedback: 'Dat lijkt meer op een LocalScript.' },
          ],
        },
      ],
      summary: ['Script = server; LocalScript = apparaat van één speler; ModuleScript = herbruikbare code.', 'Server-Scripts zet je in ServerScriptService.', 'Begin bij twijfel met een gewoon Script.'],
    },

    // ------------------------------------------------------------------ 10
    {
      id: 'c0-first-studio-script',
      courseId: 'course-0',
      title: 'Je eerste werkende script in Studio',
      objective: 'Je maakt een Script in ServerScriptService, past het aan en ziet het resultaat in de Output.',
      minutes: 10,
      prerequisites: ['studio-basics', 'script-types', 'print'],
      concepts: ['studio-basics', 'print'],
      steps: [
        {
          type: 'explain',
          body: `Tijd om alles samen te voegen: je schrijft een script in Roblox Studio en draait het in je eigen game.

Eerst oefen je de code hier. Daarna zet je precies dezelfde code in Studio.`,
        },
        {
          type: 'exercise',
          id: 'c0-first-studio-ex1',
          mode: 'independent',
          title: 'Oefen de code',
          prompt: 'Schrijf twee regels:\n1. een `print` die **Server gestart** laat zien\n2. een `print` die **Welkom bij mijn game** laat zien',
          starter: '',
          checks: [{ kind: 'output', lines: ['Server gestart', 'Welkom bij mijn game'], message: 'De Output moet twee regels hebben: **Server gestart** en daarna **Welkom bij mijn game**.' }],
          hints: ['Twee regels Output = twee keer `print`.'],
          solution: 'print("Server gestart")\nprint("Welkom bij mijn game")',
          concepts: ['print'],
          success: 'De code werkt. Nu ga je hem in Roblox Studio gebruiken.',
        },
        {
          type: 'studio',
          title: 'Zet je script in Roblox Studio',
          steps: [
            { text: 'Open je Baseplate in Roblox Studio, met de Explorer en Output zichtbaar.' },
            { text: 'Ga in de Explorer met je muis over **ServerScriptService** en klik op het **+**-knopje dat verschijnt.' },
            { text: 'Kies **Script**.', detail: 'Er opent een editor met de regel `print("Hello world!")`. Die zet Roblox er standaard in.' },
            { text: 'Vervang die regel door jouw twee regels uit de oefening hierboven.', detail: 'Typ ze zelf over. Dat is goede oefening.' },
            { text: 'Klik op **Play** (of druk op F5) om je game te starten.' },
            { text: 'Kijk in het **Output**-venster.', detail: 'Achter je tekst staat iets als "Server - Script:1": wie het bericht stuurde en vanaf welke regel.' },
            { text: 'Stop de test met **Stop** (Shift + F5).' },
          ],
          expected: 'In de Output zie je "Server gestart" en "Welkom bij mijn game".',
        },
        {
          type: 'quiz',
          id: 'c0-first-studio-q1',
          question: 'In de Output staat achter je tekst "Server - Script:2". Wat betekent de 2?',
          concepts: ['studio-basics'],
          options: [
            { text: 'Het bericht kwam van regel 2 van het script', correct: true, feedback: 'Precies. Dat is erg handig om fouten terug te vinden.' },
            { text: 'Het is het tweede script in je game', feedback: 'Het getal achter de dubbele punt is het regelnummer in dat script.' },
            { text: 'Er zijn twee spelers', feedback: 'Nee, dat getal is het regelnummer.' },
          ],
        },
      ],
      summary: ['Een server-Script maak je met + bij ServerScriptService.', 'Met Play start je een test; de Output toont je print-berichten.', 'De Output vertelt ook welk script en welke regel een bericht stuurde.'],
    },
  ],
};
