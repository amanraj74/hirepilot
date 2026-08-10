import { Brain, KanbanSquare, CalendarClock, FileText, BarChart3, ShieldCheck } from 'lucide-react';

const FEATURES = [
  {
    icon: Brain,
    title: 'Deterministic AI resume parsing',
    body: 'pdf-parse + mammoth extract text. Regex splits sections. Fuse.js matches against a curated 1500-skill taxonomy. Match scores are explainable: every number has a receipt.',
  },
  {
    icon: KanbanSquare,
    title: '7-stage Kanban pipeline',
    body: 'Applied → Screening → Shortlisted → Tech Interview → HR Interview → Offer → Hired. Drag-and-drop with full audit trail, real-time notifications, and zero lost updates.',
  },
  {
    icon: CalendarClock,
    title: 'Interview scheduler with .ics',
    body: 'Pick a slot, send invites. Candidates and interviewers get a real .ics file they can add to Google Calendar or Outlook. No &ldquo;what time is this again?&rdquo; emails.',
  },
  {
    icon: FileText,
    title: 'Branded offer letter PDFs',
    body: 'Generate polished offer letters with @react-pdf/renderer, store in Cloudinary, track accept/reject in one place. Branded templates with candidate details auto-filled.',
  },
  {
    icon: BarChart3,
    title: 'Recruiter dashboard with 8 widgets',
    body: 'Total jobs, active candidates, today&rsquo;s interviews, offer acceptance rate, hiring funnel, monthly chart. Recharts visualizations. Real data, not placeholders.',
  },
  {
    icon: ShieldCheck,
    title: '5-role RBAC + audit log',
    body: 'Candidate, Recruiter, Hiring Manager, Interviewer, Admin. Every privileged action hits the AuditLog table with actor, IP, and before/after state. Defensible by default.',
  },
];

export function Features() {
  return (
    <section id="features" className="border-b border-border py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            Features
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
            Everything a recruiter needs. Nothing they don&rsquo;t.
          </h2>
          <p className="mt-4 text-muted-foreground">
            We didn&rsquo;t ship &ldquo;AI for everything.&rdquo; We shipped the exact primitives a
            real hiring team needs, and made each one great.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-md"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
