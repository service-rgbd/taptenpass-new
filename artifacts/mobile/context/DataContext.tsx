import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import type { Transaction } from "@/types";

const TX_KEY = "@chapcredit:transactions";

interface DataContextType {
  transactions: Transaction[];
  addTransaction: (tx: Transaction) => Promise<void>;
  loadTransactions: () => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    loadTransactions();
  }, []);

  async function loadTransactions() {
    try {
      const raw = await AsyncStorage.getItem(TX_KEY);
      if (raw) setTransactions(JSON.parse(raw));
    } catch {}
  }

  async function addTransaction(tx: Transaction) {
    const updated = [tx, ...transactions];
    setTransactions(updated);
    await AsyncStorage.setItem(TX_KEY, JSON.stringify(updated));
  }

  return (
    <DataContext.Provider value={{ transactions, addTransaction, loadTransactions }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
