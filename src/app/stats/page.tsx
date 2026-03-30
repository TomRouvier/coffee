import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import NavBar from "@/components/NavBar";
import StatsFilter from "@/components/StatsFilter";

export default async function StatsPage({
  searchParams,
}: {
  searchParams: { month?: string; year?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch profile and coffees in parallel
  const [profileRes, coffeesRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name, is_admin")
      .eq("id", user.id)
      .single(),
    supabase
      .from("coffees")
      .select("scanned_at, price")
      .eq("user_id", user.id)
      .order("scanned_at", { ascending: false }),
  ]);

  const profile = profileRes.data;
  const allCoffees = coffeesRes.data || [];

  const now = new Date();
  const selectedYear = parseInt(searchParams.year || String(now.getFullYear()));
  const selectedMonth = searchParams.month
    ? parseInt(searchParams.month)
    : null;

  // Filter in JS instead of extra DB query
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

  const totalInRange = coffees.length;
  const totalCost = coffees.reduce(
    (sum, c) => sum + parseFloat(String(c.price)),
    0
  );

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

  const monthNames = [
    "Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre",
  ];

  const periodLabel = selectedMonth
    ? `${monthNames[selectedMonth - 1]} ${selectedYear}`
    : `Annee ${selectedYear}`;

  return (
    <div className="min-h-screen bg-amber-50 pb-20">
      <div className="bg-gradient-to-b from-amber-600 to-amber-500 text-white px-4 pt-8 pb-6 rounded-b-3xl">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold">Statistiques</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-4">
        <StatsFilter
          currentMonth={selectedMonth}
          currentYear={selectedYear}
          monthNames={monthNames}
        />

        <div className="bg-white rounded-2xl shadow-lg p-6 text-center mt-4">
          <p className="text-amber-600 text-sm font-medium">{periodLabel}</p>
          <div className="text-5xl font-bold text-amber-900 my-2">
            {totalInRange}
          </div>
          <p className="text-amber-600 text-sm">
            {totalInRange <= 1 ? "cafe" : "cafes"} &middot; {totalCost.toFixed(2)}€
          </p>
        </div>

        {sortedEntries.length > 0 && (
          <div className="bg-white rounded-xl shadow p-4 mt-4">
            <h3 className="text-amber-800 font-semibold text-sm mb-3">
              Detail
            </h3>
            <div className="space-y-2">
              {sortedEntries.map(({ label, count, cost }) => {
                const maxCount = Math.max(...sortedEntries.map((e) => e.count));
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
                      {count} <span className="font-normal text-amber-500">({cost.toFixed(2)}€)</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {totalInRange === 0 && (
          <div className="text-center text-amber-400 mt-8">
            <div className="text-4xl mb-2">😴</div>
            <p>Aucun cafe sur cette periode</p>
          </div>
        )}
      </div>

      <NavBar isAdmin={profile?.is_admin} />
    </div>
  );
}
