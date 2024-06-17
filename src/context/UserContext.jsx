'use client';

import { LocalStorageService } from '@/lib/utils';
import { usePathname, useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const Token = LocalStorageService.get('token');
    // const profile = LocalStorageService.get('user_profile');

    if (!Token) {
      router.push(`/login?redirect=${pathname}`);
    }
    if (Token) {
      setToken(Token);
    }
  }, []);

  //   const logout = () => {
  //     LocalStorageService.clear();
  //     router.push("/auth/creator/login");
  //   };

  return (
    <UserContext.Provider value={{ profile, setProfile }}>
      {token ? children : null}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
