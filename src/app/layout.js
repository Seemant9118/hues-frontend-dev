import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import QueryWrapper from "@/context/QueryWrapper";
import { UserProvider } from "@/context/UserContext";

const inter = Inter({ subsets: ["latin"] });

// Font files can be colocated inside of `app`
export const metadata = {
  title: "Hues! ~ AI for .. All",
  description: "HUES DASHBOARD",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`bg-[#F6F9FF] flex flex-col gap-5 min-h-screen max-h-screen`}
      >
        <QueryWrapper>
          <Toaster richColors position="top-right" />
          {children}
        </QueryWrapper>
      </body>
    </html>
  );
}
