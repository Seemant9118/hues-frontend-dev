import QueryWrapper from "@/components/wrappers/QueryWrapper";
import { Toaster } from "sonner";
import "./globals.css";
import TopLoader from "@/components/ui/TopLoader";

// Font files can be colocated inside of `app`
export const metadata = {
  title: "Hues! ~ AI for .. All",
  description: "HUES DASHBOARD",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Toaster richColors position="top-right" duration="1000" />
      <body className={`bg-[#F6F9FF] flex flex-col gap-5 h-screen`}>
        <QueryWrapper>{children}</QueryWrapper>
      </body>
    </html>
  );
}
