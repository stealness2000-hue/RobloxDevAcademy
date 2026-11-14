import { t } from '@shared/i18n';

export interface Concept {
  id: string;
  name: string;
  /** Skill group used in the mastery chart. */
  group: SkillGroup;
}

export type SkillGroup =
  | 'Basics' | 'Variables' | 'Conditions' | 'Loops' | 'Functions' | 'Tables' | 'Events' | 'Roblox services' | 'UI scripting' | 'Client/server' | 'DataStores' | 'C++' | 'Java';

/** The skill groups shown in the mastery chart, in teaching order. Names are English; show them with t(). */
export const SKILL_GROUPS: SkillGroup[] = ['Basics', 'Variables', 'Conditions', 'Loops', 'Functions', 'Tables', 'Events', 'Roblox services', 'UI scripting', 'Client/server', 'DataStores', 'C++', 'Java'];

export const CONCEPTS: Concept[] = [
  { id: 'code-basics', name: 'What code is', group: 'Basics' },
  { id: 'print', name: 'print()', group: 'Basics' },
  { id: 'strings', name: 'Text (strings)', group: 'Basics' },
  { id: 'arguments', name: 'Brackets and commas', group: 'Basics' },
  { id: 'comments', name: 'Comments', group: 'Basics' },
  { id: 'order', name: 'Order of lines', group: 'Basics' },
  { id: 'studio-basics', name: 'Roblox Studio', group: 'Roblox services' },
  { id: 'script-types', name: 'Script types', group: 'Roblox services' },
  { id: 'warn', name: 'warn()', group: 'Basics' },
  { id: 'variables', name: 'Variables', group: 'Variables' },
  { id: 'numbers', name: 'Numbers', group: 'Variables' },
  { id: 'booleans', name: 'Booleans', group: 'Variables' },
  { id: 'nil', name: 'nil', group: 'Variables' },
  { id: 'operators', name: 'Math', group: 'Variables' },
  { id: 'concatenation', name: 'Joining text', group: 'Variables' },
  { id: 'interpolation', name: 'String interpolation', group: 'Variables' },
  { id: 'typeof', name: 'typeof()', group: 'Variables' },
  { id: 'naming', name: 'Choosing names', group: 'Variables' },
  { id: 'comparisons', name: 'Comparing', group: 'Conditions' },
  { id: 'conditions', name: 'If statements', group: 'Conditions' },
  { id: 'logic', name: 'and, or, not', group: 'Conditions' },
  { id: 'loops', name: 'for loops', group: 'Loops' },
  { id: 'while-loops', name: 'while and repeat', group: 'Loops' },
  { id: 'functions', name: 'Functions', group: 'Functions' },
  { id: 'parameters', name: 'Parameters', group: 'Functions' },
  { id: 'return-values', name: 'return', group: 'Functions' },
  { id: 'tables', name: 'Lists (arrays)', group: 'Tables' },
  { id: 'dictionaries', name: 'Dictionaries', group: 'Tables' },
  { id: 'events', name: 'Events', group: 'Events' },
  { id: 'services', name: 'Services', group: 'Roblox services' },
  { id: 'ui', name: 'UI scripting', group: 'UI scripting' },
  { id: 'client-server', name: 'Client and server', group: 'Client/server' },
  { id: 'datastores', name: 'DataStores', group: 'DataStores' },
  { id: 'cpp-basics', name: 'C++: output and syntax', group: 'C++' },
  { id: 'cpp-variables', name: 'C++: variables and types', group: 'C++' },
  { id: 'cpp-conditions', name: 'C++: if and else', group: 'C++' },
  { id: 'cpp-loops', name: 'C++: loops', group: 'C++' },
  { id: 'cpp-functions', name: 'C++: functions', group: 'C++' },
  { id: 'java-basics', name: 'Java: output and syntax', group: 'Java' },
  { id: 'java-variables', name: 'Java: variables and types', group: 'Java' },
  { id: 'java-conditions', name: 'Java: if and else', group: 'Java' },
  { id: 'java-loops', name: 'Java: loops', group: 'Java' },
  { id: 'java-methods', name: 'Java: methods', group: 'Java' },
];

export const CONCEPT_BY_ID = new Map(CONCEPTS.map((c) => [c.id, c]));
/** Concept name in the current language. */
export const conceptName = (id: string) => {
  const n = CONCEPT_BY_ID.get(id)?.name;
  return n ? t(n) : id;
};
