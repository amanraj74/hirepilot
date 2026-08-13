'use client';

// Root error boundary. Shows the actual error message + digest so we
// can debug server-side exceptions instead of staring at an opaque
// digest hash. The stack is omitted by default to avoid leaking
// internal paths to end-users; click "Show details" to inspect.

import { useState } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
          padding: '2rem',
          maxWidth: '720px',
          margin: '0 auto',
          color: '#0a0a0a',
          background: '#fafafa',
        }}
      >
        <div
          style={{
            background: '#fff',
            border: '1px solid #e5e5e5',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <h1 style={{ marginTop: 0, fontSize: '1.5rem' }}>Application error</h1>
          <p style={{ color: '#525252', marginBottom: '1rem' }}>
            A server-side exception prevented this page from rendering.
          </p>

          {error.message && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                marginBottom: '1rem',
                fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                fontSize: '0.875rem',
                color: '#991b1b',
                overflowX: 'auto',
              }}
            >
              <strong>Error:</strong> {error.message}
            </div>
          )}

          {error.digest && (
            <p
              style={{
                fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                fontSize: '0.75rem',
                color: '#737373',
                marginBottom: '1rem',
              }}
            >
              <strong>Digest:</strong> {error.digest}
            </p>
          )}

          <details
            open={showDetails}
            onToggle={(e) => setShowDetails((e.target as HTMLDetailsElement).open)}
            style={{ marginBottom: '1rem' }}
          >
            <summary style={{ cursor: 'pointer', color: '#525252', fontSize: '0.875rem' }}>
              {showDetails ? 'Hide details' : 'Show details'}
            </summary>
            {error.stack && (
              <pre
                style={{
                  background: '#f5f5f5',
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  fontSize: '0.75rem',
                  overflowX: 'auto',
                  whiteSpace: 'pre-wrap',
                  marginTop: '0.5rem',
                }}
              >
                {error.stack}
              </pre>
            )}
          </details>

          <button
            type="button"
            onClick={() => reset()}
            style={{
              background: '#0a0a0a',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.625rem 1.25rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
