import Link from 'next/link';
import {
  ArrowRight,
  FileSearch,
  KanbanSquare,
  Sparkles,
  Zap,
  Shield,
  Users,
  Bot,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-background via-background to-indigo-50/40 dark:via-zinc-950 dark:to-indigo-950/30">
      {/* Decorative gradient orbs — soft accents, no heavy image. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-gradient-radial from-indigo-400/30 via-indigo-300/10 to-transparent blur-3xl dark:from-indigo-700/20 dark:via-indigo-900/10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 top-32 -z-10 h-72 w-72 rounded-full bg-violet-400/20 blur-3xl dark:bg-violet-700/15"
      />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-7 px-4 py-20 text-center sm:px-6 md:py-28">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
          <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          Open-source · AI-native Applicant Tracking System
        </span>

        <h1 className="max-w-3xl text-balance text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
          Hire faster. Apply smarter.{' '}
          <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent dark:from-indigo-300 dark:via-violet-300 dark:to-fuchsia-300">
            Stop sorting PDFs.
          </span>
        </h1>

        <p className="max-w-2xl text-balance text-base text-muted-foreground md:text-lg">
          HirePilot parses every resume, scores every match against your job, and routes every
          candidate through a 7-stage hiring pipeline — all without sending a single byte to a
          third-party LLM.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="shadow-md">
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
            accent="from-indigo-500/10 to-violet-500/10"
          />
          <DemoCard
            icon={<Zap className="h-4 w-4" />}
            label="Match score explained"
            detail="Strong skills · missing skills · recommendation"
            accent="from-fuchsia-500/10 to-pink-500/10"
          />
          <DemoCard
            icon={<KanbanSquare className="h-4 w-4" />}
            label="7-stage pipeline"
            detail="Drag candidates from Applied to Hired"
            accent="from-cyan-500/10 to-indigo-500/10"
          />
        </div>

        <div className="mt-10 grid w-full max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4">
          <TrustStat
            icon={<Users className="h-4 w-4 text-muted-foreground" />}
            value="7"
            label="Demo accounts"
          />
          <TrustStat
            icon={<Bot className="h-4 w-4 text-muted-foreground" />}
            value="0"
            label="LLM calls"
          />
          <TrustStat
            icon={<Shield className="h-4 w-4 text-muted-foreground" />}
            value="5"
            label="User roles"
          />
          <TrustStat
            icon={<KanbanSquare className="h-4 w-4 text-muted-foreground" />}
            value="25"
            label="DB models"
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
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  detail: string;
  accent: string;
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-lg border border-border bg-gradient-to-br ${accent} p-4 text-left backdrop-blur transition-all hover:border-primary/40 hover:shadow-md`}
    >
      <div className="mb-2 flex items-center gap-2 text-primary">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-sm text-muted-foreground">{detail}</p>
    </div>
  );
}

function TrustStat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card/40 p-3 text-center">
      <div className="flex items-center justify-center gap-1 text-2xl font-bold tabular-nums">
        {value}
      </div>
      <div className="mt-1 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
    </div>
  );
}
