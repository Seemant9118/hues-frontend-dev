import QueryWrapper from '@/components/wrappers/QueryWrapper';
import { CountNotificationsProvider } from '@/context/CountNotificationsContext';
import { Toaster } from 'sonner';
import './globals.css';
import { NextIntlClientProvider } from 'next-intl';
import NotFound from './not-found';

// Font files can be colocated inside of `app`
export const metadata = {
  title: 'Hues! ~ AI for .. All',
  description: 'HUES DASHBOARD',
};

export default async function RootLayout({ children, params: { locale } }) {
  let messages = {};

  try {
    const dashboardMessages = (
      await import(`../../../dictonaries/dashboard/${locale}.json`)
    ).default;

    const sidebarMessages = (
      await import(`../../../dictonaries/sidebar/${locale}.json`)
    ).default;

    const inventoryMessages = await import(
      `../../../dictonaries/inventory/${locale}.json`
    );

    const catalogueMessages = await import(
      `../../../dictonaries/catalogue/${locale}.json`
    );

    // Merge the dashboard and sidebar messages into one object
    messages = {
      ...dashboardMessages,
      ...sidebarMessages,
      ...inventoryMessages,
      ...catalogueMessages,
    };
  } catch (error) {
    NotFound(); // Handle the error by showing a 404 page
  }

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <div className="absolute">
            <Toaster richColors position="top-right" duration="2500" />
          </div>

          <CountNotificationsProvider>
            <QueryWrapper>{children}</QueryWrapper>
          </CountNotificationsProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
