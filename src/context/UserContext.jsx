'use client';

import { handleLogoutWithFcmDeregister } from '@/appUtils/helperFunctions';
import { LocalStorageService } from '@/lib/utils';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const Token = LocalStorageService.get('token');
    const userProfile = LocalStorageService.get('user_profile');

    // Use regex to match `/login/*` paths
    const isLoginChildPage = /^\/login(\/.*)?$/.test(pathname);

    if (!Token) {
      if (isLoginChildPage) {
        // Redirect to base /login if user tries to access child pages of /login without token
        router.push('/login');
      } else {
        // Store the original URL for post-login redirection
        LocalStorageService.set('redirectUrl', pathname);
        // Redirect to /login if not authenticated
        router.push('/login');
      }
    } else {
      // If authenticated, set token and user profile
      setToken(Token);
      setProfile(userProfile);
    }
    setLoading(false); // Mark initialization as complete
  }, [pathname, router]);

  const logout = () => {
    handleLogoutWithFcmDeregister(router);
  };

  // Render loading state during initialization
  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-2">
        <Image
          src={'/hues_logo.png'}
          height={40}
          width={100}
          placeholder="blur"
          alt="Logo"
          blurDataURL="/hues_logo.png"
        />
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <UserContext.Provider
      value={{ profile, setProfile, token, logout, setLoading }}
    >
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
