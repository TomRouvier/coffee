"use client";

import { useState } from "react";
import {
  recordPayment,
  resetUserCoffees,
  deleteUser,
} from "@/app/admin/actions";

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
  const [loading, setLoading] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState("");

  async function handlePayment(e: React.FormEvent) {
    e.preventDefault();
    if (!amount) return;
    setLoading("payment");
    await recordPayment(user.id, amount);
    setAmount("");
    setShowPayment(false);
    setLoading("");
  }

  async function handleReset() {
    if (!confirmReset) {
      setConfirmReset(true);
      setConfirmDelete(false);
      return;
    }
    setLoading("reset");
    await resetUserCoffees(user.id);
    setConfirmReset(false);
    setLoading("");
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setConfirmReset(false);
      return;
    }
    setLoading("delete");
    const result = await deleteUser(user.id);
    if (result.error) {
      setError(result.error);
      setTimeout(() => setError(""), 3000);
    }
    setConfirmDelete(false);
    setLoading("");
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

      {error && (
        <p className="mt-2 text-xs text-red-600 bg-red-50 px-3 py-1 rounded">
          {error}
        </p>
      )}

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
            disabled={loading === "payment" || !amount}
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {loading === "payment" ? "..." : "OK"}
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

      {/* Admin actions */}
      <div className="mt-3 flex gap-2">
        <button
          onClick={handleReset}
          onBlur={() => setConfirmReset(false)}
          disabled={loading === "reset" || user.totalCount === 0}
          className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
            confirmReset
              ? "bg-orange-500 text-white"
              : "bg-orange-50 text-orange-600 hover:bg-orange-100"
          } disabled:opacity-30`}
        >
          {loading === "reset"
            ? "..."
            : confirmReset
              ? "Confirmer le reset ?"
              : "Remettre a zero"}
        </button>
        <button
          onClick={handleDelete}
          onBlur={() => setConfirmDelete(false)}
          disabled={loading === "delete"}
          className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
            confirmDelete
              ? "bg-red-600 text-white"
              : "bg-red-50 text-red-600 hover:bg-red-100"
          } disabled:opacity-30`}
        >
          {loading === "delete"
            ? "..."
            : confirmDelete
              ? "Confirmer suppression ?"
              : "Supprimer"}
        </button>
      </div>
    </div>
  );
}
