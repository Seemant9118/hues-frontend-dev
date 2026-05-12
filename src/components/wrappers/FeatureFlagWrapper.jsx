'use client';

import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { ArrowLeftCircle, FlaskConical } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '../ui/button';

export function FeatureFlagWrapper({ flag, children, fallback, redirectTo }) {
  const isEnabled = useFeatureFlag(flag);
  const router = useRouter();

  useEffect(() => {
    if (!isEnabled && redirectTo) {
      router.replace(redirectTo);
    }
  }, [isEnabled, redirectTo, router]);

  if (isEnabled) return children;

  if (redirectTo) return null;

  if (fallback !== undefined) return fallback;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center">
      <FlaskConical className="mb-4 h-14 w-14 text-blue-400" />
      <h1 className="mb-2 text-2xl font-bold text-gray-800">
        Feature Not Available
      </h1>
      <p className="mb-6 max-w-md text-gray-600">
        This feature is currently under development and is not available in this
        environment.
      </p>
      <Link href="/dashboard">
        <Button size="sm" className="inline-flex items-center gap-2 rounded">
          <ArrowLeftCircle className="h-5 w-5" />
          Back to Dashboard
        </Button>
      </Link>
    </div>
  );
}
