'use client';

import { useState, useTransition, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { verifyOtpAction, type LoginActionState } from '@/app/(auth)/login/actions';

export function OtpForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const callbackUrl = sp.get('callbackUrl') ?? '/dashboard';
  const email = sp.get('email') ?? '';

  const [token, setToken] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [mode, setMode] = useState<'totp' | 'backup'>('totp');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const fd = new FormData();
      if (mode === 'totp') fd.set('token', token.trim());
      else fd.set('backupCode', backupCode.trim());
      fd.set('callbackUrl', callbackUrl);
      const result: LoginActionState = await verifyOtpAction(undefined, fd);
      if (result?.error) {
        setError(result.error);
        requestAnimationFrame(() => inputRef.current?.focus());
        return;
      }
      // Success — server action redirected.
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <ShieldCheck className="h-5 w-5 text-primary" />
          Two-factor authentication
        </CardTitle>
        <CardDescription>
          {email ? (
            <>
              Enter the 6-digit code from your authenticator app for <strong>{email}</strong>.
            </>
          ) : (
            'Enter the 6-digit code from your authenticator app.'
          )}
        </CardDescription>
      </CardHeader>
      <form onSubmit={submit} noValidate>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          {mode === 'totp' ? (
            <div className="space-y-2">
              <Label htmlFor="otp">Authenticator code</Label>
              <Input
                ref={inputRef}
                id="otp"
                name="token"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="123456"
                value={token}
                onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                disabled={pending}
                className="text-center text-2xl tracking-[0.6em] font-mono"
                autoFocus
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="backup">Backup code</Label>
              <Input
                ref={inputRef}
                id="backup"
                name="backupCode"
                autoComplete="off"
                maxLength={20}
                placeholder="XXXXXXXXXX"
                value={backupCode}
                onChange={(e) => setBackupCode(e.target.value.toUpperCase())}
                disabled={pending}
                className="text-center text-xl tracking-[0.4em] font-mono"
                autoFocus
              />
            </div>
          )}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            {pending ? 'Verifying…' : 'Verify and continue'}
          </Button>

          <button
            type="button"
            onClick={() => {
              setMode(mode === 'totp' ? 'backup' : 'totp');
              setError(null);
              setToken('');
              setBackupCode('');
            }}
            className="block w-full text-center text-sm text-muted-foreground hover:underline"
            disabled={pending}
          >
            {mode === 'totp' ? 'Use a backup code instead' : 'Use authenticator code instead'}
          </button>
        </CardContent>
      </form>
    </Card>
  );
}
