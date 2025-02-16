import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { invoke } from "@tauri-apps/api/core";
import { decodeJwt, isTokenExpired } from "../lib/jwt";
import { Response } from "../types";
import { StatusCode } from "../constants/statusCode";

type User = {
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
  createdAt: string;
  id: string;
  token: string;
};


type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<Response<{ token: string }>>;
  logout: () => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const token = sessionStorage.getItem("authToken");
      if (token && !isTokenExpired(token)) {
        const payload = decodeJwt(token);
        if (payload) {
          setUser({
            email: payload.email,
            firstName: payload.first_name,
            lastName: payload.last_name,
            avatarUrl: payload.avatar_url,
            createdAt: payload.created_at,
            id: payload.user_id,
            token,
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
      const response: Response<{ token: string }> =
        await invoke<Response<{ token: string }>>(
          "sign_in",
          {
            email,
            password,
          }
        );
      console.log("Login response:", response);
      if (response.status === StatusCode.Ok && response.data?.token) {
        sessionStorage.setItem("authToken", response.data.token);
        const payload = decodeJwt(response.data.token);
        console.log("payload:", payload);
        if (payload) {
          setUser({
            email: payload.email,
            firstName: payload.first_name,
            lastName: payload.last_name,
            avatarUrl: payload.avatar_url,
            createdAt: payload.created_at,
            id: payload.user_id,
            token: response.data.token,
          });
        }
        return response;
      }

      if (response.status === StatusCode.Unauthorized) {
        response.error = "Invalid email or password";
        return response;
      }

      response.error = response.error || "Login failed";
      return response;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    sessionStorage.removeItem("authToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
