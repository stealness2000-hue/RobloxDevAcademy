import type { BrowserWindow } from 'electron';
import { screen } from 'electron';
import fs from 'node:fs';
import path from 'node:path';

interface WindowState {
  bounds: { x?: number; y?: number; width: number; height: number };
  maximized: boolean;
}

const DEFAULT: WindowState = { bounds: { width: 1360, height: 860 }, maximized: false };

export function loadWindowState(dir: string): WindowState {
  try {
    const s = JSON.parse(fs.readFileSync(path.join(dir, 'window-state.json'), 'utf8')) as WindowState;
    const { x, y, width, height } = s.bounds;
    if (typeof width !== 'number' || typeof height !== 'number') return DEFAULT;
    // Only restore the position when it is still visible on a connected display.
    if (typeof x === 'number' && typeof y === 'number') {
      const visible = screen.getAllDisplays().some((d) => {
        const a = d.workArea;
        return x + 100 > a.x && x < a.x + a.width - 100 && y >= a.y - 10 && y < a.y + a.height - 50;
      });
      if (!visible) return { bounds: { width, height }, maximized: !!s.maximized };
    }
    return { bounds: { x, y, width: Math.max(1024, width), height: Math.max(680, height) }, maximized: !!s.maximized };
  } catch {
    return DEFAULT;
  }
}

export function trackWindowState(win: BrowserWindow, dir: string) {
  let timer: NodeJS.Timeout | null = null;
  const save = () => {
    if (win.isDestroyed()) return;
    const state: WindowState = { bounds: win.isMaximized() ? win.getNormalBounds() : win.getBounds(), maximized: win.isMaximized() };
    try {
      fs.writeFileSync(path.join(dir, 'window-state.json'), JSON.stringify(state));
    } catch {
      /* non-critical */
    }
  };
  const schedule = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(save, 400);
  };
  win.on('resize', schedule);
  win.on('move', schedule);
  win.on('maximize', schedule);
  win.on('unmaximize', schedule);
  win.on('close', save);
}
