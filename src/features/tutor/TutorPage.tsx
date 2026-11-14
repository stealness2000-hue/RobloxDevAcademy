import { useEffect, useState } from 'react';
import { AlertTriangle, Info, ScanSearch, Monitor } from 'lucide-react';
import { CodeEditor } from '@/editor/CodeEditor';
import { inline } from '@/components/ui';
import { call } from '@/api';
import { explainDiagnostic } from '@shared/explain-error';
import type { Diagnostic } from '@shared/types';
import { analyze, type Analysis } from './code-analysis';
import { t } from '@/i18n';

const SAMPLE = `local Players = game:GetService("Players")

Players.PlayerAdded:Connect(function(player)
    local coins = 0
    print(player.Name .. " joined")
end)
`;

export function TutorPage() {
  const [code, setCode] = useState(SAMPLE);
  const [result, setResult] = useState<Analysis | null>(null);
  const [diags, setDiags] = useState<Diagnostic[]>([]);

  async function run() {
    setResult(analyze(code));
    setDiags((await call('luau:check', code)).filter((d) => !/Unknown global '(game|workspace|script|Instance|Vector3|Color3|CFrame|UDim2|Enum|TweenInfo)'/.test(d.message)));
  }
  useEffect(() => {
    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="page wide">
      <div className="page-head">
        <div className="grow"><h1>{t('Code Explainer')}</h1><div className="sub">{t('Get your code explained line by line. This explanation works offline.')}</div></div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)' }}>
        <div className="card flush" style={{ overflow: 'hidden' }}>
          <div className="pg-section-head" style={{ padding: '10px 14px' }}><span>{t('Paste or type your script')}</span>
            <button className="btn primary sm" onClick={run}><ScanSearch size={13} /> {t('Explain my code')}</button></div>
          <CodeEditor robloxCode value={code} onChange={setCode} minLines={18} maxLines={30} onRun={run} ariaLabel={t('Code to explain')} />
        </div>
        <div className="col" style={{ gap: 14 }}>
          {result && (
            <>
              <div className="feedback info"><Info size={16} /><div className="small">{t('Static analysis: the code was read, not run. Whether it works in Roblox, you test in Roblox Studio.')}</div></div>
              {(result.scriptHint || result.robloxSpecific) && (
                <div className="card">
                  {result.scriptHint && <div>{inline(result.scriptHint)}</div>}
                  {result.robloxSpecific && <div className="small muted row" style={{ marginTop: 6 }}><Monitor size={13} /> {t('Uses the Roblox engine: only works in Roblox Studio, not in the playground.')}</div>}
                </div>
              )}
              <div className="card">
                <h3 style={{ marginBottom: 10 }}>{t('Line by line')}</h3>
                {result.lines.length === 0 ? <div className="small muted">{t('No code found.')}</div> : (
                  <div className="col" style={{ gap: 8 }}>
                    {result.lines.map((l) => (
                      <div key={l.line} className="row" style={{ alignItems: 'flex-start' }}>
                        <span className="mono faint small" style={{ width: 28, flex: 'none', textAlign: 'right' }}>{l.line}</span>
                        <span className="small">{inline(l.text)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="card">
                <h3 style={{ marginBottom: 10 }}>{t('Overview')}</h3>
                <dl className="kv">
                  <dt>{t('Variables')}</dt><dd className="mono">{result.variables.join(', ') || '—'}</dd>
                  <dt>{t('Functions')}</dt><dd className="mono">{result.functions.join(', ') || '—'}</dd>
                  <dt>Services</dt><dd className="mono">{result.services.join(', ') || '—'}</dd>
                  <dt>Events</dt><dd className="mono">{result.events.join(', ') || '—'}</dd>
                </dl>
              </div>
              {(result.findings.length > 0 || diags.length > 0) && (
                <div className="card">
                  <h3 style={{ marginBottom: 10 }}>{t('Points of attention')}</h3>
                  <div className="col" style={{ gap: 8 }}>
                    {diags.map((d, i) => (
                      <div key={`d${i}`} className="row small" style={{ alignItems: 'flex-start' }}>
                        <AlertTriangle size={14} color={d.severity === 'error' ? 'var(--error)' : 'var(--warning)'} style={{ flex: 'none', marginTop: 2 }} />
                        <span>{t('Line {line}', { line: d.line })}: {inline(explainDiagnostic(d, code).what)} <span className="faint">({t('Luau analyzer')})</span></span>
                      </div>
                    ))}
                    {result.findings.map((f, i) => (
                      <div key={i} className="row small" style={{ alignItems: 'flex-start' }}>
                        {f.level === 'warning' ? <AlertTriangle size={14} color="var(--warning)" style={{ flex: 'none', marginTop: 2 }} /> : <Info size={14} color="var(--accent-2)" style={{ flex: 'none', marginTop: 2 }} />}
                        <span>{t('Line {line}', { line: f.line })}: {inline(f.text)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
