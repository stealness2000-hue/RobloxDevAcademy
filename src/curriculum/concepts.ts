export interface Concept {
  id: string;
  name: string;
  /** Skill group used in the mastery chart. */
  group: SkillGroup;
}

export type SkillGroup =
  | 'Basis' | 'Variabelen' | 'Voorwaarden' | 'Lussen' | 'Functies' | 'Tabellen' | 'Events' | 'Roblox-services' | 'UI-scripting' | 'Client/server' | 'DataStores' | 'C++' | 'Java';

/** The skill groups shown in the mastery chart, in teaching order. */
export const SKILL_GROUPS: SkillGroup[] = ['Basis', 'Variabelen', 'Voorwaarden', 'Lussen', 'Functies', 'Tabellen', 'Events', 'Roblox-services', 'UI-scripting', 'Client/server', 'DataStores', 'C++', 'Java'];

export const CONCEPTS: Concept[] = [
  { id: 'code-basics', name: 'Wat code is', group: 'Basis' },
  { id: 'print', name: 'print()', group: 'Basis' },
  { id: 'strings', name: 'Tekst (strings)', group: 'Basis' },
  { id: 'arguments', name: 'Haakjes en komma\'s', group: 'Basis' },
  { id: 'comments', name: 'Comments', group: 'Basis' },
  { id: 'order', name: 'Volgorde van regels', group: 'Basis' },
  { id: 'studio-basics', name: 'Roblox Studio', group: 'Roblox-services' },
  { id: 'script-types', name: 'Script-soorten', group: 'Roblox-services' },
  { id: 'warn', name: 'warn()', group: 'Basis' },
  { id: 'variables', name: 'Variabelen', group: 'Variabelen' },
  { id: 'numbers', name: 'Getallen', group: 'Variabelen' },
  { id: 'booleans', name: 'Booleans', group: 'Variabelen' },
  { id: 'nil', name: 'nil', group: 'Variabelen' },
  { id: 'operators', name: 'Rekenen', group: 'Variabelen' },
  { id: 'concatenation', name: 'Tekst plakken', group: 'Variabelen' },
  { id: 'interpolation', name: 'String interpolation', group: 'Variabelen' },
  { id: 'typeof', name: 'typeof()', group: 'Variabelen' },
  { id: 'naming', name: 'Namen kiezen', group: 'Variabelen' },
  { id: 'comparisons', name: 'Vergelijken', group: 'Voorwaarden' },
  { id: 'conditions', name: 'If-statements', group: 'Voorwaarden' },
  { id: 'logic', name: 'and, or, not', group: 'Voorwaarden' },
  { id: 'loops', name: 'for-lussen', group: 'Lussen' },
  { id: 'while-loops', name: 'while en repeat', group: 'Lussen' },
  { id: 'functions', name: 'Functies', group: 'Functies' },
  { id: 'parameters', name: 'Parameters', group: 'Functies' },
  { id: 'return-values', name: 'return', group: 'Functies' },
  { id: 'tables', name: 'Lijsten (arrays)', group: 'Tabellen' },
  { id: 'dictionaries', name: 'Dictionaries', group: 'Tabellen' },
  { id: 'events', name: 'Events', group: 'Events' },
  { id: 'services', name: 'Services', group: 'Roblox-services' },
  { id: 'ui', name: 'UI-scripting', group: 'UI-scripting' },
  { id: 'client-server', name: 'Client en server', group: 'Client/server' },
  { id: 'datastores', name: 'DataStores', group: 'DataStores' },
  { id: 'cpp-basics', name: 'C++: output en syntax', group: 'C++' },
  { id: 'cpp-variables', name: 'C++: variabelen en types', group: 'C++' },
  { id: 'cpp-conditions', name: 'C++: if en else', group: 'C++' },
  { id: 'cpp-loops', name: 'C++: lussen', group: 'C++' },
  { id: 'cpp-functions', name: 'C++: functies', group: 'C++' },
  { id: 'java-basics', name: 'Java: output en syntax', group: 'Java' },
  { id: 'java-variables', name: 'Java: variabelen en types', group: 'Java' },
  { id: 'java-conditions', name: 'Java: if en else', group: 'Java' },
  { id: 'java-loops', name: 'Java: lussen', group: 'Java' },
  { id: 'java-methods', name: 'Java: methodes', group: 'Java' },
];

export const CONCEPT_BY_ID = new Map(CONCEPTS.map((c) => [c.id, c]));
export const conceptName = (id: string) => CONCEPT_BY_ID.get(id)?.name ?? id;
