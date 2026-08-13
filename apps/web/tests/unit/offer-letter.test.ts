// Unit tests for the offer letter PDF generator.
//
// The full PDF rendering happens via @react-pdf/renderer, which loads
// its built-in fonts from disk. In the Vitest environment those font
// files aren't reachable, so we mock the renderer's renderToBuffer
// to return a deterministic fake PDF buffer. The shape + branching of
// generateOfferPdf (the function we actually own) is what we're
// testing — not the pdf.js rendering internals.

import { describe, it, expect, vi } from 'vitest';

// Mock @react-pdf/renderer BEFORE importing the service. The offer
// letter component pulls Document, Page, Text, View, StyleSheet,
// renderToBuffer, etc. from this package, so we mock the whole
// surface — only renderToBuffer actually returns anything; the rest
// are identity stubs so the JSX in offer-letter.tsx can render.
const fakePdf = Buffer.from('%PDF-1.4\n%FAKE\n%%EOF\n', 'utf-8');
vi.mock('@react-pdf/renderer', () => ({
  renderToBuffer: vi.fn(async () => fakePdf),
  StyleSheet: {
    create: <T extends Record<string, unknown>>(styles: T): T => styles,
  },
  Document: ({ children }: { children: React.ReactNode }) => children,
  Page: ({ children }: { children: React.ReactNode }) => children,
  Text: ({ children }: { children: React.ReactNode }) => children,
  View: ({ children }: { children: React.ReactNode }) => children,
  Image: () => null,
  Font: { register: vi.fn() },
}));

import { generateOfferPdf } from '@/server/services/offers.service';
import { OfferLetterDocument } from '@/server/pdf/offer-letter';

describe('offer-letter PDF', () => {
  const SAMPLE_DATA = {
    candidateName: 'Sample Candidate',
    roleTitle: 'Senior Full-Stack Engineer',
    companyName: 'HirePilot Demo Inc.',
    location: 'Remote (Worldwide)',
    workMode: 'REMOTE' as const,
    salaryAmount: 12_000_000,
    salaryCurrency: 'USD',
    joiningDate: new Date('2026-09-01T00:00:00Z'),
    expiresAt: new Date('2026-08-25T00:00:00Z'),
    benefits: ['Remote-first', 'Equity', '30 days PTO'],
    bodyMarkdown: '## Welcome\n\nWe are delighted to offer you this role.',
    senderName: 'Riya Sharma',
    senderTitle: 'Hiring Manager',
    companyWebsite: 'https://hirepilot.dev',
    generatedAt: new Date('2026-08-01T00:00:00Z'),
  };

  it('returns the mocked PDF buffer', async () => {
    const buf = await generateOfferPdf(SAMPLE_DATA);
    expect(Buffer.isBuffer(buf)).toBe(true);
    expect(buf.length).toBeGreaterThan(0);
  });

  it('delegates to renderToBuffer with the React element', async () => {
    const renderer = await import('@react-pdf/renderer');
    await generateOfferPdf(SAMPLE_DATA);
    expect(renderer.renderToBuffer).toHaveBeenCalled();
  });

  it('exports a Document component that accepts OfferLetterData', () => {
    expect(typeof OfferLetterDocument).toBe('function');
  });
});
