import { useCallback, useEffect, useRef, useState } from 'react';
import { AlignLeft, FilePlus2, FileCode2, History, Loader2, Pencil, Play, RotateCcw, Save, Trash2, X, AlertTriangle, CircleAlert, BookOpen, Monitor } from 'lucide-react';
import { CodeEditor, type CodeEditorHandle } from '@/editor/CodeEditor';
import { OutputConsole, ErrorExplanation } from '@/features/learning/Output';
import { Modal } from '@/components/ui';
import { call } from '@/api';
import { useApp } from '@/store';
import { explainDiagnostic, explainRunError, ROBLOX_GLOBALS } from '@shared/explain-error';
import { codeTokens } from '@shared/luau-lexer';
import { explainNative } from '@shared/explain-native';
import { runCode } from '@/features/learning/Steps';
import { ToolchainBanner } from '@/features/learning/ToolchainBanner';
import type { CodeFile, CodeRevision, Diagnostic, RunResult } from '@shared/types';

const EXAMPLES: { name: string; code: string }[] = [
  { name: 'hallo.luau', code: '-- Je eerste script\nlocal username = "Developer"\n\nprint("Hallo " .. username)\n' },
  { name: 'coins.luau', code: 'local coins = 100\nlocal prijs = 30\n\ncoins -= prijs\nprint(`Over: {coins} coins`)\n' },
  { name: 'aftellen.luau', code: '-- Een for-lus (dat leer je in cursus 3)\nfor i = 3, 1, -1 do\n    print(i)\n    task.wait(1) -- wacht hier niet echt; in Roblox Studio wel\nend\nprint("Start!")\n' },
  { name: 'hallo.cpp', code: '#include <iostream>\n\nint main() {\n    std::cout << "Hallo vanuit C++!" << std::endl;\n    return 0;\n}\n' },
  { name: 'Main.java', code: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hallo vanuit Java!");\n    }\n}\n' },
  { name: 'winkel.luau', code: 'local coins = 120\nlocal prijs = 100\n\nif coins >= prijs then\n    print("Je kunt het kopen!")\nelse\n    print("Nog niet genoeg coins")\nend\n' },
];

const TABS_KEY = 'playground.tabs';
const langOf = (name: string): 'luau' | 'cpp' | 'java' => (/.cpp$/i.test(name) ? 'cpp' : /.java$/i.test(name) ? 'java' : 'luau');
function loadTabs(): { open: number[]; active: number | null } {
  try {
    return JSON.parse(localStorage.getItem(TABS_KEY) ?? '') ?? { open: [], active: null };
  } catch {
    return { open: [], active: null };
  }
}

export function Playground() {
  const { settings, showAwards, toast } = useApp();
  const [files, setFiles] = useState<CodeFile[]>([]);
  const [tabs, setTabs] = useState(loadTabs);
  const [buffers, setBuffers] = useState<Record<number, string>>({});
  const [recovered, setRecovered] = useState<Record<number, boolean>>({});
  const [result, setResult] = useState<RunResult | null>(null);
  const [diags, setDiags] = useState<Diagnostic[]>([]);
  const [panel, setPanel] = useState<'output' | 'problems' | 'history'>('output');
  const [revisions, setRevisions] = useState<CodeRevision[]>([]);
  const [busy, setBusy] = useState(false);
  const [dialog, setDialog] = useState<null | { kind: 'rename' | 'delete' | 'close' | 'reset' | 'restore' | 'new'; id?: number; rev?: CodeRevision }>(null);
  const [nameInput, setNameInput] = useState('');
  const editor = useRef<CodeEditorHandle>(null);
  const draftTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const active = files.find((f) => f.id === tabs.active) ?? null;
  const value = active ? buffers[active.id] ?? active.content : '';
  const dirty = (f: CodeFile) => buffers[f.id] !== undefined && buffers[f.id] !== f.content;

  const loadFiles = useCallback(async () => {
    let list = await call('files:list');
    if (list.length === 0) {
      await call('files:create', { name: EXAMPLES[0].name, content: EXAMPLES[0].code });
      list = await call('files:list');
    }
    setFiles(list);
    // Restore unsaved drafts (crash / close recovery).
    const b: Record<number, string> = {};
    const rec: Record<number, boolean> = {};
    for (const f of list) if (f.draft !== null && f.draft !== f.content) {
      b[f.id] = f.draft;
      rec[f.id] = true;
    }
    setBuffers((prev) => ({ ...b, ...prev }));
    setRecovered(rec);
    setTabs((t) => {
      const ids = new Set(list.map((f) => f.id));
      const open = t.open.filter((id) => ids.has(id));
      const activeId = t.active && ids.has(t.active) ? t.active : open[0] ?? list[0].id;
      return { open: open.length ? open : [activeId], active: activeId };
    });
  }, []);

  useEffect(() => {
    void loadFiles();
  }, [loadFiles]);
  useEffect(() => {
    try {
      localStorage.setItem(TABS_KEY, JSON.stringify(tabs));
    } catch {
      /* storage unavailable: tabs just won't be remembered */
    }
  }, [tabs]);
  useEffect(() => {
    if (active && panel === 'history') void call('files:revisions', active.id).then(setRevisions);
  }, [active?.id, panel, active?.updatedAt]);

  function onChange(v: string) {
    if (!active) return;
    const id = active.id;
    setBuffers((b) => ({ ...b, [id]: v }));
    if (!settings.editorAutoSave) return;
    clearTimeout(draftTimer.current);
    draftTimer.current = setTimeout(() => void call('files:saveDraft', { id, draft: v }), 800);
  }

  async function save() {
    if (!active) return;
    const content = buffers[active.id] ?? active.content;
    const { file, awards } = await call('files:save', { id: active.id, content, reason: 'Opgeslagen' });
    showAwards(awards);
    setFiles((fs) => fs.map((f) => (f.id === file.id ? file : f)));
    setBuffers((b) => {
      const n = { ...b };
      delete n[file.id];
      return n;
    });
    setRecovered((r) => ({ ...r, [file.id]: false }));
    toast({ kind: 'success', title: `${file.name} opgeslagen` });
  }

  async function run() {
    if (!active || busy) return;
    setBusy(true);
    setPanel('output');
    try {
      setResult(await runCode(langOf(active.name), value));
    } finally {
      setBusy(false);
    }
  }

  function openFile(id: number) {
    setTabs((t) => ({ open: t.open.includes(id) ? t.open : [...t.open, id], active: id }));
    setResult(null);
  }
  function closeTab(id: number, force = false) {
    const f = files.find((x) => x.id === id);
    if (f && dirty(f) && !force) return setDialog({ kind: 'close', id });
    setTabs((t) => {
      const open = t.open.filter((x) => x !== id);
      return { open, active: t.active === id ? open[open.length - 1] ?? null : t.active };
    });
  }

  async function createFile(name: string, code = '-- Nieuw script\n\n') {
    const f = await call('files:create', { name, content: code });
    setFiles((fs) => [f, ...fs]);
    openFile(f.id);
  }

  const lang = active ? langOf(active.name) : 'luau';
  const usesRoblox = lang === 'luau' && codeTokens(value).some((t) => t.type === 'name' && ROBLOX_GLOBALS.has(t.value));
  const runExplanation = result?.error ? (lang === 'luau' ? explainRunError(result.error, value) : explainNative(result.error.message, lang)) : null;
  const errors = diags.filter((d) => d.severity === 'error');

  return (
    <div className="page full playground">
      <aside className="pg-explorer">
        <div className="pg-section-head">
          <span>Bestanden</span>
          <button className="btn ghost sm icon" title="Nieuw bestand" aria-label="Nieuw bestand" onClick={() => { setNameInput('script.luau'); setDialog({ kind: 'new' }); }}><FilePlus2 size={15} /></button>
        </div>
        <div className="pg-files" role="listbox" aria-label="Bestanden">
          {files.map((f) => (
            <div key={f.id} className={`pg-file ${f.id === tabs.active ? 'active' : ''}`} role="option" aria-selected={f.id === tabs.active}>
              <button className="pg-file-main" onClick={() => openFile(f.id)}>
                <FileCode2 size={14} /> <span className="grow">{f.name}</span>{dirty(f) && <span className="dot" title="Niet opgeslagen" />}
              </button>
              <button className="btn ghost sm icon" aria-label={`${f.name} hernoemen`} onClick={() => { setNameInput(f.name); setDialog({ kind: 'rename', id: f.id }); }}><Pencil size={12} /></button>
              <button className="btn ghost sm icon" aria-label={`${f.name} verwijderen`} onClick={() => setDialog({ kind: 'delete', id: f.id })}><Trash2 size={12} /></button>
            </div>
          ))}
        </div>
        <div className="pg-section-head" style={{ marginTop: 12 }}><span>Voorbeelden</span></div>
        <div className="pg-files">
          {EXAMPLES.map((e) => (
            <button key={e.name} className="pg-file-main example" onClick={() => createFile(e.name, e.code)}><BookOpen size={13} /> <span className="grow">{e.name}</span></button>
          ))}
        </div>
        <div className="small faint" style={{ padding: '12px 12px 0' }}>Bestanden op <code>.luau</code> draaien in Luau, <code>.cpp</code> in C++ en <code>.java</code> in Java. Code met <code>game</code>, <code>workspace</code> of <code>Instance</code> test je in Roblox Studio.</div>
      </aside>

      <section className="pg-main">
        <div className="pg-tabs" role="tablist">
          {tabs.open.map((id) => {
            const f = files.find((x) => x.id === id);
            if (!f) return null;
            return (
              <div key={id} className={`pg-tab ${id === tabs.active ? 'active' : ''}`} role="tab" aria-selected={id === tabs.active}>
                <button className="pg-tab-main" onClick={() => openFile(id)}>{f.name}{dirty(f) && <span className="dot" />}</button>
                <button className="btn ghost sm icon" aria-label={`${f.name} sluiten`} onClick={() => closeTab(id)}><X size={12} /></button>
              </div>
            );
          })}
          <span className="grow" />
          <div className="pg-actions">
            <button className="btn primary sm" onClick={run} disabled={!active || busy} title="Ctrl + Enter">{busy ? <Loader2 size={13} className="spin" /> : <Play size={13} />} Run Code</button>
            <button className="btn sm" onClick={save} disabled={!active || !dirty(active)} title="Ctrl + S"><Save size={13} /> Opslaan</button>
            <button className="btn sm" onClick={() => editor.current?.format()} disabled={!active} title="Inspringing herstellen (Shift + Alt + F)"><AlignLeft size={13} /> Formatteren</button>
            <button className="btn sm ghost" onClick={() => setDialog({ kind: 'reset' })} disabled={!active || !dirty(active)} title="Terug naar laatst opgeslagen versie"><RotateCcw size={13} /></button>
          </div>
        </div>
        <div className="pg-banners">
        {active && recovered[active.id] && (
          <div className="pg-banner"><AlertTriangle size={14} /> Niet-opgeslagen wijzigingen van je vorige sessie zijn hersteld. Sla op om ze te bewaren, of zet het bestand terug.</div>
        )}
        {active && lang !== 'luau' && <div style={{ padding: '0 14px 8px' }}><ToolchainBanner language={lang} /></div>}
        {active && usesRoblox && (
          <div className="pg-banner warn"><Monitor size={14} /> Deze code gebruikt onderdelen van de Roblox-engine. Die bestaan alleen in Roblox Studio; de speeltuin kan ze niet uitvoeren.</div>
        )}
        </div>
        <div className="pg-editor">
          {active ? (
            <CodeEditor key={active.id} ref={editor} value={value} onChange={onChange} onRun={run} onSave={save} onDiagnostics={setDiags} errorLine={result?.error?.line ?? null} fill ariaLabel={`Editor: ${active.name}`} language={lang} />
          ) : (
            <div className="empty"><FileCode2 size={28} /> Open of maak een bestand om te beginnen.</div>
          )}
        </div>
        <div className="pg-panel">
          <div className="pg-panel-tabs" role="tablist">
            <button role="tab" aria-selected={panel === 'output'} onClick={() => setPanel('output')}>Output</button>
            <button role="tab" aria-selected={panel === 'problems'} onClick={() => setPanel('problems')}>Problemen {diags.length > 0 && <span className={`badge ${errors.length ? 'error' : 'warning'}`}>{diags.length}</span>}</button>
            <button role="tab" aria-selected={panel === 'history'} onClick={() => setPanel('history')}><History size={13} /> Versies</button>
          </div>
          <div className="pg-panel-body">
            {panel === 'output' && (result ? (
              <div className="col" style={{ gap: 10 }}>
                <OutputConsole result={result} />
                {runExplanation && <ErrorExplanation explanation={runExplanation} onGoto={(l) => editor.current?.revealLine(l)} />}
              </div>
            ) : <div className="small faint">Klik op Run Code (Ctrl + Enter) om je code uit te voeren.</div>)}
            {panel === 'problems' && (diags.length === 0 ? <div className="small faint">De Luau-analyzer vindt geen problemen.</div> : (
              <div className="col" style={{ gap: 8 }}>
                {diags.map((d, i) => {
                  const e = explainDiagnostic(d, value);
                  return (
                    <button key={i} className="problem" onClick={() => editor.current?.revealLine(d.line)}>
                      {d.severity === 'error' ? <CircleAlert size={15} color="var(--error)" /> : <AlertTriangle size={15} color="var(--warning)" />}
                      <span className="grow"><strong>{e.what.replace(/`/g, '')}</strong><span className="small faint" style={{ display: 'block' }}>Regel {d.line} · {d.message}</span></span>
                    </button>
                  );
                })}
              </div>
            ))}
            {panel === 'history' && (revisions.length === 0 ? <div className="small faint">Nog geen opgeslagen versies.</div> : (
              <table className="table">
                <thead><tr><th>Moment</th><th>Wat</th><th>Regels</th><th /></tr></thead>
                <tbody>
                  {revisions.map((r) => (
                    <tr key={r.id}>
                      <td className="mono small">{new Date(r.createdAt).toLocaleString('nl-NL')}</td>
                      <td>{r.reason}</td>
                      <td className="faint">{r.content.split('\n').length}</td>
                      <td style={{ textAlign: 'right' }}><button className="btn sm" onClick={() => setDialog({ kind: 'restore', rev: r })}>Herstellen</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ))}
          </div>
        </div>
      </section>

      {dialog?.kind === 'new' && (
        <Modal title="Nieuw bestand" onClose={() => setDialog(null)} actions={<>
          <button className="btn ghost" onClick={() => setDialog(null)}>Annuleren</button>
          <button className="btn primary" onClick={() => { void createFile(nameInput); setDialog(null); }}>Maken</button>
        </>}>
          <input className="input" style={{ width: '100%' }} value={nameInput} onChange={(e) => setNameInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { void createFile(nameInput); setDialog(null); } }} aria-label="Bestandsnaam" />
        </Modal>
      )}
      {dialog?.kind === 'rename' && (
        <Modal title="Bestand hernoemen" onClose={() => setDialog(null)} actions={<>
          <button className="btn ghost" onClick={() => setDialog(null)}>Annuleren</button>
          <button className="btn primary" onClick={async () => { const f = await call('files:rename', { id: dialog.id!, name: nameInput }); setFiles((fs) => fs.map((x) => (x.id === f.id ? f : x))); setDialog(null); }}>Hernoemen</button>
        </>}>
          <input className="input" style={{ width: '100%' }} value={nameInput} onChange={(e) => setNameInput(e.target.value)} aria-label="Nieuwe naam" />
        </Modal>
      )}
      {dialog?.kind === 'delete' && (
        <Modal title="Bestand verwijderen?" onClose={() => setDialog(null)} actions={<>
          <button className="btn ghost" onClick={() => setDialog(null)}>Annuleren</button>
          <button className="btn danger" onClick={async () => { await call('files:remove', dialog.id!); closeTab(dialog.id!, true); setFiles((fs) => fs.filter((f) => f.id !== dialog.id)); setDialog(null); }}>Verwijderen</button>
        </>}>
          {files.find((f) => f.id === dialog.id)?.name} verdwijnt uit je lijst. Het blijft bewaard in je back-ups.
        </Modal>
      )}
      {dialog?.kind === 'close' && (
        <Modal title="Niet-opgeslagen wijzigingen" onClose={() => setDialog(null)} actions={<>
          <button className="btn ghost" onClick={() => setDialog(null)}>Annuleren</button>
          <button className="btn danger" onClick={() => { setBuffers((b) => { const n = { ...b }; delete n[dialog.id!]; return n; }); void call('files:saveDraft', { id: dialog.id!, draft: null }); closeTab(dialog.id!, true); setDialog(null); }}>Niet opslaan</button>
          <button className="btn primary" onClick={async () => { await save(); closeTab(dialog.id!, true); setDialog(null); }}>Opslaan</button>
        </>}>
          Wil je de wijzigingen in {files.find((f) => f.id === dialog.id)?.name} opslaan voordat je het tabblad sluit?
        </Modal>
      )}
      {dialog?.kind === 'reset' && active && (
        <Modal title="Terug naar laatst opgeslagen versie?" onClose={() => setDialog(null)} actions={<>
          <button className="btn ghost" onClick={() => setDialog(null)}>Annuleren</button>
          <button className="btn danger" onClick={() => { setBuffers((b) => { const n = { ...b }; delete n[active.id]; return n; }); void call('files:saveDraft', { id: active.id, draft: null }); setRecovered((r) => ({ ...r, [active.id]: false })); setDialog(null); }}>Wijzigingen weggooien</button>
        </>}>
          Je niet-opgeslagen wijzigingen gaan verloren.
        </Modal>
      )}
      {dialog?.kind === 'restore' && active && dialog.rev && (
        <Modal title="Deze versie herstellen?" onClose={() => setDialog(null)} actions={<>
          <button className="btn ghost" onClick={() => setDialog(null)}>Annuleren</button>
          <button className="btn primary" onClick={async () => { const f = await call('files:restore', dialog.rev!.id); setFiles((fs) => fs.map((x) => (x.id === f.id ? f : x))); setBuffers((b) => { const n = { ...b }; delete n[f.id]; return n; }); setDialog(null); }}>Herstellen</button>
        </>}>
          De huidige inhoud blijft bewaard als aparte versie in de geschiedenis. {dirty(active) && 'Let op: je niet-opgeslagen wijzigingen worden vervangen.'}
        </Modal>
      )}
    </div>
  );
}
