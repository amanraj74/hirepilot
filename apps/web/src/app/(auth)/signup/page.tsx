'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { signupAction, type SignupState } from './actions';
import { googleSignInAction } from '../google-action';
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
      {pending ? 'Creating account…' : 'Create account'}
    </Button>
  );
}

function GoogleButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      formAction={googleSignInAction}
      variant="outline"
      className="w-full"
      disabled={pending}
    >
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
  );
}

export default function SignupPage() {
  const [state, formAction] = useActionState<SignupState, FormData>(signupAction, undefined);

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Create your account</CardTitle>
        <CardDescription>Start hiring or get hired — in under 60 seconds.</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          {state?.error && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              minLength={2}
              maxLength={80}
              aria-invalid={Boolean(state?.fieldErrors?.name?.length)}
            />
            {state?.fieldErrors?.name?.map((e: string) => (
              <p key={e} className="text-sm text-destructive">
                {e}
              </p>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Work email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              aria-invalid={Boolean(state?.fieldErrors?.email?.length)}
            />
            {state?.fieldErrors?.email?.map((e: string) => (
              <p key={e} className="text-sm text-destructive">
                {e}
              </p>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              aria-invalid={Boolean(state?.fieldErrors?.password?.length)}
            />
            <p className="text-xs text-muted-foreground">
              Min 8 characters, with at least one letter and one number.
            </p>
            {state?.fieldErrors?.password?.map((e: string) => (
              <p key={e} className="text-sm text-destructive">
                {e}
              </p>
            ))}
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">I am a</legend>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 cursor-pointer hover:bg-accent/5">
                <input
                  type="radio"
                  name="role"
                  value="CANDIDATE"
                  defaultChecked
                  required
                  className="accent-primary"
                />
                <span className="text-sm">Candidate</span>
              </label>
              <label className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 cursor-pointer hover:bg-accent/5">
                <input
                  type="radio"
                  name="role"
                  value="RECRUITER"
                  required
                  className="accent-primary"
                />
                <span className="text-sm">Recruiter</span>
              </label>
            </div>
            {state?.fieldErrors?.role?.map((e: string) => (
              <p key={e} className="text-sm text-destructive">
                {e}
              </p>
            ))}
          </fieldset>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <SubmitButton />
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>
          <GoogleButton />
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
