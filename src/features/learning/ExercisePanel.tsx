import { useRef, useState } from 'react';
import { CheckCircle2, Lightbulb, Play, RotateCcw, Eye, AlertCircle, Loader2 } from 'lucide-react';
import { CodeEditor, type CodeEditorHandle } from '@/editor/CodeEditor';
import { Modal, Prose, inline } from '@/components/ui';
import { OutputConsole, ErrorExplanation } from './Output';
import { call } from '@/api';
import { useApp } from '@/store';
import { evaluate, type Check, type EvaluationResult } from '@shared/evaluator';

export interface ExerciseSpec {
  id: string;
  title: string;
  prompt: string;
  starter: string;
  checks: Check[];
  hints: string[];
  solution: string;
  concepts: string[];
  success: string;
  mode: 'guided' | 'independent';
  kind?: 'exercise' | 'fix-bug' | 'challenge' | 'review';
}

interface Props {
  spec: ExerciseSpec;
  lessonId: string | null;
  initialCode?: string;
  initiallySolved?: boolean;
  hideHints?: boolean;
  onCodeChange?: (code: string) => void;
  onSolved?: () => void;
}

/** One "Run Code" click = run + evaluate + record attempt. */
export function ExercisePanel({ spec, lessonId, initialCode, initiallySolved, hideHints, onCodeChange, onSolved }: Props) {
  const [code, setCode] = useState(initialCode ?? spec.starter);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [solved, setSolved] = useState(!!initiallySolved);
  const [hintsShown, setHintsShown] = useState(0);
  const [failures, setFailures] = useState(0);
  const [solutionSeen, setSolutionSeen] = useState(false);
  const [confirmSolution, setConfirmSolution] = useState(false);
  const editor = useRef<CodeEditorHandle>(null);
  const { showAwards, settings } = useApp();

  async function runCode() {
    if (busy) return;
    setBusy(true);
    let first = true;
    // First run is the student's real run (recorded); evaluator follow-up runs are not counted.
    const runner = (c: string) => {
      const ch = first ? 'luau:run' : 'luau:evalRun';
      first = false;
      return call(ch, c);
    };
    try {
      const r = await evaluate(code, spec.checks, runner);
      setResult(r);
      const independent = spec.mode === 'independent' && hintsShown === 0 && !solutionSeen;
      const awards = await call('progress:recordAttempt', {
        exerciseId: spec.id,
        lessonId,
        concepts: spec.concepts,
        correct: r.passed,
        hintsUsed: solutionSeen ? Math.max(hintsShown, 3) : hintsShown,
        independent,
        kind: spec.kind === 'challenge' ? 'challenge' : spec.kind === 'fix-bug' ? 'fix-bug' : spec.kind === 'review' ? 'review' : 'exercise',
        errorCategory: r.passed ? null : r.errorCategory,
        code,
      });
      showAwards(awards);
      if (r.passed) {
        setSolved(true);
        onSolved?.();
      } else {
        setFailures((f) => f + 1);
        if (settings.hintPreference === 'after-mistake' && !hideHints && hintsShown < spec.hints.length) setHintsShown((h) => Math.max(h, 1));
      }
    } catch (e) {
      useApp.getState().toast({ kind: 'error', title: 'Code kon niet worden uitgevoerd', body: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setCode(spec.starter);
    onCodeChange?.(spec.starter);
    setResult(null);
  }

  const errorLine = result?.explanation?.line ?? null;

  return (
    <div className="exercise">
      <div className="exercise-head">
        <div className="row" style={{ gap: 10 }}>
          <span className={`badge ${spec.mode === 'independent' ? 'accent' : ''}`}>{spec.kind === 'fix-bug' ? 'Repareer de bug' : spec.mode === 'independent' ? 'Zelfstandig' : 'Begeleid'}</span>
          <h3>{spec.title}</h3>
          {solved && <span className="badge success"><CheckCircle2 size={12} /> Opgelost</span>}
        </div>
        <Prose text={spec.prompt} className="exercise-prompt" />
      </div>

      <div className="exercise-editor">
        <CodeEditor
          ref={editor}
          value={code}
          onChange={(v) => {
            setCode(v);
            onCodeChange?.(v);
          }}
          onRun={runCode}
          errorLine={errorLine}
          minLines={Math.max(3, spec.starter.split('\n').length + 1)}
          ariaLabel={`Code voor oefening: ${spec.title}`}
        />
        <div className="exercise-bar">
          <button className="btn primary" onClick={runCode} disabled={busy} title="Ctrl + Enter">
            {busy ? <Loader2 size={15} className="spin" /> : <Play size={15} />} Run Code
          </button>
          <span className="kbd-hint"><kbd>Ctrl</kbd>+<kbd>Enter</kbd></span>
          <span className="grow" />
          {!hideHints && spec.hints.length > 0 && (
            <button className="btn ghost" onClick={() => setHintsShown((h) => Math.min(spec.hints.length, h + 1))} disabled={hintsShown >= spec.hints.length}>
              <Lightbulb size={15} /> {hintsShown === 0 ? 'Hint' : hintsShown < spec.hints.length ? 'Nog een hint' : 'Geen hints meer'}
            </button>
          )}
          {!hideHints && failures >= 2 && !solved && spec.solution && (
            <button className="btn ghost" onClick={() => setConfirmSolution(true)}><Eye size={15} /> Oplossing</button>
          )}
          <button className="btn ghost icon" onClick={reset} title="Begincode terugzetten" aria-label="Begincode terugzetten"><RotateCcw size={15} /></button>
        </div>
      </div>

      {hintsShown > 0 && (
        <div className="hints">
          {spec.hints.slice(0, hintsShown).map((h, i) => (
            <div key={i} className="feedback info"><Lightbulb size={16} /><div><strong>Hint {i + 1}.</strong> {inline(h)}</div></div>
          ))}
        </div>
      )}

      {result && (
        <div className="exercise-result">
          <OutputConsole result={result.run} />
          {result.explanation ? (
            <ErrorExplanation explanation={result.explanation} onGoto={(l) => editor.current?.revealLine(l)} />
          ) : result.passed ? (
            <div className="feedback ok"><CheckCircle2 size={18} /><div><strong>{inline(spec.success)}</strong></div></div>
          ) : (
            <div className="feedback bad"><AlertCircle size={18} /><div>
              <div>{inline(result.feedback ?? 'Nog niet helemaal goed.')}</div>
              <div className="small muted" style={{ marginTop: 4 }}>Je code draaide zonder fouten, maar doet nog niet precies wat de opdracht vraagt.</div>
            </div></div>
          )}
        </div>
      )}

      {solutionSeen && (
        <div className="feedback info"><Eye size={16} /><div className="grow">
          <div className="small muted">Een mogelijke oplossing. Typ hem zelf over en probeer te begrijpen waarom hij werkt; deze oefening telt nu als begeleid.</div>
          <pre className="mono selectable" style={{ margin: '6px 0 0', whiteSpace: 'pre-wrap' }}>{spec.solution}</pre>
        </div></div>
      )}

      {confirmSolution && (
        <Modal
          title="Oplossing bekijken?"
          onClose={() => setConfirmSolution(false)}
          actions={<>
            <button className="btn ghost" onClick={() => setConfirmSolution(false)}>Nog even zelf proberen</button>
            <button className="btn primary" onClick={() => { setSolutionSeen(true); setConfirmSolution(false); }}>Toon oplossing</button>
          </>}
        >
          Je leert het meest door het zelf op te lossen. Na het bekijken telt deze oefening niet meer als zelfstandig opgelost. Je kunt hem daarna wel gewoon afronden.
        </Modal>
      )}
    </div>
  );
}
