'use client';

import { AuthProvider } from '@/context/AuthContext';
import { RBACProvider } from '@/context/RBACcontext';
import { UserProvider } from '@/context/UserContext';
import Sidebar from '@/components/ui/Sidebar';

import { LocalStorageService } from '@/lib/utils';
import { parseJwt } from '@/appUtils/helperFunctions';
import { useEffect, useState } from 'react';
import AuthInitializer from '@/components/wrappers/AuthInitializer';

export default function DashBoardLayout({ children }) {
  const token = LocalStorageService.get('token');
  const [userRoles, setUserRoles] = useState(null);

  useEffect(() => {
    const tokenData = parseJwt(token);
    setUserRoles(tokenData?.roles);
  }, [token]);

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
