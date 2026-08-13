import { MarketingNavbar } from '@/components/layout/marketing-navbar';
import { MarketingFooter } from '@/components/layout/marketing-footer';
import { MotionWrap } from '@/components/layout/motion-wrap';

// Force Node.js runtime — auth() and Prisma calls below require it.
export const runtime = 'nodejs';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNavbar />
      <main className="flex-1">
        <MotionWrap>{children}</MotionWrap>
      </main>
      <MarketingFooter />
    </div>
  );
}
