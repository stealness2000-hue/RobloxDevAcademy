import { useMemo, useState } from 'react';
import { ExternalLink, Search } from 'lucide-react';
import { KNOWLEDGE } from '@/curriculum/knowledge';
import { LESSON_BY_ID } from '@/curriculum';
import { CodeView } from '@/components/ui';
import { call } from '@/api';
import { useApp } from '@/store';
import { ClientServerVisualizer, ConditionVisualizer, EventVisualizer, LoopVisualizer } from '@/features/learning/Visualizers';

export function KnowledgePage() {
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(KNOWLEDGE[0].id);
  const [tab, setTab] = useState<'api' | 'visual'>('api');
  const navigate = useApp((s) => s.navigate);
  const list = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return KNOWLEDGE;
    return KNOWLEDGE.filter((k) => [k.title, k.simple, k.when, k.beginner, k.kind].join(' ').toLowerCase().includes(n));
  }, [q]);
  const e = KNOWLEDGE.find((k) => k.id === sel) ?? list[0];

  return (
    <div className="page wide">
      <div className="page-head">
        <div className="grow"><h1>Kennisbank</h1><div className="sub">Uitleg over Luau en de Roblox-API, in gewone taal. Werkt offline.</div></div>
        <div className="segmented" role="tablist">
          <button role="tab" aria-pressed={tab === 'api'} onClick={() => setTab('api')}>API-naslag</button>
          <button role="tab" aria-pressed={tab === 'visual'} onClick={() => setTab('visual')}>Interactieve uitleg</button>
        </div>
      </div>

      {tab === 'visual' ? (
        <div className="grid c2">
          <ConditionVisualizer />
          <LoopVisualizer />
          <EventVisualizer />
          <ClientServerVisualizer />
        </div>
      ) : (
        <div className="kb">
          <aside className="kb-list card flush">
            <div className="kb-search">
              <Search size={14} />
              <input placeholder="Zoek, bijv. TweenService of kleur" value={q} onChange={(ev) => setQ(ev.target.value)} aria-label="Zoeken in de kennisbank" autoFocus />
            </div>
            {list.map((k) => (
              <button key={k.id} className={`kb-item ${e?.id === k.id ? 'active' : ''}`} onClick={() => setSel(k.id)}>
                <span className="mono">{k.title}</span><span className="badge">{k.kind}</span>
              </button>
            ))}
            {list.length === 0 && <div className="small faint" style={{ padding: 14 }}>Niets gevonden voor "{q}".</div>}
          </aside>
          {e && (
            <article className="kb-entry card">
              <div className="row" style={{ gap: 8 }}>
                <h1 className="mono" style={{ fontSize: 20 }}>{e.title}</h1>
                <span className="badge">{e.kind}</span>
                <span className="badge accent">Draait: {e.where}</span>
              </div>
              <p className="prose" style={{ marginTop: 10 }}>{e.simple}</p>
              <h3 className="kb-h">Wanneer gebruik je het?</h3>
              <p className="muted">{e.when}</p>
              <h3 className="kb-h">Voorbeeld voor beginners</h3>
              <CodeView code={e.beginner} />
              <h3 className="kb-h">Gevorderd voorbeeld</h3>
              <CodeView code={e.advanced} />
              <h3 className="kb-h">Veelgemaakte fouten</h3>
              <ul className="prose" style={{ fontSize: 14 }}>{e.mistakes.map((m) => <li key={m}>{m}</li>)}</ul>
              <h3 className="kb-h">Gerelateerd</h3>
              <div className="row" style={{ flexWrap: 'wrap' }}>
                {e.related.map((r) => LESSON_BY_ID.has(r) ? (
                  <button key={r} className="btn sm" onClick={() => navigate('lesson', { id: r })}>Les: {LESSON_BY_ID.get(r)!.title}</button>
                ) : <span key={r} className="badge">{r} (in ontwikkeling)</span>)}
              </div>
              <div className="divider" />
              <button className="btn ghost sm" onClick={() => void call('app:openExternal', e.docs)}><ExternalLink size={13} /> Officiële documentatie</button>
              <span className="small faint" style={{ marginLeft: 8 }}>Opent in je browser. Bijgewerkt voor de Roblox-API van eind 2026.</span>
            </article>
          )}
        </div>
      )}
    </div>
  );
}
