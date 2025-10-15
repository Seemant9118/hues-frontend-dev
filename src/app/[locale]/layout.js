import QueryWrapper from '@/components/wrappers/QueryWrapper';
import { CountNotificationsProvider } from '@/context/CountNotificationsContext';
import { NextIntlClientProvider } from 'next-intl';
import { cookies } from 'next/headers';
import { Toaster } from 'sonner';
import './globals.css';
// eslint-disable-next-line camelcase
import FCMProvider from '@/context/FCMProvider';
import { Nanum_Pen_Script as nanumPenScript } from 'next/font/google';
import { loadDictionaryMessages } from '@/lib/localeUtils';
import NotFound from './not-found';

// Font configuration
const nanumPen = nanumPenScript({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-nanum-pen',
  display: 'swap',
});

// Metadata configuration
export const metadata = {
  title: 'Hues! ~ AI for .. All',
  description: 'HUES DASHBOARD',
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

const isValidEnv =
  process.env.NEXT_PUBLIC_NODE_ENV === 'dev' ||
  process.env.NEXT_PUBLIC_NODE_ENV === 'production';

export default async function RootLayout({ children, params: { locale } }) {
  const currLocale = getCurrentLocale(locale);
  let messages = {};

  try {
    messages = await loadDictionaryMessages(currLocale);
  } catch (error) {
    return <NotFound />;
  }

  return (
    <html lang={locale} className={nanumPen.variable}>
      <head>
        {isValidEnv && (
          <script
            type="text/javascript"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
        (function(c,l,a,r,i,t,y){
          c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments) };
          t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i;
          y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
        })(window, document, "clarity", "script", "tqe8tlvrll");
      `,
            }}
          />
        )}
      </head>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
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
