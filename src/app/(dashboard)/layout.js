"use client";
import React from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { UserProvider } from "@/context/UserContext";
import { usePathname } from "next/navigation";


export default function RootLayout({ children }) {
  const pathName = usePathname();

  return (
    <UserProvider>
      <Header />
      <div className="flex px-10 items-center">
        <h3 className="text-2xl font-bold text-darkText">Profile</h3>
      </div>
      <section className="px-10 grid grid-cols-[250px,_1fr] gap-5 flex-grow pb-5 max-h-full overflow-y-auto relative scrollBarStyles">
        <Sidebar />
        {pathName === "/" ? (
          children
        ) : (
          <main className="bg-white rounded-xl shadow-[0_4px_6px_0_#3288ED1A] p-4 overflow-y-auto scrollBarStyles">
            {children}
          </main>
        )}
      </section>
    </UserProvider>
  );
}
