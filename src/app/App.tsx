import { Component, lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import { backgroundStyle } from './background';
import {
  BarChart3, BookOpen, Code2, Dumbbell, FolderKanban, GraduationCap, LayoutDashboard, ScanSearch, Settings as SettingsIcon, Swords, Trophy, Flame, Sparkles, Braces,
} from 'lucide-react';
import { useApp, applyAppearance, type Page } from '@/store';
import { call, onNotice, ping } from '@/api';
import { Toasts } from '@/components/ui';
import { levelFromXp } from '@shared/xp';
import { APP_NAME } from '@shared/brand';
import { applyLanguage, t, type LanguageState } from '@/i18n';
import { Onboarding } from '@/features/onboarding/Onboarding';
import { Dashboard } from '@/features/dashboard/Dashboard';
import { LearnPage } from '@/features/learning/LearnPage';
import { LessonPlayer } from '@/features/learning/LessonPlayer';
import { PracticePage } from '@/features/practice/PracticePage';
import { AchievementsPage } from '@/features/achievements/AchievementsPage';
import { SettingsPage } from '@/features/settings/SettingsPage';
import { LESSON_BY_ID } from '@/curriculum';

const Playground = lazy(() => import('@/features/playground/Playground').then((m) => ({ default: m.Playground })));
const StatsPage = lazy(() => import('@/features/stats/StatsPage').then((m) => ({ default: m.StatsPage })));
const KnowledgePage = lazy(() => import('@/features/knowledge/KnowledgePage').then((m) => ({ default: m.KnowledgePage })));
const TutorPage = lazy(() => import('@/features/tutor/TutorPage').then((m) => ({ default: m.TutorPage })));
const ProjectsPage = lazy(() => import('@/features/projects/ProjectsPage').then((m) => ({ default: m.ProjectsPage })));

// Labels are English keys; they are translated when rendered.
const NAV: { group: string; items: { page: Page; label: string; icon: typeof LayoutDashboard }[] }[] = [
  { group: 'Learn', items: [
    { page: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { page: 'learn', label: 'Courses', icon: GraduationCap },
    { page: 'playground', label: 'Code Playground', icon: Code2 },
    { page: 'practice', label: 'Practice', icon: Dumbbell },
  ] },
  { group: 'Build', items: [
    { page: 'projects', label: 'Projects', icon: FolderKanban },
    { page: 'tutor', label: 'Code Explainer', icon: ScanSearch },
    { page: 'challenges', label: 'Challenges', icon: Swords },
  ] },
  { group: 'Reference', items: [
    { page: 'knowledge', label: 'Knowledge Base', icon: BookOpen },
    { page: 'stats', label: 'Statistics', icon: BarChart3 },
    { page: 'achievements', label: 'Achievements', icon: Trophy },
  ] },
];

const TITLES: Record<Page, string> = {
  dashboard: 'Dashboard', learn: 'Courses', lesson: 'Lesson', playground: 'Code Playground', practice: 'Practice', projects: 'Projects',
  tutor: 'Code Explainer', challenges: 'Challenges', knowledge: 'Knowledge Base', stats: 'Statistics', achievements: 'Achievements', settings: 'Settings',
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
          <strong>{t('This screen got stuck.')}</strong>
          <span className="small">{t('Your progress is safely saved. Pick another section in the sidebar or try again.')}</span>
          <pre className="mono small faint selectable" style={{ whiteSpace: 'pre-wrap' }}>{this.state.error.message}</pre>
          <button className="btn" onClick={() => this.setState({ error: null })}>{t('Try again')}</button>
        </div></div>
      );
    }
    return this.props.children;
  }
}

export function App() {
  const { ready, route, navigate, snapshot, settings } = useApp();
  // Bumped when the language changes or a machine translation of the interface finishes, so the
  // whole tree re-renders in the new language. (Not on every batch: that would reset open editors.)
  const [langVersion, setLangVersion] = useState(0);
  const langStatus = useApp((s) => s.langStatus);
  const appliedLanguage = useRef<string | null>(null);
  const onLanguageProgress = (st: LanguageState) => {
    useApp.setState({ langStatus: st });
    if (st.missing === 0) setLangVersion((v) => v + 1);
  };

  useEffect(() => {
    (async () => {
      const s = await call('settings:get');
      useApp.setState({ settings: s });
      applyAppearance(s);
      const translator = await call('mt:status').catch(() => null);
      useApp.setState({ translator });
      appliedLanguage.current = `${s.language}:${!!translator?.installed}`;
      useApp.setState({ langStatus: await applyLanguage(s.language, onLanguageProgress) });
      void call('window:setTheme', s.theme);
      await useApp.getState().refresh();
      void useApp.getState().refreshLicense();
      const status = await call('app:startupStatus');
      if (status.recoveredFromCorruption) {
        useApp.getState().toast({
          kind: 'error',
          title: t('Learning data restored'),
          body: status.restoredBackup
            ? t('The database file was damaged. The backup {file} was restored; the damaged file was kept.', { file: status.restoredBackup })
            : t('The database file was damaged and was kept separately. There was no backup to restore.'),
        });
      }
      useApp.setState({ ready: true });
    })().catch((e) => useApp.getState().toast({ kind: 'error', title: t('Starting up failed'), body: String(e?.message ?? e) }));

    const off = onNotice((n) => {
      if (n.type === 'awards') useApp.getState().showAwards(n.awards);
      if (n.type === 'translator') useApp.setState({ translator: n.status });
      if (n.type === 'break') useApp.getState().toast({ kind: 'info', title: t('Time for a break?'), body: t('You have been active for {n} minutes. Standing up and having a drink helps you focus.', { n: n.minutes }) });
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

  // Switching language later (onboarding or settings).
  const language = settings.language;
  const translatorInstalled = useApp((st) => !!st.translator?.installed);
  useEffect(() => {
    // Re-applied when the translator finishes downloading, so missing texts get translated.
    const key = `${language}:${translatorInstalled}`;
    if (!ready || appliedLanguage.current === key) return;
    appliedLanguage.current = key;
    void applyLanguage(language, onLanguageProgress).then((st) => {
      useApp.setState({ langStatus: st });
      setLangVersion((v) => v + 1);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, ready, translatorInstalled]);

  if (!ready) return <div className="app"><div className="titlebar"><span className="brand"><span className="brand-mark"><Braces size={11} /></span>{APP_NAME}</span></div><div /></div>;
  const onboarded = !!snapshot?.profile?.onboardedAt;
  const level = levelFromXp(snapshot?.xp ?? 0);
  const activePage = route.page === 'lesson' ? 'learn' : route.page;
  const crumb = route.page === 'lesson' ? LESSON_BY_ID.get(route.params?.id ?? '')?.title : t(TITLES[route.page]);

  return (
    <div className="app" key={`${language}:${langVersion}`}>
      <div className="titlebar">
        <span className="brand"><span className="brand-mark"><Braces size={11} /></span>{APP_NAME}</span>
        {onboarded && crumb && <><span className="crumb">/</span><span>{crumb}</span></>}
        <span className="spacer" />
        {langStatus.machine && langStatus.missing > 0 && (
          <button className="tb-stat btn ghost sm" onClick={() => navigate('settings', { section: 'language' })} title={t('Some texts are still in English')}>
            {useApp.getState().translator?.installed ? t('Translating… {n} left', { n: langStatus.missing }) : t('Download the translator')}
          </button>
        )}
        {onboarded && (
          <>
            <button className="tb-stat btn ghost sm" onClick={() => navigate('stats')} title={t('Learning streak')}><Flame size={13} /> {snapshot?.streakDays ?? 0}</button>
            {settings.showXp && <button className="tb-stat btn ghost sm" onClick={() => navigate('achievements')} title={`${snapshot?.xp ?? 0} XP`}><Sparkles size={13} /> {t('Level {n}', { n: level.level })}</button>}
          </>
        )}
      </div>
      {!onboarded ? (
        <Onboarding />
      ) : (
        <div className="body">
          <nav className="sidebar" aria-label={t('Main menu')}>
            {NAV.map((g) => (
              <div key={g.group}>
                <div className="group-label">{t(g.group)}</div>
                {g.items.map((it) => (
                  <button key={it.page} className="nav-item" aria-current={activePage === it.page ? 'page' : undefined} onClick={() => navigate(it.page)}>
                    <it.icon size={16} strokeWidth={1.75} /> {t(it.label)}
                  </button>
                ))}
              </div>
            ))}
            <div className="foot">
              <button className="nav-item" aria-current={activePage === 'settings' ? 'page' : undefined} onClick={() => navigate('settings')}>
                <SettingsIcon size={16} strokeWidth={1.75} /> {t('Settings')}
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
    case 'projects': return <ProjectsPage />;
    case 'tutor': return <TutorPage />;
    case 'knowledge': return <KnowledgePage />;
    case 'stats': return <StatsPage />;
    case 'achievements': return <AchievementsPage />;
    case 'settings': return <SettingsPage />;
  }
}
