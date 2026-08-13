'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
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
import { loginAction, type LoginActionState } from './actions';

const ERROR_MESSAGES: Record<string, string> = {
  CredentialsSignin: 'Invalid email or password.',
  Verification: 'Verification link is invalid or has expired.',
  Configuration: 'Auth misconfigured. Check AUTH_SECRET and NEXTAUTH_URL.',
  AccessDenied: 'Access denied.',
  default: 'Could not sign in. Try again.',
};

export function LoginForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const registered = sp.get('registered') === '1';
  const verified = sp.get('verified') === '1';
  const reset = sp.get('reset') === '1';
  const urlError = sp.get('error');

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (urlError) {
      setError(ERROR_MESSAGES[urlError] ?? null);
    }
  }, [urlError]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result: LoginActionState = await loginAction(undefined, fd);
      if (result?.needs2FA) {
        const email = encodeURIComponent(result.email ?? '');
        const cb = encodeURIComponent(result.callbackUrl ?? '/dashboard');
        router.push(`/verify-otp?email=${email}&callbackUrl=${cb}`);
        return;
      }
      if (result?.error) {
        setError(result.error);
        return;
      }
      // No 2FA — loginAction called signIn() which throws NEXT_REDIRECT
      // and NextAuth routes us to the callbackUrl automatically. If we
      // somehow get here, push manually.
      router.push('/dashboard');
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
        <CardDescription>Sign in to your HirePilot workspace.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit} noValidate>
        <CardContent className="space-y-4">
          {registered && (
            <div className="rounded-md border border-green-600/40 bg-green-600/10 px-3 py-2 text-sm text-green-700 dark:text-green-400">
              Account created. Check your email if you signed up as a recruiter.
            </div>
          )}
          {verified && (
            <div className="rounded-md border border-green-600/40 bg-green-600/10 px-3 py-2 text-sm text-green-700 dark:text-green-400">
              Email verified. You can now sign in.
            </div>
          )}
          {reset && (
            <div className="rounded-md border border-green-600/40 bg-green-600/10 px-3 py-2 text-sm text-green-700 dark:text-green-400">
              Password reset. Sign in with your new password.
            </div>
          )}
          {error && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              disabled={pending}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <a href="/forgot-password" className="text-xs text-muted-foreground hover:underline">
                Forgot?
              </a>
            </div>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                disabled={pending}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Signing in…' : 'Sign in'}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            New here?{' '}
            <a href="/signup" className="font-medium text-primary hover:underline">
              Create an account
            </a>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
