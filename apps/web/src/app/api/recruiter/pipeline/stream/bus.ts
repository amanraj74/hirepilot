// Tiny per-company pub/sub bus for pipeline events. The bus is in-
// process — fine for a single-region Vercel deployment where all
// Serverless invocations share the runtime. In a multi-region
// deployment, swap for a Redis pub/sub or Vercel KV.

type Listener = (event: { type: string; data: unknown }) => void;

class PipelineBus {
  private listeners = new Map<string, Set<Listener>>();

  subscribe(companyId: string, listener: Listener): () => void {
    let set = this.listeners.get(companyId);
    if (!set) {
      set = new Set();
      this.listeners.set(companyId, set);
    }
    set.add(listener);
    return () => {
      const current = this.listeners.get(companyId);
      if (!current) return;
      current.delete(listener);
      if (current.size === 0) this.listeners.delete(companyId);
    };
  }

  publish(companyId: string, event: { type: string; data: unknown }): void {
    const set = this.listeners.get(companyId);
    if (!set) return;
    for (const listener of set) {
      try {
        listener(event);
      } catch {
        // Don't let one bad listener break the rest
      }
    }
  }

  /** Sugar for unsubscribing via the unsubscriber returned from subscribe(). */
  unsubscribe(companyId: string, listener: Listener): void {
    this.listeners.get(companyId)?.delete(listener);
  }
}

const globalForBus = globalThis as unknown as { __pipelineBus?: PipelineBus };
export const pipelineBus: PipelineBus =
  globalForBus.__pipelineBus ?? (globalForBus.__pipelineBus = new PipelineBus());
