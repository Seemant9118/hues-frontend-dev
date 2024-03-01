import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });


// Font files can be colocated inside of `app`
export const metadata = {
  title: "HUES",
  description: "HUES DASHBOARD",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`bg-[#F6F9FF] flex flex-col gap-5 h-screen`}
      >
        <Header />
        <div className="flex px-10 items-center">
          <h3 className="text-2xl font-bold text-[#121212]">Profile</h3>
        </div>
        <section className="px-10 grid grid-cols-[250px,_1fr] gap-5 flex-grow pb-5">
          <Sidebar />
          <main className="bg-white rounded-xl shadow-[0_4px_6px_0_#3288ED1A] p-4">
            {children}
          </main>
        </section>
      </body>
    </html>
  );
}
