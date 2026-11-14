import { useMemo } from 'react';
import { ArrowRight, Flame, Repeat, RotateCcw, Sparkles, Target, TrendingDown, Trophy } from 'lucide-react';
import { useApp } from '@/store';
import { ALL_LESSONS, LESSON_BY_ID, lessonNumber, nextLesson, COURSE_BY_ID, practiceForConcept } from '@/curriculum';
import { conceptName } from '@/curriculum/concepts';
import { ProgressBar, Ring, formatDuration } from '@/components/ui';
import { levelFromXp } from '@shared/xp';
import { MASTERY_LABELS } from '@shared/mastery';
import { t, tn } from '@/i18n';

export function Dashboard() {
  const { snapshot, navigate, settings } = useApp();
  const completed = useMemo(() => new Set(snapshot?.lessons.filter((l) => l.status === 'completed').map((l) => l.lessonId)), [snapshot]);
  if (!snapshot) return <div className="page"><div className="skeleton" style={{ height: 160 }} /></div>;

  const last = snapshot.lastLessonId ? LESSON_BY_ID.get(snapshot.lastLessonId) : undefined;
  const lastDone = last && completed.has(last.id);
  const upNext = lastDone || !last ? nextLesson(completed) : last;
  const prevOfUpNext = upNext ? ALL_LESSONS[ALL_LESSONS.findIndex((l) => l.id === upNext.id) - 1] : undefined;
  const returning = snapshot.lessons.length > 0;
  const level = levelFromXp(snapshot.xp);
  const goalSec = settings.dailyGoalMinutes * 60;
  const weak = snapshot.mastery.filter((m) => m.recentFailures >= 3 && m.score < 75 && practiceForConcept(m.conceptId).length > 0);
  const due = snapshot.mastery.filter((m) => m.needsReview);
  const strongest = snapshot.mastery.filter((m) => m.attempts >= 3).sort((a, b) => b.score - a.score)[0];
  const totalLessons = ALL_LESSONS.length;

  return (
    <div className="page">
      <div className="page-head">
        <div className="grow">
          <h1>{returning ? t('Welcome back!') : t('Welcome to the Academy')}</h1>
          <div className="sub">{returning ? t('Good to see you again. This is where you left off.') : t('Everything starts with one lesson.')}</div>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)' }}>
        <div className="card continue-card">
          {upNext ? (
            <>
              <div className="card-title">{last && !lastDone ? t('You were working on') : t('Next lesson')}</div>
              <h2 style={{ marginTop: 6 }}>{t('Lesson {n}: {title}', { n: lessonNumber(upNext.id), title: upNext.title })}</h2>
              <div className="small muted" style={{ marginTop: 2 }}>{COURSE_BY_ID.get(upNext.courseId)?.title} · ± {upNext.minutes} min</div>
              <p className="muted" style={{ marginTop: 10 }}>{upNext.objective}</p>
              <div className="row" style={{ marginTop: 16 }}>
                <button className="btn primary lg" onClick={() => navigate('lesson', { id: upNext.id })} autoFocus>
                  {snapshot.lessons.some((l) => l.lessonId === upNext.id) ? t('Continue') : t('Start lesson')} <ArrowRight size={16} />
                </button>
                {prevOfUpNext && completed.has(prevOfUpNext.id) && (
                  <button className="btn ghost" onClick={() => navigate('lesson', { id: prevOfUpNext.id })}><RotateCcw size={14} /> {t('Repeat previous lesson')}</button>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="card-title">{t('All available lessons finished')}</div>
              <h2 style={{ marginTop: 6 }}>{t('Great work.')}</h2>
              <p className="muted" style={{ marginTop: 8 }}>{t('The next courses are still being written. Meanwhile, practise in Practice and Challenges, or try your own ideas in the Playground.')}</p>
              <div className="row" style={{ marginTop: 14 }}>
                <button className="btn primary" onClick={() => navigate('challenges')}>{t('Go to challenges')}</button>
                <button className="btn ghost" onClick={() => navigate('playground')}>{t('Open the playground')}</button>
              </div>
            </>
          )}
          <div className="divider" />
          <div className="row small muted"><span>{t('{done} of {total} lessons finished', { done: completed.size, total: totalLessons })}</span><span className="grow" /></div>
          <div style={{ marginTop: 6 }}><ProgressBar value={completed.size / totalLessons} /></div>
        </div>

        <div className="card">
          <div className="card-title">{t('Today')}</div>
          <div className="row" style={{ gap: 16, marginTop: 10 }}>
            <Ring value={snapshot.todaySeconds / goalSec} size={76} stroke={7}>
              <span className="mono small">{Math.min(100, Math.round((snapshot.todaySeconds / goalSec) * 100))}%</span>
            </Ring>
            <div className="col" style={{ gap: 2 }}>
              <span className="stat"><span className="value" style={{ fontSize: 20 }}>{formatDuration(snapshot.todaySeconds)}</span></span>
              <span className="small muted">{t('of your goal of {n} min', { n: settings.dailyGoalMinutes })}</span>
              <span className="small faint">{t('Only active learning time counts.')}</span>
            </div>
          </div>
          <div className="divider" />
          <div className="grid c2">
            <div className="stat">
              <span className="label row" style={{ gap: 5 }}><Flame size={13} /> {t('Streak')}</span>
              <span className="value" style={{ fontSize: 20 }}>{tn(snapshot.streakDays, '{n} day', '{n} days')}</span>
            </div>
            {settings.showXp && (
              <div className="stat">
                <span className="label row" style={{ gap: 5 }}><Sparkles size={13} /> {t('Level {n}', { n: level.level })}</span>
                <span className="value" style={{ fontSize: 20 }}>{snapshot.xp} XP</span>
                <ProgressBar value={level.progress} />
              </div>
            )}
          </div>
        </div>
      </div>

      {(weak.length > 0 || due.length > 0) && (
        <div className="grid c2" style={{ marginTop: 14 }}>
          {weak.slice(0, 1).map((w) => (
            <div key={w.conceptId} className="card suggestion">
              <TrendingDown size={18} />
              <div className="grow">
                <strong>{t('You still often make mistakes with {topic}.', { topic: conceptName(w.conceptId).toLowerCase() })}</strong>
                <div className="small muted">{t('Want to do {n} extra exercises? Making mistakes is part of learning.', { n: Math.min(3, practiceForConcept(w.conceptId).length) })}</div>
              </div>
              <button className="btn" onClick={() => navigate('practice', { concept: w.conceptId })}>{t('Practice')}</button>
            </div>
          ))}
          {due.length > 0 && (
            <div className="card suggestion">
              <Repeat size={18} />
              <div className="grow">
                <strong>{t('Time for a short review.')}</strong>
                <div className="small muted">
                  {due.slice(0, 3).map((d) => conceptName(d.conceptId)).join(', ')}
                  {due.length > 3 ? ` ${t('and {n} more', { n: due.length - 3 })}` : ''}. {t('Reviewing helps you remember it.')}
                </div>
              </div>
              <button className="btn" onClick={() => navigate('practice', { mode: 'review' })}>{t('Review')}</button>
            </div>
          )}
        </div>
      )}

      <div className="grid c3" style={{ marginTop: 14 }}>
        <div className="card">
          <div className="card-head"><Target size={16} /><h3>{t('Skills')}</h3><button className="btn ghost sm" onClick={() => navigate('stats')}>{t('All')}</button></div>
          {snapshot.mastery.length === 0 ? (
            <div className="small muted">{t('No data yet. After your first exercises you will see here how well you master each topic.')}</div>
          ) : (
            <div className="col" style={{ gap: 10 }}>
              {snapshot.mastery.slice(0, 5).map((m) => (
                <div key={m.conceptId}>
                  <div className="row small"><span className="grow">{conceptName(m.conceptId)}</span><span className="faint">{t(MASTERY_LABELS[m.level])}</span></div>
                  <ProgressBar value={m.score / 100} />
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="card">
          <div className="card-head"><Sparkles size={16} /><h3>{t('Insights')}</h3></div>
          <Insights strongest={strongest ? conceptName(strongest.conceptId) : null} completedThisWeek={countThisWeek(snapshot.lessons)} />
        </div>
        <div className="card">
          <div className="card-head"><Trophy size={16} /><h3>{t('Achievements')}</h3><button className="btn ghost sm" onClick={() => navigate('achievements')}>{t('All')}</button></div>
          <div className="stat"><span className="value">{snapshot.achievements.length}</span><span className="hint">{t('earned')}</span></div>
          <div className="small muted" style={{ marginTop: 6 }}>{t('Achievements are a bonus. Real learning is measured by the skills next to this.')}</div>
        </div>
      </div>
    </div>
  );
}

function countThisWeek(lessons: { completedAt: string | null }[]) {
  const weekAgo = Date.now() - 7 * 86_400_000;
  return lessons.filter((l) => l.completedAt && new Date(l.completedAt).getTime() > weekAgo).length;
}

/** Only observations backed by real data are shown. */
function Insights({ strongest, completedThisWeek }: { strongest: string | null; completedThisWeek: number }) {
  const items: string[] = [];
  if (completedThisWeek > 0) items.push(tn(completedThisWeek, 'You finished {n} lesson this week.', 'You finished {n} lessons this week.'));
  if (strongest) items.push(t('You are strongest in {topic}.', { topic: strongest.toLowerCase() }));
  if (!items.length) return <div className="small muted">{t('Observations appear here once there is enough data. We never show made-up statistics.')}</div>;
  return <ul className="insights">{items.map((i) => <li key={i}>{i}</li>)}</ul>;
}
