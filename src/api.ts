import type { Channel, ChannelArgs, ChannelResults } from '@shared/ipc';
import type { Award } from '@shared/types';
import type { TranslatorStatus } from '@shared/ipc';
import { t } from '@shared/i18n';
import { APP_NAME } from '@shared/brand';

export type Notice =
  | { type: 'awards'; awards: Award[] }
  | { type: 'break'; minutes: number }
  | { type: 'translator'; status: TranslatorStatus };

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
  if (!window.academy) throw new Error(t('The app bridge is not available. Start {app} from the desktop app.', { app: APP_NAME }));
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
