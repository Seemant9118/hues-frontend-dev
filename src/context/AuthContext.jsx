import { createContext, useContext, useState } from 'react';

const AuthContext = createContext({
  role: null,
  permissions: [],
  setAuthData: () => {},
});

export const AuthProvider = ({ children }) => {
  const [role, setRole] = useState(null);
  const [permissions, setPermissions] = useState([]); // now array of permission objects

  const setAuthData = (userRole, permissionArray) => {
    setRole(userRole);
    setPermissions(permissionArray);
  };

  return (
    <AuthContext.Provider value={{ role, permissions, setAuthData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
