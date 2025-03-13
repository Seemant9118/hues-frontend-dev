'use client';

import { LocalStorageService } from '@/lib/utils';
import { createContext, useContext, useState } from 'react';

const UserDataContext = createContext();

export const UserDataProvider = ({ children }) => {
  const userID = LocalStorageService.get('user_profile');
  const [userData, setUserData] = useState({
    userId: userID,
    name: '',
    dateOfBirth: '',
    panNumber: '',
    isTermsAndConditionApplied: false,
  });

  return (
    <UserDataContext.Provider value={{ userData, setUserData }}>
      {children}
    </UserDataContext.Provider>
  );
};

export const useUserData = () => useContext(UserDataContext);
