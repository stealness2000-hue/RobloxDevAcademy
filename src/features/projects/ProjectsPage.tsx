import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, CheckCircle2, Hammer, Lock, ScanSearch, Trophy, Info, AlertCircle, Lightbulb } from 'lucide-react';
import { useApp } from '@/store';
import { call } from '@/api';
import { PROJECTS, type Project } from '@/curriculum/projects';
import { LESSON_BY_ID } from '@/curriculum';
import { CodeEditor } from '@/editor/CodeEditor';
import { Prose, inline } from '@/components/ui';
import { StudioStep } from '@/features/learning/Steps';
import { hasSequence, codeTokens } from '@shared/luau-lexer';
import { ROBLOX_GLOBALS, explainDiagnostic } from '@shared/explain-error';

export function ProjectsPage() {
  const { snapshot } = useApp();
  const [open, setOpen] = useState<string | null>(null);
  const completed = new Set(snapshot?.lessons.filter((l) => l.status === 'completed').map((l) => l.lessonId));
  const project = PROJECTS.find((p) => p.id === open);
  if (project) return <ProjectView project={project} onBack={() => setOpen(null)} />;

  return (
    <div className="page">
      <div className="page-head"><div className="grow"><h1>Projecten</h1><div className="sub">Echte Roblox-mechanismen, stap voor stap. Jij schrijft de code; de Academy begeleidt.</div></div></div>
      <div className="grid c2">
        {PROJECTS.map((p) => {
          const missing = p.prerequisites.filter((id) => !completed.has(id));
          const done = completed.has(p.id);
          return (
            <button key={p.id} className="card project-card" disabled={!p.available || missing.length > 0} onClick={() => setOpen(p.id)}>
              <div className="row" style={{ gap: 8 }}>
                <span className="mono faint">{String(p.number).padStart(2, '0')}</span>
                <h3 className="grow" style={{ textAlign: 'left' }}>{p.title}</h3>
                {done ? <span className="badge success"><CheckCircle2 size={11} /> Afgerond</span> : !p.available ? <span className="badge warning"><Hammer size={11} /> In ontwikkeling</span> : missing.length ? <span className="badge"><Lock size={11} /> Vergrendeld</span> : <span className="badge accent">{p.difficulty}</span>}
              </div>
              <p className="small muted" style={{ textAlign: 'left', marginTop: 6 }}>{p.description}</p>
              <div className="row small faint" style={{ marginTop: 8, flexWrap: 'wrap', gap: 6 }}>{p.learns.map((l) => <span key={l} className="badge">{l}</span>)}</div>
              {p.available && missing.length > 0 && <div className="small faint" style={{ marginTop: 8, textAlign: 'left' }}>Rond eerst af: {missing.map((m) => LESSON_BY_ID.get(m)?.title ?? m).join(', ')}</div>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface PState { done: number[]; code: string; studio: Record<number, number[]> }

function ProjectView({ project, onBack }: { project: Project; onBack: () => void }) {
  const { snapshot, showAwards, refresh } = useApp();
  const row = snapshot?.lessons.find((l) => l.lessonId === project.id);
  const saved = (row?.state ?? {}) as Partial<PState>;
  const codeTask = project.tasks?.find((t) => t.code);
  const [st, setSt] = useState<PState>({ done: saved.done ?? [], code: saved.code ?? codeTask?.code?.starter ?? '', studio: saved.studio ?? {} });
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string; line?: number } | null>(null);
  const [hints, setHints] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const isComplete = row?.status === 'completed';

  useEffect(() => {
    void call('progress:openLesson', { lessonId: project.id, courseId: 'projects' });
  }, [project.id]);
  const update = (n: PState) => {
    setSt(n);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => void call('progress:saveLessonState', { lessonId: project.id, stepIndex: n.done.length, state: { ...n } }), 500);
  };
  const markDone = (i: number) => !st.done.includes(i) && update({ ...st, done: [...st.done, i] });

  async function staticCheck(i: number) {
    const task = project.tasks![i].code!;
    const diags = (await call('luau:check', st.code)).filter((d) => d.severity === 'error' && !(/Unknown global '([^']+)'/.exec(d.message) && ROBLOX_GLOBALS.has(/Unknown global '([^']+)'/.exec(d.message)![1])));
    const syntax = diags[0];
    let fb: typeof feedback;
    if (syntax) fb = { ok: false, text: explainDiagnostic(syntax, st.code).what, line: syntax.line };
    else {
      const toks = codeTokens(st.code);
      const miss = task.checks.find((c) => c.kind === 'uses' && !hasSequence(toks, c.sequence));
      fb = miss ? { ok: false, text: (miss as { message: string }).message } : { ok: true, text: 'De code is geldige Luau en bevat alle onderdelen. Test hem nu echt in Roblox Studio.' };
    }
    setFeedback(fb);
    showAwards(await call('progress:recordAttempt', { exerciseId: `${project.id}-code`, lessonId: project.id, concepts: ['events', 'variables'], correct: fb.ok, hintsUsed: hints, independent: hints === 0, kind: 'exercise', errorCategory: fb.ok ? null : 'other', code: st.code }));
    if (fb.ok) markDone(i);
  }

  async function finish() {
    showAwards(await call('progress:completeLesson', { lessonId: project.id, courseId: 'projects', courseLessonIds: [] }));
    await refresh();
  }
  const allDone = project.tasks!.every((_, i) => st.done.includes(i));

  return (
    <div className="page" style={{ maxWidth: 920 }}>
      <button className="btn ghost sm" onClick={onBack}><ArrowLeft size={14} /> Alle projecten</button>
      <header className="lesson-header" style={{ marginTop: 10 }}>
        <h1>Project {project.number}: {project.title}</h1>
        <p className="muted" style={{ marginTop: 6 }}>{project.description}</p>
      </header>
      <div className="grid c2" style={{ marginTop: 16 }}>
        <div className="card"><div className="card-title">Wat je leert</div><ul className="prose" style={{ fontSize: 14 }}>{project.learns.map((l) => <li key={l}>{l}</li>)}</ul></div>
        <div className="card"><div className="card-title">Voorbereiding</div><ul className="prose" style={{ fontSize: 14 }}>{project.setup?.map((s) => <li key={s}>{s}</li>)}<li>Script-locatie: {project.scriptLocation}</li></ul></div>
      </div>

      {project.tasks!.map((t, i) => (
        <section key={i} className="step-wrap" style={{ marginTop: 16 }}>
          <div className="step">
            <div className="row"><span className="badge">Stap {i + 1}</span>{st.done.includes(i) && <span className="badge success"><CheckCircle2 size={11} /> Klaar</span>}</div>
            <h2 className="step-title" style={{ marginTop: 8 }}>{t.title}</h2>
            <Prose text={t.body} />
            {t.code && (
              <div style={{ marginTop: 12 }}>
                <div className="exercise-editor">
                  <CodeEditor robloxCode value={st.code} onChange={(c) => update({ ...st, code: c })} minLines={8} ariaLabel="Projectcode" />
                  <div className="exercise-bar">
                    <button className="btn primary" onClick={() => staticCheck(i)}><ScanSearch size={15} /> Controleer code</button>
                    <span className="small faint">Statische controle: de code wordt gelezen, niet uitgevoerd.</span>
                    <span className="grow" />
                    <button className="btn ghost" onClick={() => setHints((h) => Math.min(t.code!.hints.length, h + 1))} disabled={hints >= t.code.hints.length}><Lightbulb size={15} /> Hint</button>
                  </div>
                </div>
                {t.code.hints.slice(0, hints).map((h, k) => <div key={k} className="feedback info" style={{ marginTop: 8 }}><Lightbulb size={16} /><div>{inline(h)}</div></div>)}
                {feedback && <div className={`feedback ${feedback.ok ? 'ok' : 'bad'}`} style={{ marginTop: 10 }}>{feedback.ok ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}<div>{inline(feedback.text)}{feedback.line && <span className="small faint"> (regel {feedback.line})</span>}</div></div>}
              </div>
            )}
            {t.studio && (
              <StudioStep step={{ type: 'studio', title: 'In Roblox Studio', exercise: i === project.tasks!.length - 1 && project.id === 'project-color-part' ? 'studio-color-part' : undefined, steps: t.studio, expected: i === project.tasks!.length - 1 ? project.testing!.join(' ') : 'De stappen hierboven zijn gelukt.' }}
                done={st.done.includes(i)} onDone={() => markDone(i)} checked={st.studio[i] ?? []} onCheck={(c) => update({ ...st, studio: { ...st.studio, [i]: c } })} />
            )}
          </div>
        </section>
      ))}

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-title">Veelgemaakte fouten</div>
        <ul className="prose" style={{ fontSize: 14 }}>{project.mistakes?.map((m) => <li key={m}>{m}</li>)}</ul>
      </div>
      <div className="card" style={{ marginTop: 14 }}>
        {isComplete ? (
          <div className="complete-card"><Trophy size={22} /><div className="grow"><strong>Project afgerond.</strong><div className="small muted">{project.done}</div></div></div>
        ) : (
          <div className="row">
            <Info size={16} />
            <span className="grow small muted">Rond alle stappen af om het project te voltooien. De Studio-test bevestig je zelf: de Academy kan Studio nog niet automatisch controleren.</span>
            <button className="btn primary" disabled={!allDone} onClick={finish}><CheckCircle2 size={15} /> Project afronden</button>
          </div>
        )}
      </div>
    </div>
  );
}
