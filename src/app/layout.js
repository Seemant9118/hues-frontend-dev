import QueryWrapper from "@/components/wrappers/QueryWrapper";
import { Toaster } from "sonner";
import "./globals.css";

// Font files can be colocated inside of `app`
export const metadata = {
  title: "Hues! ~ AI for .. All",
  description: "HUES DASHBOARD",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`bg-[#F6F9FF] flex flex-col gap-5 h-screen`}>
        <Toaster richColors position="top-right" />
        <QueryWrapper>{children}</QueryWrapper>
      </body>
    </html>
  );
}
