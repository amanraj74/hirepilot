'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
};

const TYPE_ICON: Record<string, string> = {
  NEW_APPLICATION: '📥',
  STAGE_CHANGED: '🔁',
  INTERVIEW_SCHEDULED: '📅',
  ASSESSMENT_ASSIGNED: '📝',
  ASSESSMENT_GRADED: '✅',
  OFFER_RECEIVED: '🎉',
  OFFER_ACCEPTED: '✅',
  OFFER_REJECTED: '👋',
  PROFILE_COMPLETE: '⭐',
};

export function NotificationBell({ initialUnreadCount }: { initialUnreadCount: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [marking, startMarking] = useTransition();

  // Load notifications when popover opens.
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch('/api/notifications', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        setItems(d.data ?? []);
        setUnreadCount((d.data ?? []).filter((n: Notification) => !n.read).length);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [open]);

  // Poll every 30s for new notifications.
  useEffect(() => {
    const tick = async () => {
      try {
        const r = await fetch('/api/notifications/unread-count', { cache: 'no-store' });
        if (r.ok) {
          const d = await r.json();
          if (typeof d.count === 'number') setUnreadCount(d.count);
        }
      } catch {
        /* ignore */
      }
    };
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  function markAllRead() {
    startMarking(async () => {
      try {
        await fetch('/api/notifications/mark-all-read', { method: 'POST' });
        setItems((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
        router.refresh();
      } catch {
        /* ignore */
      }
    });
  }

  function handleItemClick(n: Notification) {
    setOpen(false);
    if (n.link) router.push(n.link);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
          className="relative"
        >
          <Bell className="h-4 w-4" aria-hidden="true" />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold leading-none text-destructive-foreground">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <p className="text-sm font-semibold">Notifications</p>
          {unreadCount > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={markAllRead}
              disabled={marking}
              className="h-7 text-xs"
            >
              {marking ? (
                <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
              ) : (
                <Check className="h-3 w-3" aria-hidden="true" />
              )}
              Mark all read
            </Button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {loading && items.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">Loading…</div>
          ) : items.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              <Bell className="mx-auto mb-2 h-6 w-6 opacity-40" aria-hidden="true" />
              You&rsquo;re all caught up.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {items.slice(0, 10).map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => handleItemClick(n)}
                    className={cn(
                      'flex w-full items-start gap-2 px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted/50',
                      !n.read && 'bg-primary/5',
                    )}
                  >
                    <span className="text-base leading-none mt-0.5">
                      {TYPE_ICON[n.type] ?? '🔔'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn('truncate font-medium', !n.read && 'font-semibold')}>
                          {n.title}
                        </p>
                        {!n.read && (
                          <span
                            className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary"
                            aria-label="Unread"
                          />
                        )}
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                        {n.message}
                      </p>
                      <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground/70">
                        {new Date(n.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
