import { useMemo, useState } from 'react';
import { ArrowLeft, Bug, Eye, Lock, PenLine, Repeat, Swords, CheckCircle2 } from 'lucide-react';
import { useApp } from '@/store';
import { PRACTICE } from '@/curriculum/practice';
import { ALL_LESSONS } from '@/curriculum';
import { conceptName } from '@/curriculum/concepts';
import { ExercisePanel } from '@/features/learning/ExercisePanel';
import { QuizStep } from '@/features/learning/Steps';
import type { PracticeExercise } from '@/curriculum/types';

const KIND_LABEL: Record<PracticeExercise['kind'], { label: string; icon: typeof Bug }> = {
  write: { label: 'Zelf schrijven', icon: PenLine },
  'fix-bug': { label: 'Repareer de bug', icon: Bug },
  predict: { label: 'Voorspel de output', icon: Eye },
  fill: { label: 'Vul aan', icon: PenLine },
};

export function PracticePage({ challenges = false }: { challenges?: boolean }) {
  const { snapshot, route, navigate } = useApp();
  const [openId, setOpenId] = useState<string | null>(null);
  const [solvedNow, setSolvedNow] = useState<Set<string>>(new Set());
  const conceptFilter = route.params?.concept ?? null;
  const reviewMode = route.params?.mode === 'review';

  const learned = useMemo(() => {
    const done = new Set(snapshot?.lessons.filter((l) => l.status === 'completed').map((l) => l.lessonId));
    return new Set(ALL_LESSONS.filter((l) => done.has(l.id)).flatMap((l) => l.concepts));
  }, [snapshot]);
  const due = new Set(snapshot?.mastery.filter((m) => m.needsReview).map((m) => m.conceptId));
  const weakFirst = new Map(snapshot?.mastery.map((m) => [m.conceptId, m.score]));

  let list = PRACTICE.filter((p) => !!p.challenge === challenges);
  if (conceptFilter) list = list.filter((p) => p.concepts.includes(conceptFilter));
  if (reviewMode) list = list.filter((p) => p.concepts.some((c) => due.has(c)));
  // Adaptive ordering: weakest concepts first.
  list = [...list].sort((a, b) => Math.min(...a.concepts.map((c) => weakFirst.get(c) ?? 50)) - Math.min(...b.concepts.map((c) => weakFirst.get(c) ?? 50)) || a.difficulty - b.difficulty);
  const unlocked = (p: PracticeExercise) => p.prerequisites.every((c) => learned.has(c));
  const current = PRACTICE.find((p) => p.id === openId);

  if (current) {
    return (
      <div className="page" style={{ maxWidth: 900 }}>
        <button className="btn ghost sm" onClick={() => setOpenId(null)}><ArrowLeft size={14} /> Terug naar {challenges ? 'uitdagingen' : 'oefenen'}</button>
        <div style={{ marginTop: 14 }}>
          {current.kind === 'predict' ? (
            <QuizStep step={{ type: 'predict', id: current.id, question: current.prompt, code: current.starter, options: current.options!, concepts: current.concepts }} lessonId="practice" done={false} onDone={() => setSolvedNow((s) => new Set(s).add(current.id))} />
          ) : (
            <ExercisePanel
              key={current.id}
              spec={{
                id: current.id, title: current.title, prompt: current.prompt, starter: current.starter, checks: current.checks, hints: current.hints,
                solution: current.solution, concepts: current.concepts, success: `Goed gedaan. ${current.explanation}`, mode: challenges ? 'independent' : 'guided',
                kind: reviewMode ? 'review' : challenges ? 'challenge' : current.kind === 'fix-bug' ? 'fix-bug' : 'exercise',
              }}
              lessonId={null}
              hideHints={challenges}
              onSolved={() => setSolvedNow((s) => new Set(s).add(current.id))}
            />
          )}
          {challenges && <div className="small faint" style={{ marginTop: 10 }}>Uitdagingen hebben geen hints: ze laten zien wat je zelfstandig kunt. Je kunt ze zo vaak proberen als je wilt.</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-head">
        <div className="grow">
          <h1>{challenges ? 'Uitdagingen' : reviewMode ? 'Herhalen' : 'Oefenen'}</h1>
          <div className="sub">
            {challenges ? 'Zelfstandige opdrachten zonder hints. Laat zien wat je kunt.' : reviewMode ? 'Onderwerpen die je een tijd niet hebt geoefend. Kort herhalen helpt je onthouden.' : 'Extra oefeningen per onderwerp. Je zwakste onderwerpen staan bovenaan.'}
          </div>
        </div>
        {(conceptFilter || reviewMode) && <button className="btn ghost" onClick={() => navigate(challenges ? 'challenges' : 'practice')}>Alle oefeningen tonen</button>}
      </div>
      {conceptFilter && <div className="row" style={{ marginBottom: 12 }}><span className="badge accent">Onderwerp: {conceptName(conceptFilter)}</span></div>}
      {list.length === 0 && <div className="card empty"><Repeat size={24} />{reviewMode ? 'Er staat nu niets klaar om te herhalen. Mooi zo.' : 'Geen oefeningen voor deze selectie.'}</div>}
      <div className="card flush">
        {list.map((p) => {
          const K = KIND_LABEL[p.kind];
          const ok = unlocked(p);
          const solved = solvedNow.has(p.id);
          return (
            <button key={p.id} className="list-row" disabled={!ok} onClick={() => setOpenId(p.id)}>
              <span className="practice-icon">{challenges ? <Swords size={16} /> : <K.icon size={16} />}</span>
              <span className="grow">
                <span className="row" style={{ gap: 8 }}><span style={{ color: ok ? 'var(--text)' : 'var(--text-3)' }}>{p.title}</span>{solved && <CheckCircle2 size={14} color="var(--success)" />}</span>
                <span className="small faint">{K.label} · {p.concepts.map(conceptName).join(', ')}</span>
              </span>
              <span className="difficulty" aria-label={`Moeilijkheid ${p.difficulty} van 3`}>{[1, 2, 3].map((d) => <span key={d} className={d <= p.difficulty ? 'on' : ''} />)}</span>
              {!ok && <span className="small faint row" style={{ gap: 4 }}><Lock size={12} /> Eerst: {p.prerequisites.filter((c) => !learned.has(c)).map(conceptName).join(', ')}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
