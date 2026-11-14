import { course0 } from './course-0';
import { course1 } from './course-1';
import { course2 } from './course-2';
import { course3 } from './course-3';
import { course4 } from './course-4';
import { course5 } from './course-5';
import { courseCpp } from './course-cpp';
import { courseJava } from './course-java';
import { PRACTICE as EN_PRACTICE } from './practice';
import { KNOWLEDGE as EN_KNOWLEDGE, type KnowledgeEntry } from './knowledge';
import { PROJECTS as EN_PROJECTS, type Project } from './projects';
import * as nl from './nl/course-all';
import type { Course, Lesson, PracticeExercise, Step, Track } from './types';
import { FREE_COURSES, FREE_LESSONS_PER_EXTRA_TRACK } from '@shared/license';

export type { KnowledgeEntry, Project };

const planned = (id: string, number: number, title: string, description: string, level: string, topics: string[]): Course => ({
  id, number, title, description, level, lessons: [], planned: topics,
});

const EN_COURSES: Course[] = [
  course0,
  course1,
  course2,
  course3,
  course4,
  course5,
  planned('course-6', 6, 'The Roblox engine', 'Instances, properties, services and Vector3.', 'Intermediate',
    ['Instances and Parent', 'game:GetService()', 'Vector3, CFrame, Color3', 'WaitForChild()', 'Project: color-changing platform']),
  planned('course-7', 7, 'Events', 'Reacting to players: Touched, ClickDetector, ProximityPrompt.', 'Intermediate',
    [':Connect() and callbacks', 'Touched and PlayerAdded', 'Debounces and cooldowns', 'Disconnecting connections', 'Project: a door that opens']),
  planned('course-8', 8, 'Client and server', 'RemoteEvents, replication and safe validation.', 'Intermediate',
    ['What server and client are', 'Replication', 'RemoteEvents and RemoteFunctions', 'Never trust the client', 'Project: safe purchase button']),
  planned('course-9', 9, 'UI scripting', 'ScreenGui, buttons, TweenService and menus.', 'Intermediate',
    ['ScreenGui and Frames', 'UDim2 and scaling', 'Buttons and TweenService', 'Opening and closing menus', 'Project: inventory interface']),
  planned('course-10', 10, 'Data and game systems', 'Leaderstats, DataStoreService and pcall.', 'Advanced',
    ['Leaderstats', 'DataStoreService', 'pcall and error handling', 'Saving when players leave', 'Project: coins that persist']),
  planned('course-11', 11, 'Advanced Roblox development', 'ModuleScripts, types, OOP and architecture.', 'Advanced',
    ['Module architecture', 'Strict Luau types', 'Metatables and OOP', 'State machines', 'Cleaning up connections']),
  planned('course-12', 12, 'Building complete games', 'Obby, simulator, tycoon and round-based games.', 'Advanced',
    ['Obby', 'Simulator', 'Tycoon', 'Round-based multiplayer', 'Your own game as a final project']),
  courseCpp,
  courseJava,
];

const NL_COURSES: Course[] = [
  nl.course0,
  nl.course1,
  nl.course2,
  nl.course3,
  nl.course4,
  nl.course5,
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
  nl.courseCpp,
  nl.courseJava,
];

/**
 * Lesson content exists in English (the base) and Dutch (written by people). Lesson and course ids are
 * the same in both, so progress carries over when the student switches. Other languages use the English
 * content and translate the text on the fly (see src/i18n). The exports below are live bindings:
 * after setContentLanguage() every importer sees the new content (the app re-renders on a language change).
 */
export let COURSES: Course[] = EN_COURSES;
export let ALL_LESSONS: Lesson[] = [];
export let LESSON_BY_ID = new Map<string, Lesson>();
export let COURSE_BY_ID = new Map<string, Course>();
export let PRACTICE: PracticeExercise[] = EN_PRACTICE;
export let KNOWLEDGE: KnowledgeEntry[] = EN_KNOWLEDGE;
export let PROJECTS: Project[] = EN_PROJECTS;
export let contentLanguage: 'en' | 'nl' = 'en';

export function setContentLanguage(lang: string) {
  contentLanguage = lang === 'nl' ? 'nl' : 'en';
  const isNl = contentLanguage === 'nl';
  COURSES = isNl ? NL_COURSES : EN_COURSES;
  PRACTICE = isNl ? (nl.PRACTICE as PracticeExercise[]) : EN_PRACTICE;
  KNOWLEDGE = isNl ? (nl.KNOWLEDGE as unknown as KnowledgeEntry[]) : EN_KNOWLEDGE;
  PROJECTS = isNl ? (nl.PROJECTS as unknown as Project[]) : EN_PROJECTS;
  ALL_LESSONS = COURSES.flatMap((c) => c.lessons);
  LESSON_BY_ID = new Map(ALL_LESSONS.map((l) => [l.id, l]));
  COURSE_BY_ID = new Map(COURSES.map((c) => [c.id, c]));
}
setContentLanguage('en');

/** Both content sets, for tests. */
export const CONTENT_SETS = { en: () => EN_COURSES, nl: () => NL_COURSES };

export const practiceForConcept = (conceptId: string) => PRACTICE.filter((p) => !p.challenge && p.concepts.includes(conceptId));


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

/** Lesson number (1-based) within its track, for "lesson 14" style labels. */
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

/** Free trial: the first two Luau courses and the first lessons of the C++ and Java tracks (see shared/license.ts). */
export function isFreeLesson(lessonId: string): boolean {
  const lesson = LESSON_BY_ID.get(lessonId);
  if (!lesson) return true;
  if (FREE_COURSES.has(lesson.courseId)) return true;
  const track = trackOfLesson(lessonId);
  if (track === 'luau') return false;
  return lessonsOfTrack(track).findIndex((l) => l.id === lessonId) < FREE_LESSONS_PER_EXTRA_TRACK;
}
