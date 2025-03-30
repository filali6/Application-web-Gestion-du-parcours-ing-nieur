/* eslint-disable react/prop-types */
import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        const role = decoded.role;

        const name = role === 'admin' ? 'Admin' : localStorage.getItem('name') || '';

        setUser({ role, name });
      } catch (err) {
        console.error('Invalid token', err);
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, []);

  return <AuthContext.Provider value={{ user, setUser }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
