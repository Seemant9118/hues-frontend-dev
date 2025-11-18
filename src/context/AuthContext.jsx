import { createContext, useContext, useState } from 'react';

const AuthContext = createContext({
  role: null,
  permissions: [],
  setAuthData: () => {},
});

export const AuthProvider = ({ children }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState(null);
  const [permissions, setPermissions] = useState([]); // now array of permission objects

  const setAuthData = (userName, userRole, permissionArray) => {
    setName(userName);
    setRole(userRole);
    setPermissions(permissionArray);
  };

  return (
    <AuthContext.Provider value={{ name, role, permissions, setAuthData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
