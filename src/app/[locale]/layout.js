import QueryWrapper from '@/components/wrappers/QueryWrapper';
import { CountNotificationsProvider } from '@/context/CountNotificationsContext';
import { NextIntlClientProvider } from 'next-intl';
import { cookies } from 'next/headers';
import { Toaster } from 'sonner';
import './globals.css';
import '../../bones/registry';
// eslint-disable-next-line camelcase
import ClarityScript from '@/appUtils/ClarityScript';
import FCMProvider from '@/context/FCMProvider';
import { loadDictionaryMessages } from '@/lib/localeUtils';
import nanumPenScript from 'next/font/local';
import NotFound from './not-found';

// Font configuration
const nanumPen = nanumPenScript({
  src: '../../../public/fonts/NanumPenScript-Regular.ttf',
  variable: '--font-nanum-pen',
  display: 'swap',
});

// Metadata configuration
export const metadata = {
  title: 'Hues! ~ Private Beta · Built deliberately. Released carefully.',
  description:
    'ERP: A private operating system for modern businesses—governed access, verifiable records, and intelligent workflows.',
};

function getCurrentLocale(locale) {
  const cookieStore = cookies();
  const localeFromCookie = cookieStore.get('NEXT_LOCALE')?.value;
  return localeFromCookie || locale;
}

function AppProviders({ children }) {
  return (
    <QueryWrapper>
      <CountNotificationsProvider>
        <FCMProvider>{children}</FCMProvider>
      </CountNotificationsProvider>
    </QueryWrapper>
  );
}

export default async function RootLayout({ children, params: { locale } }) {
  const currLocale = getCurrentLocale(locale);
  let messages = {};

  try {
    messages = await loadDictionaryMessages(currLocale);
  } catch (error) {
    return <NotFound />;
  }

  return (
    <html lang={currLocale} className={nanumPen.variable}>
      <head>
        <ClarityScript />
      </head>
      <body>
        <NextIntlClientProvider locale={currLocale} messages={messages}>
          {/* Toast notifications */}
          <div className="absolute">
            <Toaster
              richColors
              position="top-right"
              duration={2500}
              closeButton
              pauseOnHover
            />
          </div>

          {/* App providers */}
          <AppProviders>{children}</AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
