import type { Course } from './types';

const main = (body: string, extra = '') => `public class Main {\n${extra}    public static void main(String[] args) {\n${body}\n    }\n}`;

export const courseJava: Course = {
  id: 'java-1',
  track: 'java',
  number: 1,
  title: 'Java: de basis',
  description: 'Een van de meest gebruikte talen ter wereld (ook voor Minecraft-mods). Output, variabelen, if, lussen en methodes.',
  level: 'Beginner',
  planned: [],
  lessons: [
    {
      id: 'java-hello',
      courseId: 'java-1',
      title: 'Je eerste Java-programma',
      objective: 'Je kunt met System.out.println tekst laten zien en begrijpt class, main en de puntkomma.',
      minutes: 10,
      prerequisites: [],
      concepts: ['java-basics'],
      steps: [
        {
          type: 'explain',
          body: `**Java** draait op miljarden apparaten: Android-apps, servers, en Minecraft (Java Edition) is erin geschreven.

In Java staat alle code in een **class** (klasse). Het programma start in de methode \`main\`. Net als in C++ eindigt elke opdracht met een **puntkomma** \`;\` en staan blokken tussen \`{ }\`.`,
        },
        {
          type: 'code',
          title: 'Hallo, Java',
          body: 'Klik op de onderdelen om te zien wat ze doen.',
          code: main('        System.out.println("Hallo Java!");'),
          runnable: true,
          annotations: [
            { token: 'class', text: '`public class Main` maakt een klasse met de naam `Main`. In Java staat alle code in een klasse.' },
            { token: 'main', text: '`public static void main(String[] args)` is het **startpunt** van je programma. Deze regel schrijf je altijd zo; wat elk woord betekent leer je later.' },
            { token: 'System.out.println', text: '`System.out.println(...)` laat een regel tekst zien in de Output (println = print line).' },
            { token: ';', text: 'De **puntkomma** sluit de opdracht af.' },
          ],
        },
        {
          type: 'exercise',
          id: 'java-hello-ex1',
          mode: 'guided',
          title: 'Pas de tekst aan',
          prompt: 'Verander het programma zodat het **Ik leer Java!** laat zien.',
          starter: main('        System.out.println("Hallo Java!");'),
          checks: [{ kind: 'output', lines: ['Ik leer Java!'], message: 'De Output moet precies **Ik leer Java!** zijn.' }],
          hints: ['Verander alleen de tekst tussen de aanhalingstekens.'],
          solution: main('        System.out.println("Ik leer Java!");'),
          concepts: ['java-basics'],
          success: 'Je eerste Java-programma.',
        },
        {
          type: 'exercise',
          id: 'java-hello-ex2',
          mode: 'guided',
          kind: 'fix-bug',
          title: 'Hoofdletters tellen',
          prompt: 'Deze code geeft een fout. Lees de uitleg en repareer hem. De Output moet **Start!** zijn.',
          starter: main('        system.out.println("Start!");'),
          checks: [{ kind: 'output', lines: ['Start!'], message: 'De Output moet **Start!** zijn.' }],
          hints: ['Java is hoofdlettergevoelig. Hoe schrijf je `System`?'],
          solution: main('        System.out.println("Start!");'),
          concepts: ['java-basics'],
          success: 'Klassen zoals `System` en `String` beginnen in Java altijd met een hoofdletter.',
        },
      ],
      summary: ['Java-code staat in een `class`; het programma start in `main`.', '`System.out.println(...)` laat een regel zien.', 'Elke opdracht eindigt met `;`. Java is hoofdlettergevoelig.'],
    },
    {
      id: 'java-variables',
      courseId: 'java-1',
      title: 'Variabelen en types',
      objective: 'Je kunt variabelen maken met een type (int, double, boolean, String) en ermee rekenen.',
      minutes: 12,
      prerequisites: ['java-basics'],
      concepts: ['java-variables'],
      steps: [
        {
          type: 'explain',
          body: `Ook in Java heeft elke variabele een **type**:
- \`int\`: heel getal
- \`double\`: kommagetal
- \`boolean\`: \`true\` of \`false\`
- \`String\`: tekst (met hoofdletter S)

Tekst en getallen plak je aan elkaar met \`+\`: \`"Coins: " + coins\`.`,
        },
        {
          type: 'code',
          code: main('        int coins = 100;\n        String name = "Nova";\n        coins += 25;\n        System.out.println(name + " heeft " + coins + " coins");'),
          runnable: true,
        },
        {
          type: 'predict',
          id: 'java-variables-p1',
          question: 'Wat laat deze code zien?',
          code: main('        System.out.println("Score: " + 1 + 2);'),
          concepts: ['java-variables'],
          options: [
            { text: 'Score: 3', feedback: 'Java werkt van links naar rechts: eerst "Score: " + 1 wordt tekst, daarna + 2 wordt er ook aan geplakt.' },
            { text: 'Score: 12', correct: true, feedback: 'Juist. Zodra links tekst staat, plakt `+` alles als tekst aan elkaar. Met haakjes, `(1 + 2)`, krijg je 3.' },
          ],
        },
        {
          type: 'exercise',
          id: 'java-variables-ex1',
          mode: 'independent',
          title: 'Iets kopen',
          prompt: 'Maak een `int price` met de waarde **50**, trek hem af van `coins` en laat **Over: 70** zien. Gebruik de variabelen.',
          starter: main('        int coins = 120;\n'),
          checks: [
            { kind: 'output', lines: ['Over: 70'], message: 'De Output moet **Over: 70** zijn.' },
            { kind: 'uses', sequence: ['int', 'price'], message: 'Maak een variabele `int price`.' },
            { kind: 'variants', replace: 'int coins = 120;', cases: [{ with: 'int coins = 300;', lines: ['Over: 250'] }], message: 'Je code werkt alleen voor 120 coins. Reken met de variabelen.' },
          ],
          hints: ['int price = 50;', 'coins -= price; System.out.println("Over: " + coins);'],
          solution: main('        int coins = 120;\n        int price = 50;\n        coins -= price;\n        System.out.println("Over: " + coins);'),
          concepts: ['java-variables'],
          success: 'Getest met 120 en 300 coins.',
        },
      ],
      summary: ['Types: `int`, `double`, `boolean`, `String`.', 'Tekst en waarden plak je aan elkaar met `+`.', 'Let op de volgorde: links tekst = alles wordt tekst.'],
    },
    {
      id: 'java-if',
      courseId: 'java-1',
      title: 'if, else if en else',
      objective: 'Je kunt in Java keuzes maken met if-statements, && en ||.',
      minutes: 10,
      prerequisites: ['java-variables'],
      concepts: ['java-conditions'],
      steps: [
        {
          type: 'explain',
          body: `De vorm is gelijk aan C++: \`if (voorwaarde) { ... } else if (...) { ... } else { ... }\`.

\`&&\` = en, \`||\` = of, \`!\` = niet. **Let op:** tekst vergelijk je in Java met \`.equals\`: \`team.equals("Rood")\`, niet met \`==\`.`,
        },
        {
          type: 'exercise',
          id: 'java-if-ex1',
          mode: 'independent',
          title: 'Medailles',
          prompt: 'Laat op basis van `time` zien:\n- minder dan 30 → **Goud**\n- minder dan 60 → **Zilver**\n- anders → **Brons**',
          starter: main('        int time = 45;\n'),
          checks: [
            { kind: 'output', lines: ['Zilver'], message: 'Met time 45 hoort **Zilver** te verschijnen.' },
            { kind: 'variants', replace: 'int time = 45;', cases: [{ with: 'int time = 10;', lines: ['Goud'] }, { with: 'int time = 60;', lines: ['Brons'] }], message: 'Je medailles kloppen niet voor alle tijden.' },
          ],
          hints: ['if (time < 30) { ... } else if (time < 60) { ... } else { ... }'],
          solution: main('        int time = 45;\n        if (time < 30) {\n            System.out.println("Goud");\n        } else if (time < 60) {\n            System.out.println("Zilver");\n        } else {\n            System.out.println("Brons");\n        }'),
          concepts: ['java-conditions'],
          success: 'Getest met 10, 45 en 60.',
        },
        {
          type: 'exercise',
          id: 'java-if-ex2',
          mode: 'independent',
          title: 'Zelfde team?',
          prompt: 'Laat **Vriend** zien als `myTeam` en `otherTeam` gelijk zijn, en anders **Vijand**. Vergelijk de tekst met `.equals`.',
          starter: main('        String myTeam = "Rood";\n        String otherTeam = "Blauw";\n'),
          checks: [
            { kind: 'output', lines: ['Vijand'], message: 'Rood en Blauw: **Vijand**.' },
            { kind: 'uses', sequence: ['.', 'equals', '('], message: 'Vergelijk tekst met `.equals(...)`.' },
            { kind: 'variants', replace: 'String otherTeam = "Blauw";', cases: [{ with: 'String otherTeam = "Rood";', lines: ['Vriend'] }], message: 'Twee keer Rood moet **Vriend** geven.' },
          ],
          hints: ['if (myTeam.equals(otherTeam)) { ... } else { ... }'],
          solution: main('        String myTeam = "Rood";\n        String otherTeam = "Blauw";\n        if (myTeam.equals(otherTeam)) {\n            System.out.println("Vriend");\n        } else {\n            System.out.println("Vijand");\n        }'),
          concepts: ['java-conditions'],
          success: '`.equals` vergelijkt de inhoud van tekst. Dat is een bekende Java-valkuil.',
        },
      ],
      summary: ['`if (...) { } else if (...) { } else { }`', '`&&`, `||`, `!`', 'Tekst vergelijk je met `.equals(...)`.'],
    },
    {
      id: 'java-loops',
      courseId: 'java-1',
      title: 'for- en while-lussen',
      objective: 'Je kunt code herhalen met for en while in Java.',
      minutes: 10,
      prerequisites: ['java-conditions'],
      concepts: ['java-loops'],
      steps: [
        {
          type: 'code',
          title: 'Lussen in Java',
          body: 'Een for-lus heeft drie delen: begin, zolang, en wat er na elke ronde gebeurt. `i++` betekent: tel 1 op.',
          code: main('        for (int i = 1; i <= 3; i++) {\n            System.out.println("Ronde " + i);\n        }\n        int coins = 0;\n        while (coins < 50) {\n            coins += 20;\n        }\n        System.out.println("Coins: " + coins);'),
          runnable: true,
        },
        {
          type: 'exercise',
          id: 'java-loops-ex1',
          mode: 'independent',
          title: 'Tafel van een getal',
          prompt: 'Laat met een for-lus de tafel van `number` zien, van 1 tot en met 3. Met `number = 7`:\n**1 x 7 = 7**\n**2 x 7 = 14**\n**3 x 7 = 21**',
          starter: main('        int number = 7;\n'),
          checks: [
            { kind: 'output', lines: ['1 x 7 = 7', '2 x 7 = 14', '3 x 7 = 21'], message: 'De output voor 7 klopt nog niet.' },
            { kind: 'variants', replace: 'int number = 7;', cases: [{ with: 'int number = 4;', lines: ['1 x 4 = 4', '2 x 4 = 8', '3 x 4 = 12'] }], message: 'Je code werkt alleen voor 7. Gebruik `number`.' },
          ],
          hints: ['for (int i = 1; i <= 3; i++) { System.out.println(i + " x " + number + " = " + (i * number)); }'],
          solution: main('        int number = 7;\n        for (int i = 1; i <= 3; i++) {\n            System.out.println(i + " x " + number + " = " + (i * number));\n        }'),
          concepts: ['java-loops'],
          success: 'Let op de haakjes rond `(i * number)`: zonder die haakjes plakt Java de getallen als tekst.',
        },
      ],
      summary: ['`for (int i = 1; i <= n; i++) { }`', '`while (voorwaarde) { }`', 'Gebruik haakjes bij rekenen binnen tekst: `"= " + (a * b)`.'],
    },
    {
      id: 'java-methods',
      courseId: 'java-1',
      title: 'Methodes',
      objective: 'Je kunt een static methode met parameters en een return-type schrijven.',
      minutes: 12,
      prerequisites: ['java-loops'],
      concepts: ['java-methods'],
      steps: [
        {
          type: 'explain',
          body: `In Java heet een functie een **methode**. Voor nu schrijf je ze als \`static\` in je klasse:

\`static int square(int n) { return n * n; }\`

Het eerste woord na \`static\` is het type van het antwoord (\`void\` = niets).`,
        },
        {
          type: 'exercise',
          id: 'java-methods-ex1',
          mode: 'independent',
          title: 'Schadeberekening',
          prompt: 'Schrijf in de klasse (boven `main`) de methode `static int damage(int base, boolean critical)`: geef `base` terug, of het dubbele als `critical` true is.',
          starter: main('        System.out.println(damage(10, false));\n        System.out.println(damage(10, true));', '    // schrijf hier je methode\n\n'),
          checks: [
            { kind: 'output', lines: ['10', '20'], message: 'damage(10, false) moet 10 geven en damage(10, true) 20.' },
            { kind: 'variants', replace: '        System.out.println(damage(10, true));', cases: [{ with: '        System.out.println(damage(7, true));', lines: ['10', '14'] }], message: 'Je methode werkt niet voor andere waarden. Gebruik `base`.' },
          ],
          hints: ['static int damage(int base, boolean critical) {\n    if (critical) { return base * 2; }\n    return base;\n}'],
          solution: main('        System.out.println(damage(10, false));\n        System.out.println(damage(10, true));', '    static int damage(int base, boolean critical) {\n        if (critical) {\n            return base * 2;\n        }\n        return base;\n    }\n\n'),
          concepts: ['java-methods'],
          success: 'Je eerste Java-methode, getest met verschillende waarden.',
        },
      ],
      summary: ['Een methode: `static type naam(type parameter) { ... }`', '`return` geeft het antwoord terug; `void` geeft niets terug.'],
    },
  ],
};
