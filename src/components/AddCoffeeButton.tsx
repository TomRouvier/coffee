"use client";

import { useState } from "react";
import { addManualCoffee } from "@/app/actions";
import { useData } from "@/lib/DataContext";

export default function AddCoffeeButton() {
  const [loading, setLoading] = useState(false);
  const { refreshData } = useData();

  async function handleClick() {
    setLoading(true);
    await addManualCoffee();
    await refreshData();
    setLoading(false);
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="w-full py-2.5 border-2 border-amber-400 text-amber-700 bg-amber-50 rounded-xl font-medium hover:bg-amber-100 disabled:opacity-50 transition-colors text-sm"
    >
      {loading ? "..." : "+ 1 café (manuel)"}
    </button>
  );
}
