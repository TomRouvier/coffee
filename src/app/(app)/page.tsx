"use client";

import NavBar from "@/components/NavBar";
import SuccessToast from "@/components/SuccessToast";

import PaymentForm from "@/components/PaymentForm";
import CopyablePaymentInfo from "@/components/CopyablePaymentInfo";
import AddCoffeeButton from "@/components/AddCoffeeButton";
import NegativeBalancePopup from "@/components/NegativeBalancePopup";
import { Suspense } from "react";
import { useData } from "@/lib/DataContext";

export default function HomePage() {
  const { displayName, isAdmin, coffeePrice, paymentInfo, coffees, payments, userId } =
    useData();

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const todayCount = coffees.filter(
    (c) => new Date(c.scanned_at) >= todayStart
  ).length;
  const monthCount = coffees.filter(
    (c) => new Date(c.scanned_at) >= monthStart
  ).length;
  const totalCount = coffees.length;

  const totalPaid = payments.reduce(
    (sum, p) => sum + parseFloat(String(p.amount)),
    0
  );
  const totalOwed = coffees.reduce(
    (sum, c) => sum + parseFloat(String(c.price)),
    0
  );
  const balance = totalPaid - totalOwed;

  return (
    <div className="min-h-screen bg-amber-50 pb-20">
      <Suspense>
        <SuccessToast />
        <NegativeBalancePopup balance={balance} />
      </Suspense>

      {/* Header */}
      <div className="bg-gradient-to-b from-amber-600 to-amber-500 text-white px-4 pt-8 pb-12 rounded-b-3xl">
        <div className="max-w-md mx-auto">
          <p className="text-amber-100 text-sm">Bonjour,</p>
          <h1 className="text-2xl font-bold">{displayName}</h1>
        </div>
      </div>

      {/* Main counter */}
      <div className="max-w-md mx-auto px-4 -mt-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <p className="text-amber-600 text-sm font-medium mb-1">
            Aujourd&apos;hui
          </p>
          <div className="text-6xl font-bold text-amber-900 my-2">
            {todayCount}
          </div>
          <p className="text-amber-600 text-sm">
            {todayCount <= 1 ? "cafe" : "cafes"}
          </p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <p className="text-amber-500 text-xs font-medium">Ce mois</p>
            <p className="text-3xl font-bold text-amber-800 mt-1">
              {monthCount}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <p className="text-amber-500 text-xs font-medium">Total</p>
            <p className="text-3xl font-bold text-amber-800 mt-1">
              {totalCount}
            </p>
          </div>
        </div>

        {/* Balance card */}
        <div className="bg-white rounded-xl shadow p-4 mt-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-xs text-amber-500">Du</p>
              <p className="text-lg font-bold text-amber-800">
                {totalOwed.toFixed(2)}€
              </p>
            </div>
            <div>
              <p className="text-xs text-amber-500">Paye</p>
              <p className="text-lg font-bold text-green-600">
                {totalPaid.toFixed(2)}€
              </p>
            </div>
            <div>
              <p className="text-xs text-amber-500">Solde</p>
              <p
                className={`text-lg font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {balance.toFixed(2)}€
              </p>
            </div>
          </div>
          <p className="text-[10px] text-amber-400 text-center mt-2">
            Prix du cafe : {coffeePrice.toFixed(2)}€
          </p>
        </div>

        {/* Payment info */}
        {paymentInfo && <CopyablePaymentInfo text={paymentInfo} />}

        {/* Payment form */}
        <PaymentForm userId={userId} />

        {/* NFC scan + manual fallback */}
        <div className="mt-4 bg-amber-100 rounded-2xl p-5 text-center space-y-3">
          <p className="text-amber-900 font-semibold text-base">
            Scanne le tag NFC pour enregistrer ton café !
          </p>
          <p className="text-amber-600 text-xs">
            Si vous n&apos;arrivez pas à scanner, vous pouvez ajouter manuellement :
          </p>
          <AddCoffeeButton />
        </div>

        {/* Payment history */}
        {payments.length > 0 && (
          <div className="bg-white rounded-xl shadow p-4 mt-4">
            <h2 className="text-sm font-semibold text-amber-800 mb-3">Historique des paiements</h2>
            <div className="space-y-2">
              {payments.map((p) => (
                <div key={p.id} className="flex justify-between items-center text-sm border-b border-amber-50 pb-2 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-600 text-xs">
                      {new Date(p.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                    {p.method && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-50 text-green-700 capitalize">{p.method}</span>
                    )}
                  </div>
                  <span className="font-semibold text-green-600">+{parseFloat(String(p.amount)).toFixed(2)}€</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      <NavBar isAdmin={isAdmin} />
    </div>
  );
}
