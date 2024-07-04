import QueryWrapper from '@/components/wrappers/QueryWrapper';
import { StepsProvider } from '@/context/StepsContext';
import { Toaster } from 'sonner';
import './globals.css';

// Font files can be colocated inside of `app`
export const metadata = {
  title: 'Hues! ~ AI for .. All',
  description: 'HUES DASHBOARD',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`flex h-screen flex-col gap-5 bg-[#F6F9FF]`}>
        <div className="absolute">
          <Toaster richColors position="top-right" duration="2500" />
        </div>

        <StepsProvider>
          <QueryWrapper>{children}</QueryWrapper>
        </StepsProvider>
      </body>
    </html>
  );
}
