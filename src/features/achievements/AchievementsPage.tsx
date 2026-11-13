import { useApp } from '@/store';
import { ACHIEVEMENTS } from '@shared/achievements';
import { AchievementIcon, ProgressBar } from '@/components/ui';
import { levelFromXp } from '@shared/xp';

export function AchievementsPage() {
  const snapshot = useApp((s) => s.snapshot);
  const showXp = useApp((s) => s.settings.showXp);
  const earned = new Map(snapshot?.achievements.map((a) => [a.id, a.earnedAt]));
  const level = levelFromXp(snapshot?.xp ?? 0);
  return (
    <div className="page">
      <div className="page-head">
        <div className="grow"><h1>Prestaties</h1><div className="sub">Een kleine beloning voor echte mijlpalen. {earned.size} van {ACHIEVEMENTS.length} behaald.</div></div>
      </div>
      {showXp && (
        <div className="card row" style={{ gap: 20, marginBottom: 14 }}>
          <div className="stat"><span className="label">Level</span><span className="value">{level.level}</span></div>
          <div className="grow">
            <div className="row small"><span className="grow">{snapshot?.xp ?? 0} XP</span><span className="faint">nog {level.xpForNext - level.xpIntoLevel} XP tot level {level.level + 1}</span></div>
            <div style={{ marginTop: 6 }}><ProgressBar value={level.progress} /></div>
          </div>
        </div>
      )}
      <div className="grid c3">
        {ACHIEVEMENTS.map((a) => {
          const at = earned.get(a.id);
          return (
            <div key={a.id} className={`card ach ${at ? 'earned' : ''}`}>
              <div className="ach-icon"><AchievementIcon name={a.icon} size={20} /></div>
              <div className="grow">
                <strong>{a.title}</strong>
                <div className="small muted">{a.description}</div>
                <div className="small faint" style={{ marginTop: 4 }}>{at ? `Behaald op ${new Date(at).toLocaleDateString('nl-NL')}` : 'Nog niet behaald'}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
