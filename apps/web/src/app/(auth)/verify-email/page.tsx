import { Suspense } from 'react';
import Link from 'next/link';
import { verifyEmailAction } from './actions';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

function VerifyContent({ token, email }: { token: string | null; email: string | null }) {
  // Server action is async; we invoke it server-side.
  // Component is rendered server-side; the action throws a redirect on success
  // or returns a state object on error.
  return VerifyForm({ token, email });
}

function VerifyForm({ token, email }: { token: string | null; email: string | null }) {
  // Trigger the action at render time — it will redirect on success or throw if invalid.
  // We catch the redirect by simply calling it; if it redirects, Next.js will redirect.
  void verifyEmailAction(token, email);

  // If we reach here without a redirect, the link is invalid.
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Invalid link</CardTitle>
        <CardDescription>This verification link is missing required parameters.</CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        <p>Check the URL in the email we sent you, or sign in and request a new link.</p>
      </CardContent>
      <CardFooter>
        <Link href="/login" className="w-full">
          <Button className="w-full">Go to sign in</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

type Props = {
  searchParams: Promise<{ token?: string; email?: string }>;
};

export default async function VerifyEmailPage({ searchParams }: Props) {
  const sp = await searchParams;
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Verifying…</div>}>
      <VerifyContent token={sp.token ?? null} email={sp.email ?? null} />
    </Suspense>
  );
}
