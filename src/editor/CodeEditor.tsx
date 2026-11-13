import { useEffect, useImperativeHandle, useRef, forwardRef } from 'react';
import { setupMonaco, setAutocompleteEnabled, monaco } from './monaco';
import { call, ping } from '@/api';
import { useApp } from '@/store';
import { reindent } from '@shared/format';
import type { Diagnostic } from '@shared/types';
import { ROBLOX_GLOBALS } from '@shared/explain-error';

export interface CodeEditorHandle {
  format(): void;
  focus(): void;
  revealLine(line: number): void;
  getValue(): string;
}

interface Props {
  value: string;
  onChange?: (v: string) => void;
  onRun?: () => void;
  onSave?: () => void;
  onDiagnostics?: (d: Diagnostic[]) => void;
  /** A runtime error line to highlight (from the last run). */
  errorLine?: number | null;
  readOnly?: boolean;
  minLines?: number;
  maxLines?: number;
  /** fill: take the full height of the parent */
  fill?: boolean;
  ariaLabel?: string;
  /** For Roblox-engine code (projects, code review): don't flag game/workspace/Instance as unknown. */
  robloxCode?: boolean;
}

export const CodeEditor = forwardRef<CodeEditorHandle, Props>(function CodeEditor(
  { value, onChange, onRun, onSave, onDiagnostics, errorLine, readOnly, minLines = 4, maxLines = 18, fill, ariaLabel = 'Code-editor', robloxCode },
  ref,
) {
  const host = useRef<HTMLDivElement>(null);
  const editor = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const settings = useApp((s) => s.settings);
  const cbs = useRef({ onChange, onRun, onSave, onDiagnostics });
  cbs.current = { onChange, onRun, onSave, onDiagnostics };
  const decorations = useRef<monaco.editor.IEditorDecorationsCollection | null>(null);

  useEffect(() => {
    setupMonaco();
    const model = monaco.editor.createModel(value, 'luau');
    const ed = monaco.editor.create(host.current!, {
      model,
      theme: settings.theme === 'light' ? 'academy-light' : 'academy-dark',
      automaticLayout: true,
      fontFamily: settings.editorFont,
      fontSize: settings.editorFontSize,
      fontLigatures: false, // beginners must see exactly what to type (<= not ≤)
      tabSize: settings.editorTabSize,
      insertSpaces: true,
      lineNumbers: settings.editorLineNumbers ? 'on' : 'off',
      minimap: { enabled: settings.editorMinimap && !!fill },
      wordWrap: settings.editorWordWrap ? 'on' : 'off',
      scrollBeyondLastLine: false,
      renderLineHighlight: 'line',
      smoothScrolling: true,
      cursorBlinking: 'smooth',
      cursorSmoothCaretAnimation: 'on',
      bracketPairColorization: { enabled: true },
      guides: { indentation: true, bracketPairs: false },
      autoClosingBrackets: 'always',
      autoIndent: 'full',
      folding: true,
      padding: { top: 10, bottom: 10 },
      readOnly,
      ariaLabel,
      scrollbar: { alwaysConsumeMouseWheel: !!fill, verticalScrollbarSize: 10, horizontalScrollbarSize: 10 },
      overviewRulerLanes: fill ? 2 : 0,
      quickSuggestions: settings.editorAutocomplete ? { other: true, comments: false, strings: false } : false,
      suggestOnTriggerCharacters: settings.editorAutocomplete,
      fixedOverflowWidgets: true,
      stickyScroll: { enabled: false },
    });
    editor.current = ed;
    decorations.current = ed.createDecorationsCollection();

    ed.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => cbs.current.onRun?.());
    ed.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => cbs.current.onSave?.());
    ed.addCommand(monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF, () => formatNow());

    let checkTimer: ReturnType<typeof setTimeout> | undefined;
    const runCheck = () => {
      clearTimeout(checkTimer);
      checkTimer = setTimeout(async () => {
        const code = model.getValue();
        let diags = await call('luau:check', code).catch(() => [] as Diagnostic[]);
        if (robloxCode) diags = diags.filter((d) => { const m = /Unknown global '([^']+)'/.exec(d.message); return !(m && ROBLOX_GLOBALS.has(m[1])); });
        if (model.isDisposed() || model.getValue() !== code) return;
        monaco.editor.setModelMarkers(model, 'luau', diags.map((d) => ({
          severity: d.severity === 'error' ? monaco.MarkerSeverity.Error : monaco.MarkerSeverity.Warning,
          message: d.message,
          startLineNumber: d.line, startColumn: d.column, endLineNumber: d.endLine, endColumn: Math.max(d.endColumn, d.column + 1),
        })));
        cbs.current.onDiagnostics?.(diags);
      }, 450);
    };
    const sub = model.onDidChangeContent(() => {
      ping();
      cbs.current.onChange?.(model.getValue());
      runCheck();
    });
    runCheck();

    // Auto-height for inline (lesson) editors.
    const updateHeight = () => {
      if (fill || !host.current) return;
      const lh = ed.getOption(monaco.editor.EditorOption.lineHeight);
      const lines = Math.min(maxLines, Math.max(minLines, model.getLineCount()));
      host.current.style.height = `${lines * lh + 20}px`;
      ed.layout();
    };
    updateHeight();
    const sub2 = model.onDidChangeContent(updateHeight);

    return () => {
      clearTimeout(checkTimer);
      sub.dispose();
      sub2.dispose();
      ed.dispose();
      model.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function formatNow() {
    const ed = editor.current;
    if (!ed) return;
    const model = ed.getModel()!;
    const formatted = reindent(model.getValue(), ' '.repeat(settings.editorTabSize));
    if (formatted !== model.getValue()) ed.executeEdits('format', [{ range: model.getFullModelRange(), text: formatted }]);
  }

  // External value changes (reset, restore revision, switching files).
  useEffect(() => {
    const ed = editor.current;
    if (ed && ed.getValue() !== value) ed.getModel()!.pushEditOperations([], [{ range: ed.getModel()!.getFullModelRange(), text: value }], () => null);
  }, [value]);

  useEffect(() => {
    const ed = editor.current;
    if (!ed) return;
    monaco.editor.setTheme(settings.theme === 'light' ? 'academy-light' : 'academy-dark');
    ed.updateOptions({
      fontFamily: settings.editorFont, fontSize: settings.editorFontSize, tabSize: settings.editorTabSize,
      lineNumbers: settings.editorLineNumbers ? 'on' : 'off', minimap: { enabled: settings.editorMinimap && !!fill },
      wordWrap: settings.editorWordWrap ? 'on' : 'off', readOnly,
      quickSuggestions: settings.editorAutocomplete ? { other: true, comments: false, strings: false } : false,
    });
    setAutocompleteEnabled(settings.editorAutocomplete);
  }, [settings, readOnly, fill]);

  useEffect(() => {
    decorations.current?.set(
      errorLine ? [{ range: new monaco.Range(errorLine, 1, errorLine, 1), options: { isWholeLine: true, className: 'monaco-error-line', glyphMarginClassName: '' } }] : [],
    );
    if (errorLine) editor.current?.revealLineInCenterIfOutsideViewport(errorLine);
  }, [errorLine]);

  useImperativeHandle(ref, () => ({
    format: formatNow,
    focus: () => editor.current?.focus(),
    revealLine: (l: number) => {
      editor.current?.revealLineInCenter(l);
      editor.current?.setPosition({ lineNumber: l, column: 1 });
      editor.current?.focus();
    },
    getValue: () => editor.current?.getValue() ?? '',
  }));

  return <div ref={host} className={`editor-host${fill ? ' fill' : ''}`} />;
});
