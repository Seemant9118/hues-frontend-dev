"use client";
import React from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { UserProvider } from "@/context/UserContext";
import VerifyDetail from "@/components/VerifyDetail";

export default function DashBoardLayout({ children }) {
  return (
    <UserProvider>
      <Header />
      {/* Veridy Detail component - digilocker flow */}
      {/* <VerifyDetail /> */}

      <section className="px-10 grid grid-cols-[250px,_1fr] gap-5 flex-grow pb-5 max-h-full overflow-y-auto relative scrollBarStyles">
        <Sidebar />
        <main className="bg-white rounded-xl shadow-[0_4px_6px_0_#3288ED1A] px-4 pb-4 overflow-y-auto scrollBarStyles">
          {children}
        </main>
      </section>
    </UserProvider>
  );
}
