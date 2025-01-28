import QueryWrapper from '@/components/wrappers/QueryWrapper';
import { CountNotificationsProvider } from '@/context/CountNotificationsContext';
import { Toaster } from 'sonner';
import './globals.css';

// Font files can be colocated inside of `app`
export const metadata = {
  title: 'Hues! ~ AI for .. All',
  description: 'HUES DASHBOARD',
};

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <div className="absolute">
          <Toaster richColors position="top-right" duration="2500" />
        </div>

        <CountNotificationsProvider>
          <QueryWrapper>{children}</QueryWrapper>
        </CountNotificationsProvider>
      </body>
    </html>
  );
}
