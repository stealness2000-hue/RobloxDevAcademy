import { useMemo, useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronRight, Circle, Clock, Lock, PlayCircle, Hammer, Crown } from 'lucide-react';
import { useApp } from '@/store';
import { COURSES, isFreeLesson, isUnlocked, lessonNumber, TRACK_LABEL, trackOfCourse } from '@/curriculum';
import { ProgressBar } from '@/components/ui';
import { t } from '@/i18n';
import { useTranslatedContent } from '@/i18n/content';
import { MachineBadge } from '@/components/MachineBadge';

export function LearnPage() {
  const { snapshot, navigate, license } = useApp();
  const completed = useMemo(() => new Set(snapshot?.lessons.filter((l) => l.status === 'completed').map((l) => l.lessonId)), [snapshot]);
  const started = useMemo(() => new Set(snapshot?.lessons.map((l) => l.lessonId)), [snapshot]);
  const firstOpen = COURSES.find((c) => c.lessons.some((l) => !completed.has(l.id)))?.id ?? 'course-0';
  const [open, setOpen] = useState<Set<string>>(new Set([firstOpen]));
  const toggle = (id: string) => setOpen((o) => {
    const n = new Set(o);
    if (n.has(id)) n.delete(id);
    else n.add(id);
    return n;
  });
  const totalWritten = COURSES.reduce((s, c) => s + c.lessons.length, 0);
  const unlockedAll = !!license?.unlocked;

  // Only the overview texts are translated here (not whole lessons).
  const summary = useMemo(() => COURSES.map((c) => ({
    title: c.title, description: c.description, planned: c.planned,
    lessons: c.lessons.map((l) => ({ title: l.title, objective: l.objective })),
  })), []);
  const tr = useTranslatedContent(summary, 'course-list');

  return (
    <div className="page">
      <div className="page-head">
        <div className="grow">
          <h1>{t('Courses')}</h1>
          <div className="sub">{t('From "what is code?" to complete Roblox games. Every lesson builds on the one before.')}</div>
        </div>
        <span className="small faint">{t('{done} of {total} available lessons finished', { done: completed.size, total: totalWritten })}</span>
      </div>
      {tr.machine && <MachineBadge loading={tr.loading} missing={tr.missing} />}

      {!unlockedAll && (
        <div className="card suggestion unlock-banner" style={{ marginBottom: 12 }}>
          <Crown size={18} />
          <div className="grow">
            <strong>{t('Courses 0 and 1 are free.')}</strong>
            <div className="small muted">{t('Unlock every course with a one-time purchase of {price}.', { price: license?.price ?? '$9.99' })}</div>
          </div>
          <button className="btn primary" onClick={() => navigate('settings', { section: 'license' })}>{t('Unlock full course')}</button>
        </div>
      )}

      <div className="col" style={{ gap: 10 }}>
        {COURSES.map((course, ci) => {
          const track = trackOfCourse(course);
          const newTrack = ci === 0 || trackOfCourse(COURSES[ci - 1]) !== track;
          const done = course.lessons.filter((l) => completed.has(l.id)).length;
          const isOpen = open.has(course.id);
          const available = course.lessons.length > 0;
          const text = tr.value[ci];
          const paid = available && !unlockedAll && !course.lessons.some((l) => isFreeLesson(l.id));
          return (
            <div key={course.id} style={{ display: 'contents' }}>
            {newTrack && (
              <div className="track-head">
                <h2>{TRACK_LABEL[track]}</h2>
                <span className="small muted">{track === 'luau' ? t('Learn to program Roblox games, from zero.') : track === 'cpp' ? t('The language of game engines. Works with a free compiler (g++).') : t('Known from Minecraft and Android. Works with the free JDK.')}</span>
              </div>
            )}
            <div className={`card flush course ${available ? '' : 'planned'}`}>
              <button className="course-head" onClick={() => toggle(course.id)} aria-expanded={isOpen}>
                <span className="course-num mono">{String(course.number).padStart(2, '0')}</span>
                <span className="grow">
                  <span className="row" style={{ gap: 8 }}>
                    <h2>{text.title}</h2>
                    <span className="badge">{t(course.level)}</span>
                    {!available && <span className="badge warning"><Hammer size={11} /> {t('In development')}</span>}
                    {paid && <span className="badge accent"><Crown size={11} /> {t('Full course')}</span>}
                    {available && done === course.lessons.length && <span className="badge success"><CheckCircle2 size={11} /> {t('Finished')}</span>}
                  </span>
                  <span className="small muted">{text.description}</span>
                </span>
                {available && (
                  <span className="course-progress">
                    <span className="small faint">{done}/{course.lessons.length}</span>
                    <ProgressBar value={done / course.lessons.length} tone={done === course.lessons.length ? 'success' : undefined} />
                  </span>
                )}
                {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              {isOpen && available && (
                <div className="lesson-list">
                  {course.lessons.map((l, li) => {
                    const unlocked = isUnlocked(l.id, completed);
                    const bought = unlockedAll || isFreeLesson(l.id);
                    const isDone = completed.has(l.id);
                    const lt = text.lessons[li];
                    return (
                      <button key={l.id} className="list-row" disabled={!unlocked} onClick={() => navigate('lesson', { id: l.id })}
                        aria-label={`${t('Lesson {n}: {title}', { n: lessonNumber(l.id), title: lt.title })}${unlocked ? '' : ` (${t('locked')})`}`}>
                        <span className={`lesson-status ${isDone ? 'done' : started.has(l.id) ? 'started' : ''}`}>
                          {isDone ? <CheckCircle2 size={17} /> : !unlocked ? <Lock size={15} /> : started.has(l.id) ? <PlayCircle size={17} /> : <Circle size={17} />}
                        </span>
                        <span className="mono faint small" style={{ width: 26 }}>{lessonNumber(l.id)}</span>
                        <span className="grow">
                          <span style={{ color: unlocked ? 'var(--text)' : 'var(--text-3)' }}>{lt.title}</span>
                          <span className="small faint" style={{ display: 'block' }}>{lt.objective}</span>
                        </span>
                        {!bought && <span className="badge accent" title={t('Part of the full course')}><Crown size={11} /></span>}
                        <span className="small faint row" style={{ gap: 4 }}><Clock size={12} /> {l.minutes} min</span>
                      </button>
                    );
                  })}
                </div>
              )}
              {isOpen && !available && (
                <div className="planned-list">
                  <div className="small muted" style={{ marginBottom: 6 }}>{t('This course is still being written. Planned topics:')}</div>
                  <ul>{text.planned.map((p) => <li key={p}>{p}</li>)}</ul>
                </div>
              )}
            </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
