import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { decodeJwt, isTokenExpired } from '../utils/jwt';

type User = {
  email: string;
  token: string;
};

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const token = sessionStorage.getItem('authToken');
      if (token && !isTokenExpired(token)) {
        const payload = decodeJwt(token);
        if (payload) {
          setUser({
            email: payload.email,
            token: token
          });
        }
      }
      setLoading(false);
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await invoke<{ token: string }>('sign_in', {
        email,
        password
      });
      
      if (response.token) {
        sessionStorage.setItem('authToken', response.token);
        const payload = decodeJwt(response.token);
        if (payload) {
          setUser({
            email: payload.email,
            token: response.token
          });
        }
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    sessionStorage.removeItem('authToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
