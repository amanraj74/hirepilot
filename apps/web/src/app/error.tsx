'use client';

// Root error boundary. Surfaces error.message and digest. Stack is
// collapsible so the default view is tidy in production.

import { useState } from 'react';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [open, setOpen] = useState(false);
  const message = error && typeof error.message === 'string' ? error.message : '';
  const digest = error && typeof error.digest === 'string' ? error.digest : '';

  return (
    <main className="mx-auto max-w-xl p-6 my-12">
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h1 className="text-2xl font-bold text-red-900">Application error</h1>
        <p className="mt-2 text-red-700">
          A server-side exception prevented this page from rendering.
        </p>

        {message && (
          <pre className="mt-4 whitespace-pre-wrap rounded-md border border-red-200 bg-white p-3 text-xs text-red-900">
            <strong>Error:</strong> {message}
          </pre>
        )}

        {digest && (
          <p className="mt-2 font-mono text-xs text-red-700">
            <strong>Digest:</strong> {digest}
          </p>
        )}

        <details
          open={open}
          onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
          className="mt-3"
        >
          <summary className="cursor-pointer text-sm text-red-700">
            {open ? 'Hide details' : 'Show details'}
          </summary>
          {error.stack && (
            <pre className="mt-2 whitespace-pre-wrap rounded-md bg-zinc-50 p-3 text-xs">
              {error.stack}
            </pre>
          )}
        </details>

        <button
          type="button"
          onClick={() => reset()}
          className="mt-4 rounded-md bg-red-900 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
