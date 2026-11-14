/**
 * Satisfying UI sounds, synthesized live with the Web Audio API (no audio files, works offline).
 * Every keystroke is slightly randomized in pitch and loudness so typing feels natural, not robotic.
 */
export type TypingProfile = 'off' | 'soft' | 'mechanical' | 'typewriter' | 'bubble';
export type KeyKind = 'key' | 'space' | 'enter' | 'backspace';

let ctx: AudioContext | null = null;
let noiseBuffer: AudioBuffer | null = null;
let lastKeyAt = 0;

function audio(): AudioContext | null {
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function noise(ac: AudioContext): AudioBuffer {
  if (noiseBuffer) return noiseBuffer;
  const len = Math.floor(ac.sampleRate * 0.2);
  noiseBuffer = ac.createBuffer(1, len, ac.sampleRate);
  const d = noiseBuffer.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  return noiseBuffer;
}

const jitter = (v: number, amount = 0.06) => v * (1 + (Math.random() * 2 - 1) * amount);

/** Short filtered noise burst: the "click" of a key. */
function burst(ac: AudioContext, out: AudioNode, opts: { type: BiquadFilterType; freq: number; q?: number; decay: number; gain: number; at?: number }) {
  const t = opts.at ?? ac.currentTime;
  const src = ac.createBufferSource();
  src.buffer = noise(ac);
  src.playbackRate.value = jitter(1, 0.1);
  const f = ac.createBiquadFilter();
  f.type = opts.type;
  f.frequency.value = jitter(opts.freq);
  f.Q.value = opts.q ?? 1;
  const g = ac.createGain();
  g.gain.setValueAtTime(opts.gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + opts.decay);
  src.connect(f).connect(g).connect(out);
  src.start(t, Math.random() * 0.1);
  src.stop(t + opts.decay + 0.02);
}

/** A tone with a quick exponential decay; optional pitch sweep. */
function tone(ac: AudioContext, out: AudioNode, opts: { freq: number; to?: number; type?: OscillatorType; decay: number; gain: number; at?: number; attack?: number }) {
  const t = opts.at ?? ac.currentTime;
  const o = ac.createOscillator();
  o.type = opts.type ?? 'sine';
  o.frequency.setValueAtTime(opts.freq, t);
  if (opts.to) o.frequency.exponentialRampToValueAtTime(opts.to, t + opts.decay * 0.8);
  const g = ac.createGain();
  const attack = opts.attack ?? 0.002;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(opts.gain, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + opts.decay);
  o.connect(g).connect(out);
  o.start(t);
  o.stop(t + attack + opts.decay + 0.02);
}

function master(ac: AudioContext, volume: number): GainNode {
  const g = ac.createGain();
  g.gain.value = Math.max(0, Math.min(1, volume));
  g.connect(ac.destination);
  return g;
}

export function playKey(profile: TypingProfile, kind: KeyKind, volume: number) {
  if (profile === 'off' || volume <= 0) return;
  const now = performance.now();
  if (now - lastKeyAt < 18) return; // key repeat / very fast bursts: don't stack sounds
  lastKeyAt = now;
  const ac = audio();
  if (!ac) return;
  const out = master(ac, volume);
  const low = kind === 'space' || kind === 'enter';
  const back = kind === 'backspace';

  switch (profile) {
    case 'soft':
      tone(ac, out, { freq: jitter(back ? 520 : low ? 420 : 760), decay: 0.035, gain: 0.18 });
      break;
    case 'mechanical': {
      // "thock": a muffled body thump plus a bright contact click
      tone(ac, out, { freq: jitter(low ? 95 : back ? 120 : 150), to: low ? 70 : 90, decay: low ? 0.07 : 0.045, gain: 0.5 });
      burst(ac, out, { type: 'bandpass', freq: back ? 1400 : low ? 1100 : 2200, q: 1.2, decay: 0.03, gain: 0.35 });
      break;
    }
    case 'typewriter':
      burst(ac, out, { type: 'highpass', freq: 2600, decay: 0.018, gain: 0.55 });
      tone(ac, out, { freq: jitter(180), decay: 0.03, gain: 0.25, type: 'triangle' });
      if (kind === 'enter') {
        tone(ac, out, { freq: 1568, decay: 0.7, gain: 0.22, at: ac.currentTime + 0.06, type: 'sine' });
        tone(ac, out, { freq: 3136, decay: 0.5, gain: 0.06, at: ac.currentTime + 0.06, type: 'sine' });
      }
      break;
    case 'bubble':
      tone(ac, out, { freq: jitter(back ? 500 : low ? 380 : 880, 0.12), to: back ? 260 : low ? 220 : 420, decay: 0.06, gain: 0.3 });
      break;
  }
}

/** A short rising arpeggio for a solved exercise. */
export function playSuccess(volume: number) {
  const ac = audio();
  if (!ac || volume <= 0) return;
  const out = master(ac, volume);
  const t = ac.currentTime;
  [1046.5, 1318.5, 1568].forEach((f, i) => {
    tone(ac, out, { freq: f, decay: 0.45, gain: 0.22, at: t + i * 0.07, type: 'triangle', attack: 0.006 });
    tone(ac, out, { freq: f * 2, decay: 0.25, gain: 0.04, at: t + i * 0.07, type: 'sine' });
  });
}

/** A gentle, non-punishing "not yet" sound. */
export function playNotYet(volume: number) {
  const ac = audio();
  if (!ac || volume <= 0) return;
  const out = master(ac, volume);
  const t = ac.currentTime;
  tone(ac, out, { freq: 392, decay: 0.18, gain: 0.16, at: t, type: 'triangle' });
  tone(ac, out, { freq: 330, decay: 0.25, gain: 0.14, at: t + 0.1, type: 'triangle' });
}

export function keyKind(e: { key?: string; keyCode?: number }): KeyKind | null {
  const k = e.key;
  if (k === ' ' || e.keyCode === 32) return 'space';
  if (k === 'Enter' || e.keyCode === 13) return 'enter';
  if (k === 'Backspace' || k === 'Delete' || e.keyCode === 8 || e.keyCode === 46) return 'backspace';
  if (k && k.length === 1) return 'key';
  if (e.keyCode === 9) return 'key'; // Tab
  return null; // arrows, modifiers etc. stay silent
}
