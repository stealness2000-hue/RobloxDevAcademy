import { useState } from 'react';
import { ChevronDown, ChevronRight, CornerDownRight, MonitorPlay } from 'lucide-react';
import { inline } from '@/components/ui';
import type { Explanation } from '@shared/explain-error';
import type { RunResult } from '@shared/types';
import { t } from '@/i18n';

export function OutputConsole({ result, title = 'Output', emptyText }: { result: RunResult; title?: string; emptyText?: string }) {
  return (
    <div className="output">
      <div className="output-head">
        <MonitorPlay size={14} /> {title}
        <span className="grow" />
        <span className="faint small">{result.durationMs < 1000 ? `${Math.max(1, Math.round(result.durationMs))} ms` : `${(result.durationMs / 1000).toFixed(1)} s`}</span>
      </div>
      <div className="console selectable" aria-live="polite">
        {result.output.length === 0 && !result.error && <div className="line system">{emptyText ?? t('Your program showed nothing.')}</div>}
        {result.output.map((o, i) => (
          <div key={i} className={`line ${o.kind}`}>{o.kind === 'warn' && <span className="prefix">⚠</span>}{o.text}</div>
        ))}
        {result.outputTruncated && <div className="line system">… {t('Output shortened (too many lines)')}</div>}
        {result.error && <div className="line error">{result.error.message.replace(/\nstack traceback:[\s\S]*/, '')}</div>}
      </div>
    </div>
  );
}

/** The five-part beginner explanation: what / why / where / how / more. */
export function ErrorExplanation({ explanation: e, onGoto }: { explanation: Explanation; onGoto?: (line: number) => void }) {
  const [more, setMore] = useState(false);
  const [raw, setRaw] = useState(false);
  return (
    <div className={`explain ${e.category === 'roblox-only' ? 'warning' : ''}`} role="alert">
      <div className="q">{t('What went wrong?')}</div>
      <div className="a"><strong>{inline(t(e.what))}</strong>
        {e.certainty === 'likely' && <span className="badge" style={{ marginLeft: 8 }}>{t('most likely cause')}</span>}
        {e.certainty === 'unknown' && <span className="badge warning" style={{ marginLeft: 8 }}>{t('not explained yet')}</span>}
      </div>
      <div className="q">{t('Why does this happen?')}</div>
      <div className="a">{inline(t(e.why))}</div>
      {e.line && (
        <>
          <div className="q">{t('Where is the mistake?')}</div>
          <div className="a row">
            {e.column ? t('Line {line}, position {col}', { line: e.line, col: e.column }) : t('Line {line}', { line: e.line })}
            {onGoto && <button className="btn sm ghost" onClick={() => onGoto(e.line!)}><CornerDownRight size={13} /> {t('Go to line')}</button>}
          </div>
        </>
      )}
      <div className="q">{t('How can you fix it?')}</div>
      <div className="a">{inline(t(e.hint))}</div>
      <div className="row" style={{ marginTop: 10, gap: 4 }}>
        <button className="btn sm ghost" onClick={() => setMore(!more)} aria-expanded={more}>
          {more ? <ChevronDown size={14} /> : <ChevronRight size={14} />} {t('Want more explanation?')}
        </button>
        <button className="btn sm ghost" onClick={() => setRaw(!raw)} aria-expanded={raw}>{t('Original message')}</button>
      </div>
      {more && <div className="a muted" style={{ marginTop: 6 }}>{inline(t(e.more))}</div>}
      {raw && <pre className="mono small selectable" style={{ margin: '6px 0 0', whiteSpace: 'pre-wrap', color: 'var(--text-2)' }}>{e.original}</pre>}
    </div>
  );
}
