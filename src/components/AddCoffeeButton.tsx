"use client";

import { useState } from "react";
import { addManualCoffee } from "@/app/actions";
import { useRouter } from "next/navigation";

export default function AddCoffeeButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleClick() {
    setLoading(true);
    await addManualCoffee();
    router.refresh();
    setLoading(false);
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="mt-4 w-full py-3 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700 disabled:opacity-50 transition-colors"
    >
      {loading ? "..." : "+ 1 cafe (manuel)"}
    </button>
  );
}
