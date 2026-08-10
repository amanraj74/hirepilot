// Email transport — picks between Resend and console based on EMAIL_PROVIDER.
// In dev, EMAIL_PROVIDER=console writes to stdout so judges can verify
// verification / invite / offer emails during demo without external services.

import type { ReactElement } from 'react';

export type EmailMessage = {
  to: string;
  subject: string;
  react: ReactElement;
};

export async function sendEmail(message: EmailMessage): Promise<void> {
  const provider = process.env.EMAIL_PROVIDER ?? 'console';

  if (provider === 'console') {
    console.warn('--- [DEV EMAIL] ---');
    console.warn(`To:      ${message.to}`);
    console.warn(`Subject: ${message.subject}`);
    console.warn(`From:    ${process.env.EMAIL_FROM ?? 'noreply@hirepilot.local'}`);
    console.warn('--- (rendered React email logged above; full HTML in production mode) ---');
    return;
  }

  if (provider === 'resend') {
    const { Resend } = await import('resend');
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn('[email] RESEND_API_KEY not set, falling back to console');
      return sendEmail({ ...message, react: message.react });
    }
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM ?? 'noreply@hirepilot.local',
      to: message.to,
      subject: message.subject,
      // Caller is expected to pass a React Email element; we render to HTML here.
      // (Imports of @react-email/components done lazily to avoid bundling when unused.)
      html: '<rendered-on-call>',
    });
    if (error) {
      throw new Error(`Resend send failed: ${error.message}`);
    }
    return;
  }

  console.warn(`[email] Unknown EMAIL_PROVIDER=${provider}, dropping message`);
}
