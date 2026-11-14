import { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Area, AreaChart } from 'recharts';
import { BarChart3 } from 'lucide-react';
import { call } from '@/api';
import { useApp } from '@/store';
import { Segmented, formatDuration } from '@/components/ui';
import { CONCEPT_BY_ID, SKILL_GROUPS, conceptName } from '@/curriculum/concepts';
import { ERROR_CATEGORY_LABELS, type ErrorCategory } from '@shared/explain-error';
import { MASTERY_LABELS } from '@shared/mastery';
import type { Statistics } from '@shared/types';
import { locale, t, tn } from '@/i18n';

const AXIS = { stroke: 'var(--text-3)', fontSize: 11, tickLine: false, axisLine: false } as const;
const GRID = <CartesianGrid stroke="var(--border-soft)" strokeDasharray="0" vertical={false} />;
const tooltipStyle = { contentStyle: { background: 'var(--elevated)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, color: 'var(--text)' }, labelStyle: { color: 'var(--text-2)' }, cursor: { fill: 'var(--hover)' } };
const shortDay = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString(locale(), { day: 'numeric', month: 'short' });

export function StatsPage() {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [range, setRange] = useState<7 | 30 | 90>(30);
  const showXp = useApp((s) => s.settings.showXp);
  useEffect(() => {
    void call('stats:get').then(setStats);
  }, []);

  const daily = useMemo(() => stats?.daily.slice(-range).map((d) => ({ ...d, minutes: Math.round(d.seconds / 60), label: shortDay(d.day) })) ?? [], [stats, range]);
  const skills = useMemo(() => {
    if (!stats) return [];
    return SKILL_GROUPS.map((g) => {
      const ms = stats.mastery.filter((m) => CONCEPT_BY_ID.get(m.conceptId)?.group === g);
      return { group: g, score: ms.length ? Math.round(ms.reduce((s, m) => s + m.score, 0) / ms.length) : 0, has: ms.length > 0 };
    });
  }, [stats]);

  if (!stats) return <div className="page"><div className="grid c4">{[0, 1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 88 }} />)}</div></div>;
  const hasActivity = stats.daily.some((d) => d.seconds > 0 || d.exercises > 0);
  const mostPracticed = [...stats.mastery].sort((a, b) => b.attempts - a.attempts)[0];
  const needsReview = stats.mastery.filter((m) => m.needsReview);

  return (
    <div className="page">
      <div className="page-head">
        <div className="grow"><h1>{t('Statistics')}</h1><div className="sub">{t('All numbers come from your own learning history on this computer.')}</div></div>
      </div>

      <div className="grid c4">
        <Stat label={t('Total learning time')} value={formatDuration(stats.totalSeconds)} hint={t('Today {time}', { time: formatDuration(stats.todaySeconds) })} />
        <Stat label={t('Lessons finished')} value={stats.lessonsCompleted} hint={t('{done} of {tried} attempted exercises solved', { done: stats.exercisesCompleted, tried: stats.exercisesAttempted })} />
        <Stat label={t('Independent accuracy')} value={stats.independentAccuracy === null ? '—' : `${Math.round(stats.independentAccuracy * 100)}%`} hint={t('Correct attempts on exercises without help')} />
        <Stat label={t('Streak')} value={tn(stats.streakDays, '{n} day', '{n} days')} hint={showXp ? t('{n} XP in total', { n: stats.xp }) : undefined} />
        <Stat label={t('Code runs')} value={stats.codeRuns} hint={t('{n} exercise submissions', { n: stats.codeSubmissions })} />
        <Stat label={t('Most practised')} value={mostPracticed ? conceptName(mostPracticed.conceptId) : '—'} hint={mostPracticed ? t('{n} attempts', { n: mostPracticed.attempts }) : t('No exercises yet')} small />
        <Stat label={t('To review')} value={needsReview.length} hint={needsReview.length ? needsReview.slice(0, 3).map((m) => conceptName(m.conceptId)).join(', ') : t('Nothing waiting')} />
        <Stat label={t('Sessions')} value={stats.sessions.length} hint={stats.sessions[0] ? t('Last: {time}', { time: formatDuration(stats.sessions[0].activeSeconds) }) : t('No sessions yet')} />
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <div className="card-head">
          <h3>{t('Daily activity')}</h3>
          <Segmented label={t('Period')} value={range} onChange={setRange} options={[{ value: 7, label: t('{n} days', { n: 7 }) }, { value: 30, label: t('{n} days', { n: 30 }) }, { value: 90, label: t('{n} days', { n: 90 }) }]} />
        </div>
        {hasActivity ? (
          <div style={{ height: 200 }} role="img" aria-label={t('Active learning minutes per day, last {n} days', { n: range })}>
            <ResponsiveContainer>
              <BarChart data={daily} margin={{ top: 6, right: 6, left: -18, bottom: 0 }} barCategoryGap={range === 7 ? '35%' : '18%'}>
                {GRID}
                <XAxis dataKey="label" {...AXIS} interval={range === 7 ? 0 : range === 30 ? 4 : 13} />
                <YAxis {...AXIS} allowDecimals={false} unit=" m" />
                <Tooltip {...tooltipStyle} formatter={(v) => [t('{n} min active', { n: String(v) }), t('Learning time')]} />
                <Bar dataKey="minutes" fill="var(--accent)" radius={[4, 4, 0, 0]} maxBarSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : <Empty text={t('No activity yet. After your first lesson your learning time per day appears here.')} />}
      </div>

      <div className="grid c2" style={{ marginTop: 14 }}>
        <div className="card">
          <div className="card-head"><h3>{t('Skills')}</h3><span className="small faint">{t('mastery 0–100')}</span></div>
          {stats.mastery.length ? (
            <div className="col" style={{ gap: 9 }}>
              {skills.map((s) => (
                <div key={s.group} className="skill-row" title={s.has ? `${t(s.group)}: ${s.score}` : `${t(s.group)}: ${t('not practised yet')}`}>
                  <span className="small" style={{ width: 120 }}>{t(s.group)}</span>
                  <div className="skill-track"><span style={{ width: `${s.score}%` }} /></div>
                  <span className="small mono faint" style={{ width: 34, textAlign: 'right' }}>{s.has ? s.score : '—'}</span>
                </div>
              ))}
            </div>
          ) : <Empty text={t('No data yet. Mastery is based on your exercises, quizzes and reviews, not on time.')} />}
        </div>
        <div className="card">
          <div className="card-head"><h3>{t('Learning progress')}</h3><span className="small faint">{t('finished lessons')}</span></div>
          {stats.lessonsOverTime.length ? (
            <div style={{ height: 220 }} role="img" aria-label={t('Total number of finished lessons over time')}>
              <ResponsiveContainer>
                <AreaChart data={stats.lessonsOverTime.map((d) => ({ ...d, label: shortDay(d.day) }))} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
                  {GRID}
                  <XAxis dataKey="label" {...AXIS} />
                  <YAxis {...AXIS} allowDecimals={false} />
                  <Tooltip {...tooltipStyle} cursor={{ stroke: 'var(--text-3)' }} formatter={(v) => [t('{n} lessons', { n: String(v) }), t('Total')]} />
                  <Area type="monotone" dataKey="total" stroke="var(--accent)" strokeWidth={2} fill="var(--accent-soft)" dot={{ r: 4, strokeWidth: 2, stroke: 'var(--surface)', fill: 'var(--accent)' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : <Empty text={t('Finish your first lesson to see your progress.')} />}
        </div>
      </div>

      <div className="grid c2" style={{ marginTop: 14 }}>
        <div className="card">
          <div className="card-head"><h3>{t('Most common mistakes')}</h3></div>
          {stats.errorCategories.length ? (
            <div style={{ height: Math.max(120, stats.errorCategories.slice(0, 6).length * 34) }} role="img" aria-label={t('Number of mistakes per kind')}>
              <ResponsiveContainer>
                <BarChart layout="vertical" data={stats.errorCategories.slice(0, 6).map((e) => ({ ...e, label: t(ERROR_CATEGORY_LABELS[e.category as ErrorCategory] ?? e.category) }))} margin={{ top: 0, right: 16, left: 10, bottom: 0 }}>
                  <XAxis type="number" {...AXIS} allowDecimals={false} />
                  <YAxis type="category" dataKey="label" {...AXIS} width={150} tick={{ fill: 'var(--text-2)', fontSize: 12 }} />
                  <Tooltip {...tooltipStyle} formatter={(v) => [`${v}×`, t('Count')]} />
                  <Bar dataKey="count" fill="var(--accent)" radius={[0, 4, 4, 0]} maxBarSize={14} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : <Empty text={t('No mistakes recorded yet. Making mistakes is part of it; here you will see which ones happen most.')} />}
        </div>
        <div className="card">
          <div className="card-head"><h3>{t('Learning efficiency')}</h3><span className="small faint">{t('independent exercises, per 5 attempts')}</span></div>
          {stats.efficiency.length >= 2 ? (
            <div style={{ height: 200 }} role="img" aria-label={t('Accuracy on independent exercises as you practise more')}>
              <ResponsiveContainer>
                <LineChart data={stats.efficiency.map((e) => ({ ...e, pct: Math.round(e.accuracy * 100), label: `${(e.bucket - 1) * 5 + 1}–${(e.bucket - 1) * 5 + e.attempts}` }))} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
                  {GRID}
                  <XAxis dataKey="label" {...AXIS} />
                  <YAxis {...AXIS} domain={[0, 100]} unit="%" />
                  <Tooltip {...tooltipStyle} cursor={{ stroke: 'var(--text-3)' }} formatter={(v) => [t('{n}% correct', { n: String(v) }), t('Accuracy')]} labelFormatter={(l) => t('Attempts {range}', { range: String(l) })} />
                  <Line type="monotone" dataKey="pct" stroke="var(--accent)" strokeWidth={2} dot={{ r: 4, strokeWidth: 2, stroke: 'var(--surface)', fill: 'var(--accent)' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : <Empty text={t('After at least 6 independent attempts you see here whether you get more accurate as you practise.')} />}
        </div>
      </div>

      <div className="grid c2" style={{ marginTop: 14 }}>
        <div className="card">
          <div className="card-head"><h3>{t('Regularity')}</h3><span className="small faint">{t('last 13 weeks')}</span></div>
          <Heatmap daily={stats.daily} />
        </div>
        <div className="card">
          <div className="card-head"><h3>{t('Quiz questions')}</h3><span className="small faint">{t('first answer per question')}</span></div>
          {stats.quizzes.length ? (
            <table className="table">
              <thead><tr><th>{t('Day')}</th><th>{t('Correct')}</th><th>{t('Total')}</th><th>{t('Score')}</th></tr></thead>
              <tbody>{stats.quizzes.slice(-6).reverse().map((q) => (
                <tr key={q.day}><td>{shortDay(q.day)}</td><td>{q.correct}</td><td>{q.total}</td><td className="mono">{Math.round((q.correct / q.total) * 100)}%</td></tr>
              ))}</tbody>
            </table>
          ) : <Empty text={t('No quiz questions answered yet.')} />}
        </div>
      </div>

      {stats.mastery.length > 0 && (
        <div className="card" style={{ marginTop: 14 }}>
          <div className="card-head"><h3>{t('Per topic')}</h3></div>
          <table className="table">
            <thead><tr><th>{t('Topic')}</th><th>{t('Level')}</th><th>{t('Score')}</th><th>{t('Attempts')}</th><th>{t('Correct')}</th><th>{t('Review')}</th></tr></thead>
            <tbody>{stats.mastery.map((m) => (
              <tr key={m.conceptId}>
                <td>{conceptName(m.conceptId)}</td><td>{t(MASTERY_LABELS[m.level])}</td><td className="mono">{m.score}</td><td>{m.attempts}</td><td>{m.correct}</td>
                <td>{m.needsReview ? <span className="badge warning">{t('now')}</span> : m.reviewDueAt ? <span className="small faint">{new Date(m.reviewDueAt).toLocaleDateString(locale())}</span> : '—'}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, hint, small }: { label: string; value: string | number; hint?: string; small?: boolean }) {
  return (
    <div className="card stat">
      <span className="label">{label}</span>
      <span className="value" style={small ? { fontSize: 18 } : undefined}>{value}</span>
      {hint && <span className="hint">{hint}</span>}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="empty" style={{ padding: 24 }}><BarChart3 size={22} /><span className="small">{text}</span></div>;
}

function Heatmap({ daily }: { daily: Statistics['daily'] }) {
  const days = daily.slice(-91);
  const max = Math.max(1, ...days.map((d) => d.seconds));
  const firstDow = (new Date(`${days[0].day}T12:00:00`).getDay() + 6) % 7; // Monday = 0
  const cells = [...Array(firstDow).fill(null), ...days];
  const level = (s: number) => (s === 0 ? 0 : Math.min(4, 1 + Math.floor((s / max) * 3.999)));
  return (
    <div>
      <div className="heatmap" role="img" aria-label={t('Calendar with active learning time per day')}>
        {cells.map((d, i) => d ? (
          <span key={i} className={`hm l${level(d.seconds)}`} title={`${shortDay(d.day)}: ${formatDuration(d.seconds)}`} />
        ) : <span key={i} className="hm empty" />)}
      </div>
      <div className="row small faint" style={{ marginTop: 8, gap: 6 }}>
        {t('Less')} {[0, 1, 2, 3, 4].map((l) => <span key={l} className={`hm l${l}`} />)} {t('More')}
      </div>
    </div>
  );
}
