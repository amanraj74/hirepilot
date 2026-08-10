import { Briefcase, UploadCloud, KanbanSquare, MailCheck } from 'lucide-react';

const STEPS = [
  {
    icon: Briefcase,
    step: '01',
    title: 'Post a job in under a minute',
    body: 'Title, skills, salary range, JD. Paste from your clipboard. Edit inline. Publish.',
  },
  {
    icon: UploadCloud,
    step: '02',
    title: 'Candidates upload resumes',
    body: 'PDF or DOCX, up to 10MB. We parse name, email, phone, skills, education, and experience automatically — and score them against your JD.',
  },
  {
    icon: KanbanSquare,
    step: '03',
    title: 'Drag candidates through the pipeline',
    body: 'Shortlist → interview → offer → hired. Every transition sends the candidate an in-app notification + email. Audit log captures who moved what, when.',
  },
  {
    icon: MailCheck,
    step: '04',
    title: 'Send branded offer letters',
    body: 'One-click PDF generation. Candidate accepts or rejects from the same portal. Application moves to Hired. You&rsquo;re done.',
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="border-b border-border bg-muted/30 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            How it works
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
            From job post to offer letter in four steps.
          </h2>
          <p className="mt-4 text-muted-foreground">
            No 47-step onboarding. No &ldquo;configure your pipeline stages.&rdquo; Just hire
            people.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ icon: Icon, step, title, body }) => (
            <div key={step} className="relative rounded-xl border border-border bg-card p-6">
              <div className="mb-4 flex items-center gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 font-mono text-xs font-bold text-primary">
                  {step}
                </span>
                <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <h3 className="text-base font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
