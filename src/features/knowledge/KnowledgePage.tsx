import { useMemo, useState } from 'react';
import { ExternalLink, Search } from 'lucide-react';
import { KNOWLEDGE, LESSON_BY_ID } from '@/curriculum';
import { CodeView } from '@/components/ui';
import { call } from '@/api';
import { useApp } from '@/store';
import { ClientServerVisualizer, ConditionVisualizer, EventVisualizer, LoopVisualizer } from '@/features/learning/Visualizers';
import { t } from '@/i18n';
import { useTranslatedContent } from '@/i18n/content';
import { MachineBadge } from '@/components/MachineBadge';

export function KnowledgePage() {
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(KNOWLEDGE[0].id);
  const [tab, setTab] = useState<'api' | 'visual'>('api');
  const navigate = useApp((s) => s.navigate);
  // Code examples are never translated; prose (simple, when, mistakes) is for machine languages.
  const tr = useTranslatedContent(KNOWLEDGE, 'knowledge');
  const entries = tr.value;
  const list = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return entries;
    return entries.filter((k) => [k.title, k.simple, k.when, k.beginner, k.kind].join(' ').toLowerCase().includes(n));
  }, [q, entries]);
  const e = entries.find((k) => k.id === sel) ?? list[0];

  return (
    <div className="page wide">
      <div className="page-head">
        <div className="grow"><h1>{t('Knowledge Base')}</h1><div className="sub">{t('Explanations of Luau and the Roblox API, in plain language. Works offline.')}</div></div>
        <div className="segmented" role="tablist">
          <button role="tab" aria-pressed={tab === 'api'} onClick={() => setTab('api')}>{t('API reference')}</button>
          <button role="tab" aria-pressed={tab === 'visual'} onClick={() => setTab('visual')}>{t('Interactive explanations')}</button>
        </div>
      </div>
      {tr.machine && <MachineBadge loading={tr.loading} missing={tr.missing} />}

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
              <input placeholder={t('Search, e.g. TweenService or colour')} value={q} onChange={(ev) => setQ(ev.target.value)} aria-label={t('Search the knowledge base')} autoFocus />
            </div>
            {list.map((k) => (
              <button key={k.id} className={`kb-item ${e?.id === k.id ? 'active' : ''}`} onClick={() => setSel(k.id)}>
                <span className="mono">{k.title}</span><span className="badge">{k.kind}</span>
              </button>
            ))}
            {list.length === 0 && <div className="small faint" style={{ padding: 14 }}>{t('Nothing found for "{q}".', { q })}</div>}
          </aside>
          {e && (
            <article className="kb-entry card">
              <div className="row" style={{ gap: 8 }}>
                <h1 className="mono" style={{ fontSize: 20 }}>{e.title}</h1>
                <span className="badge">{e.kind}</span>
                <span className="badge accent">{t('Runs:')} {t(e.where)}</span>
              </div>
              <p className="prose" style={{ marginTop: 10 }}>{e.simple}</p>
              <h3 className="kb-h">{t('When do you use it?')}</h3>
              <p className="muted">{e.when}</p>
              <h3 className="kb-h">{t('Example for beginners')}</h3>
              <CodeView code={e.beginner} />
              <h3 className="kb-h">{t('Advanced example')}</h3>
              <CodeView code={e.advanced} />
              <h3 className="kb-h">{t('Common mistakes')}</h3>
              <ul className="prose" style={{ fontSize: 14 }}>{e.mistakes.map((m) => <li key={m}>{m}</li>)}</ul>
              <h3 className="kb-h">{t('Related')}</h3>
              <div className="row" style={{ flexWrap: 'wrap' }}>
                {e.related.map((r) => LESSON_BY_ID.has(r) ? (
                  <button key={r} className="btn sm" onClick={() => navigate('lesson', { id: r })}>{t('Lesson')}: {LESSON_BY_ID.get(r)!.title}</button>
                ) : <span key={r} className="badge">{r} ({t('in development')})</span>)}
              </div>
              <div className="divider" />
              <button className="btn ghost sm" onClick={() => void call('app:openExternal', e.docs)}><ExternalLink size={13} /> {t('Official documentation')}</button>
              <span className="small faint" style={{ marginLeft: 8 }}>{t('Opens in your browser. Updated for the Roblox API of late 2026.')}</span>
            </article>
          )}
        </div>
      )}
    </div>
  );
}
