import { Component, lazy, Suspense, useEffect, type ReactNode } from 'react';
import { backgroundStyle } from './background';
import {
  BarChart3, BookOpen, Bot, Code2, Dumbbell, FolderKanban, GraduationCap, LayoutDashboard, Monitor, Settings as SettingsIcon, Swords, Trophy, Flame, Sparkles, Braces,
} from 'lucide-react';
import { useApp, applyAppearance, type Page } from '@/store';
import { call, onNotice, ping } from '@/api';
import { Toasts } from '@/components/ui';
import { levelFromXp } from '@shared/xp';
import { Onboarding } from '@/features/onboarding/Onboarding';
import { Dashboard } from '@/features/dashboard/Dashboard';
import { LearnPage } from '@/features/learning/LearnPage';
import { LessonPlayer } from '@/features/learning/LessonPlayer';
import { PracticePage } from '@/features/practice/PracticePage';
import { AchievementsPage } from '@/features/achievements/AchievementsPage';
import { SettingsPage } from '@/features/settings/SettingsPage';
import { StudioPage } from '@/features/studio/StudioPage';
import { LESSON_BY_ID } from '@/curriculum';

const Playground = lazy(() => import('@/features/playground/Playground').then((m) => ({ default: m.Playground })));
const StatsPage = lazy(() => import('@/features/stats/StatsPage').then((m) => ({ default: m.StatsPage })));
const KnowledgePage = lazy(() => import('@/features/knowledge/KnowledgePage').then((m) => ({ default: m.KnowledgePage })));
const TutorPage = lazy(() => import('@/features/tutor/TutorPage').then((m) => ({ default: m.TutorPage })));
const ProjectsPage = lazy(() => import('@/features/projects/ProjectsPage').then((m) => ({ default: m.ProjectsPage })));

const NAV: { group: string; items: { page: Page; label: string; icon: typeof LayoutDashboard }[] }[] = [
  { group: 'Leren', items: [
    { page: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { page: 'learn', label: 'Leren', icon: GraduationCap },
    { page: 'playground', label: 'Code Playground', icon: Code2 },
    { page: 'practice', label: 'Oefenen', icon: Dumbbell },
  ] },
  { group: 'Bouwen', items: [
    { page: 'studio', label: 'Roblox Studio', icon: Monitor },
    { page: 'projects', label: 'Projecten', icon: FolderKanban },
    { page: 'tutor', label: 'AI Tutor', icon: Bot },
    { page: 'challenges', label: 'Uitdagingen', icon: Swords },
  ] },
  { group: 'Naslag', items: [
    { page: 'knowledge', label: 'Kennisbank', icon: BookOpen },
    { page: 'stats', label: 'Statistieken', icon: BarChart3 },
    { page: 'achievements', label: 'Prestaties', icon: Trophy },
  ] },
];

const TITLES: Record<Page, string> = {
  dashboard: 'Dashboard', learn: 'Leren', lesson: 'Les', playground: 'Code Playground', practice: 'Oefenen', studio: 'Roblox Studio', projects: 'Projecten',
  tutor: 'AI Tutor', challenges: 'Uitdagingen', knowledge: 'Kennisbank', stats: 'Statistieken', achievements: 'Prestaties', settings: 'Instellingen',
};

class ErrorBoundary extends Component<{ children: ReactNode; resetKey: string }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidUpdate(prev: { resetKey: string }) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null });
  }
  render() {
    if (this.state.error) {
      return (
        <div className="page"><div className="card empty">
          <strong>Dit scherm liep vast.</strong>
          <span className="small">Je voortgang is veilig opgeslagen. Kies een ander onderdeel in de zijbalk of probeer het opnieuw.</span>
          <pre className="mono small faint selectable" style={{ whiteSpace: 'pre-wrap' }}>{this.state.error.message}</pre>
          <button className="btn" onClick={() => this.setState({ error: null })}>Opnieuw proberen</button>
        </div></div>
      );
    }
    return this.props.children;
  }
}

export function App() {
  const { ready, route, navigate, snapshot, settings } = useApp();

  useEffect(() => {
    (async () => {
      const s = await call('settings:get');
      useApp.setState({ settings: s });
      applyAppearance(s);
      void call('window:setTheme', s.theme);
      await useApp.getState().refresh();
      void useApp.getState().refreshStudio();
      const status = await call('app:startupStatus');
      if (status.recoveredFromCorruption) {
        useApp.getState().toast({
          kind: 'error',
          title: 'Leergegevens hersteld',
          body: status.restoredBackup ? `Het databasebestand was beschadigd. De back-up ${status.restoredBackup} is teruggezet; het beschadigde bestand is bewaard.` : 'Het databasebestand was beschadigd en is apart bewaard. Er was geen back-up om terug te zetten.',
        });
      }
      useApp.setState({ ready: true });
    })().catch((e) => useApp.getState().toast({ kind: 'error', title: 'Opstarten mislukt', body: String(e?.message ?? e) }));

    const off = onNotice((n) => {
      if (n.type === 'awards') useApp.getState().showAwards(n.awards);
      if (n.type === 'studio') {
        const st = useApp.getState();
        void st.refreshStudio();
        if (n.verification) st.toast(n.verification.passed ? { kind: 'success', title: 'Gecontroleerd in Studio: alles klopt!' } : { kind: 'info', title: 'Studio-controle: nog niet alles klopt', body: 'Bekijk de feedback op de pagina Roblox Studio of in je les.' });
        if (n.pull) st.toast({ kind: n.pull.kind === 'conflict' ? 'error' : 'success', title: n.pull.kind === 'conflict' ? 'Conflict: script is op beide plekken veranderd' : `Script ontvangen uit Studio`, body: n.pull.path });
        if (n.pushResult) st.toast({ kind: n.pushResult.reason === 'applied' ? 'success' : 'info', title: n.pushResult.reason === 'applied' ? 'Script bijgewerkt in Studio' : n.pushResult.reason === 'conflict' ? 'Niet bijgewerkt: Studio-versie was veranderd' : 'Update niet toegepast in Studio', body: n.pushResult.path });
      }
      if (n.type === 'break') useApp.getState().toast({ kind: 'info', title: 'Even pauze?', body: `Je bent ${n.minutes} minuten actief bezig. Even opstaan en wat drinken helpt je concentratie.` });
    });
    const activity = () => ping();
    const evs = ['keydown', 'mousedown', 'wheel', 'mousemove'] as const;
    evs.forEach((e) => window.addEventListener(e, activity, { passive: true }));
    return () => {
      off();
      evs.forEach((e) => window.removeEventListener(e, activity));
    };
  }, []);

  useEffect(() => applyAppearance(settings), [settings]);

  if (!ready) return <div className="app"><div className="titlebar"><span className="brand"><span className="brand-mark"><Braces size={11} /></span>Roblox Dev Academy</span></div><div /></div>;
  const onboarded = !!snapshot?.profile?.onboardedAt;
  const level = levelFromXp(snapshot?.xp ?? 0);
  const activePage = route.page === 'lesson' ? 'learn' : route.page;
  const crumb = route.page === 'lesson' ? LESSON_BY_ID.get(route.params?.id ?? '')?.title : TITLES[route.page];

  return (
    <div className="app">
      <div className="titlebar">
        <span className="brand"><span className="brand-mark"><Braces size={11} /></span>Roblox Dev Academy</span>
        {onboarded && crumb && <><span className="crumb">/</span><span>{crumb}</span></>}
        <span className="spacer" />
        {onboarded && (
          <>
            <button className="tb-stat btn ghost sm" onClick={() => navigate('stats')} title="Leerreeks"><Flame size={13} /> {snapshot?.streakDays ?? 0}</button>
            {settings.showXp && <button className="tb-stat btn ghost sm" onClick={() => navigate('achievements')} title={`${snapshot?.xp ?? 0} XP`}><Sparkles size={13} /> Level {level.level}</button>}
          </>
        )}
      </div>
      {!onboarded ? (
        <Onboarding />
      ) : (
        <div className="body">
          <nav className="sidebar" aria-label="Hoofdmenu">
            {NAV.map((g) => (
              <div key={g.group}>
                <div className="group-label">{g.group}</div>
                {g.items.map((it) => (
                  <button key={it.page} className="nav-item" aria-current={activePage === it.page ? 'page' : undefined} onClick={() => navigate(it.page)}>
                    <it.icon size={16} strokeWidth={1.75} /> {it.label}
                  </button>
                ))}
              </div>
            ))}
            <div className="foot">
              <button className="nav-item" aria-current={activePage === 'settings' ? 'page' : undefined} onClick={() => navigate('settings')}>
                <SettingsIcon size={16} strokeWidth={1.75} /> Instellingen
              </button>
            </div>
          </nav>
          <div className="main-wrap">
          <div className={`app-bg bg-${settings.background}`} style={backgroundStyle(settings)} aria-hidden />
          <main className="main" id="main">
            <ErrorBoundary resetKey={`${route.page}:${route.params?.id ?? ''}`}>
              <Suspense fallback={<div className="page"><div className="skeleton" style={{ height: 220 }} /></div>}>
                <Route />
              </Suspense>
            </ErrorBoundary>
          </main>
          </div>
        </div>
      )}
      <Toasts />
    </div>
  );
}

function Route() {
  const route = useApp((s) => s.route);
  switch (route.page) {
    case 'dashboard': return <Dashboard />;
    case 'learn': return <LearnPage />;
    case 'lesson': return <LessonPlayer key={route.params?.id} lessonId={route.params?.id ?? ''} />;
    case 'playground': return <Playground />;
    case 'practice': return <PracticePage key={JSON.stringify(route.params ?? {})} />;
    case 'challenges': return <PracticePage key="challenges" challenges />;
    case 'studio': return <StudioPage />;
    case 'projects': return <ProjectsPage />;
    case 'tutor': return <TutorPage />;
    case 'knowledge': return <KnowledgePage />;
    case 'stats': return <StatsPage />;
    case 'achievements': return <AchievementsPage />;
    case 'settings': return <SettingsPage />;
  }
}
