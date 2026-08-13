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

// Inline FOUC-prevention script. Inlined into the document by
// `next/script` with strategy="beforeInteractive" so it runs before any
// pixels paint. Without this, every page load in dark mode flashes
// light → dark. Uses localStorage first, then prefers-color-scheme, then
// defaults to light. Wrapped in try/catch so private-mode browsers
// don't crash. Using dangerouslySetInnerHTML rather than children so the
// raw string is emitted verbatim — avoids any chance of React
// interpreting the script text as JSX.
const themeInit = `(function(){try{var s=localStorage.getItem('hirepilot-theme');var t=(s==='dark'||s==='light')?s:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');if(t==='dark')document.documentElement.classList.add('dark');document.documentElement.dataset.theme=t;}catch(e){}})();`;

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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Hoisted into <head> automatically by Next.js */}
        <Script
          id="hirepilot-theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeInit }}
        />
        {children}
      </body>
    </html>
  );
}
