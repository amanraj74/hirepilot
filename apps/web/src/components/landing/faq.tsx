'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const FAQS = [
  {
    q: 'How does the AI match scoring actually work?',
    a: 'Deterministic engineering. No LLM. We extract skills from the resume via pdf-parse + mammoth + a 1500-skill taxonomy, then compute a weighted score across 5 dimensions: skill overlap (40%), experience match (25%), education level (15%), location (10%), salary overlap (10%). Every score shows the breakdown — strong skills, missing skills, and a recommendation. Reproducible, inspectable, zero API cost.',
  },
  {
    q: 'Do you store my candidates&rsquo; resumes?',
    a: 'Yes — uploaded PDFs and DOCX files are stored in Cloudinary, and parsed structured data lives in our Postgres database. Recruiters can delete any candidate&rsquo;s data at any time. The free tier stores for 30 days; the paid tier stores until you delete it.',
  },
  {
    q: 'Can I import existing candidates from another ATS?',
    a: 'In the demo, no. CSV bulk-import is on the roadmap (see BLUEPRINT.md §14). We don&rsquo;t have a one-click Greenhouse / Lever / Workable migration yet — would be a great paid add-on for v1.0.',
  },
  {
    q: 'Is my data secure?',
    a: 'bcrypt-hashed passwords (cost 12), JWT in HTTP-only Secure cookies, 5-role RBAC enforced server-side, audit log on every privileged action, rate limiting on auth endpoints, signed Cloudinary URLs. We&rsquo;re not SOC 2 (yet) — that&rsquo;s an Enterprise-tier future thing.',
  },
  {
    q: 'Do you integrate with LinkedIn / job boards?',
    a: 'Not in the hackathon scope. The schema reserves fields for `source` (where the candidate came from) so analytics can track it once we add the integrations. Post-hackathon roadmap: LinkedIn, Indeed, ZipRecruiter, public careers page.',
  },
  {
    q: 'Can I cancel anytime? Are you open source?',
    a: 'Yes to cancel anytime (no contracts on Free or Pro). The codebase is open source under MIT — see the GitHub repo. Self-hosting is possible if you want to run on your own infra.',
  },
];

export function FAQ() {
  return (
    <section id="faq" className="border-b border-border bg-muted/30 py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center">
          <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            FAQ
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
            Questions, answered honestly.
          </h2>
          <p className="mt-4 text-muted-foreground">
            No marketing fluff. Just the answers a real recruiter would ask before signing up.
          </p>
        </div>

        <Accordion type="single" collapsible className="mt-12">
          {FAQS.map((faq, i) => (
            <AccordionItem key={faq.q} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-base">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
