import Link from 'next/link';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Tier = {
  name: string;
  price: string;
  cadence: string;
  blurb: string;
  features: string[];
  cta: string;
  href: string;
  highlighted?: boolean;
};

const TIERS: Tier[] = [
  {
    name: 'Free',
    price: '$0',
    cadence: 'forever',
    blurb: 'For solo recruiters trying out HirePilot on real candidates.',
    features: [
      '1 active job',
      '50 candidate views / month',
      'Resume parsing (PDF + DOCX)',
      '7-stage Kanban',
      'In-app notifications',
    ],
    cta: 'Start free',
    href: '/signup',
  },
  {
    name: 'Pro',
    price: '$49',
    cadence: 'per recruiter / month',
    blurb:
      'For hiring teams that need AI match scores, branded offer letters, and the full pipeline.',
    features: [
      'Unlimited active jobs',
      'Unlimited candidate views',
      'AI match scores with explainability',
      'Branded PDF offer letters',
      'Email notifications + .ics attachments',
      'Recruiter dashboard with 8 widgets + 4 charts',
      'Priority support',
    ],
    cta: 'Start 14-day trial',
    href: '/signup',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    cadence: 'annual contract',
    blurb: 'For large orgs that need SSO, audit logs, and a dedicated account manager.',
    features: [
      'Everything in Pro',
      'SSO (SAML + OIDC)',
      'SOC 2-ready audit log',
      'Custom data retention',
      'Dedicated success manager',
      'SLA-backed uptime',
    ],
    cta: 'Talk to sales',
    href: '/signup',
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="border-b border-border py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            Pricing
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
            Simple, recruiter-friendly pricing.
          </h2>
          <p className="mt-4 text-muted-foreground">
            No per-application fees. No per-message fees. Pay for seats, not for the privilege of
            using your own ATS.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={cn(
                'relative flex flex-col rounded-2xl border bg-card p-6 transition-all',
                tier.highlighted
                  ? 'border-primary shadow-lg ring-1 ring-primary/30 lg:scale-[1.02]'
                  : 'border-border',
              )}
            >
              {tier.highlighted && (
                <span className="absolute -top-3 right-6 rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-foreground">
                  Most popular
                </span>
              )}

              <div>
                <h3 className="text-lg font-semibold">{tier.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{tier.blurb}</p>
                <div className="mt-5 flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight">{tier.price}</span>
                  <span className="text-sm text-muted-foreground">/ {tier.cadence}</span>
                </div>
              </div>

              <ul className="mt-6 flex-1 space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                className="mt-6 w-full"
                variant={tier.highlighted ? 'default' : 'outline'}
                size="lg"
              >
                <Link href={tier.href}>{tier.cta}</Link>
              </Button>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Prices shown for the demo submission. Real billing is out of scope for the hackathon
          sprint.
        </p>
      </div>
    </section>
  );
}
