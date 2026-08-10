'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { signupAction, type SignupState } from './actions';
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
            />
            {state?.fieldErrors?.name?.map((e: string) => (
              <p key={e} className="text-sm text-destructive">
                {e}
              </p>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Work email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
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
