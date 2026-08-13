'use client';

import { useEffect, useState, useTransition } from 'react';
import { ShieldCheck, ShieldOff, Loader2, Copy, Check, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

type SetupState =
  | { kind: 'loading' }
  | { kind: 'disabled' }
  | { kind: 'enabled' }
  | { kind: 'pending'; qrCodeDataUri: string; secret: string };

export function TwoFactorPanel({ initialEnabled }: { initialEnabled: boolean }) {
  const [state, setState] = useState<SetupState>(
    initialEnabled ? { kind: 'enabled' } : { kind: 'disabled' },
  );
  const [token, setToken] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  // Confirmation step for disable.
  const [disableMode, setDisableMode] = useState<'off' | 'confirm-totp' | 'confirm-backup'>('off');
  const [disableValue, setDisableValue] = useState('');

  function beginSetup() {
    setError(null);
    setInfo(null);
    setBackupCodes(null);
    startTransition(async () => {
      const res = await fetch('/api/2fa/setup', { method: 'POST' });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { title?: string };
        setError(j.title ?? 'Could not start setup.');
        return;
      }
      const j = (await res.json()) as { data: { qrCodeDataUri: string; secret: string } };
      setState({ kind: 'pending', qrCodeDataUri: j.data.qrCodeDataUri, secret: j.data.secret });
    });
  }

  function confirmEnable(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await fetch('/api/2fa/enable', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { title?: string };
        setError(j.title ?? 'Could not enable.');
        return;
      }
      const j = (await res.json()) as { data: { backupCodes: string[] } };
      setBackupCodes(j.data.backupCodes);
      setState({ kind: 'enabled' });
      setToken('');
      setInfo(
        'Two-factor authentication is now enabled. Save your backup codes in a safe place — they will only be shown once.',
      );
    });
  }

  function cancelSetup() {
    setState(initialEnabled ? { kind: 'enabled' } : { kind: 'disabled' });
    setError(null);
    setInfo(null);
  }

  function beginDisable() {
    setDisableMode('confirm-totp');
    setDisableValue('');
    setError(null);
  }

  function confirmDisable(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const body: Record<string, string> =
      disableMode === 'confirm-backup' ? { backupCode: disableValue } : { token: disableValue };
    startTransition(async () => {
      const res = await fetch('/api/2fa/disable', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { title?: string };
        setError(j.title ?? 'Could not disable.');
        return;
      }
      setState({ kind: 'disabled' });
      setDisableMode('off');
      setDisableValue('');
      setInfo('Two-factor authentication has been disabled on this account.');
    });
  }

  function copyBackupCodes() {
    if (!backupCodes) return;
    const text = backupCodes.join('\n');
    navigator.clipboard.writeText(`HirePilot backup codes\n${text}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // Auto-clear info banner after a few seconds.
  useEffect(() => {
    if (!info) return;
    const id = setTimeout(() => setInfo(null), 6000);
    return () => clearTimeout(id);
  }, [info]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Two-factor authentication
          {state.kind === 'enabled' ? (
            <Badge
              variant="default"
              className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 ml-2"
            >
              Enabled
            </Badge>
          ) : (
            <Badge variant="outline" className="ml-2">
              Disabled
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Add a second factor with any TOTP app (Google Authenticator, 1Password, Authy, …).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {info && (
          <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
            {info}
          </div>
        )}
        {error && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        {state.kind === 'enabled' && (
          <div className="space-y-3">
            {disableMode === 'off' && (
              <Button variant="outline" size="sm" onClick={beginDisable} disabled={pending}>
                <ShieldOff className="h-4 w-4" aria-hidden="true" />
                Disable two-factor
              </Button>
            )}
            {disableMode !== 'off' && (
              <form
                onSubmit={confirmDisable}
                className="space-y-3 rounded-md border border-border p-3"
              >
                <p className="text-xs text-muted-foreground">
                  Confirm with your{' '}
                  {disableMode === 'confirm-backup' ? 'backup code' : 'current 6-digit code'} to
                  disable 2FA.
                </p>
                <Input
                  autoFocus
                  value={disableValue}
                  onChange={(e) =>
                    setDisableValue(
                      disableMode === 'confirm-backup'
                        ? e.target.value.toUpperCase()
                        : e.target.value.replace(/\D/g, '').slice(0, 6),
                    )
                  }
                  maxLength={disableMode === 'confirm-backup' ? 20 : 6}
                  placeholder={disableMode === 'confirm-backup' ? 'XXXXXXXXXX' : '123456'}
                  className={
                    disableMode === 'confirm-backup'
                      ? 'font-mono'
                      : 'text-center text-2xl tracking-[0.6em] font-mono'
                  }
                />
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setDisableMode(
                        disableMode === 'confirm-totp' ? 'confirm-backup' : 'confirm-totp',
                      );
                      setDisableValue('');
                    }}
                    className="text-xs text-muted-foreground hover:underline"
                  >
                    {disableMode === 'confirm-totp'
                      ? 'Use backup code instead'
                      : 'Use authenticator code instead'}
                  </button>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={cancelSetup}
                      disabled={pending}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="destructive"
                      size="sm"
                      disabled={pending || !disableValue}
                    >
                      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      Disable
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </div>
        )}

        {state.kind === 'disabled' && (
          <Button onClick={beginSetup} disabled={pending}>
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ShieldCheck className="h-4 w-4" />
            )}
            {pending ? ' Preparing…' : ' Enable two-factor'}
          </Button>
        )}

        {state.kind === 'pending' && (
          <div className="space-y-4">
            <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400">
              <p className="flex items-center gap-1.5 font-semibold">
                <AlertTriangle className="h-3 w-3" />
                Scan the QR with your authenticator app
              </p>
              <p className="mt-1 text-amber-700/80 dark:text-amber-400/80">
                Then enter the 6-digit code shown in the app to confirm. If you can&rsquo;t scan,
                enter the secret below manually.
              </p>
            </div>

            <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
              <img
                src={state.qrCodeDataUri}
                alt="Two-factor QR code"
                className="h-48 w-48 rounded-md border border-border bg-white p-2"
                width={192}
                height={192}
              />
              <div className="flex-1 space-y-2">
                <Label htmlFor="secret">Manual entry (if you can&rsquo;t scan)</Label>
                <code className="block break-all rounded-md bg-muted px-3 py-2 font-mono text-xs">
                  {state.secret}
                </code>
              </div>
            </div>

            <form onSubmit={confirmEnable} className="space-y-2">
              <Label htmlFor="enable-code">6-digit code from your app</Label>
              <Input
                id="enable-code"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="123456"
                value={token}
                onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="text-center text-2xl tracking-[0.6em] font-mono"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={cancelSetup} disabled={pending}>
                  Cancel
                </Button>
                <Button type="submit" disabled={pending || token.length !== 6}>
                  {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Enable
                </Button>
              </div>
            </form>
          </div>
        )}

        {backupCodes && backupCodes.length > 0 && (
          <div className="space-y-2 rounded-md border border-amber-500/40 bg-amber-500/5 p-3">
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
              Save these backup codes. They will only be shown once.
            </p>
            <ul className="grid grid-cols-2 gap-1 font-mono text-sm sm:grid-cols-5">
              {backupCodes.map((c) => (
                <li key={c} className="rounded bg-muted px-2 py-1 text-center">
                  {c}
                </li>
              ))}
            </ul>
            <Button variant="outline" size="sm" onClick={copyBackupCodes}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? ' Copied' : ' Copy all'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
