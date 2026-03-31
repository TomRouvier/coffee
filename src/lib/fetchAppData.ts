import { createClient } from "@/lib/supabase/server";
import type { AppData } from "@/lib/DataContext";

export async function fetchAppData(): Promise<AppData | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [profileRes, priceRes, paymentInfoRes, coffeesRes, paymentsRes] =
    await Promise.all([
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
        .select("scanned_at, price")
        .eq("user_id", user.id),
      supabase
        .from("payments")
        .select("id, amount, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
    ]);

  const profile = profileRes.data;
  const isAdmin = profile?.is_admin || false;

  const data: AppData = {
    userId: user.id,
    displayName: profile?.display_name || user.email || "",
    isAdmin,
    coffeePrice: parseFloat(priceRes.data?.value || "0.50"),
    paymentInfo: paymentInfoRes.data?.value || "",
    coffees: coffeesRes.data || [],
    payments: paymentsRes.data || [],
  };

  if (isAdmin) {
    const [allProfilesRes, allCoffeesRes, allPaymentsRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, display_name, created_at")
        .order("display_name"),
      supabase.from("coffees").select("user_id, scanned_at, price"),
      supabase.from("payments").select("id, user_id, amount, created_at").order("created_at", { ascending: false }),
    ]);

    data.allProfiles = allProfilesRes.data || [];
    data.allCoffees = allCoffeesRes.data || [];
    data.allPayments = allPaymentsRes.data || [];
  }

  return data;
}
