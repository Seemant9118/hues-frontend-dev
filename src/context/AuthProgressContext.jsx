'use client';

import React, { createContext, useContext, useState } from 'react';

// Create the context
const AuthProgressContext = createContext();

// Create a provider component
export const AuthProgressProvider = ({ children }) => {
  const [authProgress, setAuthProgress] = useState({
    isPanVerified: false,
    isAadharVerified: false,
    isConfirmation: false,
  });

  const updateAuthProgress = (step, value) => {
    setAuthProgress((prevState) => ({
      ...prevState,
      [step]: value,
    }));
  };

  return (
    <AuthProgressContext.Provider value={{ authProgress, updateAuthProgress }}>
      {children}
    </AuthProgressContext.Provider>
  );
};

// Custom hook to use the AuthProgressContext
export const useAuthProgress = () => {
  const context = useContext(AuthProgressContext);
  if (!context) {
    throw new Error(
      'useAuthProgress must be used within an AuthProgressProvider',
    );
  }
  return context;
};
