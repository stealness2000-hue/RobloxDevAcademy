/**
 * Roblox Studio exercises and how the Academy verifies them.
 *
 * Verification is based on FACTS the plugin reads from the open place (read-only, allowlisted):
 * whether instances exist, their class, a few allowlisted properties, and script sources.
 * The Academy then checks those facts plus the script source (syntax via the Luau analyzer, required constructs).
 * Behaviour during Play (e.g. "the part turns blue") cannot be observed this way and stays self-confirmed.
 */
import { codeTokens, hasSequence } from './luau-lexer';

export type StudioRequirement =
  | { kind: 'instance'; path: string; className: string; message: string }
  | { kind: 'property'; path: string; prop: 'Anchored' | 'CanCollide' | 'Transparency'; equals: boolean | number; message: string };

export interface StudioSourceCheck {
  sequence: string[];
  message: string;
}

export interface StudioExercise {
  id: string;
  title: string;
  /** Short instruction shown in the plugin. */
  goal: string;
  steps: string[];
  scriptClass: 'Script' | 'LocalScript' | 'ModuleScript';
  /** Dot path from the DataModel, e.g. "ServerScriptService" or "Workspace.TrainingPart". */
  scriptParent: string;
  scriptName: string;
  /** Created by the plugin on request: comments only, never the answer. */
  starterSource: string;
  requirements: StudioRequirement[];
  sourceChecks: StudioSourceCheck[];
  /** Things only visible while playing; the student confirms them. */
  playtest: string;
  concepts: string[];
}

export const STUDIO_EXERCISES: StudioExercise[] = [
  {
    id: 'studio-first-script',
    title: 'Je eerste script in Studio',
    goal: 'Maak een Script in ServerScriptService dat "Server gestart" en "Welkom bij mijn game" print.',
    steps: [
      'Klik hieronder op "Maak oefenscript" (of maak zelf een Script in ServerScriptService).',
      'Typ zelf de twee print-regels in het script.',
      'Klik op "Controleer mijn werk".',
      'Druk daarna op Play en kijk in de Output.',
    ],
    scriptClass: 'Script',
    scriptParent: 'ServerScriptService',
    scriptName: 'AcademyWelcome',
    starterSource: '-- Roblox Dev Academy: je eerste script\n-- Schrijf hieronder twee print-regels.\n\n',
    requirements: [],
    sourceChecks: [
      { sequence: ['print', '(', '"Server gestart"', ')'], message: 'Er moet een regel `print("Server gestart")` in je script staan.' },
      { sequence: ['print', '(', '"Welkom bij mijn game"', ')'], message: 'Er moet een regel `print("Welkom bij mijn game")` in je script staan.' },
    ],
    playtest: 'Druk op Play: in de Output verschijnen beide berichten.',
    concepts: ['print', 'studio-basics'],
  },
  {
    id: 'studio-color-part',
    title: 'Kleurveranderend onderdeel',
    goal: 'Een Part "TrainingPart" dat blauw wordt als je het aanraakt.',
    steps: [
      'Zet een Part in Workspace en noem het TrainingPart.',
      'Zet Anchored aan in Properties.',
      'Klik op "Maak oefenscript": er komt een leeg Script in TrainingPart.',
      'Schrijf zelf de code met Touched:Connect en Color3.fromRGB.',
      'Klik op "Controleer mijn werk".',
    ],
    scriptClass: 'Script',
    scriptParent: 'Workspace.TrainingPart',
    scriptName: 'ColorScript',
    starterSource: '-- Roblox Dev Academy: kleurveranderend onderdeel\n-- script.Parent is het TrainingPart.\n\n',
    requirements: [
      { kind: 'instance', path: 'Workspace.TrainingPart', className: 'Part', message: 'Er staat nog geen Part met de naam **TrainingPart** in Workspace.' },
      { kind: 'property', path: 'Workspace.TrainingPart', prop: 'Anchored', equals: true, message: 'Zet **Anchored** van TrainingPart aan, anders valt het om.' },
    ],
    sourceChecks: [
      { sequence: ['script', '.', 'Parent'], message: 'Gebruik `script.Parent` om het Part op te halen.' },
      { sequence: ['.', 'Touched', ':', 'Connect', '('], message: 'Verbind het event met `.Touched:Connect(function() ... end)`.' },
      { sequence: ['.', 'Color', '='], message: 'Geef de `Color` van het Part een nieuwe waarde.' },
      { sequence: ['Color3', '.', 'fromRGB', '('], message: 'Maak de kleur met `Color3.fromRGB(...)`.' },
    ],
    playtest: 'Druk op Play en loop tegen het Part aan: het wordt blauw.',
    concepts: ['events', 'studio-basics'],
  },
  {
    id: 'studio-countdown',
    title: 'Aftelklok in Studio',
    goal: 'Een Script in ServerScriptService dat aftelt met een for-lus en task.wait(1).',
    steps: [
      'Klik op "Maak oefenscript".',
      'Schrijf je aftelklok uit de les: een for-lus met stap -1 en task.wait(1).',
      'Klik op "Controleer mijn werk".',
      'Druk op Play: elke seconde verschijnt een nieuwe regel.',
    ],
    scriptClass: 'Script',
    scriptParent: 'ServerScriptService',
    scriptName: 'Countdown',
    starterSource: '-- Roblox Dev Academy: aftelklok\nlocal seconds = 5\n\n',
    requirements: [],
    sourceChecks: [
      { sequence: ['for'], message: 'Gebruik een `for`-lus.' },
      { sequence: [',', '-', '1', 'do'], message: 'Tel af met stapgrootte `-1`.' },
      { sequence: ['task', '.', 'wait', '('], message: 'Wacht tussen de stappen met `task.wait(1)`.' },
      { sequence: ['print', '(', '"GO!"', ')'], message: 'Print aan het einde `"GO!"`.' },
    ],
    playtest: 'Druk op Play: de aftelling verschijnt seconde voor seconde in de Output.',
    concepts: ['loops', 'studio-basics'],
  },
];

export const STUDIO_EXERCISE_BY_ID = new Map(STUDIO_EXERCISES.map((e) => [e.id, e]));

/** Facts reported by the plugin (all read-only). */
export interface StudioFacts {
  instances: Record<string, { exists: boolean; className?: string; props?: Record<string, unknown> }>;
  /** Scripts that are direct children of the exercise's scriptParent. */
  scripts: { name: string; className: string; source: string }[];
  parentExists: boolean;
}

export interface StudioCheckItem {
  ok: boolean;
  label: string;
  message?: string;
}

export interface StudioVerification {
  exerciseId: string;
  passed: boolean;
  items: StudioCheckItem[];
  scriptName: string | null;
  checkedAt: string;
}

/**
 * Evaluates the facts. `syntaxErrors` are analyzer errors for the chosen script (Roblox globals already filtered).
 * The script that best matches the source checks is used, so the student may name it differently.
 */
export function verifyStudioFacts(
  ex: StudioExercise,
  facts: StudioFacts,
  syntaxErrorsFor: (source: string) => { line: number; message: string }[],
  now = new Date(),
): StudioVerification {
  const items: StudioCheckItem[] = [];
  for (const r of ex.requirements) {
    const f = facts.instances[r.path];
    if (r.kind === 'instance') {
      const ok = !!f?.exists && f.className === r.className;
      items.push({ ok, label: `${r.path} is een ${r.className}`, message: ok ? undefined : r.message });
    } else {
      const ok = !!f?.exists && f.props?.[r.prop] === r.equals;
      items.push({ ok, label: `${r.path}.${r.prop} = ${String(r.equals)}`, message: ok ? undefined : r.message });
    }
  }

  const candidates = facts.scripts.filter((s) => s.className === ex.scriptClass);
  if (!facts.parentExists) {
    items.push({ ok: false, label: `${ex.scriptParent} bestaat`, message: `Ik kan **${ex.scriptParent}** niet vinden in je place.` });
  } else if (candidates.length === 0) {
    items.push({ ok: false, label: `Een ${ex.scriptClass} in ${ex.scriptParent}`, message: `Er staat nog geen **${ex.scriptClass}** in **${ex.scriptParent}**. Klik op "Maak oefenscript" of voeg er zelf een toe.` });
  } else {
    const score = (src: string) => {
      const toks = codeTokens(src);
      return ex.sourceChecks.filter((c) => hasSequence(toks, c.sequence)).length;
    };
    const best = [...candidates].sort((a, b) => score(b.source) - score(a.source))[0];
    items.push({ ok: true, label: `${ex.scriptClass} "${best.name}" in ${ex.scriptParent}` });
    const errs = syntaxErrorsFor(best.source);
    items.push({
      ok: errs.length === 0,
      label: 'De code is geldige Luau',
      message: errs.length ? `Regel ${errs[0].line}: ${errs[0].message}` : undefined,
    });
    const toks = codeTokens(best.source);
    for (const c of ex.sourceChecks) {
      const ok = hasSequence(toks, c.sequence);
      items.push({ ok, label: c.message.replace(/\.$/, ''), message: ok ? undefined : c.message });
    }
    return { exerciseId: ex.id, passed: items.every((i) => i.ok), items, scriptName: best.name, checkedAt: now.toISOString() };
  }
  return { exerciseId: ex.id, passed: false, items, scriptName: null, checkedAt: now.toISOString() };
}

/** Allowlisted instance paths/properties the plugin may read for an exercise. */
export function factQueries(ex: StudioExercise) {
  const paths = [...new Set(ex.requirements.map((r) => r.path))];
  return { paths, props: ['Anchored', 'CanCollide', 'Transparency'], scriptParent: ex.scriptParent };
}
