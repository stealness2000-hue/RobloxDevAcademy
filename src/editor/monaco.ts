/**
 * Monaco setup: Luau language (tokenizer, brackets, indentation), themes, real analyzer diagnostics
 * and real Luau autocomplete (from the Luau analysis engine in the main process).
 */
import './monaco-features';
import 'monaco-editor/languages/definitions/cpp/register';
import 'monaco-editor/languages/definitions/java/register';
import * as monaco from 'monaco-editor/editor/editor.api';
import EditorWorker from 'monaco-editor/editor/editor.worker?worker';
import { call } from '@/api';

self.MonacoEnvironment = { getWorker: () => new EditorWorker() };

let registered = false;
let autocompleteEnabled = true;
export function setAutocompleteEnabled(v: boolean) {
  autocompleteEnabled = v;
}

export function setupMonaco() {
  if (registered) return monaco;
  registered = true;

  monaco.languages.register({ id: 'luau', extensions: ['.luau', '.lua'], aliases: ['Luau'] });
  monaco.languages.setLanguageConfiguration('luau', {
    comments: { lineComment: '--', blockComment: ['--[[', ']]'] },
    brackets: [['{', '}'], ['[', ']'], ['(', ')']],
    autoClosingPairs: [
      { open: '{', close: '}' }, { open: '[', close: ']' }, { open: '(', close: ')' },
      { open: '"', close: '"', notIn: ['string'] }, { open: "'", close: "'", notIn: ['string', 'comment'] }, { open: '`', close: '`', notIn: ['string'] },
    ],
    surroundingPairs: [{ open: '(', close: ')' }, { open: '"', close: '"' }, { open: "'", close: "'" }, { open: '{', close: '}' }],
    indentationRules: {
      increaseIndentPattern: /^((?!--).)*((\b(else|function|then|do|repeat)\b((?!\b(end|until)\b).)*)|(\{\s*))$/,
      decreaseIndentPattern: /^\s*((\b(elseif|else|end|until)\b)|(\})|(\)))/,
    },
    folding: { markers: { start: /^\s*--\s*#?region\b/, end: /^\s*--\s*#?endregion\b/ } },
    onEnterRules: [],
  });

  monaco.languages.setMonarchTokensProvider('luau', {
    defaultToken: '',
    keywords: ['and', 'break', 'do', 'else', 'elseif', 'end', 'false', 'for', 'function', 'if', 'in', 'local', 'nil', 'not', 'or', 'repeat', 'return', 'then', 'true', 'until', 'while', 'continue', 'export', 'type'],
    builtins: ['print', 'warn', 'typeof', 'type', 'tostring', 'tonumber', 'pairs', 'ipairs', 'select', 'error', 'pcall', 'xpcall', 'require', 'math', 'string', 'table', 'task', 'coroutine', 'bit32', 'utf8', 'buffer',
      'game', 'workspace', 'script', 'Instance', 'Vector3', 'Vector2', 'CFrame', 'Color3', 'BrickColor', 'UDim', 'UDim2', 'Enum', 'TweenInfo', 'Ray'],
    operators: ['+', '-', '*', '/', '//', '%', '^', '#', '==', '~=', '<=', '>=', '<', '>', '=', '+=', '-=', '*=', '/=', '..', '..=', '->', '::'],
    symbols: /[=><!~?:&|+\-*/^%#.]+/,
    tokenizer: {
      root: [
        [/--\[(=*)\[/, { token: 'comment', next: '@longcomment.$1' }],
        [/--.*$/, 'comment'],
        [/\[(=*)\[/, { token: 'string', next: '@longstring.$1' }],
        [/[a-zA-Z_]\w*/, { cases: { '@keywords': 'keyword', '@builtins': 'type.identifier', '@default': 'identifier' } }],
        [/[{}()[\]]/, '@brackets'],
        [/@symbols/, { cases: { '@operators': 'operator', '@default': '' } }],
        [/0[xX][0-9a-fA-F_]+/, 'number.hex'],
        [/0[bB][01_]+/, 'number'],
        [/\d[\d_]*(\.\d[\d_]*)?([eE][+-]?\d+)?/, 'number'],
        [/\.\d+([eE][+-]?\d+)?/, 'number'],
        [/"/, { token: 'string', next: '@dstring' }],
        [/'/, { token: 'string', next: '@sstring' }],
        [/`/, { token: 'string', next: '@istring' }],
        [/[;,.]/, 'delimiter'],
      ],
      longcomment: [[/\](=*)\]/, { cases: { '$1==$S2': { token: 'comment', next: '@pop' }, '@default': 'comment' } }], [/./, 'comment']],
      longstring: [[/\](=*)\]/, { cases: { '$1==$S2': { token: 'string', next: '@pop' }, '@default': 'string' } }], [/./, 'string']],
      dstring: [[/[^\\"]+$/, 'string', '@pop'], [/[^\\"]+/, 'string'], [/\\./, 'string.escape'], [/"/, 'string', '@pop']],
      sstring: [[/[^\\']+$/, 'string', '@pop'], [/[^\\']+/, 'string'], [/\\./, 'string.escape'], [/'/, 'string', '@pop']],
      istring: [[/\{/, { token: 'delimiter.bracket', next: '@interp' }], [/[^\\`{]+/, 'string'], [/\\./, 'string.escape'], [/`/, 'string', '@pop']],
      interp: [[/\}/, { token: 'delimiter.bracket', next: '@pop' }], { include: 'root' }],
    },
  } as monaco.languages.IMonarchLanguage);

  const common = (dark: boolean): monaco.editor.ITokenThemeRule[] => [
    { token: 'keyword', foreground: dark ? 'c792ea' : '8e3fc7' },
    { token: 'string', foreground: dark ? 'a5d6a7' : '2f7d32' },
    { token: 'string.escape', foreground: dark ? 'f7c97e' : 'b05a00' },
    { token: 'number', foreground: dark ? 'f7c97e' : 'b05a00' },
    { token: 'number.hex', foreground: dark ? 'f7c97e' : 'b05a00' },
    { token: 'comment', foreground: dark ? '637083' : '8b95a5', fontStyle: 'italic' },
    { token: 'type.identifier', foreground: dark ? '82aaff' : '2f5bd3' },
    { token: 'identifier', foreground: dark ? 'dfe6f3' : '1d2533' },
    { token: 'operator', foreground: dark ? '8fa0b8' : '5a6578' },
    { token: 'delimiter', foreground: dark ? '8fa0b8' : '5a6578' },
  ];
  monaco.editor.defineTheme('academy-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: common(true),
    colors: {
      'editor.background': '#0F141D', 'editor.foreground': '#DFE6F3', 'editorLineNumber.foreground': '#4A5568', 'editorLineNumber.activeForeground': '#929CAF',
      'editor.lineHighlightBackground': '#161D29', 'editor.selectionBackground': '#2A3A5E', 'editorCursor.foreground': '#7797FF',
      'editorIndentGuide.background1': '#1F2734', 'editorWidget.background': '#171E2A', 'editorWidget.border': '#2B3545',
      'editorSuggestWidget.background': '#171E2A', 'editorSuggestWidget.border': '#2B3545', 'editorSuggestWidget.selectedBackground': '#24304A',
      'editorBracketMatch.background': '#2A3A5E55', 'editorBracketMatch.border': '#527CFF88', 'scrollbarSlider.background': '#2B354580',
      'editorError.foreground': '#F16D79', 'editorWarning.foreground': '#E8B75A', 'focusBorder': '#527CFF',
    },
  });
  monaco.editor.defineTheme('academy-light', {
    base: 'vs',
    inherit: true,
    rules: common(false),
    colors: { 'editor.background': '#F8F9FC', 'editor.lineHighlightBackground': '#EEF1F6', 'editorLineNumber.foreground': '#A0A8B6', 'editorError.foreground': '#C93545', 'editorWarning.foreground': '#A86D00' },
  });

  // Real Luau autocomplete from the analysis engine (scope and type aware).
  const KIND: Record<string, monaco.languages.CompletionItemKind> = {
    property: monaco.languages.CompletionItemKind.Property,
    binding: monaco.languages.CompletionItemKind.Variable,
    keyword: monaco.languages.CompletionItemKind.Keyword,
    string: monaco.languages.CompletionItemKind.Value,
    type: monaco.languages.CompletionItemKind.Class,
    module: monaco.languages.CompletionItemKind.Module,
    generatedFunction: monaco.languages.CompletionItemKind.Function,
  };
  monaco.languages.registerCompletionItemProvider('luau', {
    triggerCharacters: ['.', ':'],
    async provideCompletionItems(model, position) {
      if (!autocompleteEnabled) return { suggestions: [] };
      const items = await call('luau:autocomplete', { code: model.getValue(), line: position.lineNumber - 1, column: position.column - 1 }).catch(() => []);
      const word = model.getWordUntilPosition(position);
      const range = new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn);
      return {
        suggestions: items.map((i) => ({
          label: i.label,
          kind: (i.detail && /->|\(/.test(i.detail) ? monaco.languages.CompletionItemKind.Function : KIND[i.kind]) ?? monaco.languages.CompletionItemKind.Text,
          detail: i.detail,
          insertText: i.insertText ?? i.label,
          tags: i.deprecated ? [monaco.languages.CompletionItemTag.Deprecated] : [],
          range,
        })),
      };
    },
  });

  return monaco;
}

export { monaco };
