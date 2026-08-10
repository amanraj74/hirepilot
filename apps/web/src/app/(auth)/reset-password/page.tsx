'use client';

import { Suspense } from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useSearchParams } from 'next/navigation';
import { resetPasswordAction, type ResetPasswordState } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Resetting…' : 'Set new password'}
    </Button>
  );
}

function ResetForm() {
  const sp = useSearchParams();
  const token = sp.get('token') ?? '';
  const email = sp.get('email') ?? '';

  const [state, formAction] = useActionState<ResetPasswordState, FormData>(
    resetPasswordAction,
    undefined,
  );

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Choose a new password</CardTitle>
        <CardDescription>For {email || 'your account'}.</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          {state && 'error' in state && state.error && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.error}
            </div>
          )}

          <input type="hidden" name="token" value={token} />
          <input type="hidden" name="email" value={email} />

          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              aria-invalid={Boolean(
                state && 'fieldErrors' in state && state.fieldErrors?.password?.length,
              )}
            />
            <p className="text-xs text-muted-foreground">
              Min 8 characters, with at least one letter and one number.
            </p>
            {state &&
              'fieldErrors' in state &&
              state.fieldErrors?.password?.map((e: string) => (
                <p key={e} className="text-sm text-destructive">
                  {e}
                </p>
              ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              aria-invalid={Boolean(
                state && 'fieldErrors' in state && state.fieldErrors?.confirmPassword?.length,
              )}
            />
            {state &&
              'fieldErrors' in state &&
              state.fieldErrors?.confirmPassword?.map((e: string) => (
                <p key={e} className="text-sm text-destructive">
                  {e}
                </p>
              ))}
          </div>
        </CardContent>
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Loading…</div>}>
      <ResetForm />
    </Suspense>
  );
}
