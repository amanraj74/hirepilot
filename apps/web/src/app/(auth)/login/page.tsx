'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { loginAction } from './actions';
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
      {pending ? 'Signing in…' : 'Sign in'}
    </Button>
  );
}

function LoginForm() {
  const sp = useSearchParams();
  const registered = sp.get('registered') === '1';

  const [state, formAction] = useActionState(loginAction, undefined);

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
        <CardDescription>Sign in to your HirePilot workspace.</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          {registered && (
            <div className="rounded-md border border-green-600/40 bg-green-600/10 px-3 py-2 text-sm text-green-700 dark:text-green-400">
              Account created. Check your email if you signed up as a recruiter.
            </div>
          )}
          {state?.error && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-xs text-muted-foreground hover:underline"
              >
                Forgot?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <SubmitButton />
          <p className="text-center text-sm text-muted-foreground">
            New here?{' '}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
