import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CtaBanner() {
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-card to-card p-8 md:p-12">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl"
          />

          <div className="relative grid gap-8 md:grid-cols-[2fr_1fr] md:items-center">
            <div>
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                Ready to stop drowning in PDFs?
              </h2>
              <p className="mt-3 max-w-xl text-muted-foreground">
                Free tier. No credit card. Set up your first job in under a minute.
              </p>
            </div>
            <div className="flex flex-col gap-2 md:items-end">
              <Button asChild size="lg">
                <Link href="/signup">
                  Create your account
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <p className="text-xs text-muted-foreground md:text-right">
                Or{' '}
                <Link href="/jobs" className="font-medium text-primary hover:underline">
                  browse open jobs
                </Link>{' '}
                as a candidate
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
