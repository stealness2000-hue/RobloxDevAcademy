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
import { t } from '@/i18n';

function declaredLocals(code: string): string[] {
  const toks = codeTokens(code);
  const names: string[] = [];
  toks.forEach((tok, i) => {
    if (tok.value === 'local' && toks[i + 1]?.type === 'name' && toks[i + 2]?.value !== '(' && toks[i + 1].value !== 'function') {
      if (!names.includes(toks[i + 1].value)) names.push(toks[i + 1].value);
    }
  });
  return names.slice(0, 8);
}

export function VariableVisualizer({ initial, title, body }: { initial: string; title?: string; body?: string }) {
  const [code, setCode] = useState(initial);
  const [boxes, setBoxes] = useState<{ name: string; type: string; value: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      const names = declaredLocals(code);
      if (!names.length) {
        setBoxes([]);
        setError(null);
        return;
      }
      const r = await call('luau:evalRun', `${code}\nreturn ${names.map((n) => `typeof(${n}), tostring(${n})`).join(', ')}`);
      if (!r.ok) {
        setError(t('The code still has a mistake. Change it to see the boxes.'));
        return;
      }
      setError(null);
      setBoxes(names.map((n, i) => ({ name: n, type: String(r.values[i * 2] ?? 'nil'), value: String(r.values[i * 2 + 1] ?? 'nil') })));
    }, 350);
    return () => clearTimeout(timer);
  }, [code]);

  return (
    <div className="step">
      {title && <h2 className="step-title">{title}</h2>}
      {body && <Prose text={body} />}
      <div className="viz">
        <CodeEditor value={code} onChange={setCode} minLines={3} ariaLabel={t('Code for the variable visualisation')} />
        <div className="viz-boxes" aria-live="polite">
          {boxes.map((b) => (
            <div key={b.name} className="var-box">
              <div className="var-name mono">{b.name}</div>
              <div className={`var-value mono t-${b.type}`} key={b.value}>{b.type === 'string' ? `"${b.value}"` : b.value}</div>
              <div className="var-type">{b.type}</div>
            </div>
          ))}
          {!boxes.length && !error && <div className="faint small">{inline(t('Create a variable with `local` to see a box.'))}</div>}
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
  const code = `local coins = ${coins}\n\nif coins >= ${limit} then\n    print("You can buy it!")\nelse\n    print("Not enough coins yet")\nend`;
  const [out, setOut] = useState<string[]>([]);
  useEffect(() => {
    const timer = setTimeout(async () => setOut((await call('luau:evalRun', code)).output.map((o) => o.text)), 150);
    return () => clearTimeout(timer);
  }, [code]);
  const result = coins >= limit;
  return (
    <div className="viz-card">
      <div className="viz-head"><h3>{t('How an if statement decides')}</h3><span className="badge">{t('really run')}</span></div>
      <label className="field" style={{ maxWidth: 360 }}>
        <span className="small muted">{inline(t('Value of `coins`:'))} <strong className="mono">{coins}</strong></span>
        <input type="range" min={0} max={250} value={coins} onChange={(e) => setCoins(Number(e.target.value))} aria-label={t('Value of coins')} />
      </label>
      <div className="trace mono">
        <div><span className="faint">1</span> coins = {coins}</div>
        <div><span className="faint">2</span> {coins} &gt;= {limit}</div>
        <div><span className="faint">3</span> <span className={result ? 'ok' : 'no'}>{result ? 'TRUE' : 'FALSE'}</span> → {result ? t('the then block runs') : t('the else block runs')}</div>
        <div><span className="faint">→</span> {t('Result:')} <strong>{out.join(' ') || '…'}</strong></div>
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
    const timer = setTimeout(() => setShown((s) => s + 1), 380);
    return () => clearTimeout(timer);
  }, [shown, out]);
  return (
    <div className="viz-card">
      <div className="viz-head"><h3>{t('A for loop, step by step')}</h3><span className="badge">{t('really run')}</span></div>
      <div className="row" style={{ gap: 14, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <pre className="mono trace" style={{ margin: 0 }}>{code}</pre>
        <div className="col" style={{ gap: 4, minWidth: 200 }}>
          {out.slice(0, shown).map((o, i) => (
            <div key={i} className="iter mono">{t('Repetition {n}', { n: i + 1 })} <ArrowRight size={12} /> <strong>{o}</strong></div>
          ))}
        </div>
      </div>
      <div className="row">
        <label className="small muted">{t('Number of repetitions')}</label>
        <input type="range" min={1} max={8} value={n} onChange={(e) => setN(Number(e.target.value))} aria-label={t('Number of repetitions')} />
        <span className="mono">{n}</span>
        <button className="btn sm" onClick={() => setShown(0)}><Play size={12} /> {t('Play again')}</button>
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
    setLog((l) => [...l.slice(-4), connected ? t('Event fired → callback runs: {code}', { code: 'print("Clicked!")' }) : t('Event fired → no connection, nothing happens')]);
  };
  return (
    <div className="viz-card">
      <div className="viz-head"><h3>{t('Event → connection → callback')}</h3><span className="badge warning">{t('simulation of Roblox')}</span></div>
      <pre className="mono trace" style={{ margin: 0 }}>{'button.MouseButton1Click:Connect(function()\n    print("Clicked!")\nend)'}</pre>
      <div className="event-flow">
        <button className="btn" onClick={fire}><MousePointerClick size={15} /> {t('Click the button')}</button>
        <div className={`flow-line ${connected ? 'on' : 'off'}`} key={pulse}><span className="dot" /></div>
        <div className={`flow-node ${connected ? '' : 'dim'}`}>{t('callback function')}</div>
      </div>
      <div className="row">
        <button className="btn sm" onClick={() => setConnected(!connected)}>{connected ? ':Disconnect()' : ':Connect()'}</button>
        <span className="small muted">{connected ? t('The function is connected to the event.') : t('The connection is broken.')}</span>
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
      <div className="viz-head"><h3>{t('RemoteEvent: the client asks, the server decides')}</h3><span className="badge warning">{t('simulation of Roblox')}</span></div>
      <div className="cs-grid">
        <div className="cs-col">
          <div className="cs-title"><Laptop size={15} /> {t("CLIENT (the player's device)")}</div>
          <div className="small muted">{t('LocalScript: button "Buy sword ({price} coins)"', { price })}</div>
          <label className="row small"><input type="checkbox" checked={cheat} onChange={(e) => setCheat(e.target.checked)} /> {t('Player tries to cheat: sends "I have 9999 coins"')}</label>
          <button className="btn primary sm" onClick={send}>buyEvent:FireServer("Sword"{cheat ? ', 9999' : ''})</button>
        </div>
        <div className="cs-wire">
          <div className={`packet ${phase}`}>{cheat ? '"Sword", 9999' : '"Sword"'}</div>
        </div>
        <div className="cs-col">
          <div className="cs-title"><Server size={15} /> SERVER (Roblox)</div>
          <div className="small muted">{t("Script: this player's real coins (only the server knows this):")}</div>
          <div className="row"><input type="range" min={0} max={200} value={coins} onChange={(e) => setCoins(Number(e.target.value))} aria-label={t('Real coins on the server')} /><span className="mono">{coins}</span></div>
          {phase === 'done' && (
            <div className={`feedback ${verdict ? 'ok' : 'bad'}`}>
              {verdict ? <ShieldCheck size={16} /> : <ShieldX size={16} />}
              <div className="small">
                {inline(`${t('The server checks its own data: `{check}` is **{result}**.', { check: `${coins} >= ${price}`, result: verdict ? 'true' : 'false' })} ${verdict ? t('Purchase approved.') : t('Purchase refused.')}`)}
                {cheat && <div style={{ marginTop: 4 }}>{inline(t('The number 9999 from the client is **ignored**: the server never trusts the client.'))}</div>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
