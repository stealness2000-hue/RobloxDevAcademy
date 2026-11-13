import { useMemo } from 'react';
import { ArrowRight, Flame, Repeat, RotateCcw, Sparkles, Target, TrendingDown, Trophy } from 'lucide-react';
import { useApp } from '@/store';
import { ALL_LESSONS, LESSON_BY_ID, lessonNumber, nextLesson, COURSE_BY_ID } from '@/curriculum';
import { conceptName } from '@/curriculum/concepts';
import { practiceForConcept } from '@/curriculum/practice';
import { ProgressBar, Ring, formatDuration } from '@/components/ui';
import { levelFromXp } from '@shared/xp';
import { MASTERY_LABELS } from '@shared/mastery';

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
          <h1>{returning ? 'Welkom terug!' : 'Welkom bij de Academy'}</h1>
          <div className="sub">{returning ? 'Fijn dat je er weer bent. Hier ging je gebleven.' : 'Alles begint met één les.'}</div>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)' }}>
        <div className="card continue-card">
          {upNext ? (
            <>
              <div className="card-title">{last && !lastDone ? 'Je was bezig met' : 'Volgende les'}</div>
              <h2 style={{ marginTop: 6 }}>Les {lessonNumber(upNext.id)}: {upNext.title}</h2>
              <div className="small muted" style={{ marginTop: 2 }}>{COURSE_BY_ID.get(upNext.courseId)?.title} · ± {upNext.minutes} min</div>
              <p className="muted" style={{ marginTop: 10 }}>{upNext.objective}</p>
              <div className="row" style={{ marginTop: 16 }}>
                <button className="btn primary lg" onClick={() => navigate('lesson', { id: upNext.id })} autoFocus>
                  {snapshot.lessons.some((l) => l.lessonId === upNext.id) ? 'Ga verder' : 'Start les'} <ArrowRight size={16} />
                </button>
                {prevOfUpNext && completed.has(prevOfUpNext.id) && (
                  <button className="btn ghost" onClick={() => navigate('lesson', { id: prevOfUpNext.id })}><RotateCcw size={14} /> Herhaal vorige les</button>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="card-title">Alle beschikbare lessen afgerond</div>
              <h2 style={{ marginTop: 6 }}>Knap werk.</h2>
              <p className="muted" style={{ marginTop: 8 }}>De volgende cursussen worden nog geschreven. Oefen ondertussen in Oefenen en Uitdagingen, of probeer je eigen ideeën in de Speeltuin.</p>
              <div className="row" style={{ marginTop: 14 }}>
                <button className="btn primary" onClick={() => navigate('challenges')}>Naar uitdagingen</button>
                <button className="btn ghost" onClick={() => navigate('playground')}>Open de speeltuin</button>
              </div>
            </>
          )}
          <div className="divider" />
          <div className="row small muted"><span>{completed.size} van {totalLessons} lessen afgerond</span><span className="grow" /></div>
          <div style={{ marginTop: 6 }}><ProgressBar value={completed.size / totalLessons} /></div>
        </div>

        <div className="card">
          <div className="card-title">Vandaag</div>
          <div className="row" style={{ gap: 16, marginTop: 10 }}>
            <Ring value={snapshot.todaySeconds / goalSec} size={76} stroke={7}>
              <span className="mono small">{Math.min(100, Math.round((snapshot.todaySeconds / goalSec) * 100))}%</span>
            </Ring>
            <div className="col" style={{ gap: 2 }}>
              <span className="stat"><span className="value" style={{ fontSize: 20 }}>{formatDuration(snapshot.todaySeconds)}</span></span>
              <span className="small muted">van je doel van {settings.dailyGoalMinutes} min</span>
              <span className="small faint">Alleen actieve leertijd telt mee.</span>
            </div>
          </div>
          <div className="divider" />
          <div className="grid c2">
            <div className="stat">
              <span className="label row" style={{ gap: 5 }}><Flame size={13} /> Reeks</span>
              <span className="value" style={{ fontSize: 20 }}>{snapshot.streakDays} {snapshot.streakDays === 1 ? 'dag' : 'dagen'}</span>
            </div>
            {settings.showXp && (
              <div className="stat">
                <span className="label row" style={{ gap: 5 }}><Sparkles size={13} /> Level {level.level}</span>
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
                <strong>Je maakt nog regelmatig fouten met {conceptName(w.conceptId).toLowerCase()}.</strong>
                <div className="small muted">Wil je {Math.min(3, practiceForConcept(w.conceptId).length)} extra oefeningen doen? Fouten maken hoort bij leren.</div>
              </div>
              <button className="btn" onClick={() => navigate('practice', { concept: w.conceptId })}>Oefenen</button>
            </div>
          ))}
          {due.length > 0 && (
            <div className="card suggestion">
              <Repeat size={18} />
              <div className="grow">
                <strong>Tijd voor een korte herhaling.</strong>
                <div className="small muted">{due.slice(0, 3).map((d) => conceptName(d.conceptId)).join(', ')}{due.length > 3 ? ` en ${due.length - 3} meer` : ''}. Herhalen helpt je het te onthouden.</div>
              </div>
              <button className="btn" onClick={() => navigate('practice', { mode: 'review' })}>Herhalen</button>
            </div>
          )}
        </div>
      )}

      <div className="grid c3" style={{ marginTop: 14 }}>
        <div className="card">
          <div className="card-head"><Target size={16} /><h3>Vaardigheden</h3><button className="btn ghost sm" onClick={() => navigate('stats')}>Alles</button></div>
          {snapshot.mastery.length === 0 ? (
            <div className="small muted">Nog geen gegevens. Na je eerste oefeningen zie je hier per onderwerp hoe goed je het beheerst.</div>
          ) : (
            <div className="col" style={{ gap: 10 }}>
              {snapshot.mastery.slice(0, 5).map((m) => (
                <div key={m.conceptId}>
                  <div className="row small"><span className="grow">{conceptName(m.conceptId)}</span><span className="faint">{MASTERY_LABELS[m.level]}</span></div>
                  <ProgressBar value={m.score / 100} />
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="card">
          <div className="card-head"><Sparkles size={16} /><h3>Inzichten</h3></div>
          <Insights strongest={strongest ? conceptName(strongest.conceptId) : null} completedThisWeek={countThisWeek(snapshot.lessons)} />
        </div>
        <div className="card">
          <div className="card-head"><Trophy size={16} /><h3>Prestaties</h3><button className="btn ghost sm" onClick={() => navigate('achievements')}>Alles</button></div>
          <div className="stat"><span className="value">{snapshot.achievements.length}</span><span className="hint">behaald</span></div>
          <div className="small muted" style={{ marginTop: 6 }}>Prestaties zijn een extraatje. Echt leren meet je met de vaardigheden hiernaast.</div>
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
  if (completedThisWeek > 0) items.push(`Je hebt deze week ${completedThisWeek} ${completedThisWeek === 1 ? 'les' : 'lessen'} afgerond.`);
  if (strongest) items.push(`Je bent het sterkst in ${strongest.toLowerCase()}.`);
  if (!items.length) return <div className="small muted">Hier verschijnen observaties zodra er genoeg gegevens zijn. We tonen nooit verzonnen statistieken.</div>;
  return <ul className="insights">{items.map((i) => <li key={i}>{i}</li>)}</ul>;
}
