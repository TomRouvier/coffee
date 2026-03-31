"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import RefreshButton from "@/components/RefreshButton";

export interface AppData {
  userId: string;
  displayName: string;
  isAdmin: boolean;
  coffeePrice: number;
  paymentInfo: string;
  coffees: { scanned_at: string; price: number }[];
  payments: { id: number; amount: number; created_at: string }[];
  allProfiles?: { id: string; display_name: string; created_at: string }[];
  allCoffees?: { user_id: string; scanned_at: string; price: number }[];
  allPayments?: { id: number; user_id: string; amount: number; created_at: string }[];
}

interface DataContextType extends AppData {
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({
  initialData,
  children,
}: {
  initialData: AppData;
  children: ReactNode;
}) {
  const [data, setData] = useState<AppData>(initialData);

  const refreshData = useCallback(async () => {
    const res = await fetch("/api/data");
    if (res.ok) {
      setData(await res.json());
    }
  }, []);

  return (
    <DataContext.Provider value={{ ...data, refreshData }}>
      <RefreshButton />
      {children}
    </DataContext.Provider>
  );
}

export function useData(): DataContextType {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
