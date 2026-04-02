"use client";

import { useState } from "react";
import { recordOwnPayment } from "@/app/actions";
import { useData } from "@/lib/DataContext";

const PAYMENT_METHODS = ["wero", "paypal", "revolut", "liquide"] as const;

export default function PaymentForm({}: { userId: string }) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const { refreshData } = useData();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || !method) return;
    setLoading(true);
    await recordOwnPayment(amount, method);
    await refreshData();
    setAmount("");
    setMethod("");
    setSuccess(true);
    setLoading(false);
    setShowForm(false);
    setTimeout(() => setSuccess(false), 2000);
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="mt-4 w-full py-3 bg-green-50 text-green-700 rounded-xl font-medium hover:bg-green-100 transition-colors border border-green-200"
      >
        {success ? "Paiement enregistre !" : "J'ai paye"}
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 bg-white rounded-xl shadow p-4"
    >
      <p className="text-sm font-medium text-amber-800 mb-2">
        Enregistrer un paiement
      </p>
      <div className="flex gap-2">
        <input
          type="number"
          step="0.01"
          min="0"
          placeholder="Montant €"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          autoFocus
          className="flex-1 px-3 py-2 rounded-lg border border-green-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <button
          type="submit"
          disabled={loading || !amount || !method}
          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "..." : "OK"}
        </button>
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm"
        >
          X
        </button>
      </div>
      <div className="flex gap-2 mt-2">
        {PAYMENT_METHODS.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMethod(m)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
              method === m
                ? "bg-green-600 text-white"
                : "bg-green-50 text-green-700 hover:bg-green-100"
            }`}
          >
            {m}
          </button>
        ))}
      </div>
    </form>
  );
}
