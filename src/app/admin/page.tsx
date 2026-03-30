import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import AdminUserCard from "@/components/AdminUserCard";
import CoffeePriceForm from "@/components/CoffeePriceForm";
import PaymentInfoForm from "@/components/PaymentInfoForm";

export default async function AdminPage() {
  const supabase = createClient();

  // Fetch everything in parallel
  const [priceRes, paymentInfoRes, profilesRes, coffeesRes, paymentsRes] = await Promise.all([
    supabase.from("settings").select("value").eq("key", "coffee_price").single(),
    supabase.from("settings").select("value").eq("key", "payment_info").single(),
    supabase.from("profiles").select("id, display_name, created_at").order("display_name"),
    supabase.from("coffees").select("user_id, scanned_at, price"),
    supabase.from("payments").select("user_id, amount"),
  ]);

  const paymentInfo = paymentInfoRes.data?.value || "";

  const coffeePrice = parseFloat(priceRes.data?.value || "0.50");
  const profiles = profilesRes.data || [];
  const coffees = coffeesRes.data || [];
  const payments = paymentsRes.data || [];

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const userStats = profiles.map((profile) => {
    const userCoffees = coffees.filter((c) => c.user_id === profile.id);
    const monthCoffees = userCoffees.filter(
      (c) => new Date(c.scanned_at) >= monthStart
    );
    const userPayments = payments.filter((p) => p.user_id === profile.id);
    const totalPaid = userPayments.reduce(
      (sum, p) => sum + parseFloat(String(p.amount)),
      0
    );
    const totalOwed = userCoffees.reduce(
      (sum, c) => sum + parseFloat(String(c.price)),
      0
    );

    return {
      id: profile.id,
      displayName: profile.display_name,
      totalCount: userCoffees.length,
      monthCount: monthCoffees.length,
      totalPaid,
      totalOwed,
      balance: totalPaid - totalOwed,
    };
  });

  userStats.sort((a, b) => b.totalCount - a.totalCount);

  const totalAllCoffees = userStats.reduce((s, u) => s + u.totalCount, 0);
  const totalAllOwed = userStats.reduce((s, u) => s + u.totalOwed, 0);
  const totalAllPaid = userStats.reduce((s, u) => s + u.totalPaid, 0);

  return (
    <div className="min-h-screen bg-amber-50 pb-20">
      <div className="bg-gradient-to-b from-amber-700 to-amber-600 text-white px-4 pt-8 pb-6 rounded-b-3xl">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold">Administration</h1>
          <p className="text-amber-200 text-sm mt-1">
            {userStats.length} utilisateurs &middot; {totalAllCoffees} cafes
          </p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-4 space-y-4">
        <CoffeePriceForm currentPrice={coffeePrice} />
        <PaymentInfoForm currentInfo={paymentInfo} />

        <div className="bg-white rounded-xl shadow p-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-xs text-amber-500">Total du</p>
              <p className="text-lg font-bold text-red-600">
                {totalAllOwed.toFixed(2)}€
              </p>
            </div>
            <div>
              <p className="text-xs text-amber-500">Total paye</p>
              <p className="text-lg font-bold text-green-600">
                {totalAllPaid.toFixed(2)}€
              </p>
            </div>
            <div>
              <p className="text-xs text-amber-500">Solde</p>
              <p
                className={`text-lg font-bold ${totalAllPaid - totalAllOwed >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {(totalAllPaid - totalAllOwed).toFixed(2)}€
              </p>
            </div>
          </div>
        </div>

        <Link
          href="/admin/stats"
          className="block w-full py-3 bg-amber-100 text-amber-800 rounded-xl text-center text-sm font-medium hover:bg-amber-200 transition-colors"
        >
          📊 Voir les statistiques globales
        </Link>

        {userStats.map((user) => (
          <AdminUserCard
            key={user.id}
            user={user}
            coffeePrice={coffeePrice}
          />
        ))}

        {userStats.length === 0 && (
          <div className="text-center text-amber-400 mt-8">
            <p>Aucun utilisateur</p>
          </div>
        )}
      </div>

      <NavBar isAdmin={true} />
    </div>
  );
}
