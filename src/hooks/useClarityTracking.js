'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function useClarityTracking() {
  const pathname = usePathname();

  useEffect(() => {
    if (
      process.env.NEXT_PUBLIC_NODE_ENV === 'dev' &&
      process.env.NEXT_PUBLIC_NODE_ENV === 'production' &&
      typeof window !== 'undefined' &&
      typeof window.clarity === 'function'
    ) {
      // Log route changes as custom events
      window.clarity('event', 'page_change', { path: pathname });
    }
  }, [pathname]);
}
