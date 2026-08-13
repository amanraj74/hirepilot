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
import { googleSignInAction } from '../google-action';

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

          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <form action={googleSignInAction} className="w-full">
            <input type="hidden" name="callbackUrl" value={sp.get('callbackUrl') ?? '/dashboard'} />
            <Button type="submit" variant="outline" className="w-full" disabled={pending}>
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"
                />
              </svg>
              Continue with Google
            </Button>
          </form>

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
