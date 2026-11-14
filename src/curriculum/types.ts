/**
 * Curriculum content model. Content is pure data (no app logic), versioned with the app,
 * and referenced from the database only by stable ids.
 */
import type { Check } from '@shared/evaluator';

export interface QuizOption {
  text: string;
  correct?: boolean;
  /** Shown after choosing this option: explains WHY it is right or wrong. */
  feedback: string;
}

export type Step =
  | { type: 'explain'; title?: string; body: string }
  | {
      type: 'code';
      title?: string;
      body?: string;
      code: string;
      /** Click-through explanation of the parts of the code. */
      annotations?: { token: string; text: string }[];
      /** Show a Run button (only for plain Luau that runs in the playground). */
      runnable?: boolean;
      /** Roblox-engine code: cannot run here, must be tested in Studio. */
      studioOnly?: boolean;
      after?: string;
    }
  | { type: 'quiz'; id: string; question: string; code?: string; options: QuizOption[]; concepts: string[] }
  | {
      type: 'predict';
      id: string;
      question: string;
      code: string;
      options: QuizOption[];
      concepts: string[];
    }
  | {
      type: 'exercise';
      id: string;
      /** guided: hints are offered generously. independent: no scaffolding, counts more for mastery. */
      mode: 'guided' | 'independent';
      title: string;
      prompt: string;
      starter: string;
      checks: Check[];
      hints: string[];
      /** Revealed only when the student explicitly asks, after at least two attempts. */
      solution: string;
      concepts: string[];
      success: string;
      kind?: 'exercise' | 'fix-bug';
    }
  | { type: 'visual'; kind: 'variable' | 'condition' | 'loop'; title?: string; body?: string; code: string }
  | {
      type: 'studio';
      title: string;
      body?: string;
      steps: { text: string; detail?: string }[];
      expected: string;
    };

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  objective: string;
  minutes: number;
  /** Concept ids the student should know first. */
  prerequisites: string[];
  /** Concept ids taught here. */
  concepts: string[];
  steps: Step[];
  summary: string[];
}

export type Track = 'luau' | 'cpp' | 'java';

export interface Course {
  id: string;
  /** Learning track; lessons unlock in order within a track. Default 'luau'. */
  track?: Track;
  number: number;
  title: string;
  description: string;
  level: string;
  /** Lessons that are fully written and available. */
  lessons: Lesson[];
  /** Planned topics not yet written. Shown honestly as "in ontwikkeling". */
  planned: string[];
}

export interface PracticeExercise {
  id: string;
  title: string;
  difficulty: 1 | 2 | 3;
  kind: 'write' | 'fix-bug' | 'predict' | 'fill';
  concepts: string[];
  prerequisites: string[];
  prompt: string;
  starter: string;
  checks: Check[];
  hints: string[];
  solution: string;
  explanation: string;
  /** For predict exercises: answer options. */
  options?: { text: string; correct?: boolean; feedback: string }[];
  /** Shown in the Challenges page (no hints, independent). */
  challenge?: boolean;
}
