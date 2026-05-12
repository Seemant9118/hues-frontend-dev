/* eslint-disable no-unused-vars */

'use client';

import { FEATURE_FLAGS } from '@/lib/featureFlags';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

function resolveFlags(rawFlags, parentKey = '', parentActive = true) {
  return Object.entries(rawFlags).reduce((acc, [key, config]) => {
    const fullKey = parentKey ? `${parentKey}.${key}` : key;

    // A flag is active only if its parent is active AND it is strictly enabled
    const isActive = parentActive && config.enabled;

    const { features, subModules, ...flagData } = config;

    let result = {
      ...acc,
      [fullKey]: {
        ...flagData,
        isActive,
      },
    };

    // Resolve subModules recursively
    if (subModules) {
      result = {
        ...result,
        ...resolveFlags(subModules, fullKey, isActive),
      };
    }

    // Resolve features recursively
    if (features) {
      result = {
        ...result,
        ...resolveFlags(features, fullKey, isActive),
      };
    }

    return result;
  }, {});
}
const FeatureFlagContext = createContext(null);

export function FeatureFlagProvider({ children }) {
  const [flags, setFlags] = useState(() => resolveFlags(FEATURE_FLAGS));
  const [isLoading, setIsLoading] = useState(false);

  // ─── PHASE 2: Uncomment when backend is ready ───────────────────────────
  // useEffect(() => {
  //   setIsLoading(true);
  //   fetch('/api/admin/feature-flags')
  //     .then((res) => {
  //       if (!res.ok) throw new Error('Failed to fetch feature flags');
  //       return res.json();
  //     })
  //     .then((remoteFlags) => setFlags(resolveFlags(remoteFlags)))
  //     .catch(() => {
  //       // Backend unavailable — silently fall back to local config.
  //       // Local config is already set as initial state.
  //       if (isDev) {
  //         console.warn('[FeatureFlags] Could not load remote flags. Using local config.');
  //       }
  //     })
  //     .finally(() => setIsLoading(false));
  // }, []);
  // ────────────────────────────────────────────────────────────────────────

  const isEnabled = useCallback(
    (flagName) => {
      const flag = flags[flagName];
      if (!flag) {
        return false;
      }
      return flag.isActive;
    },
    [flags],
  );

  const isRouteEnabled = useCallback(
    (path) => {
      return Object.values(flags).every((flag) => {
        const isControlled = flag.routePrefixes?.some((prefix) =>
          path.startsWith(prefix),
        );
        return !(isControlled && !flag.isActive);
      });
    },
    [flags],
  );

  const value = useMemo(
    () => ({ flags, isLoading, isEnabled, isRouteEnabled }),
    [flags, isLoading, isEnabled, isRouteEnabled],
  );

  return (
    <FeatureFlagContext.Provider value={value}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

export function useFeatureFlags() {
  const ctx = useContext(FeatureFlagContext);
  if (!ctx) {
    throw new Error(
      '[FeatureFlags] useFeatureFlags() must be used inside <FeatureFlagProvider>. ' +
        'Add <FeatureFlagProvider> to your dashboard layout.',
    );
  }
  return ctx;
}
