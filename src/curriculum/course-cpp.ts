import type { Course } from './types';

const H = '#include <iostream>\n';

export const courseCpp: Course = {
  id: 'cpp-1',
  track: 'cpp',
  number: 1,
  title: 'C++: the basics',
  description: 'The language of game engines. Output, variables, if, loops and functions, with a real C++ compiler.',
  level: 'Beginner',
  planned: [],
  lessons: [
    {
      id: 'cpp-hello',
      courseId: 'cpp-1',
      title: 'Your first C++ program',
      objective: 'You can show text with std::cout and understand #include, main and the semicolon.',
      minutes: 10,
      prerequisites: [],
      concepts: ['cpp-basics'],
      steps: [
        {
          type: 'explain',
          body: `**C++** is one of the most important programming languages in the world. Game engines like Unreal are written in it, and so is the Roblox engine itself.

C++ is stricter than Luau: your code is first translated into a program by a **compiler**, and only then run. The compiler checks your code very precisely. For example, every instruction ends with a **semicolon** \`;\`.`,
        },
        {
          type: 'code',
          title: 'Hello, C++',
          body: 'Click the parts to see what they do.',
          code: `${H}\nint main() {\n    std::cout << "Hello C++!" << std::endl;\n    return 0;\n}`,
          runnable: true,
          annotations: [
            { token: '#include', text: '`#include <iostream>` brings in the library that lets you show text (in = input, out = output).' },
            { token: 'main', text: '`int main()` is the **start function**: a C++ program always starts here. Everything between the `{ }` runs.' },
            { token: 'std::cout', text: '`std::cout` is the **Output**: the place where text appears. `std::` means: from the standard library.' },
            { token: '<<', text: 'With `<<` you "send" something to the Output. You can send several things in a row.' },
            { token: 'std::endl', text: '`std::endl` is a new line (end line).' },
            { token: ';', text: 'The **semicolon** ends the instruction. If you forget it, the compiler refuses your code.' },
            { token: 'return', text: '`return 0;` says: the program finished fine.' },
          ],
          after: 'When you click **Run Code**, the Academy compiles your code with g++ and runs the program.',
        },
        {
          type: 'quiz',
          id: 'cpp-hello-q1',
          question: 'Where does a C++ program start?',
          concepts: ['cpp-basics'],
          options: [
            { text: 'In the function main', correct: true, feedback: 'Right. `int main()` is always the starting point.' },
            { text: 'On the first line of the file', feedback: 'The first lines are usually `#include`s. The program itself starts in `main`.' },
            { text: 'At std::cout', feedback: '`std::cout` is the Output, not the starting point.' },
          ],
        },
        {
          type: 'exercise',
          id: 'cpp-hello-ex1',
          mode: 'guided',
          title: 'Change the text',
          prompt: 'Change the program so it shows **I am learning C++!**',
          starter: `${H}\nint main() {\n    std::cout << "Hello C++!" << std::endl;\n    return 0;\n}`,
          checks: [{ kind: 'output', lines: ['I am learning C++!'], message: 'The Output must be exactly **I am learning C++!**' }],
          hints: ['Only change the text between the quotes.'],
          solution: `${H}\nint main() {\n    std::cout << "I am learning C++!" << std::endl;\n    return 0;\n}`,
          concepts: ['cpp-basics'],
          success: 'Your first C++ program, compiled and run.',
        },
        {
          type: 'exercise',
          id: 'cpp-hello-ex2',
          mode: 'guided',
          kind: 'fix-bug',
          title: 'The forgotten semicolon',
          prompt: 'The compiler refuses this code. Click **Run Code**, read the explanation and fix the mistake. The Output must be **Level 1** followed by **Start!**',
          starter: `${H}\nint main() {\n    std::cout << "Level 1" << std::endl\n    std::cout << "Start!" << std::endl;\n    return 0;\n}`,
          checks: [{ kind: 'output', lines: ['Level 1', 'Start!'], message: 'The Output must be **Level 1** followed by **Start!**' }],
          hints: ['Which line does not end with a `;`?'],
          solution: `${H}\nint main() {\n    std::cout << "Level 1" << std::endl;\n    std::cout << "Start!" << std::endl;\n    return 0;\n}`,
          concepts: ['cpp-basics'],
          success: 'Fixed. The forgotten semicolon is the best-known C++ mistake.',
        },
      ],
      summary: ['A C++ program starts in `int main()`.', '`std::cout << ... << std::endl;` shows a line of text.', 'Every instruction ends with `;`.', 'The compiler checks your code before it runs.'],
    },
    {
      id: 'cpp-variables',
      courseId: 'cpp-1',
      title: 'Variables and types',
      objective: 'You can create variables with a type (int, double, bool, std::string) and calculate with them.',
      minutes: 12,
      prerequisites: ['cpp-basics'],
      concepts: ['cpp-variables'],
      steps: [
        {
          type: 'explain',
          body: `In Luau you write \`local coins = 100\`. In C++ you also say **what kind** of value goes in it: the **type**.

- \`int\`: a whole number, like \`100\`
- \`double\`: a decimal number, like \`1.5\`
- \`bool\`: \`true\` or \`false\`
- \`std::string\`: text (you need \`#include <string>\` for this)

After that, the variable can only hold values of that type.`,
        },
        {
          type: 'code',
          code: `${H}#include <string>\n\nint main() {\n    int coins = 100;\n    double speed = 16.5;\n    std::string name = "Nova";\n    coins += 25;\n    std::cout << name << " has " << coins << " coins" << std::endl;\n    std::cout << "Speed: " << speed << std::endl;\n    return 0;\n}`,
          runnable: true,
          after: 'With `<<` you can simply put text and numbers one after another.',
        },
        {
          type: 'predict',
          id: 'cpp-variables-p1',
          question: 'What does this code show? (Note: both numbers are int.)',
          code: `${H}\nint main() {\n    int a = 7;\n    int b = 2;\n    std::cout << a / b << std::endl;\n    return 0;\n}`,
          concepts: ['cpp-variables'],
          options: [
            { text: '3.5', feedback: 'With two `int`s, C++ calculates with whole numbers: the part after the decimal point is dropped.' },
            { text: '3', correct: true, feedback: 'Right. `int / int` gives a whole number. With `7.0 / 2` you get 3.5.' },
            { text: '4', feedback: 'C++ does not round, it cuts off: 3.5 becomes 3.' },
          ],
        },
        {
          type: 'exercise',
          id: 'cpp-variables-ex1',
          mode: 'independent',
          title: 'Buying something',
          prompt: 'Create an `int price` with the value **50**. Subtract the price from `coins` and show **Left: 70**. Use the variables, so it is also right when `coins` changes.',
          starter: `${H}\nint main() {\n    int coins = 120;\n\n    return 0;\n}`,
          checks: [
            { kind: 'output', lines: ['Left: 70'], message: 'The Output must be **Left: 70**.' },
            { kind: 'uses', sequence: ['int', 'price'], message: 'Create a variable `int price`.' },
            { kind: 'variants', replace: 'int coins = 120;', cases: [{ with: 'int coins = 300;', lines: ['Left: 250'] }], message: 'Your code only works for 120 coins. Calculate with the variables.' },
          ],
          hints: ['int price = 50;', 'coins -= price; and then std::cout << "Left: " << coins << std::endl;'],
          solution: `${H}\nint main() {\n    int coins = 120;\n    int price = 50;\n    coins -= price;\n    std::cout << "Left: " << coins << std::endl;\n    return 0;\n}`,
          concepts: ['cpp-variables'],
          success: 'Tested with 120 and 300 coins.',
        },
      ],
      summary: ['In C++ a variable always has a type: `int`, `double`, `bool`, `std::string`.', '`int / int` gives a whole number.', 'With `<<` you put text and numbers one after another in the Output.'],
    },
    {
      id: 'cpp-if',
      courseId: 'cpp-1',
      title: 'if, else if and else',
      objective: 'You can make choices in C++ with if statements and && and ||.',
      minutes: 10,
      prerequisites: ['cpp-variables'],
      concepts: ['cpp-conditions'],
      steps: [
        {
          type: 'explain',
          body: `If statements work just like in Luau, but the shape is different:
- the condition goes between **brackets**: \`if (coins >= 100)\`
- the block goes between **curly braces** \`{ }\` instead of \`then\` ... \`end\`
- \`and\` is \`&&\`, \`or\` is \`||\`, \`not\` is \`!\`, and "not equal" is \`!=\``,
        },
        {
          type: 'code',
          code: `${H}\nint main() {\n    int health = 35;\n    if (health > 70) {\n        std::cout << "Healthy" << std::endl;\n    } else if (health > 30) {\n        std::cout << "Hurt" << std::endl;\n    } else {\n        std::cout << "Almost dead!" << std::endl;\n    }\n    return 0;\n}`,
          runnable: true,
        },
        {
          type: 'exercise',
          id: 'cpp-if-ex1',
          mode: 'independent',
          title: 'Medals',
          prompt: 'Based on `time`, show:\n- less than 30 → **Gold**\n- less than 60 → **Silver**\n- otherwise → **Bronze**',
          starter: `${H}\nint main() {\n    int time = 45;\n\n    return 0;\n}`,
          checks: [
            { kind: 'output', lines: ['Silver'], message: 'With time 45, **Silver** should appear.' },
            { kind: 'variants', replace: 'int time = 45;', cases: [{ with: 'int time = 10;', lines: ['Gold'] }, { with: 'int time = 30;', lines: ['Silver'] }, { with: 'int time = 60;', lines: ['Bronze'] }], message: 'Your medals are not right for every time.' },
          ],
          hints: ['if (time < 30) { ... } else if (time < 60) { ... } else { ... }'],
          solution: `${H}\nint main() {\n    int time = 45;\n    if (time < 30) {\n        std::cout << "Gold" << std::endl;\n    } else if (time < 60) {\n        std::cout << "Silver" << std::endl;\n    } else {\n        std::cout << "Bronze" << std::endl;\n    }\n    return 0;\n}`,
          concepts: ['cpp-conditions'],
          success: 'Tested with 10, 30, 45 and 60.',
        },
        {
          type: 'exercise',
          id: 'cpp-if-ex2',
          mode: 'independent',
          title: 'Can I attack?',
          prompt: 'Show **Attack!** when `health` is greater than 0 **and** `inSafeZone` is `false`. Otherwise **Cannot attack**.',
          starter: `${H}\nint main() {\n    int health = 50;\n    bool inSafeZone = false;\n\n    return 0;\n}`,
          checks: [
            { kind: 'output', lines: ['Attack!'], message: 'With health 50 outside the safe zone: **Attack!**' },
            { kind: 'variants', replace: 'bool inSafeZone = false;', cases: [{ with: 'bool inSafeZone = true;', lines: ['Cannot attack'] }], message: 'In the safe zone it is not allowed.' },
            { kind: 'variants', replace: 'int health = 50;', cases: [{ with: 'int health = 0;', lines: ['Cannot attack'] }], message: 'With 0 health it is not allowed.' },
          ],
          hints: ['if (health > 0 && !inSafeZone) { ... } else { ... }'],
          solution: `${H}\nint main() {\n    int health = 50;\n    bool inSafeZone = false;\n    if (health > 0 && !inSafeZone) {\n        std::cout << "Attack!" << std::endl;\n    } else {\n        std::cout << "Cannot attack" << std::endl;\n    }\n    return 0;\n}`,
          concepts: ['cpp-conditions'],
          success: '`&&` and `!` are the C++ versions of `and` and `not`.',
        },
      ],
      summary: ['`if (condition) { ... } else if (...) { ... } else { ... }`', '`&&` = and, `||` = or, `!` = not, `!=` = not equal.'],
    },
    {
      id: 'cpp-loops',
      courseId: 'cpp-1',
      title: 'for and while loops',
      objective: 'You can repeat code with for and while in C++.',
      minutes: 10,
      prerequisites: ['cpp-conditions'],
      concepts: ['cpp-loops'],
      steps: [
        {
          type: 'explain',
          body: `A for loop in C++ has three parts between brackets, separated by semicolons:

\`for (int i = 1; i <= 3; i++)\`

1. **start**: \`int i = 1\`
2. **as long as**: \`i <= 3\`
3. **after each round**: \`i++\` (means: i += 1)

A while loop is \`while (condition) { ... }\`.`,
        },
        {
          type: 'code',
          code: `${H}\nint main() {\n    for (int i = 1; i <= 3; i++) {\n        std::cout << "Round " << i << std::endl;\n    }\n    int coins = 0;\n    while (coins < 50) {\n        coins += 20;\n    }\n    std::cout << "Coins: " << coins << std::endl;\n    return 0;\n}`,
          runnable: true,
        },
        {
          type: 'exercise',
          id: 'cpp-loops-ex1',
          mode: 'independent',
          title: 'Countdown',
          prompt: 'Count down from `seconds` to 1 (each number on its own line) and then show **GO!**',
          starter: `${H}\nint main() {\n    int seconds = 3;\n\n    return 0;\n}`,
          checks: [
            { kind: 'output', lines: ['3', '2', '1', 'GO!'], message: 'With 3 seconds: 3, 2, 1 and GO!' },
            { kind: 'variants', replace: 'int seconds = 3;', cases: [{ with: 'int seconds = 5;', lines: ['5', '4', '3', '2', '1', 'GO!'] }], message: 'Your countdown does not use `seconds` correctly yet.' },
          ],
          hints: ['for (int i = seconds; i >= 1; i--) { ... }', '`i--` means i -= 1.'],
          solution: `${H}\nint main() {\n    int seconds = 3;\n    for (int i = seconds; i >= 1; i--) {\n        std::cout << i << std::endl;\n    }\n    std::cout << "GO!" << std::endl;\n    return 0;\n}`,
          concepts: ['cpp-loops'],
          success: 'Tested with 3 and 5 seconds.',
        },
      ],
      summary: ['`for (start; as long as; step) { ... }`', '`i++` counts up, `i--` counts down.', '`while (condition) { ... }` repeats as long as something is true.'],
    },
    {
      id: 'cpp-functions',
      courseId: 'cpp-1',
      title: 'Functions',
      objective: 'You can write a function with parameters and a return type.',
      minutes: 12,
      prerequisites: ['cpp-loops'],
      concepts: ['cpp-functions'],
      steps: [
        {
          type: 'explain',
          body: `A function in C++ starts with the **type of the answer** (\`int\`, \`double\`, \`bool\`, or \`void\` if it returns nothing), then the name, then the parameters **with their type**.

\`int square(int n) { return n * n; }\`

Put functions **above** \`main\`, so the compiler already knows them when \`main\` uses them.`,
        },
        {
          type: 'code',
          code: `${H}#include <string>\n\nint square(int n) {\n    return n * n;\n}\n\nvoid greet(std::string name) {\n    std::cout << "Welcome, " << name << std::endl;\n}\n\nint main() {\n    greet("Kai");\n    std::cout << square(7) << std::endl;\n    return 0;\n}`,
          runnable: true,
          after: '`void` means: this function gives nothing back.',
        },
        {
          type: 'exercise',
          id: 'cpp-functions-ex1',
          mode: 'independent',
          title: 'Damage calculation',
          prompt: 'Above `main`, write the function `int damage(int base, bool critical)`: it returns `base`, or double that when `critical` is true. `main` already uses it.',
          starter: `${H}\n// write your function here\n\nint main() {\n    std::cout << damage(10, false) << std::endl;\n    std::cout << damage(10, true) << std::endl;\n    return 0;\n}`,
          checks: [
            { kind: 'output', lines: ['10', '20'], message: 'damage(10, false) must give 10 and damage(10, true) 20.' },
            { kind: 'variants', replace: '    std::cout << damage(10, true) << std::endl;', cases: [{ with: '    std::cout << damage(7, true) << std::endl;', lines: ['10', '14'] }], message: 'Your function does not work for other values. Use `base` in your calculation.' },
          ],
          hints: ['int damage(int base, bool critical) {\n    if (critical) { return base * 2; }\n    return base;\n}'],
          solution: `${H}\nint damage(int base, bool critical) {\n    if (critical) {\n        return base * 2;\n    }\n    return base;\n}\n\nint main() {\n    std::cout << damage(10, false) << std::endl;\n    std::cout << damage(10, true) << std::endl;\n    return 0;\n}`,
          concepts: ['cpp-functions'],
          success: 'Your first C++ function, tested with different values.',
        },
      ],
      summary: ['`type name(type parameter) { ... return ...; }`', '`void` = returns nothing.', 'Put functions above `main`.'],
    },
  ],
};
