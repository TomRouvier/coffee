"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { useData } from "@/lib/DataContext";

export default function RefreshButton() {
  const { refreshData } = useData();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  return (
    <button
      onClick={handleRefresh}
      disabled={refreshing}
      className="fixed top-3 right-3 z-50 w-9 h-9 flex items-center justify-center rounded-full bg-white/80 backdrop-blur shadow-md border border-amber-200 text-amber-600 hover:bg-amber-50 active:scale-95 transition-all disabled:opacity-50"
      aria-label="Rafraîchir"
    >
      <RefreshCw size={16} strokeWidth={2.5} className={refreshing ? "animate-spin" : ""} />
    </button>
  );
}
