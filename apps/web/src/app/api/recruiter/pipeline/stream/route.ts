// SSE endpoint — streams pipeline stage-change events to all
// connected recruiter clients.
//
// The event source uses a per-tenant in-memory bus keyed by
// companyId. Stages are written via the moveApplication service
// (which doesn't import this file directly to avoid a cycle); the
// route wires the event writer at boot.
//
// Messages are simple JSON lines: { type: 'stage', id, stage }
//
// Client subscribes via fetch('/api/recruiter/pipeline/stream')
// with EventSource or the useEventStream hook.

import { NextRequest } from 'next/server';
import { requireRole } from '@/server/auth/rbac';
import { pipelineBus } from './bus';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const user = await requireRole(['RECRUITER', 'HIRING_MANAGER', 'ADMIN']);
  const companyId = user.companyId ?? '__none__';

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      const send = (event: string, data: unknown) => {
        try {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        } catch {
          // controller closed
        }
      };

      // Initial hello so the client knows the stream is alive.
      send('hello', { ts: Date.now() });

      // Heartbeat every 25s to keep proxies / browsers from closing.
      const heartbeat = setInterval(() => send('heartbeat', { ts: Date.now() }), 25_000);

      const bus = pipelineBus.subscribe(companyId, (event) => {
        send(event.type, event.data);
      });

      // Close on client disconnect.
      const onAbort = () => {
        clearInterval(heartbeat);
        pipelineBus.unsubscribe(companyId, bus);
        try {
          controller.close();
        } catch {
          // already closed
        }
      };
      req.signal.addEventListener('abort', onAbort);
    },
  });

  return new Response(stream, {
    headers: {
      'content-type': 'text/event-stream',
      'cache-control': 'no-cache, no-transform',
      connection: 'keep-alive',
      'x-accel-buffering': 'no',
    },
  });
}
