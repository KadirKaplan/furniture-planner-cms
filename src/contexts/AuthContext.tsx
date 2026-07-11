import React, { createContext, useContext, useEffect, useState } from 'react';
import { getMe, login as authLogin, logout as authLogout } from '../services/auth';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('eyce_token');
      if (token) {
        try {
          const res = await getMe();
          setUser(res.data);
          localStorage.setItem('eyce_user', JSON.stringify(res.data));
        } catch (error) {
          authLogout();
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authLogin(email, password);
    localStorage.setItem('eyce_token', res.data.token);
    localStorage.setItem('eyce_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
  };

  const logout = () => {
    authLogout();
    setUser(null);
    window.location.href = import.meta.env.BASE_URL + 'login';
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
