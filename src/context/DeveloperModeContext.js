'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { usePermission } from '@/hooks/usePermissions';

const DeveloperModeContext = createContext(null);

export const DeveloperModeProvider = ({ children }) => {
  const [isDeveloperMode, setIsDeveloperMode] = useState(false);
  const [isGlobalToggleVisible, setIsGlobalToggleVisible] = useState(true);

  const isFeatureEnabled = useFeatureFlag('DEVELOPER_MODE_TOGGLE');
  const { hasPermission } = usePermission();
  const hasConfigPermission = hasPermission('permission:form-config-manage');
  const effectiveIsDeveloperMode =
    isDeveloperMode && isFeatureEnabled && hasConfigPermission;

  // Load from localStorage on mount
  useEffect(() => {
    const savedDevMode = localStorage.getItem('isDeveloperMode');
    const savedToggleVisible = localStorage.getItem('isGlobalToggleVisible');

    if (savedDevMode !== null) {
      setIsDeveloperMode(savedDevMode === 'true');
    }
    if (savedToggleVisible !== null) {
      setIsGlobalToggleVisible(savedToggleVisible === 'true');
    }
  }, []);

  const setDeveloperMode = (value) => {
    setIsDeveloperMode(value);
    localStorage.setItem('isDeveloperMode', value.toString());
  };

  const setGlobalToggleVisible = (value) => {
    setIsGlobalToggleVisible(value);
    localStorage.setItem('isGlobalToggleVisible', value.toString());
  };

  return (
    <DeveloperModeContext.Provider
      value={{
        isDeveloperMode: effectiveIsDeveloperMode,
        setDeveloperMode,
        isGlobalToggleVisible,
        setGlobalToggleVisible,
      }}
    >
      {children}
    </DeveloperModeContext.Provider>
  );
};

export const useDeveloperMode = () => {
  const context = useContext(DeveloperModeContext);
  if (!context) {
    throw new Error(
      'useDeveloperMode must be used within a DeveloperModeProvider',
    );
  }
  return context;
};
