import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const updateAuth = useCallback(() => {
    const userInfo = localStorage.getItem('userInfo');
    const userRole = localStorage.getItem('userRole');
    
    if (userInfo && userRole) {
      setUser({
        ...JSON.parse(userInfo),
        role: userRole
      });
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    updateAuth();
    window.addEventListener('storage', updateAuth);
    return () => window.removeEventListener('storage', updateAuth);
  }, [updateAuth]);

  const login = (userData) => {
    localStorage.setItem('userInfo', JSON.stringify(userData));
    localStorage.setItem('userRole', userData.role);
    updateAuth();
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    localStorage.removeItem('userRole');
    updateAuth();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
