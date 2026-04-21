"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function NegativeBalancePopup({ balance }: { balance: number }) {
  const searchParams = useSearchParams();
  const initialToast = useRef(searchParams.get("toast"));
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (initialToast.current === "success" && balance < 0) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [balance]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center">
        <div className="text-5xl mb-3">&#9888;&#65039;</div>
        <h2 className="text-lg font-bold text-red-600 mb-2">Solde negatif !</h2>
        <p className="text-amber-800 text-sm mb-1">
          Ton solde est actuellement de
        </p>
        <p className="text-2xl font-bold text-red-600 mb-3">
          {balance.toFixed(2)}€
        </p>
        <p className="text-amber-600 text-sm mb-5">
          Pense a recharger ton compte pour revenir en positif.
        </p>
        <button
          onClick={() => setVisible(false)}
          className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors w-full"
        >
          Compris !
        </button>
      </div>
    </div>
  );
}
