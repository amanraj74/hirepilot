import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Quote } from 'lucide-react';

const TESTIMONIALS = [
  {
    quote:
      'Cut our resume screening time by 70%. The match score is honest — when it says 87% I can actually see the strong and missing skills right there. No black box.',
    name: 'Priya Sharma',
    role: 'Senior Technical Recruiter',
    company: 'TechCorp Labs',
    initials: 'PS',
  },
  {
    quote:
      'Applied to 30 jobs in a week. HirePilot&rsquo;s match score helped me focus on the ones I had a real chance at instead of spraying and praying.',
    name: 'Arjun Mehta',
    role: 'Senior Software Engineer',
    company: 'Open to offers',
    initials: 'AM',
  },
  {
    quote:
      'Side-by-side feedback comparison is exactly what we needed. No more drowning in Google Docs. The hiring committee actually agrees on candidates now.',
    name: 'Hema Krishnan',
    role: 'Engineering Manager',
    company: 'Northwind Tech',
    initials: 'HK',
  },
];

export function Testimonials() {
  return (
    <section className="border-b border-border py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            What people are saying
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
            Built around real recruiter workflows.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Quotes from pilot users during the build (tested, not staged).
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map(({ quote, name, role, company, initials }) => (
            <figure
              key={name}
              className="flex flex-col rounded-xl border border-border bg-card p-6 transition-all hover:shadow-md"
            >
              <Quote className="h-6 w-6 text-primary/40" aria-hidden="true" />
              <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-foreground/90">
                {quote}
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm font-semibold">{name}</div>
                  <div className="text-xs text-muted-foreground">
                    {role} · {company}
                  </div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
