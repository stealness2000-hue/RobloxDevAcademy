import type { CSSProperties } from 'react';

/** Inline style for the background layer: dim level and (optional) custom image served via app://. */
export function backgroundStyle(s: { background: string; backgroundDim: number; customBackground: string | null }): CSSProperties {
  const style: Record<string, string> = { '--bg-dim': String(s.backgroundDim) };
  if (s.background === 'custom' && s.customBackground) style.backgroundImage = `url("app://academy/user-content/${s.customBackground}")`;
  return style as CSSProperties;
}
