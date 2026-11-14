import { useApp } from '@/store';
import { ACHIEVEMENTS } from '@shared/achievements';
import { LANGUAGE_BY_CODE } from '@shared/languages';
import { AchievementIcon, ProgressBar } from '@/components/ui';
import { levelFromXp } from '@shared/xp';
import { t } from '@/i18n';

export function AchievementsPage() {
  const snapshot = useApp((s) => s.snapshot);
  const showXp = useApp((s) => s.settings.showXp);
  const locale = LANGUAGE_BY_CODE.get(useApp((s) => s.settings.language))?.locale ?? 'en-US';
  const earned = new Map(snapshot?.achievements.map((a) => [a.id, a.earnedAt]));
  const level = levelFromXp(snapshot?.xp ?? 0);
  return (
    <div className="page">
      <div className="page-head">
        <div className="grow"><h1>{t('Achievements')}</h1><div className="sub">{t('A small reward for real milestones. {done} of {total} earned.', { done: earned.size, total: ACHIEVEMENTS.length })}</div></div>
      </div>
      {showXp && (
        <div className="card row" style={{ gap: 20, marginBottom: 14 }}>
          <div className="stat"><span className="label">Level</span><span className="value">{level.level}</span></div>
          <div className="grow">
            <div className="row small"><span className="grow">{snapshot?.xp ?? 0} XP</span><span className="faint">{t('{xp} XP to go until level {n}', { xp: level.xpForNext - level.xpIntoLevel, n: level.level + 1 })}</span></div>
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
                <strong>{t(a.title)}</strong>
                <div className="small muted">{t(a.description)}</div>
                <div className="small faint" style={{ marginTop: 4 }}>{at ? t('Earned on {date}', { date: new Date(at).toLocaleDateString(locale) }) : t('Not earned yet')}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
