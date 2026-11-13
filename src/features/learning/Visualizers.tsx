/**
 * Interactive visualizers. Values come from REALLY running the code in the Luau runtime.
 * The event and client/server visualizers are clearly labelled simulations of Roblox behaviour.
 */
import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, MousePointerClick, Server, Laptop, ShieldCheck, ShieldX, Play } from 'lucide-react';
import { CodeEditor } from '@/editor/CodeEditor';
import { Prose, inline } from '@/components/ui';
import { call } from '@/api';
import { codeTokens } from '@shared/luau-lexer';

function declaredLocals(code: string): string[] {
  const t = codeTokens(code);
  const names: string[] = [];
  t.forEach((tok, i) => {
    if (tok.value === 'local' && t[i + 1]?.type === 'name' && t[i + 2]?.value !== '(' && t[i + 1].value !== 'function') {
      if (!names.includes(t[i + 1].value)) names.push(t[i + 1].value);
    }
  });
  return names.slice(0, 8);
}

export function VariableVisualizer({ initial, title, body }: { initial: string; title?: string; body?: string }) {
  const [code, setCode] = useState(initial);
  const [boxes, setBoxes] = useState<{ name: string; type: string; value: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(async () => {
      const names = declaredLocals(code);
      if (!names.length) {
        setBoxes([]);
        setError(null);
        return;
      }
      const r = await call('luau:evalRun', `${code}\nreturn ${names.map((n) => `typeof(${n}), tostring(${n})`).join(', ')}`);
      if (!r.ok) {
        setError('De code bevat nog een fout. Pas hem aan om de doosjes te zien.');
        return;
      }
      setError(null);
      setBoxes(names.map((n, i) => ({ name: n, type: String(r.values[i * 2] ?? 'nil'), value: String(r.values[i * 2 + 1] ?? 'nil') })));
    }, 350);
    return () => clearTimeout(t);
  }, [code]);

  return (
    <div className="step">
      {title && <h2 className="step-title">{title}</h2>}
      {body && <Prose text={body} />}
      <div className="viz">
        <CodeEditor value={code} onChange={setCode} minLines={3} ariaLabel="Code voor de variabelen-visualisatie" />
        <div className="viz-boxes" aria-live="polite">
          {boxes.map((b) => (
            <div key={b.name} className="var-box">
              <div className="var-name mono">{b.name}</div>
              <div className={`var-value mono t-${b.type}`} key={b.value}>{b.type === 'string' ? `"${b.value}"` : b.value}</div>
              <div className="var-type">{b.type}</div>
            </div>
          ))}
          {!boxes.length && !error && <div className="faint small">Maak een variabele met <code>local</code> om een doosje te zien.</div>}
          {error && <div className="small" style={{ color: 'var(--warning)' }}>{error}</div>}
        </div>
      </div>
    </div>
  );
}

/** Shows how `if <name> <op> <limit> then` evaluates for an adjustable value. */
export function ConditionVisualizer() {
  const [coins, setCoins] = useState(120);
  const [limit] = useState(100);
  const code = `local coins = ${coins}\n\nif coins >= ${limit} then\n    print("Je kunt het kopen!")\nelse\n    print("Nog niet genoeg coins")\nend`;
  const [out, setOut] = useState<string[]>([]);
  useEffect(() => {
    const t = setTimeout(async () => setOut((await call('luau:evalRun', code)).output.map((o) => o.text)), 150);
    return () => clearTimeout(t);
  }, [code]);
  const result = coins >= limit;
  return (
    <div className="viz-card">
      <div className="viz-head"><h3>Hoe een if-statement beslist</h3><span className="badge">echte uitvoering</span></div>
      <label className="field" style={{ maxWidth: 360 }}>
        <span className="small muted">Waarde van <code>coins</code>: <strong className="mono">{coins}</strong></span>
        <input type="range" min={0} max={250} value={coins} onChange={(e) => setCoins(Number(e.target.value))} aria-label="Waarde van coins" />
      </label>
      <div className="trace mono">
        <div><span className="faint">1</span> coins = {coins}</div>
        <div><span className="faint">2</span> {coins} &gt;= {limit}</div>
        <div><span className="faint">3</span> <span className={result ? 'ok' : 'no'}>{result ? 'TRUE' : 'FALSE'}</span> → {result ? 'het then-blok draait' : 'het else-blok draait'}</div>
        <div><span className="faint">→</span> Resultaat: <strong>{out.join(' ') || '…'}</strong></div>
      </div>
    </div>
  );
}

export function LoopVisualizer() {
  const [n, setN] = useState(3);
  const code = `for i = 1, ${n} do\n    print(i)\nend`;
  const [out, setOut] = useState<string[]>([]);
  const [shown, setShown] = useState(0);
  useEffect(() => {
    void call('luau:evalRun', code).then((r) => {
      setOut(r.output.map((o) => o.text));
      setShown(0);
    });
  }, [code]);
  useEffect(() => {
    if (shown >= out.length) return;
    const t = setTimeout(() => setShown((s) => s + 1), 380);
    return () => clearTimeout(t);
  }, [shown, out]);
  return (
    <div className="viz-card">
      <div className="viz-head"><h3>Een for-lus, stap voor stap</h3><span className="badge">echte uitvoering</span></div>
      <div className="row" style={{ gap: 14, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <pre className="mono trace" style={{ margin: 0 }}>{code}</pre>
        <div className="col" style={{ gap: 4, minWidth: 200 }}>
          {out.slice(0, shown).map((o, i) => (
            <div key={i} className="iter mono">Herhaling {i + 1} <ArrowRight size={12} /> <strong>{o}</strong></div>
          ))}
        </div>
      </div>
      <div className="row">
        <label className="small muted">Aantal herhalingen</label>
        <input type="range" min={1} max={8} value={n} onChange={(e) => setN(Number(e.target.value))} aria-label="Aantal herhalingen" />
        <span className="mono">{n}</span>
        <button className="btn sm" onClick={() => setShown(0)}><Play size={12} /> Opnieuw afspelen</button>
      </div>
    </div>
  );
}

export function EventVisualizer() {
  const [connected, setConnected] = useState(true);
  const [log, setLog] = useState<string[]>([]);
  const [pulse, setPulse] = useState(0);
  const fire = () => {
    setPulse((p) => p + 1);
    setLog((l) => [...l.slice(-4), connected ? 'Event afgevuurd → callback draait: print("Geklikt!")' : 'Event afgevuurd → geen verbinding, er gebeurt niets']);
  };
  return (
    <div className="viz-card">
      <div className="viz-head"><h3>Event → verbinding → callback</h3><span className="badge warning">simulatie van Roblox</span></div>
      <pre className="mono trace" style={{ margin: 0 }}>{'button.MouseButton1Click:Connect(function()\n    print("Geklikt!")\nend)'}</pre>
      <div className="event-flow">
        <button className="btn" onClick={fire}><MousePointerClick size={15} /> Klik op de knop</button>
        <div className={`flow-line ${connected ? 'on' : 'off'}`} key={pulse}><span className="dot" /></div>
        <div className={`flow-node ${connected ? '' : 'dim'}`}>callback-functie</div>
      </div>
      <div className="row">
        <button className="btn sm" onClick={() => setConnected(!connected)}>{connected ? ':Disconnect()' : ':Connect()'}</button>
        <span className="small muted">{connected ? 'De functie is verbonden met het event.' : 'De verbinding is verbroken.'}</span>
      </div>
      <div className="console" style={{ minHeight: 60 }}>{log.map((l, i) => <div key={i} className="line">{l}</div>)}</div>
    </div>
  );
}

export function ClientServerVisualizer() {
  const [coins, setCoins] = useState(80);
  const [price] = useState(100);
  const [cheat, setCheat] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'travel' | 'done'>('idle');
  const verdict = useMemo(() => coins >= price, [coins, price]);
  const send = () => {
    setPhase('travel');
    setTimeout(() => setPhase('done'), 700);
  };
  return (
    <div className="viz-card">
      <div className="viz-head"><h3>RemoteEvent: client vraagt, server beslist</h3><span className="badge warning">simulatie van Roblox</span></div>
      <div className="cs-grid">
        <div className="cs-col">
          <div className="cs-title"><Laptop size={15} /> CLIENT (apparaat van de speler)</div>
          <div className="small muted">LocalScript: knop "Koop zwaard ({price} coins)"</div>
          <label className="row small"><input type="checkbox" checked={cheat} onChange={(e) => setCheat(e.target.checked)} /> Speler probeert vals te spelen: stuurt "ik heb 9999 coins"</label>
          <button className="btn primary sm" onClick={send}>buyEvent:FireServer("Zwaard"{cheat ? ', 9999' : ''})</button>
        </div>
        <div className="cs-wire">
          <div className={`packet ${phase}`}>{cheat ? '"Zwaard", 9999' : '"Zwaard"'}</div>
        </div>
        <div className="cs-col">
          <div className="cs-title"><Server size={15} /> SERVER (Roblox)</div>
          <div className="small muted">Script: echte coins van deze speler (alleen de server weet dit):</div>
          <div className="row"><input type="range" min={0} max={200} value={coins} onChange={(e) => setCoins(Number(e.target.value))} aria-label="Echte coins op de server" /><span className="mono">{coins}</span></div>
          {phase === 'done' && (
            <div className={`feedback ${verdict ? 'ok' : 'bad'}`}>
              {verdict ? <ShieldCheck size={16} /> : <ShieldX size={16} />}
              <div className="small">
                {inline(`Server controleert zijn eigen gegevens: \`${coins} >= ${price}\` is **${verdict ? 'true' : 'false'}**. ${verdict ? 'Aankoop goedgekeurd.' : 'Aankoop geweigerd.'}`)}
                {cheat && <div style={{ marginTop: 4 }}>{inline('Het getal 9999 van de client wordt **genegeerd**: de server vertrouwt de client nooit.')}</div>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
