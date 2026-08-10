import Link from 'next/link';
import { Logo } from './logo';

const FOOTER_SECTIONS = [
  {
    title: 'Product',
    links: [
      { href: '/#features', label: 'Features' },
      { href: '/#pricing', label: 'Pricing' },
      { href: '/#faq', label: 'FAQ' },
      { href: '/jobs', label: 'Browse jobs' },
    ],
  },
  {
    title: 'Account',
    links: [
      { href: '/login', label: 'Sign in' },
      { href: '/signup', label: 'Create account' },
      { href: '/forgot-password', label: 'Reset password' },
    ],
  },
  {
    title: 'Project',
    links: [
      { href: 'https://github.com/amanraj74/hirepilot', label: 'Source code', external: true },
      { href: '/#how', label: 'How it works' },
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[2fr_3fr]">
          <div className="space-y-3">
            <Logo />
            <p className="max-w-xs text-sm text-muted-foreground">
              The AI-powered Applicant Tracking System for recruiters who don&rsquo;t have time for
              tools that don&rsquo;t work.
            </p>
            <p className="text-xs text-muted-foreground">
              Built for the DevFusion 4.O hackathon · Problem Statement 2.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
            {FOOTER_SECTIONS.map((section) => (
              <div key={section.title}>
                <h3 className="mb-3 text-sm font-semibold">{section.title}</h3>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      {link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} HirePilot. MIT licensed.</p>
          <p className="flex items-center gap-2">
            <span aria-hidden>•</span>
            <span>Deterministic AI. No LLM API bills. No data leaks.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
