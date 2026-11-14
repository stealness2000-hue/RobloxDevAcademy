import type { Course } from './types';

const main = (body: string, extra = '') => `public class Main {\n${extra}    public static void main(String[] args) {\n${body}\n    }\n}`;

export const courseJava: Course = {
  id: 'java-1',
  track: 'java',
  number: 1,
  title: 'Java: the basics',
  description: 'One of the most used languages in the world (also for Minecraft mods). Output, variables, if, loops and methods.',
  level: 'Beginner',
  planned: [],
  lessons: [
    {
      id: 'java-hello',
      courseId: 'java-1',
      title: 'Your first Java program',
      objective: 'You can show text with System.out.println and understand class, main and the semicolon.',
      minutes: 10,
      prerequisites: [],
      concepts: ['java-basics'],
      steps: [
        {
          type: 'explain',
          body: `**Java** runs on billions of devices: Android apps, servers, and Minecraft (Java Edition) is written in it.

In Java all code lives in a **class**. The program starts in the method \`main\`. Just like in C++, every instruction ends with a **semicolon** \`;\` and blocks go between \`{ }\`.`,
        },
        {
          type: 'code',
          title: 'Hello, Java',
          body: 'Click the parts to see what they do.',
          code: main('        System.out.println("Hello Java!");'),
          runnable: true,
          annotations: [
            { token: 'class', text: '`public class Main` creates a class named `Main`. In Java all code lives in a class.' },
            { token: 'main', text: '`public static void main(String[] args)` is the **starting point** of your program. You always write this line like this; you will learn what each word means later.' },
            { token: 'System.out.println', text: '`System.out.println(...)` shows a line of text in the Output (println = print line).' },
            { token: ';', text: 'The **semicolon** ends the instruction.' },
          ],
        },
        {
          type: 'exercise',
          id: 'java-hello-ex1',
          mode: 'guided',
          title: 'Change the text',
          prompt: 'Change the program so it shows **I am learning Java!**',
          starter: main('        System.out.println("Hello Java!");'),
          checks: [{ kind: 'output', lines: ['I am learning Java!'], message: 'The Output must be exactly **I am learning Java!**' }],
          hints: ['Only change the text between the quotes.'],
          solution: main('        System.out.println("I am learning Java!");'),
          concepts: ['java-basics'],
          success: 'Your first Java program.',
        },
        {
          type: 'exercise',
          id: 'java-hello-ex2',
          mode: 'guided',
          kind: 'fix-bug',
          title: 'Capital letters count',
          prompt: 'This code gives an error. Read the explanation and fix it. The Output must be **Start!**',
          starter: main('        system.out.println("Start!");'),
          checks: [{ kind: 'output', lines: ['Start!'], message: 'The Output must be **Start!**' }],
          hints: ['Java is case-sensitive. How do you write `System`?'],
          solution: main('        System.out.println("Start!");'),
          concepts: ['java-basics'],
          success: 'Classes like `System` and `String` always start with a capital letter in Java.',
        },
      ],
      summary: ['Java code lives in a `class`; the program starts in `main`.', '`System.out.println(...)` shows a line.', 'Every instruction ends with `;`. Java is case-sensitive.'],
    },
    {
      id: 'java-variables',
      courseId: 'java-1',
      title: 'Variables and types',
      objective: 'You can create variables with a type (int, double, boolean, String) and calculate with them.',
      minutes: 12,
      prerequisites: ['java-basics'],
      concepts: ['java-variables'],
      steps: [
        {
          type: 'explain',
          body: `In Java every variable has a **type** too:
- \`int\`: whole number
- \`double\`: decimal number
- \`boolean\`: \`true\` or \`false\`
- \`String\`: text (with a capital S)

You join text and numbers with \`+\`: \`"Coins: " + coins\`.`,
        },
        {
          type: 'code',
          code: main('        int coins = 100;\n        String name = "Nova";\n        coins += 25;\n        System.out.println(name + " has " + coins + " coins");'),
          runnable: true,
        },
        {
          type: 'predict',
          id: 'java-variables-p1',
          question: 'What does this code show?',
          code: main('        System.out.println("Score: " + 1 + 2);'),
          concepts: ['java-variables'],
          options: [
            { text: 'Score: 3', feedback: 'Java works from left to right: first "Score: " + 1 becomes text, then + 2 is glued onto it as well.' },
            { text: 'Score: 12', correct: true, feedback: 'Right. As soon as there is text on the left, `+` glues everything together as text. With brackets, `(1 + 2)`, you get 3.' },
          ],
        },
        {
          type: 'exercise',
          id: 'java-variables-ex1',
          mode: 'independent',
          title: 'Buying something',
          prompt: 'Create an `int price` with the value **50**, subtract it from `coins` and show **Left: 70**. Use the variables.',
          starter: main('        int coins = 120;\n'),
          checks: [
            { kind: 'output', lines: ['Left: 70'], message: 'The Output must be **Left: 70**.' },
            { kind: 'uses', sequence: ['int', 'price'], message: 'Create a variable `int price`.' },
            { kind: 'variants', replace: 'int coins = 120;', cases: [{ with: 'int coins = 300;', lines: ['Left: 250'] }], message: 'Your code only works for 120 coins. Calculate with the variables.' },
          ],
          hints: ['int price = 50;', 'coins -= price; System.out.println("Left: " + coins);'],
          solution: main('        int coins = 120;\n        int price = 50;\n        coins -= price;\n        System.out.println("Left: " + coins);'),
          concepts: ['java-variables'],
          success: 'Tested with 120 and 300 coins.',
        },
      ],
      summary: ['Types: `int`, `double`, `boolean`, `String`.', 'You join text and values with `+`.', 'Watch the order: text on the left = everything becomes text.'],
    },
    {
      id: 'java-if',
      courseId: 'java-1',
      title: 'if, else if and else',
      objective: 'You can make choices in Java with if statements, && and ||.',
      minutes: 10,
      prerequisites: ['java-variables'],
      concepts: ['java-conditions'],
      steps: [
        {
          type: 'explain',
          body: `The shape is the same as in C++: \`if (condition) { ... } else if (...) { ... } else { ... }\`.

\`&&\` = and, \`||\` = or, \`!\` = not. **Careful:** in Java you compare text with \`.equals\`: \`team.equals("Red")\`, not with \`==\`.`,
        },
        {
          type: 'exercise',
          id: 'java-if-ex1',
          mode: 'independent',
          title: 'Medals',
          prompt: 'Based on `time`, show:\n- less than 30 → **Gold**\n- less than 60 → **Silver**\n- otherwise → **Bronze**',
          starter: main('        int time = 45;\n'),
          checks: [
            { kind: 'output', lines: ['Silver'], message: 'With time 45, **Silver** should appear.' },
            { kind: 'variants', replace: 'int time = 45;', cases: [{ with: 'int time = 10;', lines: ['Gold'] }, { with: 'int time = 60;', lines: ['Bronze'] }], message: 'Your medals are not right for every time.' },
          ],
          hints: ['if (time < 30) { ... } else if (time < 60) { ... } else { ... }'],
          solution: main('        int time = 45;\n        if (time < 30) {\n            System.out.println("Gold");\n        } else if (time < 60) {\n            System.out.println("Silver");\n        } else {\n            System.out.println("Bronze");\n        }'),
          concepts: ['java-conditions'],
          success: 'Tested with 10, 45 and 60.',
        },
        {
          type: 'exercise',
          id: 'java-if-ex2',
          mode: 'independent',
          title: 'Same team?',
          prompt: 'Show **Friend** when `myTeam` and `otherTeam` are equal, and otherwise **Enemy**. Compare the text with `.equals`.',
          starter: main('        String myTeam = "Red";\n        String otherTeam = "Blue";\n'),
          checks: [
            { kind: 'output', lines: ['Enemy'], message: 'Red and Blue: **Enemy**.' },
            { kind: 'uses', sequence: ['.', 'equals', '('], message: 'Compare text with `.equals(...)`.' },
            { kind: 'variants', replace: 'String otherTeam = "Blue";', cases: [{ with: 'String otherTeam = "Red";', lines: ['Friend'] }], message: 'Red twice must give **Friend**.' },
          ],
          hints: ['if (myTeam.equals(otherTeam)) { ... } else { ... }'],
          solution: main('        String myTeam = "Red";\n        String otherTeam = "Blue";\n        if (myTeam.equals(otherTeam)) {\n            System.out.println("Friend");\n        } else {\n            System.out.println("Enemy");\n        }'),
          concepts: ['java-conditions'],
          success: '`.equals` compares the content of text. That is a well-known Java trap.',
        },
      ],
      summary: ['`if (...) { } else if (...) { } else { }`', '`&&`, `||`, `!`', 'You compare text with `.equals(...)`.'],
    },
    {
      id: 'java-loops',
      courseId: 'java-1',
      title: 'for and while loops',
      objective: 'You can repeat code with for and while in Java.',
      minutes: 10,
      prerequisites: ['java-conditions'],
      concepts: ['java-loops'],
      steps: [
        {
          type: 'code',
          title: 'Loops in Java',
          body: 'A for loop has three parts: start, as long as, and what happens after each round. `i++` means: add 1.',
          code: main('        for (int i = 1; i <= 3; i++) {\n            System.out.println("Round " + i);\n        }\n        int coins = 0;\n        while (coins < 50) {\n            coins += 20;\n        }\n        System.out.println("Coins: " + coins);'),
          runnable: true,
        },
        {
          type: 'exercise',
          id: 'java-loops-ex1',
          mode: 'independent',
          title: 'Times table of a number',
          prompt: 'Use a for loop to show the times table of `number`, from 1 to 3. With `number = 7`:\n**1 x 7 = 7**\n**2 x 7 = 14**\n**3 x 7 = 21**',
          starter: main('        int number = 7;\n'),
          checks: [
            { kind: 'output', lines: ['1 x 7 = 7', '2 x 7 = 14', '3 x 7 = 21'], message: 'The output for 7 is not right yet.' },
            { kind: 'variants', replace: 'int number = 7;', cases: [{ with: 'int number = 4;', lines: ['1 x 4 = 4', '2 x 4 = 8', '3 x 4 = 12'] }], message: 'Your code only works for 7. Use `number`.' },
          ],
          hints: ['for (int i = 1; i <= 3; i++) { System.out.println(i + " x " + number + " = " + (i * number)); }'],
          solution: main('        int number = 7;\n        for (int i = 1; i <= 3; i++) {\n            System.out.println(i + " x " + number + " = " + (i * number));\n        }'),
          concepts: ['java-loops'],
          success: 'Notice the brackets around `(i * number)`: without them Java glues the numbers together as text.',
        },
      ],
      summary: ['`for (int i = 1; i <= n; i++) { }`', '`while (condition) { }`', 'Use brackets when calculating inside text: `"= " + (a * b)`.'],
    },
    {
      id: 'java-methods',
      courseId: 'java-1',
      title: 'Methods',
      objective: 'You can write a static method with parameters and a return type.',
      minutes: 12,
      prerequisites: ['java-loops'],
      concepts: ['java-methods'],
      steps: [
        {
          type: 'explain',
          body: `In Java a function is called a **method**. For now you write them as \`static\` in your class:

\`static int square(int n) { return n * n; }\`

The first word after \`static\` is the type of the answer (\`void\` = nothing).`,
        },
        {
          type: 'exercise',
          id: 'java-methods-ex1',
          mode: 'independent',
          title: 'Damage calculation',
          prompt: 'In the class (above `main`), write the method `static int damage(int base, boolean critical)`: return `base`, or double that when `critical` is true.',
          starter: main('        System.out.println(damage(10, false));\n        System.out.println(damage(10, true));', '    // write your method here\n\n'),
          checks: [
            { kind: 'output', lines: ['10', '20'], message: 'damage(10, false) must give 10 and damage(10, true) 20.' },
            { kind: 'variants', replace: '        System.out.println(damage(10, true));', cases: [{ with: '        System.out.println(damage(7, true));', lines: ['10', '14'] }], message: 'Your method does not work for other values. Use `base`.' },
          ],
          hints: ['static int damage(int base, boolean critical) {\n    if (critical) { return base * 2; }\n    return base;\n}'],
          solution: main('        System.out.println(damage(10, false));\n        System.out.println(damage(10, true));', '    static int damage(int base, boolean critical) {\n        if (critical) {\n            return base * 2;\n        }\n        return base;\n    }\n\n'),
          concepts: ['java-methods'],
          success: 'Your first Java method, tested with different values.',
        },
      ],
      summary: ['A method: `static type name(type parameter) { ... }`', '`return` gives back the answer; `void` gives back nothing.'],
    },
  ],
};
