'use client';

import { RBAC_CONFIG } from '@/lib/rbacConfig';
import { createContext, useContext } from 'react';

const RBACContext = createContext(null);

export const RBACProvider = ({ userRoles = [], children }) => {
  const hasPageAccess = (page) => {
    const config = RBAC_CONFIG[page];
    if (!config) return false;
    return userRoles.some((role) => config.allowedRoles.includes(role));
  };

  const canPerformAction = (page, action) => {
    const config = RBAC_CONFIG[page];
    if (!config || !config.actions?.[action]) return false;
    return userRoles.some((role) => config.actions[action].includes(role));
  };

  return (
    <RBACContext.Provider
      value={{ userRoles, hasPageAccess, canPerformAction }}
    >
      {children}
    </RBACContext.Provider>
  );
};

export const useRBAC = () => {
  const context = useContext(RBACContext);
  if (!context) throw new Error('useRBAC must be used inside RBACProvider');
  return context;
};
