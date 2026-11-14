import type { Course } from './types';

const H = '#include <iostream>\n';

export const courseCpp: Course = {
  id: 'cpp-1',
  track: 'cpp',
  number: 1,
  title: 'C++: de basis',
  description: 'De taal van game-engines. Output, variabelen, if, lussen en functies, met een echte C++-compiler.',
  level: 'Beginner',
  planned: [],
  lessons: [
    {
      id: 'cpp-hello',
      courseId: 'cpp-1',
      title: 'Je eerste C++-programma',
      objective: 'Je kunt met std::cout tekst laten zien en begrijpt #include, main en de puntkomma.',
      minutes: 10,
      prerequisites: [],
      concepts: ['cpp-basics'],
      steps: [
        {
          type: 'explain',
          body: `**C++** is een van de belangrijkste programmeertalen ter wereld. Game-engines zoals Unreal zijn erin geschreven, en de Roblox-engine zelf ook.

C++ is strenger dan Luau: je code wordt eerst door een **compiler** vertaald naar een programma, en pas daarna uitgevoerd. De compiler controleert je code heel precies. Elke opdracht eindigt bijvoorbeeld met een **puntkomma** \`;\`.`,
        },
        {
          type: 'code',
          title: 'Hallo, C++',
          body: 'Klik op de onderdelen om te zien wat ze doen.',
          code: `${H}\nint main() {\n    std::cout << "Hallo C++!" << std::endl;\n    return 0;\n}`,
          runnable: true,
          annotations: [
            { token: '#include', text: '`#include <iostream>` haalt de bibliotheek binnen waarmee je tekst kunt laten zien (in = input, out = output).' },
            { token: 'main', text: '`int main()` is de **startfunctie**: een C++-programma begint altijd hier. Alles tussen de `{ }` wordt uitgevoerd.' },
            { token: 'std::cout', text: '`std::cout` is de **Output**: de plek waar tekst verschijnt. `std::` betekent: uit de standaardbibliotheek.' },
            { token: '<<', text: 'Met `<<` "stuur" je iets naar de Output. Je kunt meerdere dingen achter elkaar sturen.' },
            { token: 'std::endl', text: '`std::endl` is een nieuwe regel (end line).' },
            { token: ';', text: 'De **puntkomma** sluit de opdracht af. Vergeet je hem, dan weigert de compiler je code.' },
            { token: 'return', text: '`return 0;` zegt: het programma is goed afgelopen.' },
          ],
          after: 'Na **Run Code** compileert de Academy je code met g++ en voert het programma uit.',
        },
        {
          type: 'quiz',
          id: 'cpp-hello-q1',
          question: 'Waar begint een C++-programma?',
          concepts: ['cpp-basics'],
          options: [
            { text: 'In de functie main', correct: true, feedback: 'Juist. `int main()` is altijd het startpunt.' },
            { text: 'Op de eerste regel van het bestand', feedback: 'De eerste regels zijn meestal `#include`s. Het programma zelf start in `main`.' },
            { text: 'Bij std::cout', feedback: '`std::cout` is de Output, niet het startpunt.' },
          ],
        },
        {
          type: 'exercise',
          id: 'cpp-hello-ex1',
          mode: 'guided',
          title: 'Pas de tekst aan',
          prompt: 'Verander het programma zodat het **Ik leer C++!** laat zien.',
          starter: `${H}\nint main() {\n    std::cout << "Hallo C++!" << std::endl;\n    return 0;\n}`,
          checks: [{ kind: 'output', lines: ['Ik leer C++!'], message: 'De Output moet precies **Ik leer C++!** zijn.' }],
          hints: ['Verander alleen de tekst tussen de aanhalingstekens.'],
          solution: `${H}\nint main() {\n    std::cout << "Ik leer C++!" << std::endl;\n    return 0;\n}`,
          concepts: ['cpp-basics'],
          success: 'Je eerste C++-programma, gecompileerd en uitgevoerd.',
        },
        {
          type: 'exercise',
          id: 'cpp-hello-ex2',
          mode: 'guided',
          kind: 'fix-bug',
          title: 'De vergeten puntkomma',
          prompt: 'De compiler weigert deze code. Klik op **Run Code**, lees de uitleg en repareer de fout. De Output moet **Level 1** en daarna **Start!** zijn.',
          starter: `${H}\nint main() {\n    std::cout << "Level 1" << std::endl\n    std::cout << "Start!" << std::endl;\n    return 0;\n}`,
          checks: [{ kind: 'output', lines: ['Level 1', 'Start!'], message: 'De Output moet **Level 1** en daarna **Start!** zijn.' }],
          hints: ['Welke regel eindigt niet met een `;`?'],
          solution: `${H}\nint main() {\n    std::cout << "Level 1" << std::endl;\n    std::cout << "Start!" << std::endl;\n    return 0;\n}`,
          concepts: ['cpp-basics'],
          success: 'Opgelost. De vergeten puntkomma is de bekendste C++-fout.',
        },
      ],
      summary: ['Een C++-programma start in `int main()`.', '`std::cout << ... << std::endl;` laat een regel tekst zien.', 'Elke opdracht eindigt met `;`.', 'De compiler controleert je code voordat hij draait.'],
    },
    {
      id: 'cpp-variables',
      courseId: 'cpp-1',
      title: 'Variabelen en types',
      objective: 'Je kunt variabelen maken met een type (int, double, bool, std::string) en ermee rekenen.',
      minutes: 12,
      prerequisites: ['cpp-basics'],
      concepts: ['cpp-variables'],
      steps: [
        {
          type: 'explain',
          body: `In Luau schrijf je \`local coins = 100\`. In C++ zeg je er ook bij **wat voor soort** waarde erin zit: het **type**.

- \`int\`: een heel getal, zoals \`100\`
- \`double\`: een kommagetal, zoals \`1.5\`
- \`bool\`: \`true\` of \`false\`
- \`std::string\`: tekst (hiervoor heb je \`#include <string>\` nodig)

Een variabele kan daarna alleen waarden van dat type bevatten.`,
        },
        {
          type: 'code',
          code: `${H}#include <string>\n\nint main() {\n    int coins = 100;\n    double speed = 16.5;\n    std::string name = "Nova";\n    coins += 25;\n    std::cout << name << " heeft " << coins << " coins" << std::endl;\n    std::cout << "Snelheid: " << speed << std::endl;\n    return 0;\n}`,
          runnable: true,
          after: 'Met `<<` kun je tekst en getallen gewoon achter elkaar zetten.',
        },
        {
          type: 'predict',
          id: 'cpp-variables-p1',
          question: 'Wat laat deze code zien? (Let op: beide getallen zijn int.)',
          code: `${H}\nint main() {\n    int a = 7;\n    int b = 2;\n    std::cout << a / b << std::endl;\n    return 0;\n}`,
          concepts: ['cpp-variables'],
          options: [
            { text: '3.5', feedback: 'Bij twee `int`s rekent C++ met hele getallen: het deel achter de komma valt weg.' },
            { text: '3', correct: true, feedback: 'Juist. `int / int` geeft een heel getal. Met `7.0 / 2` krijg je 3.5.' },
            { text: '4', feedback: 'C++ rondt niet af, maar kapt af: 3.5 wordt 3.' },
          ],
        },
        {
          type: 'exercise',
          id: 'cpp-variables-ex1',
          mode: 'independent',
          title: 'Iets kopen',
          prompt: 'Maak een `int price` met de waarde **50**. Trek de prijs af van `coins` en laat **Over: 70** zien. Gebruik de variabelen, zodat het ook klopt als `coins` verandert.',
          starter: `${H}\nint main() {\n    int coins = 120;\n\n    return 0;\n}`,
          checks: [
            { kind: 'output', lines: ['Over: 70'], message: 'De Output moet **Over: 70** zijn.' },
            { kind: 'uses', sequence: ['int', 'price'], message: 'Maak een variabele `int price`.' },
            { kind: 'variants', replace: 'int coins = 120;', cases: [{ with: 'int coins = 300;', lines: ['Over: 250'] }], message: 'Je code werkt alleen voor 120 coins. Reken met de variabelen.' },
          ],
          hints: ['int price = 50;', 'coins -= price; en daarna std::cout << "Over: " << coins << std::endl;'],
          solution: `${H}\nint main() {\n    int coins = 120;\n    int price = 50;\n    coins -= price;\n    std::cout << "Over: " << coins << std::endl;\n    return 0;\n}`,
          concepts: ['cpp-variables'],
          success: 'Getest met 120 en 300 coins.',
        },
      ],
      summary: ['Een variabele heeft in C++ altijd een type: `int`, `double`, `bool`, `std::string`.', '`int / int` geeft een heel getal.', 'Met `<<` zet je tekst en getallen achter elkaar in de Output.'],
    },
    {
      id: 'cpp-if',
      courseId: 'cpp-1',
      title: 'if, else if en else',
      objective: 'Je kunt in C++ keuzes maken met if-statements en && en ||.',
      minutes: 10,
      prerequisites: ['cpp-variables'],
      concepts: ['cpp-conditions'],
      steps: [
        {
          type: 'explain',
          body: `If-statements werken net als in Luau, maar de vorm is anders:
- de voorwaarde staat tussen **haakjes**: \`if (coins >= 100)\`
- het blok staat tussen **accolades** \`{ }\` in plaats van \`then\` ... \`end\`
- \`and\` is \`&&\`, \`or\` is \`||\`, \`not\` is \`!\`, en "niet gelijk" is \`!=\``,
        },
        {
          type: 'code',
          code: `${H}\nint main() {\n    int health = 35;\n    if (health > 70) {\n        std::cout << "Gezond" << std::endl;\n    } else if (health > 30) {\n        std::cout << "Gewond" << std::endl;\n    } else {\n        std::cout << "Bijna dood!" << std::endl;\n    }\n    return 0;\n}`,
          runnable: true,
        },
        {
          type: 'exercise',
          id: 'cpp-if-ex1',
          mode: 'independent',
          title: 'Medailles',
          prompt: 'Laat op basis van `time` zien:\n- minder dan 30 → **Goud**\n- minder dan 60 → **Zilver**\n- anders → **Brons**',
          starter: `${H}\nint main() {\n    int time = 45;\n\n    return 0;\n}`,
          checks: [
            { kind: 'output', lines: ['Zilver'], message: 'Met time 45 hoort **Zilver** te verschijnen.' },
            { kind: 'variants', replace: 'int time = 45;', cases: [{ with: 'int time = 10;', lines: ['Goud'] }, { with: 'int time = 30;', lines: ['Zilver'] }, { with: 'int time = 60;', lines: ['Brons'] }], message: 'Je medailles kloppen niet voor alle tijden.' },
          ],
          hints: ['if (time < 30) { ... } else if (time < 60) { ... } else { ... }'],
          solution: `${H}\nint main() {\n    int time = 45;\n    if (time < 30) {\n        std::cout << "Goud" << std::endl;\n    } else if (time < 60) {\n        std::cout << "Zilver" << std::endl;\n    } else {\n        std::cout << "Brons" << std::endl;\n    }\n    return 0;\n}`,
          concepts: ['cpp-conditions'],
          success: 'Getest met 10, 30, 45 en 60.',
        },
        {
          type: 'exercise',
          id: 'cpp-if-ex2',
          mode: 'independent',
          title: 'Mag ik aanvallen?',
          prompt: 'Laat **Aanval!** zien als `health` groter is dan 0 **en** `inSafeZone` `false` is. Anders **Kan niet aanvallen**.',
          starter: `${H}\nint main() {\n    int health = 50;\n    bool inSafeZone = false;\n\n    return 0;\n}`,
          checks: [
            { kind: 'output', lines: ['Aanval!'], message: 'Met health 50 buiten de safezone: **Aanval!**' },
            { kind: 'variants', replace: 'bool inSafeZone = false;', cases: [{ with: 'bool inSafeZone = true;', lines: ['Kan niet aanvallen'] }], message: 'In de safezone mag het niet.' },
            { kind: 'variants', replace: 'int health = 50;', cases: [{ with: 'int health = 0;', lines: ['Kan niet aanvallen'] }], message: 'Met 0 health mag het niet.' },
          ],
          hints: ['if (health > 0 && !inSafeZone) { ... } else { ... }'],
          solution: `${H}\nint main() {\n    int health = 50;\n    bool inSafeZone = false;\n    if (health > 0 && !inSafeZone) {\n        std::cout << "Aanval!" << std::endl;\n    } else {\n        std::cout << "Kan niet aanvallen" << std::endl;\n    }\n    return 0;\n}`,
          concepts: ['cpp-conditions'],
          success: '`&&` en `!` zijn de C++-versies van `and` en `not`.',
        },
      ],
      summary: ['`if (voorwaarde) { ... } else if (...) { ... } else { ... }`', '`&&` = and, `||` = or, `!` = not, `!=` = niet gelijk.'],
    },
    {
      id: 'cpp-loops',
      courseId: 'cpp-1',
      title: 'for- en while-lussen',
      objective: 'Je kunt code herhalen met for en while in C++.',
      minutes: 10,
      prerequisites: ['cpp-conditions'],
      concepts: ['cpp-loops'],
      steps: [
        {
          type: 'explain',
          body: `Een for-lus in C++ heeft drie delen tussen haakjes, gescheiden door puntkomma's:

\`for (int i = 1; i <= 3; i++)\`

1. **begin**: \`int i = 1\`
2. **zolang**: \`i <= 3\`
3. **na elke ronde**: \`i++\` (betekent: i += 1)

Een while-lus is \`while (voorwaarde) { ... }\`.`,
        },
        {
          type: 'code',
          code: `${H}\nint main() {\n    for (int i = 1; i <= 3; i++) {\n        std::cout << "Ronde " << i << std::endl;\n    }\n    int coins = 0;\n    while (coins < 50) {\n        coins += 20;\n    }\n    std::cout << "Coins: " << coins << std::endl;\n    return 0;\n}`,
          runnable: true,
        },
        {
          type: 'exercise',
          id: 'cpp-loops-ex1',
          mode: 'independent',
          title: 'Aftellen',
          prompt: 'Tel af van `seconds` naar 1 (elk getal op een eigen regel) en laat daarna **GO!** zien.',
          starter: `${H}\nint main() {\n    int seconds = 3;\n\n    return 0;\n}`,
          checks: [
            { kind: 'output', lines: ['3', '2', '1', 'GO!'], message: 'Met 3 seconden: 3, 2, 1 en GO!' },
            { kind: 'variants', replace: 'int seconds = 3;', cases: [{ with: 'int seconds = 5;', lines: ['5', '4', '3', '2', '1', 'GO!'] }], message: 'Je aftelling gebruikt `seconds` nog niet goed.' },
          ],
          hints: ['for (int i = seconds; i >= 1; i--) { ... }', '`i--` betekent i -= 1.'],
          solution: `${H}\nint main() {\n    int seconds = 3;\n    for (int i = seconds; i >= 1; i--) {\n        std::cout << i << std::endl;\n    }\n    std::cout << "GO!" << std::endl;\n    return 0;\n}`,
          concepts: ['cpp-loops'],
          success: 'Getest met 3 en 5 seconden.',
        },
      ],
      summary: ['`for (begin; zolang; stap) { ... }`', '`i++` telt op, `i--` telt af.', '`while (voorwaarde) { ... }` herhaalt zolang iets waar is.'],
    },
    {
      id: 'cpp-functions',
      courseId: 'cpp-1',
      title: 'Functies',
      objective: 'Je kunt een functie met parameters en een return-type schrijven.',
      minutes: 12,
      prerequisites: ['cpp-loops'],
      concepts: ['cpp-functions'],
      steps: [
        {
          type: 'explain',
          body: `Een functie in C++ begint met het **type van het antwoord** (\`int\`, \`double\`, \`bool\`, of \`void\` als hij niets teruggeeft), dan de naam, dan de parameters **met hun type**.

\`int square(int n) { return n * n; }\`

Zet functies **boven** \`main\`, zodat de compiler ze al kent als \`main\` ze gebruikt.`,
        },
        {
          type: 'code',
          code: `${H}#include <string>\n\nint square(int n) {\n    return n * n;\n}\n\nvoid greet(std::string name) {\n    std::cout << "Welkom, " << name << std::endl;\n}\n\nint main() {\n    greet("Kai");\n    std::cout << square(7) << std::endl;\n    return 0;\n}`,
          runnable: true,
          after: '`void` betekent: deze functie geeft niets terug.',
        },
        {
          type: 'exercise',
          id: 'cpp-functions-ex1',
          mode: 'independent',
          title: 'Schadeberekening',
          prompt: 'Schrijf boven `main` de functie `int damage(int base, bool critical)`: die geeft `base` terug, of het dubbele als `critical` true is. `main` gebruikt hem al.',
          starter: `${H}\n// schrijf hier je functie\n\nint main() {\n    std::cout << damage(10, false) << std::endl;\n    std::cout << damage(10, true) << std::endl;\n    return 0;\n}`,
          checks: [
            { kind: 'output', lines: ['10', '20'], message: 'damage(10, false) moet 10 geven en damage(10, true) 20.' },
            { kind: 'variants', replace: '    std::cout << damage(10, true) << std::endl;', cases: [{ with: '    std::cout << damage(7, true) << std::endl;', lines: ['10', '14'] }], message: 'Je functie werkt niet voor andere waarden. Gebruik `base` in je berekening.' },
          ],
          hints: ['int damage(int base, bool critical) {\n    if (critical) { return base * 2; }\n    return base;\n}'],
          solution: `${H}\nint damage(int base, bool critical) {\n    if (critical) {\n        return base * 2;\n    }\n    return base;\n}\n\nint main() {\n    std::cout << damage(10, false) << std::endl;\n    std::cout << damage(10, true) << std::endl;\n    return 0;\n}`,
          concepts: ['cpp-functions'],
          success: 'Je eerste C++-functie, getest met verschillende waarden.',
        },
      ],
      summary: ['`type naam(type parameter) { ... return ...; }`', '`void` = geeft niets terug.', 'Zet functies boven `main`.'],
    },
  ],
};
