"use client";

import { useState } from "react";
import {
  recordPayment,
  deletePayment,
  resetUserCoffees,
  deleteUser,
  setUserCoffeeCount,
} from "@/app/admin/actions";
import { useData } from "@/lib/DataContext";

interface Payment {
  id: number;
  amount: number;
  created_at: string;
  method?: string | null;
}

interface UserStats {
  id: string;
  displayName: string;
  totalCount: number;
  monthCount: number;
  totalPaid: number;
  totalOwed: number;
  balance: number;
  payments: Payment[];
}

export default function AdminUserCard({
  user,
}: {
  user: UserStats;
  coffeePrice?: number;
}) {
  const PAYMENT_METHODS = ["wero", "paypal", "revolut", "liquide"] as const;
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");
  const [coffeeCount, setCoffeeCount] = useState(String(user.totalCount));
  const [loading, setLoading] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSetCount, setShowSetCount] = useState(false);
  const [deletingPaymentId, setDeletingPaymentId] = useState<number | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(false);
  const { refreshData } = useData();

  async function handlePayment(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || !method) return;
    setLoading("payment");
    await recordPayment(user.id, amount, method);
    await refreshData();
    setAmount("");
    setMethod("");
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
    await refreshData();
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
    await refreshData();
    setConfirmDelete(false);
    setLoading("");
  }

  async function handleDeletePayment(paymentId: number) {
    setDeletingPaymentId(paymentId);
    await deletePayment(paymentId);
    await refreshData();
    setDeletingPaymentId(null);
  }

  async function handleSetCount(e: React.FormEvent) {
    e.preventDefault();
    setLoading("count");
    await setUserCoffeeCount(user.id, coffeeCount);
    await refreshData();
    setShowSetCount(false);
    setLoading("");
  }

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={() => {
          setExpanded((v) => {
            if (v) {
              setShowPayment(false);
              setShowHistory(false);
              setShowSetCount(false);
              setConfirmReset(false);
              setConfirmDelete(false);
            }
            return !v;
          });
        }}
      >
        <div className="flex items-center gap-2">
          <span
            className={`text-amber-400 text-xs transition-transform duration-200 ${expanded ? "rotate-90" : ""}`}
          >
            ▶
          </span>
          <div>
            <h3 className="font-semibold text-amber-900">{user.displayName}</h3>
            <p className="text-xs text-amber-500">
              Ce mois : {user.monthCount} &middot; Total : {user.totalCount} cafes
            </p>
          </div>
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

      {expanded && <>
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
        <form onSubmit={handlePayment} className="mt-3 space-y-2">
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
              disabled={loading === "payment" || !amount || !method}
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
          </div>
          <div className="flex gap-2">
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
      )}

      {/* Payment history */}
      {user.payments.length > 0 && (
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="mt-2 w-full py-2 bg-gray-50 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
        >
          {showHistory ? "Masquer" : "Voir"} l&apos;historique ({user.payments.length} paiement{user.payments.length > 1 ? "s" : ""})
        </button>
      )}
      {showHistory && user.payments.length > 0 && (
        <div className="mt-2 bg-gray-50 rounded-lg p-3 space-y-2">
          {user.payments.map((p) => (
            <div key={p.id} className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-xs">
                  {new Date(p.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                </span>
                {p.method && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-50 text-green-700 capitalize">{p.method}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-green-600">+{parseFloat(String(p.amount)).toFixed(2)}€</span>
                <button
                  onClick={() => handleDeletePayment(p.id)}
                  disabled={deletingPaymentId === p.id}
                  className="text-red-400 hover:text-red-600 text-xs disabled:opacity-50"
                >
                  {deletingPaymentId === p.id ? "..." : "✕"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Set total count */}
      {!showSetCount ? (
        <button
          onClick={() => setShowSetCount(true)}
          className="mt-2 w-full py-2 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-100 transition-colors"
        >
          Modifier le total de cafes
        </button>
      ) : (
        <form onSubmit={handleSetCount} className="mt-2 flex gap-2">
          <input
            type="number"
            min="0"
            value={coffeeCount}
            onChange={(e) => setCoffeeCount(e.target.value)}
            autoFocus
            className="flex-1 px-3 py-2 rounded-lg border border-amber-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <button
            type="submit"
            disabled={loading === "count"}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-50 transition-colors"
          >
            {loading === "count" ? "..." : "OK"}
          </button>
          <button
            type="button"
            onClick={() => setShowSetCount(false)}
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
      </>}
    </div>
  );
}
