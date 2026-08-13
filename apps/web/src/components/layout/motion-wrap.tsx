'use client';

// Page-transition wrapper for the public marketing surfaces. Uses
// AnimatePresence keyed by pathname so that navigating between /, /jobs,
// /jobs/[id] etc. cross-fades the content rather than hard-cutting.
// Honors prefers-reduced-motion via Framer's built-in respect.

import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

export function MotionWrap({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        style={{ width: '100%' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
