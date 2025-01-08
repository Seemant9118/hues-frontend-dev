'use client';

import { createContext, useContext, useState } from 'react';

// Create the context
const CountNotificationsContext = createContext();

// Provider component
export const CountNotificationsProvider = ({ children }) => {
  const [totalUnreadNotifications, setTotalUnreadNotifications] = useState(0);

  if (CountNotificationsContext === undefined) {
    throw new Error(
      'useUnreadNotificationsCount must be used within a UnreadCountNotificationsProvider',
    );
  }

  return (
    <CountNotificationsContext.Provider
      value={{ totalUnreadNotifications, setTotalUnreadNotifications }}
    >
      {children}
    </CountNotificationsContext.Provider>
  );
};

// Hook to use the context
export const useNotificationsCount = () => {
  const context = useContext(CountNotificationsContext);

  if (!context) {
    throw new Error(
      'useUnreadNotificationsCount must be used within a UnreadCountNotificationsProvider',
    );
  }

  return context;
};
