import { Fragment, useEffect, useRef, type ReactNode } from 'react';
import {
  ArrowLeftRight, Award, Box, Braces, Bug, CalendarCheck, FileCode2, Footprints, Gamepad2, GitBranch, LayoutPanelTop, Layers,
  ListChecks, Play, Repeat, Zap, Sparkles, CheckCircle2, Info, AlertTriangle, X,
} from 'lucide-react';
import { tokenize } from '@shared/luau-lexer';
import { useApp } from '@/store';
import { t as tr } from '@shared/i18n';

// ---------------------------------------------------------------- icons for achievements
const ACH_ICONS: Record<string, typeof Play> = {
  play: Play, footprints: Footprints, box: Box, bug: Bug, 'list-checks': ListChecks, 'file-code': FileCode2, 'calendar-check': CalendarCheck,
  layers: Layers, braces: Braces, 'git-branch': GitBranch, repeat: Repeat, zap: Zap, layout: LayoutPanelTop, 'arrow-left-right': ArrowLeftRight,
  gamepad: Gamepad2, award: Award,
};
export function AchievementIcon({ name, size = 20 }: { name: string; size?: number }) {
  const I = ACH_ICONS[name] ?? Award;
  return <I size={size} strokeWidth={1.75} />;
}

// ---------------------------------------------------------------- inline rich text
/**
 * Minimal, safe formatter for lesson text: **bold**, `code`, paragraphs, "- " bullet lists,
 * "1. " numbered lists and "> " callouts. Produces React nodes only (no innerHTML).
 */
export function inline(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const t = m[0];
    parts.push(t.startsWith('**') ? <strong key={k++}>{t.slice(2, -2)}</strong> : <code key={k++}>{t.slice(1, -1)}</code>);
    last = m.index + t.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

export function Prose({ text, className = '' }: { text: string; className?: string }) {
  const blocks = text.trim().split(/\n\s*\n/);
  return (
    <div className={`prose ${className}`}>
      {blocks.map((b, i) => {
        const lines = b.split('\n');
        if (lines.every((l) => /^\s*- /.test(l)))
          return <ul key={i}>{lines.map((l, j) => <li key={j}>{inline(l.replace(/^\s*- /, ''))}</li>)}</ul>;
        if (lines.every((l) => /^\s*\d+\. /.test(l)))
          return <ol key={i}>{lines.map((l, j) => <li key={j}>{inline(l.replace(/^\s*\d+\. /, ''))}</li>)}</ol>;
        if (lines.every((l) => l.startsWith('> '))) return <div key={i} className="callout">{inline(lines.map((l) => l.slice(2)).join(' '))}</div>;
        return <p key={i}>{lines.map((l, j) => <Fragment key={j}>{j > 0 && <br />}{inline(l)}</Fragment>)}</p>;
      })}
    </div>
  );
}

// ---------------------------------------------------------------- static code view with Luau highlighting
const BUILTINS = new Set(['print', 'warn', 'typeof', 'type', 'tostring', 'tonumber', 'math', 'string', 'table', 'task', 'pairs', 'ipairs', 'game', 'workspace', 'script', 'Instance', 'Vector3', 'Color3', 'CFrame', 'UDim2', 'Enum', 'pcall', 'error', 'require']);

const CLIKE_KEYWORDS = new Set(['int', 'double', 'float', 'bool', 'boolean', 'char', 'void', 'long', 'auto', 'const', 'return', 'if', 'else', 'for', 'while', 'do', 'break', 'continue', 'true', 'false', 'class', 'public', 'private', 'static', 'new', 'null', 'nullptr', 'struct', 'using', 'namespace', 'include', 'switch', 'case', 'import', 'String']);

/** Small tokenizer for C++/Java highlighting in static code blocks (display only). */
function tokenizeClike(src: string): { type: string; value: string }[] {
  const re = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?)|(\d+(?:\.\d+)?)|(#\w+|[A-Za-z_]\w*)|(\s+)|([\s\S])/g;
  const out: { type: string; value: string }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    if (m[1]) out.push({ type: 'comment', value: m[1] });
    else if (m[2]) out.push({ type: 'string', value: m[2] });
    else if (m[3]) out.push({ type: 'number', value: m[3] });
    else if (m[4]) out.push({ type: m[4].startsWith('#') || CLIKE_KEYWORDS.has(m[4]) ? 'keyword' : 'name', value: m[4] });
    else if (m[5]) out.push({ type: 'whitespace', value: m[5] });
    else out.push({ type: 'symbol', value: m[6] });
  }
  return out;
}

export function CodeView({ code, highlightLines = [], errorLine, focusToken, className = '', language = 'luau' }: { code: string; highlightLines?: number[]; errorLine?: number; focusToken?: string; className?: string; language?: 'luau' | 'cpp' | 'java' }) {
  const tokens = language === 'luau' ? tokenize(code, { keepWhitespace: true }) : tokenizeClike(code);
  const lines: ReactNode[][] = [[]];
  let key = 0;
  for (const t of tokens) {
    const cls = t.type === 'name' && (BUILTINS.has(t.value) || (language !== 'luau' && /^(std|System|cout|endl|println|out|Math)$/.test(t.value))) ? 'tok-builtin' : `tok-${t.type}`;
    const pieces = t.value.split('\n');
    pieces.forEach((p, i) => {
      if (i > 0) lines.push([]);
      if (p) lines[lines.length - 1].push(<span key={key++} className={`${cls}${focusToken && t.value === focusToken ? ' tok-focus' : ''}`}>{p}</span>);
    });
  }
  return (
    <div className={`code-block selectable ${className}`}>
      <pre>
        {lines.map((l, i) => (
          <span key={i} className={`ln${highlightLines.includes(i + 1) ? ' hl' : ''}${errorLine === i + 1 ? ' err' : ''}`}>
            {l.length ? l : ' '}
            {'\n'}
          </span>
        ))}
      </pre>
    </div>
  );
}

// ---------------------------------------------------------------- small controls
export function ProgressBar({ value, tone }: { value: number; tone?: 'success' }) {
  return (
    <div className={`progress ${tone ?? ''}`} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value * 100)}>
      <span style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%` }} />
    </div>
  );
}

export function Ring({ value, size = 64, stroke = 6, children }: { value: number; size?: number; stroke?: number; children?: ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }} aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--active)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={v >= 1 ? 'var(--success)' : 'var(--accent)'} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - v)} style={{ transition: 'stroke-dashoffset var(--dur-slow) var(--ease)' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>{children}</div>
    </div>
  );
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return <button type="button" className="switch" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)} />;
}

export function Segmented<T extends string | number>({ value, options, onChange, label }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div className="segmented" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={String(o.value)} type="button" aria-pressed={o.value === value} onClick={() => onChange(o.value)}>{o.label}</button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------- modal / confirm
export function Modal({ title, children, onClose, actions }: { title: string; children: ReactNode; onClose: () => void; actions: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.querySelector<HTMLElement>('button, input, select, textarea')?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      prev?.focus?.();
    };
  }, [onClose]);
  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title} ref={ref}>
        <h2>{title}</h2>
        <div className="muted">{children}</div>
        <div className="actions">{actions}</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- toasts
export function Toasts() {
  const toasts = useApp((s) => s.toasts);
  const dismiss = useApp((s) => s.dismiss);
  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.slice(-4).map((t) => (
        <div key={t.id} className={`toast ${t.kind}`}>
          <span className="t-icon">
            {t.kind === 'achievement' ? <Sparkles size={18} /> : t.kind === 'success' ? <CheckCircle2 size={18} /> : t.kind === 'error' ? <AlertTriangle size={18} /> : <Info size={18} />}
          </span>
          <div className="grow">
            <div className="t-title">{t.title}</div>
            {t.body && <div className="t-body">{t.body}</div>}
          </div>
          <button className="btn ghost sm icon" aria-label={tr('Close')} onClick={() => dismiss(t.id)}><X size={14} /></button>
        </div>
      ))}
    </div>
  );
}

export function formatDuration(seconds: number): string {
  if (seconds > 0 && seconds < 60) return '< 1 min';
  const m = Math.round(seconds / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  return tr('{h} h {m} min', { h, m: m % 60 });
}
