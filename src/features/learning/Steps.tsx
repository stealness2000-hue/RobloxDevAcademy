import { useState } from 'react';
import { t } from '@/i18n';
import { CheckCircle2, Circle, Play, Loader2, XCircle, Monitor, Info } from 'lucide-react';
import { CodeView, Prose, inline } from '@/components/ui';
import { OutputConsole, ErrorExplanation } from './Output';
import { call } from '@/api';
import { useApp } from '@/store';
import { explainRunError } from '@shared/explain-error';
import { explainNative } from '@shared/explain-native';
import type { RunResult } from '@shared/types';
import type { Step } from '@/curriculum/types';

type StepOf<T extends Step['type']> = Extract<Step, { type: T }>;

export function ExplainStep({ step }: { step: StepOf<'explain'> }) {
  return (
    <div className="step">
      {step.title && <h2 className="step-title">{step.title}</h2>}
      <Prose text={step.body} />
    </div>
  );
}

export type Lang = 'luau' | 'cpp' | 'java';

export function runCode(language: Lang, code: string) {
  return language === 'luau' ? call('luau:run', code) : call('code:run', { language, code, record: true });
}

export function useRunner(language: Lang = 'luau') {
  const [result, setResult] = useState<RunResult | null>(null);
  const [busy, setBusy] = useState(false);
  const run = async (code: string) => {
    setBusy(true);
    try {
      setResult(await runCode(language, code));
    } finally {
      setBusy(false);
    }
  };
  return { result, busy, run, setResult };
}

export function CodeStep({ step, language = 'luau' }: { step: StepOf<'code'>; language?: Lang }) {
  const [focus, setFocus] = useState<number | null>(step.annotations?.length ? 0 : null);
  const { result, busy, run } = useRunner(language);
  const ann = focus !== null ? step.annotations?.[focus] : undefined;
  return (
    <div className="step">
      {step.title && <h2 className="step-title">{step.title}</h2>}
      {step.body && <Prose text={step.body} />}
      <div className="code-example">
        <CodeView code={step.code} focusToken={ann?.token} errorLine={result?.error?.line} language={language} />
        {step.annotations && (
          <div className="annotations">
            <div className="ann-tabs" role="tablist" aria-label={t('Parts of the code')}>
              {step.annotations.map((a, i) => (
                <button key={i} role="tab" aria-selected={focus === i} className="ann-tab mono" onClick={() => setFocus(i)}>{a.token}</button>
              ))}
            </div>
            {ann && <div className="ann-body" role="tabpanel">{inline(ann.text)}</div>}
          </div>
        )}
        {(step.runnable || step.studioOnly) && (
          <div className="exercise-bar">
            {step.runnable && (
              <button className="btn primary" onClick={() => run(step.code)} disabled={busy}>
                {busy ? <Loader2 size={15} className="spin" /> : <Play size={15} />} {t('Run Code')}
              </button>
            )}
            {step.studioOnly && <span className="badge warning"><Monitor size={12} /> {t('Only in Roblox Studio')}</span>}
          </div>
        )}
      </div>
      {result && (
        <>
          <OutputConsole result={result} />
          {result.error && <ErrorExplanation explanation={language === 'luau' ? explainRunError(result.error, step.code) : explainNative(result.error.message, language)} />}
        </>
      )}
      {step.after && (result || !step.runnable) && <Prose text={step.after} className="after" />}
    </div>
  );
}

/** Multiple choice. Counts as done once the correct answer is chosen; the FIRST answer is recorded. */
export function QuizStep({ step, lessonId, done, onDone, language = 'luau' }: { step: StepOf<'quiz'> | StepOf<'predict'>; lessonId: string; done: boolean; onDone: () => void; language?: Lang }) {
  const [chosen, setChosen] = useState<number | null>(null);
  const [answeredOnce, setAnsweredOnce] = useState(done);
  const [verify, setVerify] = useState<RunResult | null>(null);
  const [verifying, setVerifying] = useState(false);
  const showAwards = useApp((s) => s.showAwards);
  const isPredict = step.type === 'predict';
  const correctIdx = step.options.findIndex((o) => o.correct);
  const solved = done || chosen === correctIdx;

  async function choose(i: number) {
    if (solved) return;
    setChosen(i);
    const correct = i === correctIdx;
    if (!answeredOnce) {
      setAnsweredOnce(true);
      showAwards(await call('progress:recordQuiz', { quizId: step.id, lessonId, concepts: step.concepts, correct }));
    }
    if (correct) onDone();
  }

  return (
    <div className="step">
      <div className="row" style={{ marginBottom: 8 }}>
        <span className="badge">{isPredict ? t('Predict the output') : t('Quiz question')}</span>
      </div>
      <h2 className="step-title">{step.question}</h2>
      {'code' in step && step.code && <CodeView code={step.code} language={language} />}
      <div className="col" role="radiogroup" aria-label={step.question} style={{ marginTop: 12 }}>
        {step.options.map((o, i) => {
          const state = chosen === i ? (i === correctIdx ? 'correct' : 'wrong') : done && i === correctIdx ? 'correct' : '';
          return (
            <button key={i} className={`choice ${state}`} role="radio" aria-checked={chosen === i} onClick={() => choose(i)} disabled={solved && chosen !== i && !(done && i === correctIdx)}>
              {state === 'correct' ? <CheckCircle2 size={17} color="var(--success)" /> : state === 'wrong' ? <XCircle size={17} color="var(--error)" /> : <span className="radio" />}
              <span className={isPredict ? 'mono' : ''}>{o.text}</span>
            </button>
          );
        })}
      </div>
      {chosen !== null && (
        <div className={`feedback ${chosen === correctIdx ? 'ok' : 'bad'}`} style={{ marginTop: 12 }}>
          {chosen === correctIdx ? <CheckCircle2 size={18} /> : <Info size={18} />}
          <div>{inline(step.options[chosen].feedback)}{chosen !== correctIdx && <div className="small muted" style={{ marginTop: 4 }}>{t('Try another answer.')}</div>}</div>
        </div>
      )}
      {isPredict && solved && 'code' in step && (
        <div style={{ marginTop: 12 }}>
          {!verify ? (
            <button className="btn" disabled={verifying} onClick={async () => { setVerifying(true); setVerify(await runCode(language, step.code!)); setVerifying(false); }}>
              <Play size={14} /> {t('Check it yourself: run the code')}
            </button>
          ) : (
            <OutputConsole result={verify} title={t('Real Output')} />
          )}
        </div>
      )}
    </div>
  );
}

/** Studio steps cannot be verified automatically; the student confirms them. This is recorded honestly as self-reported. */
export function StudioStep({ step, done, onDone, checked, onCheck }: { step: StepOf<'studio'>; done: boolean; onDone: () => void; checked: number[]; onCheck: (c: number[]) => void }) {
  const all = step.steps.every((_, i) => checked.includes(i));
  return (
    <div className="step">
      <div className="row" style={{ marginBottom: 8 }}>
        <span className="badge warning"><Monitor size={12} /> {t('In Roblox Studio')}</span>
      </div>
      <h2 className="step-title">{step.title}</h2>
      {step.body && <Prose text={step.body} />}
      <ol className="studio-steps">
        {step.steps.map((s, i) => {
          const on = checked.includes(i);
          return (
            <li key={i}>
              <button className={`studio-check ${on ? 'on' : ''}`} aria-pressed={on} onClick={() => onCheck(on ? checked.filter((c) => c !== i) : [...checked, i])}>
                {on ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                <span className="grow">
                  <span className="n">{i + 1}.</span> {inline(s.text)}
                  {s.detail && <span className="detail">{inline(s.detail)}</span>}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      <div className="feedback info" style={{ marginTop: 12 }}>
        <Info size={16} />
        <div>
          <div><strong>{t('Expected result:')}</strong> {inline(step.expected)}</div>
          <div className="small muted" style={{ marginTop: 4 }}>{t('The Academy cannot check this step automatically. You confirm yourself that it worked.')}</div>
        </div>
      </div>
      <div className="row" style={{ marginTop: 12 }}>
        <button className={`btn ${done ? 'success' : 'primary'}`} disabled={!all || done} onClick={onDone}>
          <CheckCircle2 size={15} /> {done ? t('Confirmed') : t('It worked in Studio')}
        </button>
        {!all && !done && <span className="small faint">{t('First tick off all the steps.')}</span>}
      </div>
    </div>
  );
}
