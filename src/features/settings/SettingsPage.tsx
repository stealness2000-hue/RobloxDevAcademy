import { useEffect, useState, type ReactNode } from 'react';
import { Download, HardDriveDownload, RotateCcw, Trash2, Archive } from 'lucide-react';
import { useApp } from '@/store';
import { call } from '@/api';
import { Modal, Segmented, Switch } from '@/components/ui';
import type { BackupInfo, Settings } from '@shared/types';
import { playKey, playSuccess, type TypingProfile } from '@/sound/sounds';
import { backgroundStyle } from '@/app/background';

const SECTIONS = ['Weergave', 'Geluid', 'Leren', 'Editor', 'Roblox Studio', 'AI Tutor', 'Gegevens'] as const;
const BACKGROUNDS: { value: Settings['background']; label: string }[] = [
  { value: 'none', label: 'Geen' }, { value: 'aurora', label: 'Aurora' }, { value: 'grid', label: 'Raster' }, { value: 'dots', label: 'Stippen' },
  { value: 'sunset', label: 'Avond' }, { value: 'ocean', label: 'Oceaan' },
];
type Section = (typeof SECTIONS)[number];

function Row({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="setting-row">
      <div className="grow"><div>{label}</div>{hint && <div className="small faint">{hint}</div>}</div>
      <div>{children}</div>
    </div>
  );
}

export function SettingsPage() {
  const { settings, updateSettings, route } = useApp();
  const initial = SECTIONS.find((x) => x === route.params?.section) ?? 'Weergave';
  const [section, setSection] = useState<Section>(initial);
  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => void updateSettings({ [k]: v } as Partial<Settings>);

  return (
    <div className="page">
      <div className="page-head"><div className="grow"><h1>Instellingen</h1><div className="sub">Alles wordt direct en lokaal opgeslagen.</div></div></div>
      <div className="settings">
        <nav className="settings-nav" aria-label="Instellingen-secties">
          {SECTIONS.map((s) => <button key={s} className="nav-item" aria-current={section === s ? 'page' : undefined} onClick={() => setSection(s)}>{s}</button>)}
        </nav>
        <div className="card settings-body">
          {section === 'Weergave' && (
            <>
              <Row label="Thema"><Segmented label="Thema" value={settings.theme} onChange={(v) => set('theme', v)} options={[{ value: 'dark', label: 'Donker' }, { value: 'light', label: 'Licht' }]} /></Row>
              <Row label="Accentkleur">
                <div className="row" role="radiogroup" aria-label="Accentkleur">
                  {(['blue', 'violet', 'teal', 'amber'] as const).map((a) => (
                    <button key={a} role="radio" aria-checked={settings.accent === a} aria-label={a} className={`swatch sw-${a}`} onClick={() => set('accent', a)} />
                  ))}
                </div>
              </Row>
              <div className="setting-row" style={{ display: 'block' }}>
                <div style={{ marginBottom: 8 }}>Achtergrond</div>
                <div className="bg-tiles" role="radiogroup" aria-label="Achtergrond">
                  {BACKGROUNDS.map((b) => (
                    <button key={b.value} type="button" role="radio" aria-checked={settings.background === b.value} className="bg-tile" onClick={() => set('background', b.value)}>
                      <div className={`app-bg bg-${b.value === 'none' ? 'solid' : b.value}`} />
                      <span>{b.label}</span>
                    </button>
                  ))}
                  <button type="button" role="radio" aria-checked={settings.background === 'custom'} className="bg-tile" onClick={async () => {
                    try {
                      const next = await call('settings:pickBackground');
                      if (next) useApp.setState({ settings: next });
                    } catch (e) {
                      useApp.getState().toast({ kind: 'error', title: 'Afbeelding niet gebruikt', body: (e as Error).message });
                    }
                  }}>
                    {settings.customBackground && <div className="app-bg" style={backgroundStyle({ ...settings, background: 'custom' })} />}
                    <span>{settings.customBackground ? 'Eigen ✓' : 'Eigen…'}</span>
                  </button>
                </div>
                <div className="row" style={{ marginTop: 12 }}>
                  <span className="small muted" style={{ width: 160 }}>Dimmen (leesbaarheid)</span>
                  <input type="range" min={0} max={0.9} step={0.05} value={settings.backgroundDim} onChange={(e) => set('backgroundDim', Number(e.target.value))} aria-label="Achtergrond dimmen" />
                  <span className="mono small">{Math.round(settings.backgroundDim * 100)}%</span>
                </div>
              </div>
              <Row label="Interface-schaal" hint="Maakt alles groter of kleiner.">
                <Segmented label="Schaal" value={settings.uiScale} onChange={(v) => set('uiScale', v)} options={[{ value: 0.9, label: '90%' }, { value: 1, label: '100%' }, { value: 1.1, label: '110%' }, { value: 1.25, label: '125%' }]} />
              </Row>
              <Row label="Minder beweging" hint="Zet animaties uit. 'Systeem' volgt je Windows-instelling.">
                <Segmented label="Minder beweging" value={settings.reducedMotion} onChange={(v) => set('reducedMotion', v)} options={[{ value: 'system', label: 'Systeem' }, { value: 'on', label: 'Aan' }, { value: 'off', label: 'Uit' }]} />
              </Row>
              <Row label="XP en levels tonen" hint="XP is een extraatje; je beheersing wordt altijd bijgehouden."><Switch label="XP tonen" checked={settings.showXp} onChange={(v) => set('showXp', v)} /></Row>
            </>
          )}
          {section === 'Geluid' && (
            <>
              <Row label="Typgeluid" hint="Een geluidje bij elke toets in de code-editor. Elke toets klinkt net iets anders.">
                <div className="row">
                  <Segmented label="Typgeluid" value={settings.typingSound} onChange={(v) => { set('typingSound', v); playKey(v as TypingProfile, 'key', settings.soundVolume); }} options={[{ value: 'off', label: 'Uit' }, { value: 'soft', label: 'Zacht' }, { value: 'mechanical', label: 'Mechanisch' }, { value: 'typewriter', label: 'Typemachine' }, { value: 'bubble', label: 'Bubbel' }]} />
                </div>
              </Row>
              <Row label="Probeer het" hint="Klik om het gekozen geluid te horen, ook voor spatie en Enter.">
                <div className="row">
                  {(['key', 'space', 'enter', 'backspace'] as const).map((k) => (
                    <button key={k} className="btn sm" onClick={() => playKey(settings.typingSound, k, settings.soundVolume)}>{({ key: 'Letter', space: 'Spatie', enter: 'Enter', backspace: 'Backspace' } as const)[k]}</button>
                  ))}
                </div>
              </Row>
              <Row label="Volume">
                <div className="row">
                  <input type="range" min={0} max={1} step={0.05} value={settings.soundVolume} onChange={(e) => set('soundVolume', Number(e.target.value))} aria-label="Volume" />
                  <span className="mono small" style={{ width: 36 }}>{Math.round(settings.soundVolume * 100)}%</span>
                </div>
              </Row>
              <Row label="Geluid bij oefeningen" hint="Een kort belletje als je oefening klopt, en een zacht toontje als het nog niet klopt.">
                <div className="row"><Switch label="Geluid bij oefeningen" checked={settings.feedbackSounds} onChange={(v) => { set('feedbackSounds', v); if (v) playSuccess(settings.soundVolume); }} /></div>
              </Row>
            </>
          )}
          {section === 'Leren' && (
            <>
              <Row label="Dagelijks doel" hint="Een persoonlijk doel, geen verplichting.">
                <div className="row"><input className="input" type="number" min={5} max={240} value={settings.dailyGoalMinutes} onChange={(e) => { const n = Number(e.target.value); if (n >= 5 && n <= 240) set('dailyGoalMinutes', n); }} style={{ width: 80 }} aria-label="Dagelijks doel in minuten" /><span className="small muted">minuten</span></div>
              </Row>
              <Row label="Hints" hint="Wanneer verschijnt de eerste hint?">
                <Segmented label="Hints" value={settings.hintPreference} onChange={(v) => set('hintPreference', v)} options={[{ value: 'on-request', label: 'Alleen als ik erom vraag' }, { value: 'after-mistake', label: 'Na een fout' }]} />
              </Row>
              <Row label="Pauze na inactiviteit" hint="Leertijd telt niet als je zoveel minuten niets doet.">
                <Segmented label="Inactiviteit" value={settings.idleTimeoutMinutes} onChange={(v) => set('idleTimeoutMinutes', v)} options={[{ value: 2, label: '2 min' }, { value: 3, label: '3 min' }, { value: 5, label: '5 min' }, { value: 10, label: '10 min' }]} />
              </Row>
              <Row label="Pauzeherinnering" hint="Een rustige melding na zoveel minuten actief leren.">
                <Segmented label="Pauzeherinnering" value={settings.breakReminderMinutes} onChange={(v) => set('breakReminderMinutes', v)} options={[{ value: 0, label: 'Uit' }, { value: 25, label: '25 min' }, { value: 45, label: '45 min' }, { value: 60, label: '60 min' }]} />
              </Row>
            </>
          )}
          {section === 'Editor' && (
            <>
              <Row label="Lettergrootte"><Segmented label="Lettergrootte" value={settings.editorFontSize} onChange={(v) => set('editorFontSize', v)} options={[12, 13, 14, 16, 18].map((n) => ({ value: n, label: String(n) }))} /></Row>
              <Row label="Lettertype">
                <select className="select" value={settings.editorFont} onChange={(e) => set('editorFont', e.target.value)} aria-label="Lettertype">
                  <option value="'Cascadia Code', 'JetBrains Mono', Consolas, monospace">Cascadia Code</option>
                  <option value="Consolas, monospace">Consolas</option>
                  <option value="'JetBrains Mono', Consolas, monospace">JetBrains Mono (als geïnstalleerd)</option>
                  <option value="'Courier New', monospace">Courier New</option>
                </select>
              </Row>
              <Row label="Tabgrootte"><Segmented label="Tabgrootte" value={settings.editorTabSize} onChange={(v) => set('editorTabSize', v)} options={[2, 4].map((n) => ({ value: n, label: `${n} spaties` }))} /></Row>
              <Row label="Regelnummers"><Switch label="Regelnummers" checked={settings.editorLineNumbers} onChange={(v) => set('editorLineNumbers', v)} /></Row>
              <Row label="Automatisch aanvullen" hint="Suggesties van de echte Luau-analyzer (namen in scope, functies)."><Switch label="Automatisch aanvullen" checked={settings.editorAutocomplete} onChange={(v) => set('editorAutocomplete', v)} /></Row>
              <Row label="Concepten automatisch bewaren" hint="Niet-opgeslagen werk in de speeltuin wordt bewaard en na een crash hersteld."><Switch label="Automatisch bewaren" checked={settings.editorAutoSave} onChange={(v) => set('editorAutoSave', v)} /></Row>
              <Row label="Regels laten afbreken"><Switch label="Regels afbreken" checked={settings.editorWordWrap} onChange={(v) => set('editorWordWrap', v)} /></Row>
              <Row label="Minimap" hint="Klein overzicht van je bestand in de speeltuin."><Switch label="Minimap" checked={settings.editorMinimap} onChange={(v) => set('editorMinimap', v)} /></Row>
              <Row label="Formatteren" hint="Herstelt de inspringing op basis van blokken (Shift + Alt + F). Herschrijft je code niet."><span className="badge">ingebouwd</span></Row>
            </>
          )}
          {section === 'Roblox Studio' && (
            <div className="prose" style={{ fontSize: 14 }}>
              <p><span className="badge warning">Nog niet beschikbaar</span></p>
              <p>De koppeling met Roblox Studio (plugin, verbindingsstatus en synchronisatie) wordt gebouwd in fase 3. Er zijn nu nog geen instellingen om te wijzigen. Studio-oefeningen werken wel, met handmatige stappen.</p>
            </div>
          )}
          {section === 'AI Tutor' && <AiSection />}
          {section === 'Gegevens' && <DataSection />}
        </div>
      </div>
    </div>
  );
}

function DataSection() {
  const { toast, refresh } = useApp();
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [dialog, setDialog] = useState<null | { kind: 'restore'; file: string } | { kind: 'reset'; scope: 'lessons' | 'practice' | 'statistics' | 'all' } | { kind: 'delete' }>(null);
  const [confirmText, setConfirmText] = useState('');
  const load = () => void call('data:listBackups').then(setBackups);
  useEffect(load, []);
  const RESET_LABEL = { lessons: 'lesvoortgang', practice: 'oefeningen en beheersing', statistics: 'leertijd-statistieken', all: 'alle voortgang' } as const;

  return (
    <>
      <Row label="Gegevens exporteren" hint="Een leesbaar JSON-bestand met al je leergegevens.">
        <button className="btn" onClick={async () => { const r = await call('data:export'); if (r.saved) toast({ kind: 'success', title: 'Export opgeslagen', body: r.path }); }}><Download size={14} /> Exporteren</button>
      </Row>
      <Row label="Back-up maken" hint="Er wordt ook elke dag automatisch een back-up gemaakt (de laatste 15 blijven bewaard).">
        <button className="btn" onClick={async () => { await call('data:backupNow'); load(); toast({ kind: 'success', title: 'Back-up gemaakt' }); }}><HardDriveDownload size={14} /> Nu back-uppen</button>
      </Row>
      <div className="setting-row" style={{ display: 'block' }}>
        <div style={{ marginBottom: 8 }}>Back-ups herstellen</div>
        {backups.length === 0 ? <div className="small faint">Nog geen back-ups.</div> : (
          <table className="table">
            <tbody>{backups.map((b) => (
              <tr key={b.file}>
                <td className="mono small"><Archive size={12} /> {b.file.replace('backup-', '').replace('.sqlite', '')}</td>
                <td className="small faint">{Math.round(b.sizeBytes / 1024)} KB</td>
                <td style={{ textAlign: 'right' }}><button className="btn sm" onClick={() => setDialog({ kind: 'restore', file: b.file })}>Herstellen</button></td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
      <Row label="Voortgang resetten" hint="Vóór elke reset wordt automatisch een back-up gemaakt.">
        <div className="row" style={{ flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {(['lessons', 'practice', 'statistics', 'all'] as const).map((s) => <button key={s} className="btn sm danger" onClick={() => setDialog({ kind: 'reset', scope: s })}><RotateCcw size={12} /> {RESET_LABEL[s]}</button>)}
        </div>
      </Row>
      <Row label="Profiel verwijderen" hint="Verwijdert al je lokale gegevens. Er wordt eerst een back-up gemaakt.">
        <button className="btn danger" onClick={() => { setConfirmText(''); setDialog({ kind: 'delete' }); }}><Trash2 size={14} /> Verwijderen</button>
      </Row>

      {dialog?.kind === 'restore' && (
        <Modal title="Back-up herstellen?" onClose={() => setDialog(null)} actions={<>
          <button className="btn ghost" onClick={() => setDialog(null)}>Annuleren</button>
          <button className="btn primary" onClick={async () => { const r = await call('data:restoreBackup', dialog.file); setDialog(null); load(); await refresh(); toast(r.restored ? { kind: 'success', title: 'Back-up hersteld' } : { kind: 'error', title: 'Deze back-up kon niet worden gelezen' }); }}>Herstellen</button>
        </>}>Je huidige gegevens worden eerst zelf als back-up bewaard. Daarna wordt de gekozen back-up teruggezet.</Modal>
      )}
      {dialog?.kind === 'reset' && (
        <Modal title={`${RESET_LABEL[dialog.scope][0].toUpperCase()}${RESET_LABEL[dialog.scope].slice(1)} resetten?`} onClose={() => setDialog(null)} actions={<>
          <button className="btn ghost" onClick={() => setDialog(null)}>Annuleren</button>
          <button className="btn danger" onClick={async () => { await call('data:reset', dialog.scope); setDialog(null); load(); await refresh(); toast({ kind: 'info', title: 'Gereset', body: 'Er is eerst een back-up gemaakt.' }); }}>Resetten</button>
        </>}>Dit wist {RESET_LABEL[dialog.scope]}. Je kunt het terugdraaien via de back-up die nu automatisch wordt gemaakt.</Modal>
      )}
      {dialog?.kind === 'delete' && (
        <Modal title="Profiel definitief verwijderen?" onClose={() => setDialog(null)} actions={<>
          <button className="btn ghost" onClick={() => setDialog(null)}>Annuleren</button>
          <button className="btn danger" disabled={confirmText !== 'VERWIJDER'} onClick={async () => { await call('data:deleteProfile', 'VERWIJDER'); setDialog(null); await refresh(); }}>Verwijderen</button>
        </>}>
          <p>Al je voortgang, bestanden en instellingen worden verwijderd. De back-upmap blijft bestaan. Typ <strong>VERWIJDER</strong> om te bevestigen.</p>
          <input className="input" style={{ width: '100%', marginTop: 10 }} value={confirmText} onChange={(e) => setConfirmText(e.target.value)} aria-label="Typ VERWIJDER" />
        </Modal>
      )}
    </>
  );
}

function AiSection() {
  const { toast } = useApp();
  const [status, setStatus] = useState<{ configured: boolean; encryptionAvailable: boolean; model: string } | null>(null);
  const [key, setKey] = useState('');
  const load = () => void call('ai:status').then(setStatus);
  useEffect(load, []);
  if (!status) return null;
  return (
    <>
      <div className="prose" style={{ fontSize: 14, padding: '14px 0' }}>
        <p>De <strong>AI Mentor</strong> maakt bij elke les een uitlegvideo. Zonder sleutel gebruikt hij de ingebouwde uitleg uit de les (werkt offline). Met een Claude API-sleutel schrijft echte AI (model <code>{status.model}</code>) een persoonlijke uitleg.</p>
        <p className="small muted">Privacy: alleen de inhoud van de les wordt verstuurd, geen naam, voortgang of bestanden. De sleutel wordt versleuteld opgeslagen met Windows-beveiliging en nooit gelogd. Een AI-video wordt bewaard, zodat dezelfde les je geen extra kosten geeft. Gebruik van de API kost geld op je Anthropic-account.</p>
      </div>
      <Row label="Status" hint={status.encryptionAvailable ? undefined : 'Windows-versleuteling is niet beschikbaar; de sleutel kan niet veilig worden opgeslagen.'}>
        {status.configured ? <span className="badge success">Sleutel ingesteld</span> : <span className="badge">Geen sleutel (ingebouwde uitleg)</span>}
      </Row>
      {!status.configured ? (
        <Row label="Claude API-sleutel" hint="Maak een sleutel op platform.claude.com (begint met sk-ant-).">
          <div className="row">
            <input className="input" type="password" autoComplete="off" spellCheck={false} placeholder="sk-ant-..." value={key} onChange={(e) => setKey(e.target.value.trim())} style={{ width: 260 }} aria-label="Claude API-sleutel" />
            <button className="btn primary" disabled={!/^sk-ant-[A-Za-z0-9_-]{20,300}$/.test(key) || !status.encryptionAvailable} onClick={async () => {
              try {
                await call('ai:setKey', key);
                setKey('');
                toast({ kind: 'success', title: 'AI-sleutel opgeslagen', body: 'Open bij een les "Uitleg door AI Mentor".' });
              } catch (e) {
                toast({ kind: 'error', title: 'Niet opgeslagen', body: (e as Error).message });
              }
              load();
            }}>Opslaan</button>
          </div>
        </Row>
      ) : (
        <Row label="Sleutel verwijderen" hint="Daarna gebruikt de mentor weer de ingebouwde uitleg.">
          <button className="btn danger" onClick={async () => { await call('ai:clearKey'); load(); }}>Verwijderen</button>
        </Row>
      )}
    </>
  );
}
