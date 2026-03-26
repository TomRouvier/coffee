import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import NavBar from "@/components/NavBar";
import SuccessToast from "@/components/SuccessToast";
import LogoutButton from "@/components/LogoutButton";
import { Suspense } from "react";

export default async function HomePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, is_admin")
    .eq("id", user.id)
    .single();

  const displayName = profile?.display_name || user.email;
  const isAdmin = profile?.is_admin || false;

  // Get today's count
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { count: todayCount } = await supabase
    .from("coffees")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("scanned_at", today.toISOString());

  // Get this month's count
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const { count: monthCount } = await supabase
    .from("coffees")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("scanned_at", monthStart.toISOString());

  // Get total count
  const { count: totalCount } = await supabase
    .from("coffees")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  return (
    <div className="min-h-screen bg-amber-50 pb-20">
      <Suspense>
        <SuccessToast />
      </Suspense>

      {/* Header */}
      <div className="bg-gradient-to-b from-amber-600 to-amber-500 text-white px-4 pt-8 pb-12 rounded-b-3xl">
        <div className="flex justify-between items-start max-w-md mx-auto">
          <div>
            <p className="text-amber-100 text-sm">Bonjour,</p>
            <h1 className="text-2xl font-bold">{displayName}</h1>
          </div>
          <LogoutButton />
        </div>
      </div>

      {/* Main counter */}
      <div className="max-w-md mx-auto px-4 -mt-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <p className="text-amber-600 text-sm font-medium mb-1">
            Aujourd&apos;hui
          </p>
          <div className="text-6xl font-bold text-amber-900 my-2">
            {todayCount || 0}
          </div>
          <p className="text-amber-600 text-sm">
            {(todayCount || 0) <= 1 ? "cafe" : "cafes"}
          </p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <p className="text-amber-500 text-xs font-medium">Ce mois</p>
            <p className="text-3xl font-bold text-amber-800 mt-1">
              {monthCount || 0}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <p className="text-amber-500 text-xs font-medium">Total</p>
            <p className="text-3xl font-bold text-amber-800 mt-1">
              {totalCount || 0}
            </p>
          </div>
        </div>

        {/* Scan instruction */}
        <div className="mt-6 bg-amber-100 rounded-xl p-4 text-center">
          <p className="text-amber-800 text-sm">
            Scanne le tag NFC pour enregistrer ton cafe !
          </p>
        </div>
      </div>

      <NavBar isAdmin={isAdmin} />
    </div>
  );
}
