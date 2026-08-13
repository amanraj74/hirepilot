import type { Metadata } from 'next';
import localFont from 'next/font/local';
import Script from 'next/script';
import './globals.css';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

// Runs before React hydrates. Without this, every page load in dark mode
// flashes light → dark (FOUC). Reads localStorage, falls back to the OS
// preference, sets the .dark class on <html> before any pixels paint.
// Strategy: next/script with strategy="beforeInteractive" ensures it
// queues in <head> ahead of hydration.
const themeInit = `
(function() {
  try {
    var stored = localStorage.getItem('hirepilot-theme');
    var prefers = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = stored === 'dark' || stored === 'light'
      ? stored
      : (prefers ? 'dark' : 'light');
    if (theme === 'dark') document.documentElement.classList.add('dark');
    document.documentElement.dataset.theme = theme;
  } catch (e) {}
})();
`;

export const metadata: Metadata = {
  title: {
    default: 'HirePilot — AI-Powered Recruitment & ATS',
    template: '%s · HirePilot',
  },
  description:
    'HirePilot is an AI-powered Applicant Tracking System that fuses resume parsing, AI match scoring, and a 7-stage hiring pipeline into one workspace.',
  applicationName: 'HirePilot',
  authors: [{ name: 'HirePilot' }],
  keywords: ['ATS', 'applicant tracking', 'recruitment', 'HR', 'hiring', 'AI resume matching'],
  openGraph: {
    type: 'website',
    title: 'HirePilot — AI-Powered Recruitment & ATS',
    description: 'One workspace. Every developer workflow. Fused.',
    siteName: 'HirePilot',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HirePilot — AI-Powered Recruitment & ATS',
    description: 'One workspace. Every developer workflow. Fused.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="hirepilot-theme-init" strategy="beforeInteractive">
          {themeInit}
        </Script>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
    </html>
  );
}
