import { useEffect, useState, type ReactNode } from 'react';
import { Download, HardDriveDownload, RotateCcw, Trash2, Archive, Loader2, CheckCircle2 } from 'lucide-react';
import { useApp } from '@/store';
import { call } from '@/api';
import { Modal, ProgressBar, Segmented, Switch } from '@/components/ui';
import type { BackupInfo, Settings } from '@shared/types';
import { playKey, playSuccess, type TypingProfile } from '@/sound/sounds';
import { backgroundStyle } from '@/app/background';
import { isMachineLanguage } from '@shared/languages';
import { LanguagePicker } from '@/components/LanguagePicker';
import { LicensePanel } from '@/features/license/LicensePanel';
import { t } from '@/i18n';

const SECTIONS = [
  { id: 'appearance', label: 'Appearance' },
  { id: 'language', label: 'Language' },
  { id: 'license', label: 'Full course' },
  { id: 'sound', label: 'Sound' },
  { id: 'learning', label: 'Learning' },
  { id: 'editor', label: 'Editor' },
  { id: 'data', label: 'Data' },
] as const;
type Section = (typeof SECTIONS)[number]['id'];

const BACKGROUNDS: { value: Settings['background']; label: string }[] = [
  { value: 'none', label: 'None' }, { value: 'aurora', label: 'Aurora' }, { value: 'grid', label: 'Grid' }, { value: 'dots', label: 'Dots' },
  { value: 'sunset', label: 'Sunset' }, { value: 'ocean', label: 'Ocean' },
];

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
  const initial = SECTIONS.find((x) => x.id === route.params?.section)?.id ?? 'appearance';
  const [section, setSection] = useState<Section>(initial);
  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => void updateSettings({ [k]: v } as Partial<Settings>);

  return (
    <div className="page">
      <div className="page-head"><div className="grow"><h1>{t('Settings')}</h1><div className="sub">{t('Everything is saved immediately and locally.')}</div></div></div>
      <div className="settings">
        <nav className="settings-nav" aria-label={t('Settings sections')}>
          {SECTIONS.map((s) => <button key={s.id} className="nav-item" aria-current={section === s.id ? 'page' : undefined} onClick={() => setSection(s.id)}>{t(s.label)}</button>)}
        </nav>
        <div className="card settings-body">
          {section === 'appearance' && (
            <>
              <Row label={t('Theme')}><Segmented label={t('Theme')} value={settings.theme} onChange={(v) => set('theme', v)} options={[{ value: 'dark', label: t('Dark') }, { value: 'light', label: t('Light') }]} /></Row>
              <Row label={t('Accent colour')}>
                <div className="row" role="radiogroup" aria-label={t('Accent colour')}>
                  {(['blue', 'violet', 'teal', 'amber'] as const).map((a) => (
                    <button key={a} role="radio" aria-checked={settings.accent === a} aria-label={a} className={`swatch sw-${a}`} onClick={() => set('accent', a)} />
                  ))}
                </div>
              </Row>
              <div className="setting-row" style={{ display: 'block' }}>
                <div style={{ marginBottom: 8 }}>{t('Background')}</div>
                <div className="bg-tiles" role="radiogroup" aria-label={t('Background')}>
                  {BACKGROUNDS.map((b) => (
                    <button key={b.value} type="button" role="radio" aria-checked={settings.background === b.value} className="bg-tile" onClick={() => set('background', b.value)}>
                      <div className={`app-bg bg-${b.value === 'none' ? 'solid' : b.value}`} />
                      <span>{t(b.label)}</span>
                    </button>
                  ))}
                  <button type="button" role="radio" aria-checked={settings.background === 'custom'} className="bg-tile" onClick={async () => {
                    try {
                      const next = await call('settings:pickBackground');
                      if (next) useApp.setState({ settings: next });
                    } catch (e) {
                      useApp.getState().toast({ kind: 'error', title: t('Image not used'), body: (e as Error).message });
                    }
                  }}>
                    {settings.customBackground && <div className="app-bg" style={backgroundStyle({ ...settings, background: 'custom' })} />}
                    <span>{settings.customBackground ? `${t('Own image')} ✓` : `${t('Own image')}…`}</span>
                  </button>
                </div>
                <div className="row" style={{ marginTop: 12 }}>
                  <span className="small muted" style={{ width: 160 }}>{t('Dim (readability)')}</span>
                  <input type="range" min={0} max={0.9} step={0.05} value={settings.backgroundDim} onChange={(e) => set('backgroundDim', Number(e.target.value))} aria-label={t('Dim the background')} />
                  <span className="mono small">{Math.round(settings.backgroundDim * 100)}%</span>
                </div>
              </div>
              <Row label={t('Interface scale')} hint={t('Makes everything bigger or smaller.')}>
                <Segmented label={t('Scale')} value={settings.uiScale} onChange={(v) => set('uiScale', v)} options={[{ value: 0.9, label: '90%' }, { value: 1, label: '100%' }, { value: 1.1, label: '110%' }, { value: 1.25, label: '125%' }]} />
              </Row>
              <Row label={t('Reduce motion')} hint={t("Turns animations off. 'System' follows your Windows setting.")}>
                <Segmented label={t('Reduce motion')} value={settings.reducedMotion} onChange={(v) => set('reducedMotion', v)} options={[{ value: 'system', label: t('System') }, { value: 'on', label: t('On') }, { value: 'off', label: t('Off') }]} />
              </Row>
              <Row label={t('Show XP and levels')} hint={t('XP is a bonus; your mastery is always tracked.')}><Switch label={t('Show XP')} checked={settings.showXp} onChange={(v) => set('showXp', v)} /></Row>
            </>
          )}
          {section === 'language' && <LanguageSection />}
          {section === 'license' && <div style={{ padding: '14px 0' }}><LicensePanel /></div>}
          {section === 'sound' && (
            <>
              <Row label={t('Typing sound')} hint={t('A little sound for every key in the code editor. Every key sounds slightly different.')}>
                <div className="row">
                  <Segmented label={t('Typing sound')} value={settings.typingSound} onChange={(v) => { set('typingSound', v); playKey(v as TypingProfile, 'key', settings.soundVolume); }} options={[{ value: 'off', label: t('Off') }, { value: 'soft', label: t('Soft') }, { value: 'mechanical', label: t('Mechanical') }, { value: 'typewriter', label: t('Typewriter') }, { value: 'bubble', label: t('Bubble') }]} />
                </div>
              </Row>
              <Row label={t('Try it')} hint={t('Click to hear the chosen sound, also for space and Enter.')}>
                <div className="row">
                  {(['key', 'space', 'enter', 'backspace'] as const).map((k) => (
                    <button key={k} className="btn sm" onClick={() => playKey(settings.typingSound, k, settings.soundVolume)}>{({ key: t('Letter'), space: t('Space'), enter: 'Enter', backspace: 'Backspace' })[k]}</button>
                  ))}
                </div>
              </Row>
              <Row label={t('Volume')}>
                <div className="row">
                  <input type="range" min={0} max={1} step={0.05} value={settings.soundVolume} onChange={(e) => set('soundVolume', Number(e.target.value))} aria-label={t('Volume')} />
                  <span className="mono small" style={{ width: 36 }}>{Math.round(settings.soundVolume * 100)}%</span>
                </div>
              </Row>
              <Row label={t('Exercise sounds')} hint={t('A short chime when your exercise is right, and a soft tone when it is not right yet.')}>
                <div className="row"><Switch label={t('Exercise sounds')} checked={settings.feedbackSounds} onChange={(v) => { set('feedbackSounds', v); if (v) playSuccess(settings.soundVolume); }} /></div>
              </Row>
            </>
          )}
          {section === 'learning' && (
            <>
              <Row label={t('Daily goal')} hint={t('A personal goal, not a duty.')}>
                <div className="row"><input className="input" type="number" min={5} max={240} value={settings.dailyGoalMinutes} onChange={(e) => { const n = Number(e.target.value); if (n >= 5 && n <= 240) set('dailyGoalMinutes', n); }} style={{ width: 80 }} aria-label={t('Daily goal in minutes')} /><span className="small muted">{t('minutes')}</span></div>
              </Row>
              <Row label={t('Hints')} hint={t('When does the first hint appear?')}>
                <Segmented label={t('Hints')} value={settings.hintPreference} onChange={(v) => set('hintPreference', v)} options={[{ value: 'on-request', label: t('Only when I ask') }, { value: 'after-mistake', label: t('After a mistake') }]} />
              </Row>
              <Row label={t('Pause after inactivity')} hint={t('Learning time does not count when you do nothing for this many minutes.')}>
                <Segmented label={t('Inactivity')} value={settings.idleTimeoutMinutes} onChange={(v) => set('idleTimeoutMinutes', v)} options={[{ value: 2, label: '2 min' }, { value: 3, label: '3 min' }, { value: 5, label: '5 min' }, { value: 10, label: '10 min' }]} />
              </Row>
              <Row label={t('Break reminder')} hint={t('A calm message after this many minutes of active learning.')}>
                <Segmented label={t('Break reminder')} value={settings.breakReminderMinutes} onChange={(v) => set('breakReminderMinutes', v)} options={[{ value: 0, label: t('Off') }, { value: 25, label: '25 min' }, { value: 45, label: '45 min' }, { value: 60, label: '60 min' }]} />
              </Row>
            </>
          )}
          {section === 'editor' && (
            <>
              <Row label={t('Font size')}><Segmented label={t('Font size')} value={settings.editorFontSize} onChange={(v) => set('editorFontSize', v)} options={[12, 13, 14, 16, 18].map((n) => ({ value: n, label: String(n) }))} /></Row>
              <Row label={t('Font')}>
                <select className="select" value={settings.editorFont} onChange={(e) => set('editorFont', e.target.value)} aria-label={t('Font')}>
                  <option value="'Cascadia Code', 'JetBrains Mono', Consolas, monospace">Cascadia Code</option>
                  <option value="Consolas, monospace">Consolas</option>
                  <option value="'JetBrains Mono', Consolas, monospace">{t('JetBrains Mono (if installed)')}</option>
                  <option value="'Courier New', monospace">Courier New</option>
                </select>
              </Row>
              <Row label={t('Tab size')}><Segmented label={t('Tab size')} value={settings.editorTabSize} onChange={(v) => set('editorTabSize', v)} options={[2, 4].map((n) => ({ value: n, label: t('{n} spaces', { n }) }))} /></Row>
              <Row label={t('Line numbers')}><Switch label={t('Line numbers')} checked={settings.editorLineNumbers} onChange={(v) => set('editorLineNumbers', v)} /></Row>
              <Row label={t('Autocomplete')} hint={t('Suggestions from the real Luau analyzer (names in scope, functions).')}><Switch label={t('Autocomplete')} checked={settings.editorAutocomplete} onChange={(v) => set('editorAutocomplete', v)} /></Row>
              <Row label={t('Keep drafts automatically')} hint={t('Unsaved work in the playground is kept and restored after a crash.')}><Switch label={t('Keep drafts automatically')} checked={settings.editorAutoSave} onChange={(v) => set('editorAutoSave', v)} /></Row>
              <Row label={t('Wrap lines')}><Switch label={t('Wrap lines')} checked={settings.editorWordWrap} onChange={(v) => set('editorWordWrap', v)} /></Row>
              <Row label={t('Minimap')} hint={t('Small overview of your file in the playground.')}><Switch label={t('Minimap')} checked={settings.editorMinimap} onChange={(v) => set('editorMinimap', v)} /></Row>
              <Row label={t('Formatting')} hint={t('Fixes the indentation based on blocks (Shift + Alt + F). Does not rewrite your code.')}><span className="badge">{t('built in')}</span></Row>
            </>
          )}
          {section === 'data' && <DataSection />}
        </div>
      </div>
    </div>
  );
}

function LanguageSection() {
  const { settings, updateSettings, translator, refreshLicense, langStatus } = useApp();
  const machine = isMachineLanguage(settings.language);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    void refreshLicense();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      <div className="setting-row" style={{ display: 'block' }}>
        <div style={{ marginBottom: 8 }}>{t('Language of the app and the lessons')}</div>
        <LanguagePicker value={settings.language} onChange={(code) => void updateSettings({ language: code })} />
      </div>
      <div className="setting-row" style={{ display: 'block' }}>
        <div className="row" style={{ marginBottom: 6 }}>
          <strong className="grow">{t('Offline translator (for automatically translated languages)')}</strong>
          {translator?.installed && <span className="badge success"><CheckCircle2 size={11} /> {t('Installed')}</span>}
        </div>
        <div className="small muted">
          {t('English and Dutch are written by people and need nothing extra. For the other {n} languages the app uses M2M100, a free translation model (MIT licence) that runs on your own computer: nothing you type is sent anywhere. It is downloaded once (about {mb} MB) from huggingface.co.', { n: 84, mb: translator?.sizeMb ?? 640 })}
        </div>
        {translator?.downloading ? (
          <div style={{ marginTop: 10 }}>
            <div className="row small" style={{ marginBottom: 4 }}><Loader2 size={13} className="spin" /> {t('Downloading… {p}%', { p: Math.round(translator.progress * 100) })}</div>
            <ProgressBar value={translator.progress} />
          </div>
        ) : translator?.installed ? (
          <div className="row" style={{ marginTop: 10 }}>
            {machine && langStatus.missing > 0 && <span className="small muted grow">{t('Translating the interface… {n} texts left. You can keep using the app.', { n: langStatus.missing })}</span>}
            <button className="btn sm ghost danger" onClick={async () => useApp.setState({ translator: await call('mt:remove') })}><Trash2 size={13} /> {t('Remove translator')}</button>
          </div>
        ) : (
          <div className="row" style={{ marginTop: 10 }}>
            <button className="btn primary" disabled={busy} onClick={async () => {
              setBusy(true);
              const st = await call('mt:download');
              useApp.setState({ translator: st });
              setBusy(false);
              // Start translating the interface now that the model is here.
              if (st.installed && machine) void updateSettings({ language: settings.language });
            }}><Download size={14} /> {t('Download translator (free)')}</button>
            {translator?.error && <span className="small" style={{ color: 'var(--error)' }}>{t('Download failed: {error}', { error: translator.error })}</span>}
          </div>
        )}
        <div className="small faint" style={{ marginTop: 8 }}>
          {t('Machine translation is slower than reading: the first time you open a lesson in a new language it can take a little while. Every translated sentence is saved, so the next time it is instant.')}
        </div>
      </div>
    </>
  );
}

function DataSection() {
  const { toast, refresh } = useApp();
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [dialog, setDialog] = useState<null | { kind: 'restore'; file: string } | { kind: 'reset'; scope: 'lessons' | 'practice' | 'statistics' | 'all' } | { kind: 'delete' }>(null);
  const [confirmText, setConfirmText] = useState('');
  const load = () => void call('data:listBackups').then(setBackups);
  useEffect(load, []);
  const RESET_LABEL = { lessons: t('lesson progress'), practice: t('exercises and mastery'), statistics: t('learning time statistics'), all: t('all progress') } as const;
  const confirmWord = t('DELETE');

  return (
    <>
      <Row label={t('Export data')} hint={t('A readable JSON file with all your learning data.')}>
        <button className="btn" onClick={async () => { const r = await call('data:export'); if (r.saved) toast({ kind: 'success', title: t('Export saved'), body: r.path }); }}><Download size={14} /> {t('Export')}</button>
      </Row>
      <Row label={t('Make a backup')} hint={t('A backup is also made automatically every day (the last 15 are kept).')}>
        <button className="btn" onClick={async () => { await call('data:backupNow'); load(); toast({ kind: 'success', title: t('Backup made') }); }}><HardDriveDownload size={14} /> {t('Back up now')}</button>
      </Row>
      <div className="setting-row" style={{ display: 'block' }}>
        <div style={{ marginBottom: 8 }}>{t('Restore backups')}</div>
        {backups.length === 0 ? <div className="small faint">{t('No backups yet.')}</div> : (
          <table className="table">
            <tbody>{backups.map((b) => (
              <tr key={b.file}>
                <td className="mono small"><Archive size={12} /> {b.file.replace('backup-', '').replace('.sqlite', '')}</td>
                <td className="small faint">{Math.round(b.sizeBytes / 1024)} KB</td>
                <td style={{ textAlign: 'right' }}><button className="btn sm" onClick={() => setDialog({ kind: 'restore', file: b.file })}>{t('Restore')}</button></td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
      <Row label={t('Reset progress')} hint={t('A backup is made automatically before every reset.')}>
        <div className="row" style={{ flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {(['lessons', 'practice', 'statistics', 'all'] as const).map((s) => <button key={s} className="btn sm danger" onClick={() => setDialog({ kind: 'reset', scope: s })}><RotateCcw size={12} /> {RESET_LABEL[s]}</button>)}
        </div>
      </Row>
      <Row label={t('Delete profile')} hint={t('Deletes all your local data. A backup is made first.')}>
        <button className="btn danger" onClick={() => { setConfirmText(''); setDialog({ kind: 'delete' }); }}><Trash2 size={14} /> {t('Delete')}</button>
      </Row>

      {dialog?.kind === 'restore' && (
        <Modal title={t('Restore backup?')} onClose={() => setDialog(null)} actions={<>
          <button className="btn ghost" onClick={() => setDialog(null)}>{t('Cancel')}</button>
          <button className="btn primary" onClick={async () => { const r = await call('data:restoreBackup', dialog.file); setDialog(null); load(); await refresh(); toast(r.restored ? { kind: 'success', title: t('Backup restored') } : { kind: 'error', title: t('This backup could not be read') }); }}>{t('Restore')}</button>
        </>}>{t('Your current data is first saved as a backup itself. Then the chosen backup is put back.')}</Modal>
      )}
      {dialog?.kind === 'reset' && (
        <Modal title={t('Reset {what}?', { what: RESET_LABEL[dialog.scope] })} onClose={() => setDialog(null)} actions={<>
          <button className="btn ghost" onClick={() => setDialog(null)}>{t('Cancel')}</button>
          <button className="btn danger" onClick={async () => { await call('data:reset', dialog.scope); setDialog(null); load(); await refresh(); toast({ kind: 'info', title: t('Reset done'), body: t('A backup was made first.') }); }}>{t('Reset')}</button>
        </>}>{t('This erases {what}. You can undo it with the backup that is made automatically now.', { what: RESET_LABEL[dialog.scope] })}</Modal>
      )}
      {dialog?.kind === 'delete' && (
        <Modal title={t('Delete profile permanently?')} onClose={() => setDialog(null)} actions={<>
          <button className="btn ghost" onClick={() => setDialog(null)}>{t('Cancel')}</button>
          <button className="btn danger" disabled={confirmText.trim().toUpperCase() !== confirmWord.toUpperCase()} onClick={async () => { await call('data:deleteProfile', 'DELETE'); setDialog(null); await refresh(); }}>{t('Delete')}</button>
        </>}>
          <p>{t('All your progress, files and settings are deleted. The backup folder stays. Type {word} to confirm.', { word: confirmWord })}</p>
          <input className="input" style={{ width: '100%', marginTop: 10 }} value={confirmText} onChange={(e) => setConfirmText(e.target.value)} aria-label={t('Type {word}', { word: confirmWord })} />
        </Modal>
      )}
    </>
  );
}
