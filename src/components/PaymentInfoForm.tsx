"use client";

import { useState } from "react";
import { updatePaymentInfo } from "@/app/admin/actions";

export default function PaymentInfoForm({
  currentInfo,
}: {
  currentInfo: string;
}) {
  const [info, setInfo] = useState(currentInfo);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await updatePaymentInfo(info);
    setSaved(true);
    setLoading(false);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-4">
      <label className="text-sm font-medium text-amber-800 block mb-2">
        Info de paiement (visible par tous)
      </label>
      <textarea
        value={info}
        onChange={(e) => setInfo(e.target.value)}
        placeholder="Ex: Paylib au 06 12 34 56 78"
        rows={2}
        className="w-full px-3 py-2 rounded-lg border border-amber-200 text-amber-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
      />
      <button
        type="submit"
        disabled={loading}
        className="mt-2 px-4 py-1.5 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-50 transition-colors"
      >
        {saved ? "Enregistre !" : loading ? "..." : "Enregistrer"}
      </button>
    </form>
  );
}
