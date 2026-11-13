import { useEffect, useState } from 'react';
import { AlertTriangle, Bot, Info, ScanSearch, Monitor } from 'lucide-react';
import { CodeEditor } from '@/editor/CodeEditor';
import { inline } from '@/components/ui';
import { call } from '@/api';
import { explainDiagnostic } from '@shared/explain-error';
import type { Diagnostic } from '@shared/types';
import { analyze, type Analysis } from './code-analysis';

const SAMPLE = `local Players = game:GetService("Players")

Players.PlayerAdded:Connect(function(player)
    local coins = 0
    print(player.Name .. " doet mee")
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
        <div className="grow"><h1>AI Tutor</h1><div className="sub">Laat je code regel voor regel uitleggen. Deze uitleg werkt offline.</div></div>
      </div>

      <div className="card suggestion" style={{ marginBottom: 14 }}>
        <Bot size={18} />
        <div className="grow">
          <strong>De AI-tutor is nog niet gekoppeld.</strong>
          <div className="small muted">Een optionele AI-tutor (uitleg, hints, quizvragen, projectbegeleiding) komt in fase 5. Die wordt nooit verplicht en stuurt alleen iets weg als jij dat toestaat. Tot die tijd gebruik je hieronder de offline code-uitleg.</div>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)' }}>
        <div className="card flush" style={{ overflow: 'hidden' }}>
          <div className="pg-section-head" style={{ padding: '10px 14px' }}><span>Plak of typ je script</span>
            <button className="btn primary sm" onClick={run}><ScanSearch size={13} /> Leg mijn code uit</button></div>
          <CodeEditor robloxCode value={code} onChange={setCode} minLines={18} maxLines={30} onRun={run} ariaLabel="Code om uit te leggen" />
        </div>
        <div className="col" style={{ gap: 14 }}>
          {result && (
            <>
              <div className="feedback info"><Info size={16} /><div className="small">Statische analyse: de code is gelezen, niet uitgevoerd. Of hij in Roblox werkt, test je in Roblox Studio.</div></div>
              {(result.scriptHint || result.robloxSpecific) && (
                <div className="card">
                  {result.scriptHint && <div>{inline(result.scriptHint)}</div>}
                  {result.robloxSpecific && <div className="small muted row" style={{ marginTop: 6 }}><Monitor size={13} /> Gebruikt de Roblox-engine: werkt alleen in Roblox Studio, niet in de speeltuin.</div>}
                </div>
              )}
              <div className="card">
                <h3 style={{ marginBottom: 10 }}>Regel voor regel</h3>
                {result.lines.length === 0 ? <div className="small muted">Geen code gevonden.</div> : (
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
                <h3 style={{ marginBottom: 10 }}>Overzicht</h3>
                <dl className="kv">
                  <dt>Variabelen</dt><dd className="mono">{result.variables.join(', ') || '—'}</dd>
                  <dt>Functies</dt><dd className="mono">{result.functions.join(', ') || '—'}</dd>
                  <dt>Services</dt><dd className="mono">{result.services.join(', ') || '—'}</dd>
                  <dt>Events</dt><dd className="mono">{result.events.join(', ') || '—'}</dd>
                </dl>
              </div>
              {(result.findings.length > 0 || diags.length > 0) && (
                <div className="card">
                  <h3 style={{ marginBottom: 10 }}>Aandachtspunten</h3>
                  <div className="col" style={{ gap: 8 }}>
                    {diags.map((d, i) => (
                      <div key={`d${i}`} className="row small" style={{ alignItems: 'flex-start' }}>
                        <AlertTriangle size={14} color={d.severity === 'error' ? 'var(--error)' : 'var(--warning)'} style={{ flex: 'none', marginTop: 2 }} />
                        <span>Regel {d.line}: {inline(explainDiagnostic(d, code).what)} <span className="faint">(Luau-analyzer)</span></span>
                      </div>
                    ))}
                    {result.findings.map((f, i) => (
                      <div key={i} className="row small" style={{ alignItems: 'flex-start' }}>
                        {f.level === 'warning' ? <AlertTriangle size={14} color="var(--warning)" style={{ flex: 'none', marginTop: 2 }} /> : <Info size={14} color="var(--accent-2)" style={{ flex: 'none', marginTop: 2 }} />}
                        <span>Regel {f.line}: {inline(f.text)}</span>
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
