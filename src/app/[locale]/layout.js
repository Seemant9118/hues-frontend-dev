import QueryWrapper from '@/components/wrappers/QueryWrapper';
import { CountNotificationsProvider } from '@/context/CountNotificationsContext';
import { NextIntlClientProvider } from 'next-intl';
import { cookies } from 'next/headers';
import { Toaster } from 'sonner';
import './globals.css';
// eslint-disable-next-line camelcase
import { Nanum_Pen_Script } from 'next/font/google';
import NotFound from './not-found';

const nanumPen = Nanum_Pen_Script({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-nanum-pen',
  display: 'swap',
});

// Font files can be colocated inside of `app`
export const metadata = {
  title: 'Hues! ~ AI for .. All',
  description: 'HUES DASHBOARD',
};

export default async function RootLayout({ children, params: { locale } }) {
  const cookieStore = cookies();
  const localeFromCookie = cookieStore.get('NEXT_LOCALE')?.value;
  const currLocale = localeFromCookie || locale;

  let messages = {};

  try {
    const authMessages = await import(
      `../../../dictonaries/auth/${currLocale}.json`
    );
    const dashboardMessages = (
      await import(`../../../dictonaries/dashboard/${currLocale}.json`)
    ).default;

    const sidebarMessages = (
      await import(`../../../dictonaries/sidebar/${currLocale}.json`)
    ).default;

    const inventoryMessages = await import(
      `../../../dictonaries/inventory/${currLocale}.json`
    );

    const catalogueMessages = await import(
      `../../../dictonaries/catalogue/${currLocale}.json`
    );

    const salesMessages = await import(
      `../../../dictonaries/sales/${currLocale}.json`
    );

    const purchaseMessages = await import(
      `../../../dictonaries/purchases/${currLocale}.json`
    );

    const clientMessages = await import(
      `../../../dictonaries/client/${currLocale}.json`
    );

    const vendorMessages = await import(
      `../../../dictonaries/vendor/${currLocale}.json`
    );

    const customerMessages = await import(
      `../../../dictonaries/customers/${currLocale}.json`
    );

    const memberMessages = await import(
      `../../../dictonaries/members/${currLocale}.json`
    );

    const notificationsMessages = await import(
      `../../../dictonaries/notification/${currLocale}.json`
    );

    const settingsMessages = await import(
      `../../../dictonaries/settings/${currLocale}.json`
    );

    const profileMessages = await import(
      `../../../dictonaries/profile/${currLocale}.json`
    );

    const componentsMessages = await import(
      `../../../dictonaries/components/${currLocale}.json`
    );

    // Merge the dashboard and sidebar messages into one object
    messages = {
      ...authMessages,
      ...dashboardMessages,
      ...sidebarMessages,
      ...inventoryMessages,
      ...catalogueMessages,
      ...salesMessages,
      ...purchaseMessages,
      ...clientMessages,
      ...vendorMessages,
      ...customerMessages,
      ...memberMessages,
      ...notificationsMessages,
      ...settingsMessages,
      ...profileMessages,
      ...componentsMessages,
    };
  } catch (error) {
    NotFound(); // Handle the error by showing a 404 page
  }

  return (
    <html lang={locale} className={`${nanumPen.variable}`}>
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
