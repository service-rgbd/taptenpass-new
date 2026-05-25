import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@/types";

const USER_KEY = "@chapcredit:user";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  checkPhone: (phone: string) => Promise<boolean>;
  login: (phone: string, password: string) => Promise<boolean>;
  register: (fullname: string, phone: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { loadUser(); }, []);

  async function loadUser() {
    try {
      const raw = await AsyncStorage.getItem(USER_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
    } finally {
      setIsLoading(false);
    }
  }

  async function checkPhone(phone: string): Promise<boolean> {
    try {
      const raw = await AsyncStorage.getItem(USER_KEY);
      if (!raw) return false;
      const stored: User = JSON.parse(raw);
      return stored.phone === phone;
    } catch {
      return false;
    }
  }

  async function login(phone: string, _password: string): Promise<boolean> {
    try {
      const raw = await AsyncStorage.getItem(USER_KEY);
      if (!raw) return false;
      const stored: User = JSON.parse(raw);
      if (stored.phone === phone) {
        setUser(stored);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async function register(fullname: string, phone: string, _password: string): Promise<boolean> {
    try {
      const newUser: User = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        fullname,
        phone,
        email: "",
        walletBalance: 5000,
        createdAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(newUser));
      setUser(newUser);
      return true;
    } catch {
      return false;
    }
  }

  async function logout(): Promise<void> {
    await AsyncStorage.removeItem(USER_KEY);
    setUser(null);
  }

  async function updateUser(updates: Partial<User>): Promise<void> {
    if (!user) return;
    const updated = { ...user, ...updates };
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(updated));
    setUser(updated);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, checkPhone, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
