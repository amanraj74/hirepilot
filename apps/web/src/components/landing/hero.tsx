import Link from 'next/link';
import { ArrowRight, FileSearch, KanbanSquare, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,theme(colors.indigo.500/12),transparent_60%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent,theme(colors.background))]"
      />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-20 text-center sm:px-6 md:py-28">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          Built for DevFusion 4.O · Problem Statement 2
        </span>

        <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
          Hire faster. Apply smarter.{' '}
          <span className="bg-gradient-to-r from-primary to-indigo-400 bg-clip-text text-transparent">
            Stop sorting PDFs.
          </span>
        </h1>

        <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
          HirePilot is an AI-powered Applicant Tracking System that parses every resume, scores
          every match against your job, and routes every candidate through a 7-stage pipeline. Built
          for recruiters who don&rsquo;t have time for tools that don&rsquo;t work.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/signup">
              Get started free
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/jobs">Browse open jobs</Link>
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          No credit card · No LLM API bills · Recruiter signup requires email verification
        </p>

        <div className="mt-8 grid w-full max-w-4xl grid-cols-1 gap-3 sm:grid-cols-3">
          <DemoCard
            icon={<FileSearch className="h-4 w-4" />}
            label="Resume parsed in 2s"
            detail="PDF + DOCX → name, email, skills, experience"
          />
          <DemoCard
            icon={<Sparkles className="h-4 w-4" />}
            label="Match score explained"
            detail="Strong skills · missing skills · recommendation"
          />
          <DemoCard
            icon={<KanbanSquare className="h-4 w-4" />}
            label="7-stage pipeline"
            detail="Drag candidates from Applied to Hired"
          />
        </div>
      </div>
    </section>
  );
}

function DemoCard({
  icon,
  label,
  detail,
}: {
  icon: React.ReactNode;
  label: string;
  detail: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card/60 p-4 text-left backdrop-blur">
      <div className="mb-2 flex items-center gap-2 text-primary">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-sm text-muted-foreground">{detail}</p>
    </div>
  );
}
