'use client';

import { useDeveloperMode } from '@/context/DeveloperModeContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function DeveloperModeWrapper({ children, redirectTo = '/dashboard' }) {
  const { isDeveloperMode } = useDeveloperMode();
  const router = useRouter();

  useEffect(() => {
    if (!isDeveloperMode && redirectTo) {
      router.replace(redirectTo);
    }
  }, [isDeveloperMode, redirectTo, router]);

  if (!isDeveloperMode) return null;

  return children;
}
