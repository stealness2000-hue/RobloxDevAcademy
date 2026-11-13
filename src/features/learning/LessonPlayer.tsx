import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, Target, Trophy, BookOpen, RotateCcw } from 'lucide-react';
import { useApp } from '@/store';
import { call } from '@/api';
import { COURSE_BY_ID, LESSON_BY_ID, isGradedStep, lessonNumber, ALL_LESSONS } from '@/curriculum';
import { conceptName } from '@/curriculum/concepts';
import { ProgressBar, Prose, inline } from '@/components/ui';
import { CodeStep, ExplainStep, QuizStep, StudioStep } from './Steps';
import { VariableVisualizer, ConditionVisualizer, LoopVisualizer } from './Visualizers';
import { ExercisePanel } from './ExercisePanel';
import type { Award } from '@shared/types';

interface LessonState {
  done: string[];
  codes: Record<string, string>;
  studio: Record<string, number[]>;
  reached: number;
}

export function LessonPlayer({ lessonId }: { lessonId: string }) {
  const lesson = LESSON_BY_ID.get(lessonId);
  const { snapshot, navigate, showAwards, refresh } = useApp();
  const row = snapshot?.lessons.find((l) => l.lessonId === lessonId);
  const [repeating, setRepeating] = useState(false);
  const alreadyCompleted = row?.status === 'completed' && !repeating;
  const saved = (row?.state ?? {}) as Partial<LessonState>;
  const [state, setState] = useState<LessonState>({
    done: saved.done ?? [],
    codes: saved.codes ?? {},
    studio: saved.studio ?? {},
    reached: alreadyCompleted ? (lesson?.steps.length ?? 1) - 1 : Math.min(saved.reached ?? row?.stepIndex ?? 0, (lesson?.steps.length ?? 1) - 1),
  });
  const [completion, setCompletion] = useState<Award[] | null>(null);
  const stepRefs = useRef<(HTMLElement | null)[]>([]);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const latest = useRef(state);
  latest.current = state;

  useEffect(() => {
    if (!lesson) return;
    void call('progress:openLesson', { lessonId, courseId: lesson.courseId }).then(refresh);
    return () => {
      // Flush pending state when leaving the lesson.
      clearTimeout(saveTimer.current);
      void call('progress:saveLessonState', { lessonId, stepIndex: latest.current.reached, state: { ...latest.current } });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  const persist = (s: LessonState) => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => void call('progress:saveLessonState', { lessonId, stepIndex: s.reached, state: { ...s } }), 600);
  };
  const update = (fn: (s: LessonState) => LessonState) => {
    setState((prev) => {
      const next = fn(prev);
      persist(next);
      return next;
    });
  };

  const course = lesson ? COURSE_BY_ID.get(lesson.courseId) : undefined;
  const gradedKeys = useMemo(() => lesson?.steps.map((s, i) => (isGradedStep(s) ? `s${i}` : null)).filter(Boolean) as string[], [lesson]);

  if (!lesson || !course) {
    return <div className="page"><div className="empty">Deze les bestaat niet (meer).<button className="btn" onClick={() => navigate('learn')}>Naar Leren</button></div></div>;
  }

  const isDone = (i: number) => state.done.includes(`s${i}`) || alreadyCompleted;
  const canAdvance = (i: number) => !isGradedStep(lesson.steps[i]) || isDone(i);
  const markDone = (i: number) => update((s) => (s.done.includes(`s${i}`) ? s : { ...s, done: [...s.done, `s${i}`] }));
  const advance = () => {
    update((s) => ({ ...s, reached: Math.min(lesson.steps.length - 1, s.reached + 1) }));
    setTimeout(() => stepRefs.current[latest.current.reached]?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  };
  const allDone = gradedKeys.every((k) => state.done.includes(k)) || alreadyCompleted;
  const atEnd = state.reached >= lesson.steps.length - 1;
  const progress = alreadyCompleted ? 1 : (state.reached + (canAdvance(state.reached) ? 1 : 0)) / lesson.steps.length;
  const idx = ALL_LESSONS.findIndex((l) => l.id === lesson.id);
  const next = ALL_LESSONS[idx + 1];
  const prev = ALL_LESSONS[idx - 1];

  async function complete() {
    const awards = await call('progress:completeLesson', { lessonId, courseId: lesson!.courseId, courseLessonIds: course!.lessons.map((l) => l.id) });
    await call('progress:saveLessonState', { lessonId, stepIndex: latest.current.reached, state: { ...latest.current } });
    setCompletion(awards);
    showAwards(awards);
    await refresh();
  }

  return (
    <div className="page lesson-page">
      <div className="lesson-top">
        <button className="btn ghost sm" onClick={() => navigate('learn')}><ArrowLeft size={14} /> {course.title}</button>
        <span className="grow" />
        <span className="small faint">Les {lessonNumber(lesson.id)}</span>
      </div>
      <header className="lesson-header">
        <h1>{lesson.title}</h1>
        <div className="lesson-meta">
          <span className="row small muted"><Target size={14} /> {lesson.objective}</span>
        </div>
        <div className="row small muted" style={{ gap: 16, marginTop: 6, flexWrap: 'wrap' }}>
          <span className="row" style={{ gap: 5 }}><Clock size={13} /> ± {lesson.minutes} min</span>
          {lesson.prerequisites.length > 0 && <span>Voorkennis: {lesson.prerequisites.map(conceptName).join(', ')}</span>}
          {alreadyCompleted && <span className="badge success"><CheckCircle2 size={12} /> Afgerond</span>}
        </div>
        <div style={{ marginTop: 14 }}><ProgressBar value={progress} tone={alreadyCompleted ? 'success' : undefined} /></div>
      </header>

      <div className="steps">
        {lesson.steps.slice(0, state.reached + 1).map((step, i) => (
          <section key={i} ref={(el) => { stepRefs.current[i] = el; }} className={`step-wrap ${i === state.reached ? 'current' : ''}`} aria-label={`Stap ${i + 1}`}>
            {step.type === 'explain' && <ExplainStep step={step} />}
            {step.type === 'code' && <CodeStep step={step} />}
            {(step.type === 'quiz' || step.type === 'predict') && <QuizStep step={step} lessonId={lessonId} done={isDone(i)} onDone={() => markDone(i)} />}
            {step.type === 'visual' && step.kind === 'variable' && <VariableVisualizer initial={step.code} title={step.title} body={step.body} />}
            {step.type === 'visual' && step.kind !== 'variable' && (
              <div className="step">
                {step.title && <h2 className="step-title">{step.title}</h2>}
                {step.body && <Prose text={step.body} />}
                {step.kind === 'condition' ? <ConditionVisualizer /> : <LoopVisualizer />}
              </div>
            )}
            {step.type === 'studio' && (
              <StudioStep step={step} done={isDone(i)} onDone={() => markDone(i)} checked={state.studio[`s${i}`] ?? (alreadyCompleted ? step.steps.map((_, k) => k) : [])}
                onCheck={(c) => update((s) => ({ ...s, studio: { ...s.studio, [`s${i}`]: c } }))} />
            )}
            {step.type === 'exercise' && (
              <div className="step">
                <ExercisePanel
                  spec={step}
                  lessonId={lessonId}
                  initialCode={state.codes[step.id]}
                  initiallySolved={isDone(i)}
                  onCodeChange={(c) => update((s) => ({ ...s, codes: { ...s.codes, [step.id]: c } }))}
                  onSolved={() => markDone(i)}
                />
              </div>
            )}
            {i === state.reached && !atEnd && (
              <div className="step-next">
                <button className="btn primary" onClick={advance} disabled={!canAdvance(i)}>Verder <ArrowRight size={15} /></button>
                {!canAdvance(i) && <span className="small faint">{step.type === 'exercise' ? 'Los de oefening op om verder te gaan.' : step.type === 'studio' ? 'Bevestig de Studio-stappen om verder te gaan.' : 'Kies het juiste antwoord om verder te gaan.'}</span>}
              </div>
            )}
          </section>
        ))}

        {atEnd && canAdvance(state.reached) && (
          <section className="step-wrap lesson-end">
            <div className="step">
              <div className="row" style={{ gap: 10 }}><BookOpen size={18} /><h2>Samenvatting</h2></div>
              <ul className="summary">{lesson.summary.map((s, i) => <li key={i}>{inline(s)}</li>)}</ul>
              {!allDone && <div className="feedback bad"><div>Niet alle oefeningen en vragen zijn afgerond. Scroll omhoog om ze af te maken.</div></div>}
              {(completion || alreadyCompleted) ? (
                <div className="complete-card">
                  <Trophy size={22} />
                  <div className="grow">
                    <strong>{completion ? 'Les afgerond!' : 'Je hebt deze les al afgerond.'}</strong>
                    {completion && completion.length > 0 && (
                      <div className="small muted">{completion.map((a) => (a.kind === 'xp' ? `+${a.amount} XP · ${a.reason}` : `Prestatie: ${a.reason}`)).join('   ·   ')}</div>
                    )}
                    {completion && completion.length === 0 && <div className="small muted">Je voortgang is opgeslagen.</div>}
                  </div>
                  {next ? (
                    <button className="btn primary" onClick={() => navigate('lesson', { id: next.id })}>Volgende les: {next.title} <ArrowRight size={15} /></button>
                  ) : (
                    <button className="btn primary" onClick={() => navigate('learn')}>Naar het overzicht</button>
                  )}
                </div>
              ) : (
                <div className="row" style={{ marginTop: 14 }}>
                  <button className="btn primary lg" disabled={!allDone} onClick={complete}><CheckCircle2 size={16} /> Les afronden</button>
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      <div className="lesson-nav">
        {prev ? <button className="btn ghost" onClick={() => navigate('lesson', { id: prev.id })}><ArrowLeft size={14} /> {prev.title}</button> : <span />}
        {row?.status === 'completed' && !repeating && (
          <button className="btn ghost" onClick={() => { setRepeating(true); setCompletion(null); update(() => ({ done: [], codes: {}, studio: {}, reached: 0 })); }} title="Oefeningen opnieuw maken (je voortgang blijft bewaard)">
            <RotateCcw size={14} /> Les herhalen
          </button>
        )}
      </div>
    </div>
  );
}
