'use client';

import { LocalStorageService } from '@/lib/utils';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const SIDEBAR_COLLAPSE_KEY = 'hues.sidebar.collapsed';
const COLLAPSE_BREAKPOINT = 1024;
const DEFAULT_COLLAPSE_BREAKPOINT = 1280;

const SidebarLayoutContext = createContext(undefined);

export function SidebarLayoutProvider({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isCompactViewport, setIsCompactViewport] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    const initialViewportCompact = window.innerWidth < COLLAPSE_BREAKPOINT;
    setIsCompactViewport(initialViewportCompact);

    const storedState = LocalStorageService.get(SIDEBAR_COLLAPSE_KEY);
    const initialCollapsed =
      storedState === null
        ? window.innerWidth < DEFAULT_COLLAPSE_BREAKPOINT
        : storedState === 'true';

    setIsCollapsed(initialCollapsed);
    setHasHydrated(true);

    let previousViewportCompact = initialViewportCompact;
    const handleResize = () => {
      const nextViewportCompact = window.innerWidth < COLLAPSE_BREAKPOINT;
      setIsCompactViewport(nextViewportCompact);

      if (nextViewportCompact && !previousViewportCompact) {
        setIsCollapsed(true);
      }

      previousViewportCompact = nextViewportCompact;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!hasHydrated || typeof window === 'undefined') return;
    LocalStorageService.set(SIDEBAR_COLLAPSE_KEY, String(isCollapsed));
  }, [hasHydrated, isCollapsed]);

  const toggleSidebar = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  const value = useMemo(
    () => ({
      hasHydrated,
      isCollapsed,
      isCompactViewport,
      setIsCollapsed,
      toggleSidebar,
    }),
    [hasHydrated, isCollapsed, isCompactViewport, toggleSidebar],
  );

  return (
    <SidebarLayoutContext.Provider value={value}>
      {children}
    </SidebarLayoutContext.Provider>
  );
}

export function useSidebarLayout() {
  const context = useContext(SidebarLayoutContext);

  if (!context) {
    throw new Error(
      'useSidebarLayout must be used within a SidebarLayoutProvider',
    );
  }

  return context;
}
