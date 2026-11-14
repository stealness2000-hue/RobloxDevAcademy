import { describe, expect, it } from 'vitest';
import { NativeRunner } from '../electron/services/native-runner';

const runner = new NativeRunner();
const java = await runner.detect('java');
const cpp = await runner.detect('cpp');

describe.skipIf(!java.available)(`Java runner (${java.version ?? 'not installed'})`, () => {
  it('runs a program and captures println output, including accents', async () => {
    const r = await runner.run('java', 'public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hallo Java");\n    System.out.println("Café " + (2 + 3));\n  }\n}');
    expect(r.error).toBeNull();
    expect(r.output.map((o) => o.text)).toEqual(['Hallo Java', 'Café 5']);
  });
  it('reports compile errors with a line number', async () => {
    const r = await runner.run('java', 'public class Main {\n  public static void main(String[] args) {\n    System.out.println("x")\n  }\n}');
    expect(r.ok).toBe(false);
    expect(r.error?.kind).toBe('syntax');
    expect(r.error?.line).toBe(3);
  });
  it('reports runtime exceptions', async () => {
    const r = await runner.run('java', 'public class Main {\n  public static void main(String[] args) {\n    int a = 0;\n    System.out.println(10 / a);\n  }\n}');
    expect(r.error?.kind).toBe('runtime');
    expect(r.error?.message).toMatch(/ArithmeticException/);
  });
  it('stops infinite loops', async () => {
    const r = await runner.run('java', 'public class Main {\n  public static void main(String[] args) {\n    while (true) {}\n  }\n}');
    expect(r.error?.kind).toBe('timeout');
  }, 30000);
});

describe.skipIf(!cpp.available)(`C++ runner (${cpp.version ?? 'not installed'})`, () => {
  it('compiles and runs', async () => {
    const r = await runner.run('cpp', '#include <iostream>\nint main() {\n    std::cout << "Hallo C++" << std::endl;\n    return 0;\n}');
    expect(r.error).toBeNull();
    expect(r.output.map((o) => o.text)).toEqual(['Hallo C++']);
  });
  it('reports compile errors with a line number', async () => {
    const r = await runner.run('cpp', '#include <iostream>\nint main() {\n    std::cout << "x"\n    return 0;\n}');
    expect(r.error?.kind).toBe('syntax');
    expect(r.error?.line).toBeGreaterThan(0);
  });
});
