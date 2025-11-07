'use client';

import Sidebar from '@/components/ui/Sidebar';
import { AuthProvider } from '@/context/AuthContext';
import { RBACProvider } from '@/context/RBACcontext';
import { UserProvider } from '@/context/UserContext';

import { parseJwt } from '@/appUtils/helperFunctions';
import AuthInitializer from '@/components/wrappers/AuthInitializer';
import useClarityTracking from '@/hooks/useClarityTracking';
import { LocalStorageService } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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
        <UserProvider>
          <section className="scrollBarStyles relative grid h-screen flex-grow grid-cols-[225px,_1fr] overflow-y-auto">
            <Sidebar />
            <main className="scrollBarStyles overflow-y-auto bg-white px-4">
              {children}
            </main>
          </section>
        </UserProvider>
      </RBACProvider>
    </AuthProvider>
  );
}
