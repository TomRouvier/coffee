"use client";

import { useState } from "react";
import { updateCoffeePrice } from "@/app/admin/actions";

export default function CoffeePriceForm({
  currentPrice,
}: {
  currentPrice: number;
}) {
  const [price, setPrice] = useState(currentPrice.toFixed(2));
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await updateCoffeePrice(price);
    setSaved(true);
    setLoading(false);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow p-4 flex items-center gap-3"
    >
      <label className="text-sm font-medium text-amber-800 shrink-0">
        Prix du cafe
      </label>
      <div className="flex items-center gap-1 flex-1">
        <input
          type="number"
          step="0.01"
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-20 px-2 py-1.5 rounded-lg border border-amber-200 text-amber-900 text-sm text-center focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
        <span className="text-amber-700 text-sm">€</span>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-50 transition-colors"
      >
        {saved ? "OK !" : loading ? "..." : "Modifier"}
      </button>
      <p className="text-[10px] text-amber-400 w-full text-center mt-1">
        Le nouveau prix s&apos;appliquera aux prochains cafes uniquement.
      </p>
    </form>
  );
}
