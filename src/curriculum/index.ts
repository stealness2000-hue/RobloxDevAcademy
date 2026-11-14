import { course0 } from './course-0';
import { course1 } from './course-1';
import { course2 } from './course-2';
import { course3 } from './course-3';
import { course4 } from './course-4';
import { course5 } from './course-5';
import { courseCpp } from './course-cpp';
import { courseJava } from './course-java';
import type { Course, Lesson, Step, Track } from './types';

const planned = (id: string, number: number, title: string, description: string, level: string, topics: string[]): Course => ({
  id, number, title, description, level, lessons: [], planned: topics,
});

/** All courses in teaching order. Courses without lessons are shown as "in ontwikkeling". */
export const COURSES: Course[] = [
  course0,
  course1,
  course2,
  course3,
  course4,
  course5,
  planned('course-6', 6, 'De Roblox-engine', 'Instances, properties, services en Vector3.', 'Gemiddeld',
    ['Instances en Parent', 'game:GetService()', 'Vector3, CFrame, Color3', 'WaitForChild()', 'Project: kleurveranderend platform']),
  planned('course-7', 7, 'Events', 'Reageren op spelers: Touched, ClickDetector, ProximityPrompt.', 'Gemiddeld',
    [':Connect() en callbacks', 'Touched en PlayerAdded', 'Debounces en cooldowns', 'Verbindingen verbreken', 'Project: een deur die opengaat']),
  planned('course-8', 8, 'Client en server', 'RemoteEvents, replicatie en veilige validatie.', 'Gemiddeld',
    ['Wat server en client zijn', 'Replicatie', 'RemoteEvents en RemoteFunctions', 'Nooit de client vertrouwen', 'Project: veilige aankoopknop']),
  planned('course-9', 9, 'UI-scripting', 'ScreenGui, knoppen, TweenService en menu\'s.', 'Gemiddeld',
    ['ScreenGui en Frames', 'UDim2 en schalen', 'Knoppen en TweenService', 'Menu\'s openen en sluiten', 'Project: inventaris-interface']),
  planned('course-10', 10, 'Data en gamesystemen', 'Leaderstats, DataStoreService en pcall.', 'Gevorderd',
    ['Leaderstats', 'DataStoreService', 'pcall en foutafhandeling', 'Opslaan bij vertrekken', 'Project: blijvende coins']),
  planned('course-11', 11, 'Geavanceerde Roblox-ontwikkeling', 'ModuleScripts, types, OOP en architectuur.', 'Gevorderd',
    ['Module-architectuur', 'Strikte Luau-types', 'Metatables en OOP', 'State machines', 'Opruimen van verbindingen']),
  planned('course-12', 12, 'Complete games bouwen', 'Obby, simulator, tycoon en ronde-gebaseerde games.', 'Gevorderd',
    ['Obby', 'Simulator', 'Tycoon', 'Ronde-gebaseerde multiplayer', 'Eigen game als eindproject']),
  courseCpp,
  courseJava,
];

export const ALL_LESSONS: Lesson[] = COURSES.flatMap((c) => c.lessons);
export const LESSON_BY_ID = new Map(ALL_LESSONS.map((l) => [l.id, l]));
export const COURSE_BY_ID = new Map(COURSES.map((c) => [c.id, c]));

export const TRACK_LABEL: Record<Track, string> = { luau: 'Roblox Luau', cpp: 'C++', java: 'Java' };
export const trackOfCourse = (c: Course): Track => c.track ?? 'luau';
export const trackOfLesson = (id: string): Track => {
  const l = LESSON_BY_ID.get(id);
  const c = l ? COURSE_BY_ID.get(l.courseId) : undefined;
  return c ? trackOfCourse(c) : 'luau';
};
export const lessonsOfTrack = (t: Track) => COURSES.filter((c) => trackOfCourse(c) === t).flatMap((c) => c.lessons);
/** Programming language of a lesson's code (each track has one language). */
export const languageOfLesson = (id: string): 'luau' | 'cpp' | 'java' => trackOfLesson(id);

/** Lesson number (1-based) within its track, for "les 14" style labels. */
export const lessonNumber = (id: string) => lessonsOfTrack(trackOfLesson(id)).findIndex((l) => l.id === id) + 1;

/** Steps the student must complete before a lesson counts as done. */
export const isGradedStep = (s: Step) => s.type === 'exercise' || s.type === 'quiz' || s.type === 'predict' || s.type === 'studio';

/** Sequential unlocking per track: the first lesson of each track is open; the next opens once the previous is completed. */
export function isUnlocked(lessonId: string, completed: Set<string>): boolean {
  const list = lessonsOfTrack(trackOfLesson(lessonId));
  const idx = list.findIndex((l) => l.id === lessonId);
  if (idx <= 0) return idx === 0;
  return completed.has(list[idx - 1].id) || completed.has(lessonId);
}

export function nextLesson(completed: Set<string>, track: Track = 'luau'): Lesson | null {
  return lessonsOfTrack(track).find((l) => !completed.has(l.id)) ?? ALL_LESSONS.find((l) => !completed.has(l.id)) ?? null;
}
