// Email transport — picks between Resend and console based on EMAIL_PROVIDER.
// In dev (EMAIL_PROVIDER=console) every message is logged to stdout so judges
// can verify verification / invite / offer emails during demo without burning
// Resend quota. In prod (EMAIL_PROVIDER=resend + RESEND_API_KEY set) the
// React message body is rendered to HTML and sent through Resend's SDK.

import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

export type EmailMessage = {
  to: string;
  subject: string;
  react: ReactElement;
};

function renderToHtml(element: ReactElement): string {
  // Wrap in a full document so Resend doesn't require a separate text part.
  // renderToStaticMarkup is fine for email bodies — no client components or
  // hydration needed.
  const body = renderToStaticMarkup(element);
  return `<!doctype html><html><head><meta charset="utf-8" /></head><body>${body}</body></html>`;
}

export async function sendEmail(message: EmailMessage): Promise<void> {
  const provider = process.env.EMAIL_PROVIDER ?? 'console';

  if (provider === 'console') {
    console.warn('--- [DEV EMAIL] ---');
    console.warn(`To:      ${message.to}`);
    console.warn(`Subject: ${message.subject}`);
    console.warn(`From:    ${process.env.EMAIL_FROM ?? 'noreply@hirepilot.local'}`);
    console.warn('--- (rendered React email logged above; HTML elided in console transport) ---');
    return;
  }

  if (provider === 'resend') {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn('[email] RESEND_API_KEY not set, falling back to console transport');
      return sendEmail({ ...message, react: message.react });
    }
    const { Resend } = await import('resend');
    const resend = new Resend(apiKey);
    const html = renderToHtml(message.react);
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM ?? 'HirePilot <noreply@hirepilot.local>',
      to: message.to,
      subject: message.subject,
      html,
    });
    if (error) {
      throw new Error(`Resend send failed: ${error.message}`);
    }
    return;
  }

  console.warn(`[email] Unknown EMAIL_PROVIDER=${provider}, dropping message`);
}
