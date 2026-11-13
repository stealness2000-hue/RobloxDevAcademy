import { useState } from 'react';
import { ArrowLeft, ArrowRight, Code2 } from 'lucide-react';
import { call } from '@/api';
import { useApp } from '@/store';
import type { Experience, GoalGenre } from '@shared/types';

const EXPERIENCE: { value: Experience; label: string }[] = [
  { value: 'none', label: 'Helemaal niets' },
  { value: 'edited', label: 'Ik heb ooit een script aangepast' },
  { value: 'basics', label: 'Ik begrijp een paar basisbegrippen' },
  { value: 'some', label: 'Ik kan al een beetje scripten' },
];
const GOALS: { value: GoalGenre; label: string }[] = [
  { value: 'simulator', label: 'Simulator' }, { value: 'tycoon', label: 'Tycoon' }, { value: 'obby', label: 'Obby' },
  { value: 'multiplayer', label: 'Multiplayer game' }, { value: 'adventure', label: 'Adventure game' }, { value: 'ui', label: 'UI-systemen' },
  { value: 'various', label: 'Verschillende soorten games' }, { value: 'unknown', label: 'Ik weet het nog niet' },
];
const MINUTES = [10, 15, 20, 30];

export function Onboarding() {
  const [screen, setScreen] = useState(0);
  const [experience, setExperience] = useState<Experience>('none');
  const [goal, setGoal] = useState<GoalGenre>('unknown');
  const [minutes, setMinutes] = useState(15);
  const [custom, setCustom] = useState('');
  const [saving, setSaving] = useState(false);
  const { refresh, navigate } = useApp();

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
            <h1 className="ob-title">Leer Roblox programmeren. Vanaf nul.</h1>
            <p className="ob-text">Je hoeft nog niets van code te weten. Wij leren je stap voor stap hoe je zelf Roblox-games programmeert.</p>
            <button className="btn primary lg" onClick={() => setScreen(1)} autoFocus>Begin met leren <ArrowRight size={16} /></button>
          </div>
        )}

        {screen === 1 && (
          <div className="ob-body">
            <h1 className="ob-title">Hoeveel weet je al van programmeren?</h1>
            <p className="ob-text">Er is geen fout antwoord. Je begint altijd bij de basis; met ervaring ga je er gewoon sneller doorheen.</p>
            <div className="col" role="radiogroup" aria-label="Ervaring">
              {EXPERIENCE.map((e) => (
                <button key={e.value} className="choice" role="radio" aria-checked={experience === e.value} onClick={() => setExperience(e.value)}>
                  <span className="radio" /> {e.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {screen === 2 && (
          <div className="ob-body">
            <h1 className="ob-title">Wat wil je uiteindelijk maken?</h1>
            <p className="ob-text">We gebruiken dit voor voorbeelden en projecten. De basislessen volgt iedereen.</p>
            <div className="choice-grid" role="radiogroup" aria-label="Doel">
              {GOALS.map((g) => (
                <button key={g.value} className="choice" role="radio" aria-checked={goal === g.value} onClick={() => setGoal(g.value)}>
                  <span className="radio" /> {g.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {screen === 3 && (
          <div className="ob-body">
            <h1 className="ob-title">Hoeveel tijd wil je per dag leren?</h1>
            <p className="ob-text">Dit is een persoonlijk doel, geen verplichting. Je kunt het altijd aanpassen in Instellingen.</p>
            <div className="choice-grid" role="radiogroup" aria-label="Dagelijks doel">
              {MINUTES.map((m) => (
                <button key={m} className="choice" role="radio" aria-checked={!custom && minutes === m} onClick={() => { setMinutes(m); setCustom(''); }}>
                  <span className="radio" /> {m} minuten
                </button>
              ))}
            </div>
            <label className="field" style={{ marginTop: 12 }}>
              <span>Of kies zelf (minuten)</span>
              <input className="input" type="number" min={5} max={240} placeholder="Bijvoorbeeld 45" value={custom} onChange={(e) => setCustom(e.target.value)} style={{ width: 180 }} />
            </label>
          </div>
        )}

        {screen === 4 && (
          <div className="ob-body">
            <h1 className="ob-title">Je begint bij les 1: Wat is code?</h1>
            <p className="ob-text">Een korte les van ongeveer vijf minuten. Daarna schrijf je in les 2 je eerste echte Luau-script.</p>
            <ul className="ob-summary small muted">
              <li>Ervaring: {EXPERIENCE.find((e) => e.value === experience)?.label}</li>
              <li>Doel: {GOALS.find((g) => g.value === goal)?.label}</li>
              <li>Dagelijks doel: {dailyGoal} minuten</li>
            </ul>
            <button className="btn primary lg" onClick={finish} disabled={saving} autoFocus>Start les 1 <ArrowRight size={16} /></button>
          </div>
        )}

        {screen > 0 && screen < 4 && (
          <div className="ob-actions">
            <button className="btn ghost" onClick={() => setScreen(screen - 1)}><ArrowLeft size={15} /> Terug</button>
            <button className="btn primary" onClick={() => setScreen(screen + 1)}>Volgende <ArrowRight size={15} /></button>
          </div>
        )}
        {screen === 4 && <div className="ob-actions"><button className="btn ghost" onClick={() => setScreen(3)}><ArrowLeft size={15} /> Terug</button></div>}
      </div>
    </div>
  );
}
