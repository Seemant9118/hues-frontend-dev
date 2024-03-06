import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

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
        className={`bg-[#F6F9FF] flex flex-col gap-5 min-h-screen max-h-screen`}
      >
        <Toaster richColors />
        {children}
      </body>
    </html>
  );
}
