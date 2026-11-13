import { create } from 'zustand';
import { call } from './api';
import { ACHIEVEMENT_BY_ID } from '@shared/achievements';
import { DEFAULT_SETTINGS, type Award, type ProgressSnapshot, type Settings, type StudioState } from '@shared/types';

export type Page =
  | 'dashboard' | 'learn' | 'lesson' | 'playground' | 'practice' | 'studio' | 'projects' | 'tutor'
  | 'challenges' | 'knowledge' | 'stats' | 'achievements' | 'settings';

export interface Route {
  page: Page;
  params?: Record<string, string>;
}

export interface Toast {
  id: number;
  kind: 'info' | 'success' | 'achievement' | 'error';
  title: string;
  body?: string;
}

interface State {
  ready: boolean;
  settings: Settings;
  snapshot: ProgressSnapshot | null;
  route: Route;
  toasts: Toast[];
  studio: StudioState | null;
  refreshStudio(): Promise<void>;
  navigate(page: Page, params?: Record<string, string>): void;
  refresh(): Promise<void>;
  updateSettings(patch: Partial<Settings>): Promise<void>;
  toast(t: Omit<Toast, 'id'>): void;
  dismiss(id: number): void;
  showAwards(awards: Award[]): void;
}

let toastId = 0;

export const useApp = create<State>((set, get) => ({
  ready: false,
  settings: DEFAULT_SETTINGS,
  snapshot: null,
  route: { page: 'dashboard' },
  toasts: [],
  studio: null,
  async refreshStudio() {
    try {
      set({ studio: await call('studio:status') });
    } catch {
      /* bridge not ready yet */
    }
  },
  navigate(page, params) {
    set({ route: { page, params } });
    document.querySelector('.main')?.scrollTo({ top: 0 });
  },
  async refresh() {
    const snapshot = await call('progress:snapshot');
    set({ snapshot });
  },
  async updateSettings(patch) {
    const prev = get().settings;
    set({ settings: { ...prev, ...patch } }); // optimistic
    try {
      const settings = await call('settings:set', patch);
      set({ settings });
      if (patch.theme) void call('window:setTheme', patch.theme);
    } catch {
      set({ settings: prev });
      get().toast({ kind: 'error', title: 'Instelling niet opgeslagen', body: 'Probeer het opnieuw.' });
    }
  },
  toast(t) {
    const id = ++toastId;
    set({ toasts: [...get().toasts, { ...t, id }] });
    setTimeout(() => get().dismiss(id), t.kind === 'achievement' ? 6000 : 4000);
  },
  dismiss(id) {
    set({ toasts: get().toasts.filter((t) => t.id !== id) });
  },
  showAwards(awards) {
    const { showXp } = get().settings;
    for (const a of awards) {
      if (a.kind === 'achievement' && a.achievementId) {
        const def = ACHIEVEMENT_BY_ID.get(a.achievementId);
        get().toast({ kind: 'achievement', title: `Prestatie: ${def?.title ?? a.reason}`, body: def?.description });
      }
    }
    const xp = awards.filter((a) => a.kind === 'xp').reduce((s, a) => s + (a.amount ?? 0), 0);
    if (xp > 0 && showXp) get().toast({ kind: 'success', title: `+${xp} XP`, body: awards.filter((a) => a.kind === 'xp').map((a) => a.reason).join(' · ') });
    if (awards.length) void get().refresh();
  },
}));

export function applyAppearance(s: Settings) {
  const root = document.documentElement;
  root.dataset.theme = s.theme;
  root.dataset.accent = s.accent;
  root.dataset.motion = s.reducedMotion === 'system' ? '' : s.reducedMotion;
  document.body.style.zoom = String(s.uiScale); // interface scaling
}
