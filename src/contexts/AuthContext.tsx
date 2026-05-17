import { createContext, useContext, useState, type ReactNode } from "react";
import {
  authService,
  type AuthResponse,
} from "../services/authService";

interface User {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  useApi: boolean;
  setUseApi: (val: boolean) => void;
  requestOtp: (identifier: string) => Promise<void>;
  verifyOtp: (identifier: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(authService.getCurrentUser());
  const [token, setToken] = useState<string | null>(authService.getToken());
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useApi, setUseApiState] = useState<boolean>(() => {
    return localStorage.getItem("use_api") === "true";
  });

  const setUseApi = (val: boolean) => {
    setUseApiState(val);
    localStorage.setItem("use_api", val ? "true" : "false");
  };

  const requestOtp = async (identifier: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.requestOtp(identifier);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      setError(err instanceof Error ? err.message : "Failed to request OTP");
      throw err;
    }
  };

  const verifyOtp = async (identifier: string, otp: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response: AuthResponse = await authService.verifyOtp(identifier, otp);

      // Note: User info might be null or require a separate fetch depending on API design
      // For now, setting placeholder or keeping existing if available
      setToken(response.accessToken);
      setIsAuthenticated(true);
      setIsLoading(false);
    } catch (err) {
      setToken(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      setError(err instanceof Error ? err.message : "Verification failed");
      throw err;
    }
  };

  const logout = async () => {
    setIsLoading(true);

    try {
      await authService.logout();

      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      setError(err instanceof Error ? err.message : "Logout failed");
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        error,
        useApi,
        setUseApi,
        requestOtp,
        verifyOtp,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
