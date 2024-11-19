'use client';

import Sidebar from '@/components/ui/Sidebar';
import { UserProvider } from '@/context/UserContext';

export default function DashBoardLayout({ children }) {
  return (
    <UserProvider>
      {/* <Header /> */}

      <section className="scrollBarStyles relative grid h-screen flex-grow grid-cols-[225px,_1fr] overflow-y-auto">
        <Sidebar />
        <main className="scrollBarStyles overflow-y-auto bg-white px-4">
          {children}
        </main>
      </section>
    </UserProvider>
  );
}
