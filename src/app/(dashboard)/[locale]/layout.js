import Sidebar from '@/components/ui/Sidebar';
import { UserProvider } from '@/context/UserContext';
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';

export default async function DashBoardLayout({
  children,
  params: { locale },
}) {
  let messages = {};

  try {
    const dashboardMessages = (
      await import(`../../../../dictonaries/dashboard/${locale}.json`)
    ).default;

    const sidebarMessages = (
      await import(`../../../../dictonaries/sidebar/${locale}.json`)
    ).default;

    // Merge the dashboard and sidebar messages into one object
    messages = { ...dashboardMessages, ...sidebarMessages };
  } catch (error) {
    notFound(); // Handle the error by showing a 404 page
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <UserProvider>
        <section className="scrollBarStyles relative grid h-screen flex-grow grid-cols-[225px,_1fr] overflow-y-auto">
          <Sidebar />
          <main className="scrollBarStyles overflow-y-auto bg-white px-4">
            {children}
          </main>
        </section>
      </UserProvider>
    </NextIntlClientProvider>
  );
}
