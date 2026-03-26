import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import NavBar from "@/components/NavBar";
import SuccessToast from "@/components/SuccessToast";
import LogoutButton from "@/components/LogoutButton";
import PaymentForm from "@/components/PaymentForm";
import { Suspense } from "react";

export default async function HomePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch everything in parallel (1 round trip instead of 6)
  const [profileRes, priceRes, paymentInfoRes, coffeesRes, paymentsRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name, is_admin")
      .eq("id", user.id)
      .single(),
    supabase
      .from("settings")
      .select("value")
      .eq("key", "coffee_price")
      .single(),
    supabase
      .from("settings")
      .select("value")
      .eq("key", "payment_info")
      .single(),
    supabase
      .from("coffees")
      .select("scanned_at")
      .eq("user_id", user.id),
    supabase
      .from("payments")
      .select("amount")
      .eq("user_id", user.id),
  ]);

  const paymentInfo = paymentInfoRes.data?.value || "";

  const profile = profileRes.data;
  const displayName = profile?.display_name || user.email;
  const isAdmin = profile?.is_admin || false;
  const coffeePrice = parseFloat(priceRes.data?.value || "0.50");

  // Compute counts from the single coffees query
  const allCoffees = coffeesRes.data || [];
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const todayCount = allCoffees.filter(
    (c) => new Date(c.scanned_at) >= todayStart
  ).length;
  const monthCount = allCoffees.filter(
    (c) => new Date(c.scanned_at) >= monthStart
  ).length;
  const totalCount = allCoffees.length;

  const totalPaid = (paymentsRes.data || []).reduce(
    (sum, p) => sum + parseFloat(String(p.amount)),
    0
  );
  const totalOwed = totalCount * coffeePrice;
  const balance = totalPaid - totalOwed;

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
        {paymentInfo && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mt-4 text-center">
            <p className="text-xs text-green-600 font-medium mb-1">Comment payer</p>
            <p className="text-sm text-green-800 whitespace-pre-line">{paymentInfo}</p>
          </div>
        )}

        {/* Payment form */}
        <PaymentForm userId={user.id} />

        {/* Scan instruction */}
        <div className="mt-4 bg-amber-100 rounded-xl p-4 text-center">
          <p className="text-amber-800 text-sm">
            Scanne le tag NFC pour enregistrer ton cafe !
          </p>
        </div>
      </div>

      <NavBar isAdmin={isAdmin} />
    </div>
  );
}
