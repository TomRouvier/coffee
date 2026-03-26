"use client";

import { useState } from "react";
import { recordPayment } from "@/app/admin/actions";

interface UserStats {
  id: string;
  displayName: string;
  totalCount: number;
  monthCount: number;
  totalPaid: number;
  totalOwed: number;
  balance: number;
}

export default function AdminUserCard({
  user,
}: {
  user: UserStats;
  coffeePrice?: number;
}) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  async function handlePayment(e: React.FormEvent) {
    e.preventDefault();
    if (!amount) return;
    setLoading(true);
    await recordPayment(user.id, amount);
    setAmount("");
    setShowPayment(false);
    setLoading(false);
  }

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-amber-900">{user.displayName}</h3>
          <p className="text-xs text-amber-500">
            Ce mois : {user.monthCount} &middot; Total : {user.totalCount} cafes
          </p>
        </div>
        <div
          className={`text-right ${user.balance >= 0 ? "text-green-600" : "text-red-600"}`}
        >
          <p className="text-xl font-bold">{user.balance.toFixed(2)}€</p>
          <p className="text-[10px] text-amber-400">
            {user.totalOwed.toFixed(2)}€ du / {user.totalPaid.toFixed(2)}€ paye
          </p>
        </div>
      </div>

      {/* Payment toggle */}
      {!showPayment ? (
        <button
          onClick={() => setShowPayment(true)}
          className="mt-3 w-full py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
        >
          + Enregistrer un paiement
        </button>
      ) : (
        <form onSubmit={handlePayment} className="mt-3 flex gap-2">
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
            disabled={loading || !amount}
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "..." : "OK"}
          </button>
          <button
            type="button"
            onClick={() => setShowPayment(false)}
            className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm"
          >
            X
          </button>
        </form>
      )}
    </div>
  );
}
