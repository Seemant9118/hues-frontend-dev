import QueryWrapper from '@/components/wrappers/QueryWrapper';
import { CountNotificationsProvider } from '@/context/CountNotificationsContext';
import { NextIntlClientProvider } from 'next-intl';
import { Toaster } from 'sonner';
import './globals.css';
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

    const salesMessages = await import(
      `../../../dictonaries/sales/${locale}.json`
    );

    const purchaseMessages = await import(
      `../../../dictonaries/purchases/${locale}.json`
    );

    const clientMessages = await import(
      `../../../dictonaries/client/${locale}.json`
    );

    const vendorMessages = await import(
      `../../../dictonaries/vendor/${locale}.json`
    );

    const notificationsMessages = await import(
      `../../../dictonaries/notification/${locale}.json`
    );

    const settingsMessages = await import(
      `../../../dictonaries/settings/${locale}.json`
    );

    const profileMessages = await import(
      `../../../dictonaries/profile/${locale}.json`
    );

    const componentsMessages = await import(
      `../../../dictonaries/components/${locale}.json`
    );

    // Merge the dashboard and sidebar messages into one object
    messages = {
      ...dashboardMessages,
      ...sidebarMessages,
      ...inventoryMessages,
      ...catalogueMessages,
      ...salesMessages,
      ...purchaseMessages,
      ...clientMessages,
      ...vendorMessages,
      ...notificationsMessages,
      ...settingsMessages,
      ...profileMessages,
      ...componentsMessages,
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
