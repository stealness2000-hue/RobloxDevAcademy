import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Braces, Captions, ChevronLeft, ChevronRight, Loader2, Pause, Play, Volume2, VolumeX, X, Lightbulb, MonitorPlay, ListChecks } from 'lucide-react';
import { call } from '@/api';
import { useApp } from '@/store';
import { CodeView } from '@/components/ui';
import { sceneDurationMs, type MentorScene, type MentorScript } from '@shared/mentor';
import { LANGUAGE_BY_CODE } from '@shared/languages';
import type { Lesson } from '@/curriculum/types';
import { t } from '@/i18n';
import { builtinScript } from './script';

type Lang = 'luau' | 'cpp' | 'java';

function sceneText(s: MentorScene): string {
  if (s.kind === 'title') return `${s.title}. ${s.subtitle}`;
  if (s.kind === 'recap') return `${t('In short')}: ${s.points.join('. ')}`;
  if (s.kind === 'code' || s.kind === 'output') return s.say;
  return s.text;
}

/** A Windows voice for the student's language (e.g. "nl-NL" or "fr-FR"), if one is installed. */
function voiceFor(locale: string): SpeechSynthesisVoice | null {
  try {
    const voices = window.speechSynthesis?.getVoices() ?? [];
    const want = locale.toLowerCase();
    const base = want.split('-')[0];
    return voices.find((v) => v.lang?.toLowerCase() === want) ?? voices.find((v) => v.lang?.toLowerCase().startsWith(base)) ?? null;
  } catch {
    return null;
  }
}

/** Fills built-in output scenes by really running the preceding code; scenes that can't run are dropped. */
async function withRealOutput(script: MentorScript, language: Lang): Promise<MentorScript> {
  const scenes: MentorScene[] = [];
  let lastCode: string | null = null;
  for (const s of script.scenes) {
    if (s.kind === 'code') lastCode = s.code;
    if (s.kind === 'output' && s.lines.length === 0) {
      if (!lastCode) continue;
      try {
        // Not recorded as a student run (no statistics, no achievements).
        const r = language === 'luau' ? await call('luau:evalRun', lastCode) : await call('code:run', { language, code: lastCode, record: false });
        if (!r.ok || r.output.length === 0) continue;
        scenes.push({ ...s, lines: r.output.slice(0, 30).map((o) => o.text.slice(0, 299)) });
      } catch {
        /* toolchain missing: skip this scene */
      }
      continue;
    }
    scenes.push(s);
  }
  return { ...script, scenes };
}

/**
 * Explainer video for a lesson, generated from the lesson itself (works offline, no AI service):
 * typed code, highlighted lines, real program output, captions and an optional Windows voice-over.
 */
export function MentorPlayer({ lesson, language, onClose }: { lesson: Lesson; language: Lang; onClose: () => void }) {
  const settings = useApp((s) => s.settings);
  const locale = LANGUAGE_BY_CODE.get(settings.language)?.locale ?? 'en-US';
  const languageName = LANGUAGE_BY_CODE.get(settings.language)?.name ?? 'English';
  const [script, setScript] = useState<MentorScript | null>(null);
  const [loading, setLoading] = useState<string | null>(t('Preparing the video…'));
  const [index, setIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [voiceOn, setVoiceOn] = useState(true);
  const [captions, setCaptions] = useState(true);
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const speechDone = useRef(true);
  const raf = useRef(0);
  const last = useRef(0);

  const load = useCallback(async () => {
    setPlaying(false);
    window.speechSynthesis?.cancel();
    setLoading(t('Preparing the video…'));
    const s = await withRealOutput(builtinScript(lesson, language), language);
    setScript(s);
    setIndex(0);
    setElapsed(0);
    setLoading(null);
    setPlaying(true);
  }, [lesson, language]);

  useEffect(() => {
    void load();
    const pick = () => setVoice(voiceFor(locale));
    pick();
    window.speechSynthesis?.addEventListener?.('voiceschanged', pick);
    return () => {
      window.speechSynthesis?.cancel();
      window.speechSynthesis?.removeEventListener?.('voiceschanged', pick);
      cancelAnimationFrame(raf.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scene = script?.scenes[index];
  const duration = useMemo(() => (scene ? sceneDurationMs(scene) : 1), [scene]);
  const speak = voiceOn && !!voice;

  // Voice-over for the current scene.
  useEffect(() => {
    if (!scene || !playing) return;
    window.speechSynthesis?.cancel();
    if (!speak) {
      speechDone.current = true;
      return;
    }
    speechDone.current = false;
    const u = new SpeechSynthesisUtterance(sceneText(scene));
    u.voice = voice;
    u.lang = voice!.lang;
    u.rate = speed;
    u.onend = () => {
      speechDone.current = true;
    };
    window.speechSynthesis.speak(u);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, playing, speak, scene]);

  // Clock: advances while playing; with voice-over, a scene also waits until the voice has finished.
  useEffect(() => {
    if (!playing || !script) return;
    last.current = performance.now();
    const tick = (now: number) => {
      const dt = (now - last.current) * speed;
      last.current = now;
      setElapsed((e) => {
        const next = e + dt;
        const typingDone = !(scene?.kind === 'code' && scene.typing) || next >= Math.min(6000, (scene?.kind === 'code' ? scene.code.length : 0) * 28);
        const finished = speak ? speechDone.current && typingDone && next > 1200 : next >= duration;
        if (finished) {
          if (index < script.scenes.length - 1) {
            setIndex((i) => i + 1);
            return 0;
          }
          setPlaying(false);
          return next;
        }
        return next;
      });
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [playing, script, index, duration, speed, speak, scene]);

  const go = (i: number) => {
    if (!script) return;
    window.speechSynthesis?.cancel();
    setIndex(Math.max(0, Math.min(script.scenes.length - 1, i)));
    setElapsed(0);
  };
  const toggle = () => {
    if (!script) return;
    if (!playing && index === script.scenes.length - 1 && elapsed >= duration) go(0);
    if (playing) window.speechSynthesis?.cancel();
    setPlaying((p) => !p);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        toggle();
      } else if (e.key === 'ArrowRight') go(index + 1);
      else if (e.key === 'ArrowLeft') go(index - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const typed = scene?.kind === 'code' ? (scene.typing ? scene.code.slice(0, Math.floor(elapsed / 28)) : scene.code) : '';
  const progress = script ? (index + Math.min(1, elapsed / duration)) / script.scenes.length : 0;

  return (
    <div className="overlay mentor-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="mentor" role="dialog" aria-modal="true" aria-label={t('Explainer video: {title}', { title: lesson.title })}>
        <div className="mentor-top">
          <div className="mentor-avatar" aria-hidden><Braces size={16} /></div>
          <div className="grow">
            <strong>{t('Video explanation')}</strong>
            <div className="small muted">{lesson.title}</div>
          </div>
          {script && <span className="badge">{t('Made from this lesson')}</span>}
          <button className="btn ghost sm icon" onClick={onClose} aria-label={t('Close')}><X size={16} /></button>
        </div>

        <div className="mentor-stage" onClick={toggle}>
          {loading || !scene ? (
            <div className="mentor-loading"><Loader2 size={26} className="spin" /><span>{loading}</span></div>
          ) : (
            <div className={`mentor-scene s-${scene.kind}`} key={index}>
              {scene.kind === 'title' && (
                <div className="ms-title">
                  <div className="ms-chip">{language === 'luau' ? 'Roblox Luau' : language === 'cpp' ? 'C++' : 'Java'}</div>
                  <h2>{scene.title}</h2>
                  <p>{scene.subtitle}</p>
                </div>
              )}
              {scene.kind === 'say' && <div className="ms-say"><div className="mentor-avatar big" aria-hidden><Braces size={28} /></div><p>{scene.text}</p></div>}
              {scene.kind === 'tip' && <div className="ms-tip"><Lightbulb size={28} /><p>{scene.text}</p></div>}
              {scene.kind === 'code' && (
                <div className="ms-code">
                  <CodeView code={typed + (scene.typing && typed.length < scene.code.length ? '▍' : '')} highlightLines={typed.length >= scene.code.length || !scene.typing ? scene.highlight : []} language={language} />
                </div>
              )}
              {scene.kind === 'output' && (
                <div className="ms-output">
                  <div className="output-head"><MonitorPlay size={14} /> Output</div>
                  <div className="console">{scene.lines.map((l, i) => <div key={i} className="line" style={{ animationDelay: `${i * 120}ms` }}>{l}</div>)}</div>
                </div>
              )}
              {scene.kind === 'recap' && (
                <div className="ms-recap">
                  <div className="row" style={{ gap: 8 }}><ListChecks size={20} /><h2>{t('In short')}</h2></div>
                  <ul>{scene.points.map((p, i) => <li key={i} style={{ animationDelay: `${i * 180}ms` }}>{p}</li>)}</ul>
                </div>
              )}
              {!playing && <div className="ms-paused"><Play size={34} /></div>}
            </div>
          )}
          {captions && scene && !loading && scene.kind !== 'title' && scene.kind !== 'recap' && (
            <div className="mentor-captions">{sceneText(scene)}</div>
          )}
        </div>

        <div className="mentor-controls">
          <button className="btn ghost icon" onClick={toggle} aria-label={playing ? t('Pause') : t('Play')} disabled={!script}>{playing ? <Pause size={17} /> : <Play size={17} />}</button>
          <button className="btn ghost icon" onClick={() => go(index - 1)} aria-label={t('Previous scene')} disabled={!script}><ChevronLeft size={17} /></button>
          <button className="btn ghost icon" onClick={() => go(index + 1)} aria-label={t('Next scene')} disabled={!script}><ChevronRight size={17} /></button>
          <div className="mentor-timeline" role="slider" aria-label={t('Timeline')} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}>
            <div className="fill" style={{ width: `${progress * 100}%` }} />
            {script?.scenes.map((_, i) => (
              <button key={i} className={`seg ${i === index ? 'on' : ''}`} style={{ left: `${(i / script.scenes.length) * 100}%`, width: `${100 / script.scenes.length}%` }} onClick={() => go(i)} aria-label={t('Go to scene {n}', { n: i + 1 })} />
            ))}
          </div>
          <span className="small mono faint">{script ? `${index + 1}/${script.scenes.length}` : ''}</span>
          <select className="select" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} aria-label={t('Speed')}>
            {[0.75, 1, 1.25, 1.5].map((s) => <option key={s} value={s}>{s}×</option>)}
          </select>
          <button className="btn ghost icon" onClick={() => setCaptions((c) => !c)} aria-pressed={captions} aria-label={t('Captions')} title={t('Captions')}><Captions size={17} style={{ opacity: captions ? 1 : 0.45 }} /></button>
          <button className="btn ghost icon" onClick={() => setVoiceOn((v) => !v)} disabled={!voice} aria-pressed={speak} aria-label={t('Read aloud')} title={voice ? t('Read aloud') : t('No {language} voice found in Windows', { language: languageName })}>
            {speak ? <Volume2 size={17} /> : <VolumeX size={17} />}
          </button>
        </div>
        {!voice && (
          <div className="mentor-foot small faint">
            {t('Read aloud: Windows has no {language} voice. You can add one in Windows Settings → Time & language → Speech.', { language: languageName })}
          </div>
        )}
      </div>
    </div>
  );
}
