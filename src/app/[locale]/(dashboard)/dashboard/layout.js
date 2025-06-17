'use client';

import { parseJwt } from '@/appUtils/helperFunctions';
import Sidebar from '@/components/ui/Sidebar';
import { RBACProvider } from '@/context/RBACcontext';
import { UserProvider } from '@/context/UserContext';
import { LocalStorageService } from '@/lib/utils';
import { useEffect, useState } from 'react';

export default function DashBoardLayout({ children }) {
  const token = LocalStorageService.get('token');
  const [userRoles, setUserRoles] = useState(null);

  useEffect(() => {
    const tokenData = parseJwt(token);
    setUserRoles(tokenData?.roles);
  }, [token]);

  return (
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
  );
}
