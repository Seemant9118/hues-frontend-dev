'use client';

import { useFeatureFlags } from '@/context/FeatureFlagContext';

export function useFeatureFlag(flagName) {
  const { isEnabled } = useFeatureFlags();
  return isEnabled(flagName);
}

export function useIsRouteEnabled() {
  const { isRouteEnabled } = useFeatureFlags();
  return isRouteEnabled;
}
