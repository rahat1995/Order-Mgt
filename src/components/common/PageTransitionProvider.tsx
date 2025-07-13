
'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

function PageTransitionInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const key = `${pathname}?${searchParams.toString()}`;

  const variants = {
    initial: {
      opacity: 0,
      y: 15,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: 'easeInOut',
      },
    },
    exit: {
      opacity: 0,
      y: -15,
      transition: {
        duration: 0.2,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={key}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={null}>
            <PageTransitionInner>{children}</PageTransitionInner>
        </Suspense>
    );
}
