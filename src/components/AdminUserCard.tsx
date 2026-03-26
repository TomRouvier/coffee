"use client";

import { useState } from "react";
import { resetUserCoffees } from "@/app/admin/actions";

interface UserStats {
  id: string;
  displayName: string;
  totalCount: number;
  monthCount: number;
}

export default function AdminUserCard({ user }: { user: UserStats }) {
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  async function handleReset() {
    if (!confirmed) {
      setConfirmed(true);
      return;
    }

    setLoading(true);
    await resetUserCoffees(user.id);
    setConfirmed(false);
    setLoading(false);
  }

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-amber-900">{user.displayName}</h3>
          <p className="text-xs text-amber-500">
            Ce mois : {user.monthCount} &middot; Total : {user.totalCount}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold text-amber-700">
            {user.totalCount}
          </div>
          <button
            onClick={handleReset}
            disabled={loading || user.totalCount === 0}
            onBlur={() => setConfirmed(false)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              confirmed
                ? "bg-red-500 text-white"
                : "bg-amber-100 text-amber-700 hover:bg-red-100 hover:text-red-600"
            } disabled:opacity-30`}
          >
            {loading
              ? "..."
              : confirmed
                ? "Confirmer ?"
                : "Reset"}
          </button>
        </div>
      </div>
    </div>
  );
}
