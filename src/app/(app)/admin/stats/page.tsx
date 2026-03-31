"use client";

import NavBar from "@/components/NavBar";
import StatsFilter from "@/components/StatsFilter";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useData } from "@/lib/DataContext";

export default function AdminStatsPage() {
  const {
    allProfiles: profiles = [],
    allCoffees: allCoffees = [],
    allPayments: allPayments = [],
  } = useData();
  const searchParams = useSearchParams();

  const now = new Date();
  const selectedYear = parseInt(searchParams.get("year") || String(now.getFullYear()));
  const selectedMonth = searchParams.get("month")
    ? parseInt(searchParams.get("month")!)
    : null;

  let startDate: Date;
  let endDate: Date;

  if (selectedMonth !== null) {
    startDate = new Date(selectedYear, selectedMonth - 1, 1);
    endDate = new Date(selectedYear, selectedMonth, 1);
  } else {
    startDate = new Date(selectedYear, 0, 1);
    endDate = new Date(selectedYear + 1, 0, 1);
  }

  const coffees = allCoffees.filter((c) => {
    const d = new Date(c.scanned_at);
    return d >= startDate && d < endDate;
  });

  const payments = allPayments.filter((p) => {
    const d = new Date(p.created_at);
    return d >= startDate && d < endDate;
  });

  const totalCount = coffees.length;
  const totalCost = coffees.reduce(
    (sum, c) => sum + parseFloat(String(c.price)),
    0
  );
  const totalPaid = payments.reduce(
    (sum, p) => sum + parseFloat(String(p.amount)),
    0
  );

  // Group by day or month
  const grouped: Record<number, { count: number; cost: number; label: string }> = {};
  coffees.forEach((c) => {
    const date = new Date(c.scanned_at);
    const sortKey = selectedMonth !== null ? date.getDate() : date.getMonth();
    const label =
      selectedMonth !== null
        ? date.toLocaleDateString("fr-FR", { day: "numeric", weekday: "short" })
        : date.toLocaleDateString("fr-FR", { month: "short" });
    if (!grouped[sortKey]) grouped[sortKey] = { count: 0, cost: 0, label };
    grouped[sortKey].count += 1;
    grouped[sortKey].cost += parseFloat(String(c.price));
  });

  const sortedEntries = Object.entries(grouped)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([, v]) => v);

  // User ranking
  const userMap: Record<string, { name: string; count: number; cost: number }> = {};
  coffees.forEach((c) => {
    if (!userMap[c.user_id]) {
      const profile = profiles.find((p) => p.id === c.user_id);
      userMap[c.user_id] = {
        name: profile?.display_name || "?",
        count: 0,
        cost: 0,
      };
    }
    userMap[c.user_id].count += 1;
    userMap[c.user_id].cost += parseFloat(String(c.price));
  });
  const userStats = Object.values(userMap).sort((a, b) => b.count - a.count);

  const monthNames = [
    "Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre",
  ];

  const periodLabel = selectedMonth
    ? `${monthNames[selectedMonth - 1]} ${selectedYear}`
    : `Annee ${selectedYear}`;

  return (
    <div className="min-h-screen bg-amber-50 pb-20">
      <div className="bg-gradient-to-b from-amber-700 to-amber-600 text-white px-4 pt-8 pb-6 rounded-b-3xl">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/admin"
              className="text-amber-200 hover:text-white transition-colors"
            >
              &larr;
            </Link>
            <h1 className="text-2xl font-bold">Statistiques globales</h1>
          </div>
          <p className="text-amber-200 text-sm">
            {profiles.length} utilisateurs &middot; {periodLabel}
          </p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-4 space-y-4">
        <StatsFilter
          currentMonth={selectedMonth}
          currentYear={selectedYear}
          monthNames={monthNames}
          basePath="/admin/stats"
        />

        {/* Summary */}
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <p className="text-amber-600 text-sm font-medium">{periodLabel}</p>
          <div className="text-5xl font-bold text-amber-900 my-2">
            {totalCount}
          </div>
          <p className="text-amber-600 text-sm">
            {totalCount <= 1 ? "cafe" : "cafes"} &middot; {totalCost.toFixed(2)}€
          </p>
        </div>

        {/* Revenue */}
        <div className="bg-white rounded-xl shadow p-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-xs text-amber-500">Total du</p>
              <p className="text-lg font-bold text-red-600">
                {totalCost.toFixed(2)}€
              </p>
            </div>
            <div>
              <p className="text-xs text-amber-500">Total paye</p>
              <p className="text-lg font-bold text-green-600">
                {totalPaid.toFixed(2)}€
              </p>
            </div>
            <div>
              <p className="text-xs text-amber-500">Solde</p>
              <p
                className={`text-lg font-bold ${totalPaid - totalCost >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {(totalPaid - totalCost).toFixed(2)}€
              </p>
            </div>
          </div>
        </div>

        {/* Consumption chart */}
        {sortedEntries.length > 0 && (
          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="text-amber-800 font-semibold text-sm mb-3">
              Consommation {selectedMonth ? "par jour" : "par mois"}
            </h3>
            <div className="space-y-2">
              {sortedEntries.map(({ label, count, cost }) => {
                const maxCount = Math.max(
                  ...sortedEntries.map((e) => e.count)
                );
                const width = maxCount > 0 ? (count / maxCount) * 100 : 0;
                return (
                  <div key={label} className="flex items-center gap-2">
                    <span className="text-xs text-amber-700 w-16 text-right shrink-0">
                      {label}
                    </span>
                    <div className="flex-1 bg-amber-100 rounded-full h-5 overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full transition-all"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-amber-900 w-16 text-right">
                      {count}{" "}
                      <span className="font-normal text-amber-500">
                        ({cost.toFixed(2)}€)
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* User ranking */}
        {userStats.length > 0 && (
          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="text-amber-800 font-semibold text-sm mb-3">
              Classement
            </h3>
            <div className="space-y-2">
              {userStats.map((user, i) => {
                const maxCount = userStats[0].count;
                const width = maxCount > 0 ? (user.count / maxCount) * 100 : 0;
                return (
                  <div key={user.name} className="flex items-center gap-2">
                    <span className="text-xs text-amber-700 w-20 text-right shrink-0 truncate">
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`}{" "}
                      {user.name}
                    </span>
                    <div className="flex-1 bg-amber-100 rounded-full h-5 overflow-hidden">
                      <div
                        className="bg-amber-600 h-full rounded-full transition-all"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-amber-900 w-16 text-right">
                      {user.count}{" "}
                      <span className="font-normal text-amber-500">
                        ({user.cost.toFixed(2)}€)
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {totalCount === 0 && (
          <div className="text-center text-amber-400 mt-8">
            <div className="text-4xl mb-2">😴</div>
            <p>Aucun cafe sur cette periode</p>
          </div>
        )}
      </div>

      <NavBar isAdmin={true} />
    </div>
  );
}
