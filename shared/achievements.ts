// Achievement catalogue. Conditions are evaluated in the main process from real events only.
export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: string; // key into the renderer's icon map
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'hello-roblox', title: 'Hello Roblox', description: 'Voer je eerste Luau-programma uit.', icon: 'play' },
  { id: 'first-lesson', title: 'Eerste stap', description: 'Rond je eerste les af.', icon: 'footprints' },
  { id: 'first-variable', title: 'Eerste variabele', description: 'Maak zelfstandig je eerste variabele.', icon: 'box' },
  { id: 'bug-hunter', title: 'Bugjager', description: 'Repareer je eerste kapotte script.', icon: 'bug' },
  { id: 'ten-solutions', title: 'Tien oplossingen', description: 'Los tien verschillende oefeningen correct op.', icon: 'list-checks' },
  { id: 'own-file', title: 'Eigen bestand', description: 'Sla je eerste eigen script op in de speeltuin.', icon: 'file-code' },
  { id: 'streak-3', title: 'Drie dagen op rij', description: 'Leer op drie dagen achter elkaar.', icon: 'calendar-check' },
  { id: 'course-0', title: 'Fundament gelegd', description: 'Rond de cursus "Voordat je codeert" af.', icon: 'layers' },
  { id: 'course-1', title: 'Luau-basis', description: 'Rond de cursus "Luau-fundamenten" af.', icon: 'braces' },
  { id: 'logic-learner', title: 'Logic Learner', description: 'Rond de cursus over voorwaarden af.', icon: 'git-branch' },
  { id: 'function-builder', title: 'Function Builder', description: 'Rond de cursus over functies af.', icon: 'braces' },
  { id: 'table-master', title: 'Table Master', description: 'Rond de cursus over tabellen af.', icon: 'layers' },
  { id: 'loop-master', title: 'Loop Master', description: 'Bereik het niveau "Bekwaam" voor lussen.', icon: 'repeat' },
  { id: 'event-handler', title: 'Event Handler', description: 'Maak je eerste werkende event-verbinding.', icon: 'zap' },
  { id: 'ui-developer', title: 'UI Developer', description: 'Maak je eerste werkende interface.', icon: 'layout' },
  { id: 'client-server', title: 'Client Server Engineer', description: 'Rond een veilige RemoteEvent-oefening af.', icon: 'arrow-left-right' },
  { id: 'first-game-system', title: 'Eerste gamesysteem', description: 'Maak een compleet spelmechanisme af.', icon: 'gamepad' },
  { id: 'roblox-developer', title: 'Roblox Developer', description: 'Rond het volledige kerncurriculum af.', icon: 'award' },
];

export const ACHIEVEMENT_BY_ID = new Map(ACHIEVEMENTS.map((a) => [a.id, a]));

/** Course id → achievement unlocked when the whole course is completed. */
export const COURSE_ACHIEVEMENTS: Record<string, string> = {
  'course-0': 'course-0',
  'course-1': 'course-1',
  'course-2': 'logic-learner',
  'course-4': 'function-builder',
  'course-5': 'table-master',
};
