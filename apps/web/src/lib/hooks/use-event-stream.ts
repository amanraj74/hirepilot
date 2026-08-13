'use client';

// Subscribes to a server-sent-events stream and re-renders on each
// event. Used by the pipeline page to refresh the Kanban as soon as
// a stage changes anywhere in the company.
//
// Usage:
//   const { lastEvent } = useEventStream('/api/recruiter/pipeline/stream', {
//     onEvent: (e) => router.refresh(),
//   });

import { useEffect, useRef, useState } from 'react';

export type EventStreamOptions = {
  /** Called for every event the server sends. */
  onEvent?: (e: { type: string; data: unknown }) => void;
  /** Auto-reconnect on disconnect. Defaults to true. */
  reconnect?: boolean;
};

export function useEventStream(
  url: string,
  options: EventStreamOptions = {},
): { lastEvent: { type: string; data: unknown } | null; connected: boolean } {
  const { onEvent, reconnect = true } = options;
  const [lastEvent, setLastEvent] = useState<{ type: string; data: unknown } | null>(null);
  const [connected, setConnected] = useState(false);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    if (!url) return;
    let es: EventSource | null = null;
    let stopped = false;
    let retryDelay = 1000;

    const connect = () => {
      if (stopped) return;
      es = new EventSource(url, { withCredentials: true });
      es.addEventListener('open', () => {
        setConnected(true);
        retryDelay = 1000;
      });
      es.addEventListener('error', () => {
        setConnected(false);
        es?.close();
        if (!reconnect || stopped) return;
        // Exponential-ish backoff capped at 30s.
        const wait = Math.min(retryDelay, 30_000);
        retryDelay = Math.min(retryDelay * 2, 30_000);
        setTimeout(() => {
          if (!stopped) connect();
        }, wait);
      });
      // Catch-all listener — fires for any named event.
      es.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          const evt = { type: e.type || 'message', data };
          setLastEvent(evt);
          onEventRef.current?.(evt);
        } catch {
          // ignore non-JSON events (e.g. heartbeats)
        }
      };
      // Also forward typed events so e.g. a 'stage' event triggers
      // onEvent with a useful type tag.
      const types = ['stage', 'job', 'heartbeat', 'hello'];
      for (const t of types) {
        es.addEventListener(t, (e) => {
          try {
            const data = JSON.parse((e as MessageEvent).data);
            const evt = { type: t, data };
            setLastEvent(evt);
            onEventRef.current?.(evt);
          } catch {
            // ignore
          }
        });
      }
    };
    connect();
    return () => {
      stopped = true;
      es?.close();
    };
  }, [url, reconnect]);

  return { lastEvent, connected };
}
