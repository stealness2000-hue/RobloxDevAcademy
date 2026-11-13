import { useEffect, useState } from 'react';
import { CheckCircle2, Circle, CircleAlert, Download, Link2, Link2Off, Monitor, PlugZap, RefreshCw, Send, ShieldCheck, Trash2, XCircle, ScanSearch, GitCompare } from 'lucide-react';
import { useApp } from '@/store';
import { call } from '@/api';
import { CodeView, Modal, inline } from '@/components/ui';
import { STUDIO_EXERCISES, type StudioVerification } from '@shared/studio';
import { explainMessage } from '@shared/explain-error';
import type { StudioState } from '@shared/types';

export const STATUS_LABEL: Record<StudioState['status'], { text: string; tone: 'success' | 'warning' | 'error' | '' }> = {
  connected: { text: 'Verbonden', tone: 'success' },
  disconnected: { text: 'Niet verbonden', tone: 'warning' },
  'permission-required': { text: 'Wacht op koppelcode', tone: 'warning' },
  'plugin-unavailable': { text: 'Plugin niet gevonden', tone: 'warning' },
  'studio-not-detected': { text: 'Studio niet gestart', tone: '' },
  error: { text: 'Fout', tone: 'error' },
};

export function VerificationView({ v }: { v: StudioVerification }) {
  return (
    <div className={`feedback ${v.passed ? 'ok' : 'bad'}`}>
      {v.passed ? <CheckCircle2 size={18} /> : <CircleAlert size={18} />}
      <div className="grow">
        <strong>{v.passed ? 'Gecontroleerd in Studio: alles klopt.' : 'Nog niet alles klopt in Studio.'}</strong>
        <ul className="check-list">
          {v.items.map((i, k) => (
            <li key={k} className={i.ok ? 'ok' : 'no'}>
              {i.ok ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
              <span>{inline(i.ok ? i.label : i.message ?? i.label)}</span>
            </li>
          ))}
        </ul>
        <div className="small faint">Gecontroleerd om {new Date(v.checkedAt).toLocaleTimeString('nl-NL')}. Wat er tijdens Play gebeurt, controleer je zelf.</div>
      </div>
    </div>
  );
}

export function StudioPage() {
  const { studio, refreshStudio, navigate, toast } = useApp();
  const [confirmInstall, setConfirmInstall] = useState(false);
  const [compare, setCompare] = useState<StudioState['conflicts'][number] | null>(null);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    void refreshStudio();
    const t = setInterval(() => {
      setNow(Date.now());
      void refreshStudio();
    }, 2000);
    return () => clearInterval(t);
  }, [refreshStudio]);

  if (!studio) return <div className="page"><div className="skeleton" style={{ height: 160 }} /></div>;
  const s = STATUS_LABEL[studio.status];
  const connected = studio.status === 'connected';
  const setupSteps = [
    { done: studio.plugin.installed && studio.plugin.upToDate, text: 'Installeer de Academy-plugin in Roblox Studio.' },
    { done: studio.status !== 'studio-not-detected' && studio.status !== 'plugin-unavailable', text: 'Start Roblox Studio en open een place (bijvoorbeeld een Baseplate).' },
    { done: studio.paired || connected, text: 'Open in Studio het tabblad **Plugins** → **Academy**. Vraagt Studio om toegang tot 127.0.0.1? Klik op **Allow**.' },
    { done: connected, text: 'Klik hieronder op **Koppelen** en typ de code in het Academy-paneel in Studio.' },
  ];
  const secondsLeft = studio.pairingExpiresAt ? Math.max(0, Math.round((studio.pairingExpiresAt - now) / 1000)) : 0;

  return (
    <div className="page">
      <div className="page-head">
        <div className="grow"><h1>Roblox Studio</h1><div className="sub">Koppel de Academy aan Roblox Studio: oefeningen openen, je werk laten controleren en scripts veilig synchroniseren.</div></div>
      </div>

      <div className="card studio-status">
        <div className="row" style={{ gap: 12 }}>
          <PlugZap size={20} />
          <div className="grow">
            <div className="row" style={{ gap: 8 }}>
              <strong>Koppeling met Studio</strong>
              <span className={`badge ${s.tone}`}>{s.text}</span>
              {connected && studio.placeName && <span className="small muted">Place: {studio.placeName}</span>}
            </div>
            <div className="small muted" style={{ marginTop: 2 }}>
              {studio.error ?? (connected ? 'De Academy en Studio praten met elkaar via je eigen computer (127.0.0.1).' : studio.status === 'permission-required' ? `Typ de code in het Academy-paneel in Studio. Nog ${secondsLeft} seconden geldig.` : 'Volg de stappen hieronder om te koppelen.')}
            </div>
          </div>
          {studio.pairingCode && <div className="pair-code mono" aria-label="Koppelcode">{studio.pairingCode}</div>}
          {!studio.paired && !studio.pairingCode && <button className="btn primary" onClick={async () => { await call('studio:startPairing'); void refreshStudio(); }}><Link2 size={15} /> Koppelen</button>}
          {studio.paired && <button className="btn ghost" onClick={async () => { await call('studio:unpair'); void refreshStudio(); }}><Link2Off size={15} /> Ontkoppelen</button>}
        </div>
        <div className="divider" />
        <div className="grid c3">
          <div className="row small" style={{ alignItems: 'flex-start' }}><ShieldCheck size={15} style={{ flex: 'none' }} /><span>Alleen via je eigen computer (127.0.0.1), met jouw toestemming en een geheime sessiesleutel.</span></div>
          <div className="row small" style={{ alignItems: 'flex-start' }}><ShieldCheck size={15} style={{ flex: 'none' }} /><span>De plugin voert geen ontvangen code uit en verandert alleen iets als jij klikt. Ctrl+Z maakt het ongedaan.</span></div>
          <div className="row small" style={{ alignItems: 'flex-start' }}><ShieldCheck size={15} style={{ flex: 'none' }} /><span>Scripts worden nooit stilletjes overschreven: bij een conflict kies jij.</span></div>
        </div>
      </div>

      {!connected && (
        <div className="card" style={{ marginTop: 14 }}>
          <div className="card-head"><h3>Instellen in 4 stappen</h3></div>
          <ol className="studio-steps">
            {setupSteps.map((st, i) => (
              <li key={i}>
                <div className={`studio-check ${st.done ? 'on' : ''}`} style={{ cursor: 'default' }}>
                  {st.done ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                  <span className="grow"><span className="n">{i + 1}.</span> {inline(st.text)}</span>
                  {i === 0 && !(studio.plugin.installed && studio.plugin.upToDate) && (
                    <button className="btn sm primary" onClick={() => setConfirmInstall(true)}><Download size={13} /> {studio.plugin.installed ? 'Bijwerken' : 'Installeren'}</button>
                  )}
                </div>
              </li>
            ))}
          </ol>
          {!studio.plugin.robloxFound && <div className="small faint" style={{ marginTop: 8 }}>Roblox Studio lijkt nog niet geïnstalleerd. Download het gratis via create.roblox.com.</div>}
        </div>
      )}

      <div className="grid c2" style={{ marginTop: 14 }}>
        <div className="card">
          <div className="card-head"><Monitor size={16} /><h3>Studio-oefeningen</h3></div>
          <div className="col" style={{ gap: 10 }}>
            {STUDIO_EXERCISES.map((ex) => {
              const v = studio.verifications.find((x) => x.exerciseId === ex.id);
              const active = studio.currentExerciseId === ex.id;
              return (
                <div key={ex.id} className={`studio-ex ${active ? 'active' : ''}`}>
                  <div className="row">
                    {v?.passed ? <CheckCircle2 size={16} color="var(--success)" /> : <Circle size={16} />}
                    <strong className="grow">{ex.title}</strong>
                    {active && <span className="badge accent">Open in Studio</span>}
                  </div>
                  <div className="small muted">{ex.goal}</div>
                  <div className="row" style={{ marginTop: 8 }}>
                    <button className="btn sm" disabled={!connected} onClick={async () => { await call('studio:openExercise', ex.id); void refreshStudio(); toast({ kind: 'info', title: 'Oefening staat klaar in Studio', body: 'Kijk in het Academy-paneel in Studio.' }); }}>Open in Studio</button>
                    <button className="btn sm primary" disabled={!connected || !active} onClick={async () => { await call('studio:requestCheck'); toast({ kind: 'info', title: 'Controle aangevraagd', body: 'De plugin leest je place en stuurt het resultaat terug.' }); }}><ScanSearch size={13} /> Controleer nu</button>
                  </div>
                  {v && <div style={{ marginTop: 8 }}><VerificationView v={v} /></div>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="col" style={{ gap: 14 }}>
          <div className="card">
            <div className="card-head"><CircleAlert size={16} /><h3>Hulp bij de Output</h3>{studio.logs.length > 0 && <button className="btn ghost sm" onClick={async () => { await call('studio:clearLogs'); void refreshStudio(); }}><Trash2 size={13} /> Wissen</button>}</div>
            {studio.logs.length === 0 ? (
              <div className="small muted">Fouten en waarschuwingen uit de Output van Studio (tijdens Play) verschijnen hier, met uitleg in gewone taal.</div>
            ) : (
              <div className="col" style={{ gap: 10 }}>
                {studio.logs.slice(0, 8).map((l, i) => {
                  const e = explainMessage(l.text, '');
                  return (
                    <div key={i} className={`explain ${l.kind === 'warning' ? 'warning' : ''}`}>
                      <div className="mono small faint selectable">{l.text}</div>
                      <div className="a" style={{ marginTop: 6 }}><strong>{inline(e.what)}</strong></div>
                      <div className="a small">{inline(e.hint)}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="card">
            <div className="card-head"><RefreshCw size={16} /><h3>Gesynchroniseerde scripts</h3></div>
            {studio.conflicts.map((c) => (
              <div key={c.id} className="feedback bad" style={{ marginBottom: 10 }}>
                <GitCompare size={16} />
                <div className="grow">
                  <strong>Conflict in {c.path}</strong>
                  <div className="small muted">Het script is zowel in Studio als in de Academy veranderd. Er is niets overschreven.</div>
                  <button className="btn sm" style={{ marginTop: 8 }} onClick={() => setCompare(c)}>Vergelijk en kies</button>
                </div>
              </div>
            ))}
            {studio.synced.length === 0 ? (
              <div className="small muted">Selecteer in Studio een script en klik in het Academy-paneel op <strong>Stuur geselecteerd script naar Academy</strong>. Het verschijnt dan in de Code Playground.</div>
            ) : (
              <table className="table">
                <tbody>
                  {studio.synced.map((f) => (
                    <tr key={f.path}>
                      <td className="mono small">{f.path}</td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button className="btn sm ghost" onClick={() => navigate('playground')}>Openen</button>
                        <button className="btn sm" disabled={!connected || studio.pendingPushes.includes(f.path)} onClick={async () => { await call('studio:push', f.fileId); void refreshStudio(); toast({ kind: 'info', title: 'Update klaargezet', body: 'Bevestig in het Academy-paneel in Studio.' }); }}>
                          <Send size={12} /> {studio.pendingPushes.includes(f.path) ? 'Wacht op Studio' : 'Naar Studio'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className="small faint" style={{ marginTop: 8 }}>"Naar Studio" stuurt de opgeslagen versie uit de Playground. De plugin vraagt eerst om bevestiging en weigert als het script in Studio intussen veranderd is.</div>
          </div>
        </div>
      </div>

      {confirmInstall && (
        <Modal title="Plugin installeren?" onClose={() => setConfirmInstall(false)} actions={<>
          <button className="btn ghost" onClick={() => setConfirmInstall(false)}>Annuleren</button>
          <button className="btn primary" onClick={async () => {
            try {
              await call('studio:installPlugin');
              toast({ kind: 'success', title: 'Plugin geïnstalleerd', body: 'Herstart Roblox Studio als het al open was.' });
            } catch (e) {
              toast({ kind: 'error', title: 'Installeren mislukt', body: (e as Error).message });
            }
            setConfirmInstall(false);
            void refreshStudio();
          }}>Installeren</button>
        </>}>
          De Academy zet één bestand, <code>RobloxDevAcademy.lua</code>, in de pluginmap van Roblox Studio:
          <div className="mono small selectable" style={{ marginTop: 8, wordBreak: 'break-all' }}>{studio.plugin.path}</div>
          <div style={{ marginTop: 8 }}>Verwijderen kan altijd door dat bestand weg te halen. Was Studio al open? Herstart Studio daarna.</div>
        </Modal>
      )}

      {compare && (
        <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && setCompare(null)}>
          <div className="modal compare-modal" role="dialog" aria-modal="true" aria-label="Versies vergelijken">
            <h2>Welke versie wil je houden?</h2>
            <div className="small muted">{compare.path}. De andere versie blijft bewaard in de versiegeschiedenis van het bestand.</div>
            <div className="compare-grid">
              <div><div className="card-title">In Studio</div><CodeView code={compare.studioSource} /></div>
              <div><div className="card-title">In de Academy</div><CodeView code={compare.academySource} /></div>
            </div>
            <div className="actions">
              <button className="btn ghost" onClick={() => setCompare(null)}>Later</button>
              <button className="btn" onClick={async () => { await call('studio:resolveConflict', { id: compare.id, choice: 'studio' }); setCompare(null); void refreshStudio(); }}>Houd Studio-versie</button>
              <button className="btn primary" onClick={async () => { await call('studio:resolveConflict', { id: compare.id, choice: 'academy' }); setCompare(null); void refreshStudio(); toast({ kind: 'info', title: 'Academy-versie gekozen', body: 'Bevestig de update in het Academy-paneel in Studio.' }); }}>Houd Academy-versie</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

