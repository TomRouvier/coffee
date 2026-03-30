"use client";

import { useRouter } from "next/navigation";

export default function StatsFilter({
  currentMonth,
  currentYear,
  monthNames,
  basePath = "/stats",
}: {
  currentMonth: number | null;
  currentYear: number;
  monthNames: string[];
  basePath?: string;
}) {
  const router = useRouter();

  function navigate(month: number | null, year: number) {
    const params = new URLSearchParams();
    if (month !== null) params.set("month", String(month));
    params.set("year", String(year));
    router.push(`${basePath}?${params.toString()}`);
  }

  const years = [];
  const currentRealYear = new Date().getFullYear();
  for (let y = currentRealYear; y >= currentRealYear - 3; y--) {
    years.push(y);
  }

  return (
    <div className="flex gap-2">
      <select
        value={currentMonth ?? ""}
        onChange={(e) => {
          const val = e.target.value;
          navigate(val === "" ? null : parseInt(val), currentYear);
        }}
        className="flex-1 px-3 py-2 rounded-xl border border-amber-200 bg-white text-amber-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
      >
        <option value="">Toute l&apos;annee</option>
        {monthNames.map((name, i) => (
          <option key={i} value={i + 1}>
            {name}
          </option>
        ))}
      </select>

      <select
        value={currentYear}
        onChange={(e) => navigate(currentMonth, parseInt(e.target.value))}
        className="px-3 py-2 rounded-xl border border-amber-200 bg-white text-amber-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
}
