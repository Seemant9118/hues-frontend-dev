'use client';

import Sidebar from '@/components/ui/Sidebar';
import { AuthProvider } from '@/context/AuthContext';
import { RBACProvider } from '@/context/RBACcontext';
import {
  SidebarLayoutProvider,
  useSidebarLayout,
} from '@/context/SidebarLayoutContext';
import { UserProvider } from '@/context/UserContext';
import { FeatureFlagProvider } from '@/context/FeatureFlagContext';
import { parseJwt } from '@/appUtils/helperFunctions';
import AuthInitializer from '@/components/wrappers/AuthInitializer';
import useClarityTracking from '@/hooks/useClarityTracking';
import { LocalStorageService } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

function DashboardShell({ children }) {
  const { isCollapsed } = useSidebarLayout();

  return (
    <section
      className="relative grid h-screen min-w-0 flex-grow overflow-hidden transition-[grid-template-columns] duration-300 ease-in-out [grid-template-columns:var(--sidebar-width)_minmax(0,1fr)]"
      style={{ '--sidebar-width': isCollapsed ? '72px' : '225px' }}
    >
      <Sidebar />
      <main className="scrollBarStyles min-w-0 overflow-y-auto overflow-x-hidden bg-white px-4">
        {children}
      </main>
    </section>
  );
}

export default function DashBoardLayout({ children }) {
  const token = LocalStorageService.get('token');
  const router = useRouter();
  const [userRoles, setUserRoles] = useState(null);

  useEffect(() => {
    const tokenData = parseJwt(token);
    setUserRoles(tokenData?.roles);
  }, [token]);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        const { action, url } = event.data || {};
        if (action === 'navigate' && url) {
          window.focus();
          router.push(url); // SPA navigation, no hard reload
        }
      });
    }
  }, [router]);

  useClarityTracking();

  return (
    <AuthProvider>
      <AuthInitializer />
      <RBACProvider userRoles={userRoles}>
        <FeatureFlagProvider>
          <UserProvider>
            <SidebarLayoutProvider>
              <DashboardShell>{children}</DashboardShell>
            </SidebarLayoutProvider>
          </UserProvider>
        </FeatureFlagProvider>
      </RBACProvider>
    </AuthProvider>
  );
}
