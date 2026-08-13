'use client';

// Monaco-based code editor for assessment questions. Used for CODE, SQL,
// and DEBUG question types. Light-mode styling, controlled value, fixed
// height (the surrounding card scrolls if the answer gets long). Loads
// Monaco from the CDN by default — `@monaco-editor/react` handles the
// loader and AMD bundle, so we don't need to ship the editor as part of
// our JS bundle.

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import type { OnMount } from '@monaco-editor/react';

const Editor = dynamic(() => import('@monaco-editor/react').then((m) => m.Editor), {
  ssr: false,
  loading: () => (
    <div className="space-y-2 rounded-md border border-border bg-card p-4">
      <Skeleton className="h-3 w-1/3" />
      <Skeleton className="h-3 w-2/3" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-3 w-3/4" />
    </div>
  ),
});

const LANGUAGE_MAP: Record<string, string> = {
  CODE: 'javascript',
  DEBUG: 'javascript',
  SQL: 'sql',
};

const LANGUAGE_LABEL: Record<string, string> = {
  CODE: 'JavaScript',
  DEBUG: 'JavaScript',
  SQL: 'SQL',
};

export function CodeEditor({
  questionType,
  language,
  value,
  onChange,
  starterCode,
  rows = 12,
}: {
  questionType: 'CODE' | 'SQL' | 'DEBUG';
  language?: string | null;
  value: string;
  onChange: (next: string) => void;
  starterCode?: string | null;
  rows?: number;
}) {
  const monacoLanguage =
    language && language.trim().length > 0 ? language : LANGUAGE_MAP[questionType];
  const showLabel = LANGUAGE_LABEL[questionType] ?? questionType;

  const handleMount: OnMount = (editor, monaco) => {
    // Disable the "no telemetry" nag; keep things tidy.
    editor.updateOptions({
      fontSize: 13,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      lineNumbers: 'on',
      renderLineHighlight: 'all',
      tabSize: 2,
      wordWrap: 'on',
      automaticLayout: true,
      readOnly: false,
    });
    monaco.editor.defineTheme('hirepilot-light', {
      base: 'vs',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#fafafa',
        'editorGutter.background': '#f4f4f5',
      },
    });
    monaco.editor.setTheme('hirepilot-light');
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium uppercase tracking-wider text-muted-foreground">
          {showLabel}
        </span>
        {starterCode && (
          <span className="text-muted-foreground">
            Starter code provided · {starterCode.split('\n').length} lines
          </span>
        )}
      </div>
      <div
        className="overflow-hidden rounded-md border border-border bg-card"
        style={{ height: `${rows * 22 + 16}px` }}
      >
        <Editor
          height="100%"
          language={monacoLanguage}
          value={value || starterCode || ''}
          theme="hirepilot-light"
          onMount={handleMount}
          onChange={(v) => onChange(v ?? '')}
          options={{
            fontSize: 13,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            tabSize: 2,
            wordWrap: 'on',
          }}
        />
      </div>
    </div>
  );
}
