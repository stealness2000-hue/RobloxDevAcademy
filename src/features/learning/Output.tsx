import { useState } from 'react';
import { ChevronDown, ChevronRight, CornerDownRight, MonitorPlay } from 'lucide-react';
import { inline } from '@/components/ui';
import type { Explanation } from '@shared/explain-error';
import type { RunResult } from '@shared/types';

export function OutputConsole({ result, title = 'Output', emptyText = 'Je programma liet niets zien.' }: { result: RunResult; title?: string; emptyText?: string }) {
  return (
    <div className="output">
      <div className="output-head">
        <MonitorPlay size={14} /> {title}
        <span className="grow" />
        <span className="faint small">{result.durationMs < 1000 ? `${Math.max(1, Math.round(result.durationMs))} ms` : `${(result.durationMs / 1000).toFixed(1)} s`}</span>
      </div>
      <div className="console selectable" aria-live="polite">
        {result.output.length === 0 && !result.error && <div className="line system">{emptyText}</div>}
        {result.output.map((o, i) => (
          <div key={i} className={`line ${o.kind}`}>{o.kind === 'warn' && <span className="prefix">⚠</span>}{o.text}</div>
        ))}
        {result.outputTruncated && <div className="line system">… Output ingekort (te veel regels)</div>}
        {result.error && <div className="line error">{result.error.message.replace(/\nstack traceback:[\s\S]*/, '')}</div>}
      </div>
    </div>
  );
}

/** The five-part beginner explanation: Wat / Waarom / Waar / Hoe / Meer. */
export function ErrorExplanation({ explanation: e, onGoto }: { explanation: Explanation; onGoto?: (line: number) => void }) {
  const [more, setMore] = useState(false);
  const [raw, setRaw] = useState(false);
  return (
    <div className={`explain ${e.category === 'roblox-only' ? 'warning' : ''}`} role="alert">
      <div className="q">Wat ging er mis?</div>
      <div className="a"><strong>{inline(e.what)}</strong>
        {e.certainty === 'waarschijnlijk' && <span className="badge" style={{ marginLeft: 8 }}>meest waarschijnlijke oorzaak</span>}
        {e.certainty === 'onbekend' && <span className="badge warning" style={{ marginLeft: 8 }}>nog geen vertaling</span>}
      </div>
      <div className="q">Waarom gebeurt dit?</div>
      <div className="a">{inline(e.why)}</div>
      {e.line && (
        <>
          <div className="q">Waar zit de fout?</div>
          <div className="a row">
            Regel {e.line}{e.column ? `, positie ${e.column}` : ''}
            {onGoto && <button className="btn sm ghost" onClick={() => onGoto(e.line!)}><CornerDownRight size={13} /> Ga naar regel</button>}
          </div>
        </>
      )}
      <div className="q">Hoe kun je dit oplossen?</div>
      <div className="a">{inline(e.hint)}</div>
      <div className="row" style={{ marginTop: 10, gap: 4 }}>
        <button className="btn sm ghost" onClick={() => setMore(!more)} aria-expanded={more}>
          {more ? <ChevronDown size={14} /> : <ChevronRight size={14} />} Wil je meer uitleg?
        </button>
        <button className="btn sm ghost" onClick={() => setRaw(!raw)} aria-expanded={raw}>Originele melding</button>
      </div>
      {more && <div className="a muted" style={{ marginTop: 6 }}>{inline(e.more)}</div>}
      {raw && <pre className="mono small selectable" style={{ margin: '6px 0 0', whiteSpace: 'pre-wrap', color: 'var(--text-2)' }}>{e.original}</pre>}
    </div>
  );
}
