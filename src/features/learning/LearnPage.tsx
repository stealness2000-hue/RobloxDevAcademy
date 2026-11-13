import { useMemo, useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronRight, Circle, Clock, Lock, PlayCircle, Hammer } from 'lucide-react';
import { useApp } from '@/store';
import { COURSES, isUnlocked, lessonNumber } from '@/curriculum';
import { ProgressBar } from '@/components/ui';

export function LearnPage() {
  const { snapshot, navigate } = useApp();
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

  return (
    <div className="page">
      <div className="page-head">
        <div className="grow">
          <h1>Leren</h1>
          <div className="sub">Van "wat is code?" tot complete Roblox-games. Elke les bouwt voort op de vorige.</div>
        </div>
        <span className="small faint">{completed.size} van {totalWritten} beschikbare lessen afgerond</span>
      </div>

      <div className="col" style={{ gap: 10 }}>
        {COURSES.map((course) => {
          const done = course.lessons.filter((l) => completed.has(l.id)).length;
          const isOpen = open.has(course.id);
          const available = course.lessons.length > 0;
          return (
            <div key={course.id} className={`card flush course ${available ? '' : 'planned'}`}>
              <button className="course-head" onClick={() => toggle(course.id)} aria-expanded={isOpen}>
                <span className="course-num mono">{String(course.number).padStart(2, '0')}</span>
                <span className="grow">
                  <span className="row" style={{ gap: 8 }}>
                    <h2>{course.title}</h2>
                    <span className="badge">{course.level}</span>
                    {!available && <span className="badge warning"><Hammer size={11} /> In ontwikkeling</span>}
                    {available && done === course.lessons.length && <span className="badge success"><CheckCircle2 size={11} /> Afgerond</span>}
                  </span>
                  <span className="small muted">{course.description}</span>
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
                  {course.lessons.map((l) => {
                    const unlocked = isUnlocked(l.id, completed);
                    const isDone = completed.has(l.id);
                    return (
                      <button key={l.id} className="list-row" disabled={!unlocked} onClick={() => navigate('lesson', { id: l.id })} aria-label={`Les ${lessonNumber(l.id)}: ${l.title}${unlocked ? '' : ' (vergrendeld)'}`}>
                        <span className={`lesson-status ${isDone ? 'done' : started.has(l.id) ? 'started' : ''}`}>
                          {isDone ? <CheckCircle2 size={17} /> : !unlocked ? <Lock size={15} /> : started.has(l.id) ? <PlayCircle size={17} /> : <Circle size={17} />}
                        </span>
                        <span className="mono faint small" style={{ width: 26 }}>{lessonNumber(l.id)}</span>
                        <span className="grow">
                          <span style={{ color: unlocked ? 'var(--text)' : 'var(--text-3)' }}>{l.title}</span>
                          <span className="small faint" style={{ display: 'block' }}>{l.objective}</span>
                        </span>
                        <span className="small faint row" style={{ gap: 4 }}><Clock size={12} /> {l.minutes} min</span>
                      </button>
                    );
                  })}
                </div>
              )}
              {isOpen && !available && (
                <div className="planned-list">
                  <div className="small muted" style={{ marginBottom: 6 }}>Deze cursus wordt nog geschreven. Geplande onderwerpen:</div>
                  <ul>{course.planned.map((p) => <li key={p}>{p}</li>)}</ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
