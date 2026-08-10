import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign in to HirePilot',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted px-4 py-12">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
