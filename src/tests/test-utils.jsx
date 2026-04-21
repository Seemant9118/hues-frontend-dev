import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NextIntlClientProvider } from 'next-intl';
import { CountNotificationsProvider } from '@/context/CountNotificationsContext';
import { StepsProvider } from '@/context/StepsContext';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Create a custom render function that includes all providers
const AllTheProviders = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <NextIntlClientProvider locale="en" messages={{}}>
        <CountNotificationsProvider>
          <StepsProvider>{children}</StepsProvider>
        </CountNotificationsProvider>
      </NextIntlClientProvider>
    </QueryClientProvider>
  );
};

const customRender = (ui, options) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// re-export everything
export * from '@testing-library/react';

// override render method
export { customRender as render, userEvent };
