import { useState } from 'react';
import { ArrowLeft, ArrowRight, Code2 } from 'lucide-react';
import { call } from '@/api';
import { useApp } from '@/store';
import type { Experience, GoalGenre } from '@shared/types';
import { APP_TAGLINE } from '@shared/brand';
import { t } from '@/i18n';
import { LanguagePicker } from '@/components/LanguagePicker';

const EXPERIENCE: { value: Experience; label: string }[] = [
  { value: 'none', label: 'Nothing at all' },
  { value: 'edited', label: 'I once changed a script' },
  { value: 'basics', label: 'I understand a few basic ideas' },
  { value: 'some', label: 'I can already script a little' },
];
const GOALS: { value: GoalGenre; label: string }[] = [
  { value: 'simulator', label: 'Simulator' }, { value: 'tycoon', label: 'Tycoon' }, { value: 'obby', label: 'Obby' },
  { value: 'multiplayer', label: 'Multiplayer game' }, { value: 'adventure', label: 'Adventure game' }, { value: 'ui', label: 'UI systems' },
  { value: 'various', label: 'Different kinds of games' }, { value: 'unknown', label: "I don't know yet" },
];
const MINUTES = [10, 15, 20, 30];

export function Onboarding() {
  const [screen, setScreen] = useState(0);
  const [experience, setExperience] = useState<Experience>('none');
  const [goal, setGoal] = useState<GoalGenre>('unknown');
  const [minutes, setMinutes] = useState(15);
  const [custom, setCustom] = useState('');
  const [saving, setSaving] = useState(false);
  const { refresh, navigate, settings, updateSettings } = useApp();

  const dailyGoal = custom ? Math.max(5, Math.min(240, Number(custom) || 15)) : minutes;

  async function finish() {
    setSaving(true);
    await call('profile:completeOnboarding', { experience, goal, dailyGoalMinutes: dailyGoal });
    await useApp.getState().updateSettings({ dailyGoalMinutes: dailyGoal });
    await refresh();
    navigate('lesson', { id: 'c0-what-is-code' });
  }

  const steps = 5;
  return (
    <div className="onboarding">
      <div className="ob-card" key={screen}>
        <div className="ob-progress" aria-hidden>{Array.from({ length: steps }, (_, i) => <span key={i} className={i <= screen ? 'on' : ''} />)}</div>

        {screen === 0 && (
          <div className="ob-body">
            <div className="ob-mark"><Code2 size={22} /></div>
            <h1 className="ob-title">{t(APP_TAGLINE)}</h1>
            <p className="ob-text">{t("You don't need to know anything about code yet. We teach you step by step how to program your own Roblox games.")}</p>
            <div className="ob-language">
              <LanguagePicker value={settings.language} onChange={(code) => void updateSettings({ language: code })} />
            </div>
            <button className="btn primary lg" onClick={() => setScreen(1)} autoFocus>{t('Start learning')} <ArrowRight size={16} /></button>
          </div>
        )}

        {screen === 1 && (
          <div className="ob-body">
            <h1 className="ob-title">{t("How much do you already know about programming?")}</h1>
            <p className="ob-text">{t("There is no wrong answer. You always start with the basics; with experience you simply go through them faster.")}</p>
            <div className="col" role="radiogroup" aria-label={t('Experience')}>
              {EXPERIENCE.map((e) => (
                <button key={e.value} className="choice" role="radio" aria-checked={experience === e.value} onClick={() => setExperience(e.value)}>
                  <span className="radio" /> {t(e.label)}
                </button>
              ))}
            </div>
          </div>
        )}

        {screen === 2 && (
          <div className="ob-body">
            <h1 className="ob-title">{t("What do you want to make in the end?")}</h1>
            <p className="ob-text">{t("We use this for examples and projects. Everyone follows the basic lessons.")}</p>
            <div className="choice-grid" role="radiogroup" aria-label={t('Goal')}>
              {GOALS.map((g) => (
                <button key={g.value} className="choice" role="radio" aria-checked={goal === g.value} onClick={() => setGoal(g.value)}>
                  <span className="radio" /> {t(g.label)}
                </button>
              ))}
            </div>
          </div>
        )}

        {screen === 3 && (
          <div className="ob-body">
            <h1 className="ob-title">{t("How much time do you want to learn per day?")}</h1>
            <p className="ob-text">{t("This is a personal goal, not a duty. You can always change it in Settings.")}</p>
            <div className="choice-grid" role="radiogroup" aria-label={t('Daily goal')}>
              {MINUTES.map((m) => (
                <button key={m} className="choice" role="radio" aria-checked={!custom && minutes === m} onClick={() => { setMinutes(m); setCustom(''); }}>
                  <span className="radio" /> {t('{n} minutes', { n: m })}
                </button>
              ))}
            </div>
            <label className="field" style={{ marginTop: 12 }}>
              <span>{t('Or choose yourself (minutes)')}</span>
              <input className="input" type="number" min={5} max={240} placeholder={t('For example 45')} value={custom} onChange={(e) => setCustom(e.target.value)} style={{ width: 180 }} />
            </label>
          </div>
        )}

        {screen === 4 && (
          <div className="ob-body">
            <h1 className="ob-title">{t("You start with lesson 1: What is code?")}</h1>
            <p className="ob-text">{t("A short lesson of about five minutes. Then, in lesson 2, you write your first real Luau script.")}</p>
            <ul className="ob-summary small muted">
              <li>{t('Experience')}: {t(EXPERIENCE.find((e) => e.value === experience)?.label ?? '')}</li>
              <li>{t('Goal')}: {t(GOALS.find((g) => g.value === goal)?.label ?? '')}</li>
              <li>{t('Daily goal')}: {t('{n} minutes', { n: dailyGoal })}</li>
            </ul>
            <button className="btn primary lg" onClick={finish} disabled={saving} autoFocus>{t('Start lesson 1')} <ArrowRight size={16} /></button>
          </div>
        )}

        {screen > 0 && screen < 4 && (
          <div className="ob-actions">
            <button className="btn ghost" onClick={() => setScreen(screen - 1)}><ArrowLeft size={15} /> {t('Back')}</button>
            <button className="btn primary" onClick={() => setScreen(screen + 1)}>{t('Next')} <ArrowRight size={15} /></button>
          </div>
        )}
        {screen === 4 && <div className="ob-actions"><button className="btn ghost" onClick={() => setScreen(3)}><ArrowLeft size={15} /> {t('Back')}</button></div>}
      </div>
    </div>
  );
}
