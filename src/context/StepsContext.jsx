'use client';

import { createContext, useContext, useState } from 'react';

const StepsContext = createContext();

export const StepsProvider = ({ children }) => {
  const [currStep, setCurrStep] = useState(1);

  return (
    <StepsContext.Provider value={{ currStep, setCurrStep }}>
      {children}
    </StepsContext.Provider>
  );
};

export const useStep = () => useContext(StepsContext);
