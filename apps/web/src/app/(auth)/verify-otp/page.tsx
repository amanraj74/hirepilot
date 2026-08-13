import { Suspense } from 'react';
import { OtpForm } from './otp-form';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Loading…</div>}>
      <OtpForm />
    </Suspense>
  );
}
