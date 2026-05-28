import React, { createContext, useContext, useEffect, useState } from "react";
import {
  ApiError,
  checkPhoneExists,
  fetchCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
} from "@/lib/api-client";
import type { User } from "@/types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  checkPhone: (phone: string) => Promise<boolean>;
  login: (phone: string, password: string) => Promise<boolean>;
  register: (fullname: string, phone: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const current = await fetchCurrentUser();
      setUser(current);
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 401) {
        console.warn("Failed to load user", error);
      }
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function refreshUser() {
    try {
      const current = await fetchCurrentUser();
      setUser(current);
    } catch {
      setUser(null);
    }
  }

  async function checkPhone(phone: string): Promise<boolean> {
    try {
      return await checkPhoneExists(phone);
    } catch {
      return false;
    }
  }

  async function login(phone: string, password: string): Promise<boolean> {
    try {
      const result = await loginUser({ phone, password });
      setUser(result.user);
      return true;
    } catch {
      return false;
    }
  }

  async function register(
    fullname: string,
    phone: string,
    password: string,
  ): Promise<boolean> {
    try {
      const result = await registerUser({ fullname, phone, password });
      setUser(result.user);
      return true;
    } catch {
      return false;
    }
  }

  async function logout(): Promise<void> {
    await logoutUser();
    setUser(null);
  }

  async function updateUser(updates: Partial<User>): Promise<void> {
    if (!user) return;
    setUser({ ...user, ...updates });
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        checkPhone,
        login,
        register,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
