'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { PageLoader } from './PageLoader';

function PageTransitionInner({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    setIsLoading(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleAnchorClick = (event: MouseEvent) => {
      try {
        const target = event.target as HTMLElement;
        const anchor = target.closest('a');

        if (anchor) {
          const url = new URL(anchor.href);
          const newPath = url.pathname + url.search;
          const currentPath = window.location.pathname + window.location.search;

          if (url.origin === window.location.origin && newPath !== currentPath && !anchor.hasAttribute('download') && anchor.target !== '_blank') {
            setIsLoading(true);
          }
        }
      } catch (err) {
        // Ignore errors from invalid anchor hrefs
      }
    };
    
    const handlePopState = () => {
      setIsLoading(true);
    };

    document.addEventListener('click', handleAnchorClick);
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.removeEventListener('click', handleAnchorClick);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return (
    <>
      {isLoading && <PageLoader />}
      {children}
    </>
  );
}

export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={null}>
            <PageTransitionInner>{children}</PageTransitionInner>
        </Suspense>
    );
}
