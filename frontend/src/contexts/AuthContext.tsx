import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authApi, LoginPayload, RegisterPayload } from '../services/authApi';
import { profileApi } from '../services/profileApi';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  updateUserProfile: (updates: Partial<User>) => Promise<User>;
  setupProfile: (data: Partial<User>) => Promise<User>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('jai_kisan_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    setIsLoading(true);
    try {
      const currentUser = await authApi.getMe();
      setUser(currentUser);
    } catch {
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (credentials: LoginPayload) => {
    setIsLoading(true);
    try {
      const res = await authApi.login(credentials);
      setToken(res.access_token);
      setUser(res.user);
      localStorage.setItem('jai_kisan_user', JSON.stringify(res.user));
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload) => {
    setIsLoading(true);
    try {
      const res = await authApi.register(payload);
      setToken(res.access_token);
      setUser(res.user);
      localStorage.setItem('jai_kisan_user', JSON.stringify(res.user));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authApi.logout();
    setToken(null);
    setUser(null);
  };

  const updateUserProfile = async (updates: Partial<User>): Promise<User> => {
    const updated = await profileApi.updateProfile(updates);
    setUser(updated);
    return updated;
  };

  const setupProfile = async (data: Partial<User>): Promise<User> => {
    const updated = await profileApi.setupProfile(data);
    setUser(updated);
    return updated;
  };

  const refreshProfile = async () => {
    if (token) {
      await fetchCurrentUser();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        updateUserProfile,
        setupProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
