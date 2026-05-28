import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ApiError, createTransaction, fetchTransactions } from "@/lib/api-client";
import type { Transaction } from "@/types";

interface DataContextType {
  transactions: Transaction[];
  isLoading: boolean;
  addTransaction: (input: {
    packageId: string;
    beneficiaryPhone: string;
    paymentMethod: string;
  }) => Promise<{ transaction: Transaction; walletBalance: number }>;
  loadTransactions: () => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user, refreshUser } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadTransactions = useCallback(async () => {
    if (!user) {
      setTransactions([]);
      return;
    }

    setIsLoading(true);
    try {
      const rows = await fetchTransactions();
      setTransactions(rows);
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 401) {
        console.warn("Failed to load transactions", error);
      }
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  async function addTransaction(input: {
    packageId: string;
    beneficiaryPhone: string;
    paymentMethod: string;
  }) {
    const result = await createTransaction(input);
    setTransactions((current) => [result.transaction, ...current]);
    await refreshUser();
    return result;
  }

  return (
    <DataContext.Provider
      value={{ transactions, isLoading, addTransaction, loadTransactions }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
