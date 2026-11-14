// Achievement catalogue. Conditions are evaluated in the main process from real events only.
export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: string; // key into the renderer's icon map
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'hello-roblox', title: 'Hello Roblox', description: 'Run your first Luau program.', icon: 'play' },
  { id: 'first-lesson', title: 'First step', description: 'Finish your first lesson.', icon: 'footprints' },
  { id: 'first-variable', title: 'First variable', description: 'Create your first variable on your own.', icon: 'box' },
  { id: 'bug-hunter', title: 'Bug hunter', description: 'Fix your first broken script.', icon: 'bug' },
  { id: 'ten-solutions', title: 'Ten solutions', description: 'Solve ten different exercises correctly.', icon: 'list-checks' },
  { id: 'own-file', title: 'Your own file', description: 'Save your first own script in the playground.', icon: 'file-code' },
  { id: 'streak-3', title: 'Three days in a row', description: 'Learn on three days in a row.', icon: 'calendar-check' },
  { id: 'course-0', title: 'Foundation laid', description: 'Finish the course "Before you code".', icon: 'layers' },
  { id: 'course-1', title: 'Luau basics', description: 'Finish the course "Luau fundamentals".', icon: 'braces' },
  { id: 'logic-learner', title: 'Logic Learner', description: 'Finish the course about conditions.', icon: 'git-branch' },
  { id: 'function-builder', title: 'Function Builder', description: 'Finish the course about functions.', icon: 'braces' },
  { id: 'table-master', title: 'Table Master', description: 'Finish the course about tables.', icon: 'layers' },
  { id: 'loop-master', title: 'Loop Master', description: 'Reach the level "Proficient" for loops.', icon: 'repeat' },
  { id: 'event-handler', title: 'Event Handler', description: 'Make your first working event connection.', icon: 'zap' },
  { id: 'ui-developer', title: 'UI Developer', description: 'Make your first working interface.', icon: 'layout' },
  { id: 'client-server', title: 'Client Server Engineer', description: 'Finish a safe RemoteEvent exercise.', icon: 'arrow-left-right' },
  { id: 'first-game-system', title: 'First game system', description: 'Finish a complete game mechanic.', icon: 'gamepad' },
  { id: 'roblox-developer', title: 'Roblox Developer', description: 'Finish the complete core curriculum.', icon: 'award' },
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
