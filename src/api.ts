import type { Channel, ChannelArgs, ChannelResults } from '@shared/ipc';
import type { Award } from '@shared/types';
import type { StudioVerification } from '@shared/studio';

export type Notice =
  | { type: 'awards'; awards: Award[] }
  | { type: 'break'; minutes: number }
  | { type: 'studio'; verification?: StudioVerification; pull?: { path: string; kind: string }; pushResult?: { path: string; reason: string } };

interface Bridge {
  invoke(channel: string, arg?: unknown): Promise<unknown>;
  ping(): void;
  onNotice(cb: (n: Notice) => void): () => void;
  platform: string;
}

declare global {
  interface Window {
    academy?: Bridge;
  }
}

function bridge(): Bridge {
  if (!window.academy) throw new Error('De app-brug is niet beschikbaar. Start Roblox Dev Academy via de desktop-app.');
  return window.academy;
}

export function call<K extends Channel>(channel: K, ...args: ChannelArgs[K] extends undefined ? [] : [ChannelArgs[K]]): Promise<ChannelResults[K]> {
  return bridge().invoke(channel, args[0]) as Promise<ChannelResults[K]>;
}

export const onNotice = (cb: (n: Notice) => void) => bridge().onNotice(cb);

let lastPing = 0;
/** Throttled activity signal for active study-time tracking. */
export function ping() {
  const now = Date.now();
  if (now - lastPing < 5000) return;
  lastPing = now;
  bridge().ping();
}
