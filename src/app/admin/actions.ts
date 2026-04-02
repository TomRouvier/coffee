"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

function getAdminSupabase() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function verifyAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) return null;
  return user;
}

export async function updateCoffeePrice(price: string) {
  const admin = await verifyAdmin();
  if (!admin) return { error: "Non autorise" };

  const numPrice = parseFloat(price);
  if (isNaN(numPrice) || numPrice < 0) return { error: "Prix invalide" };

  const supabase = createClient();
  const { error } = await supabase
    .from("settings")
    .update({ value: numPrice.toFixed(2) })
    .eq("key", "coffee_price");

  if (error) return { error: error.message };

  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true };
}

export async function updatePaymentInfo(info: string) {
  const admin = await verifyAdmin();
  if (!admin) return { error: "Non autorise" };

  const supabase = createClient();
  const { error } = await supabase
    .from("settings")
    .upsert({ key: "payment_info", value: info }, { onConflict: "key" });

  if (error) return { error: error.message };

  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true };
}

export async function recordPayment(userId: string, amount: string, method?: string) {
  const admin = await verifyAdmin();
  if (!admin) return { error: "Non autorise" };

  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) return { error: "Montant invalide" };

  const supabase = createClient();
  const { error } = await supabase.from("payments").insert({
    user_id: userId,
    amount: numAmount,
    recorded_by: admin.id,
    method: method || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true };
}

export async function deletePayment(paymentId: number) {
  const admin = await verifyAdmin();
  if (!admin) return { error: "Non autorise" };

  const supabase = createClient();
  const { error } = await supabase.from("payments").delete().eq("id", paymentId);

  if (error) return { error: error.message };

  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true };
}

export async function resetUserCoffees(userId: string) {
  const admin = await verifyAdmin();
  if (!admin) return { error: "Non autorise" };

  const supabase = createClient();
  await Promise.all([
    supabase.from("coffees").delete().eq("user_id", userId),
    supabase.from("payments").delete().eq("user_id", userId),
  ]);

  revalidatePath("/admin");
  return { success: true };
}

export async function setUserCoffeeCount(userId: string, count: string) {
  const admin = await verifyAdmin();
  if (!admin) return { error: "Non autorise" };

  const numCount = parseInt(count);
  if (isNaN(numCount) || numCount < 0) return { error: "Nombre invalide" };

  const supabase = createClient();

  // Get current count
  const { data: currentCoffees } = await supabase
    .from("coffees")
    .select("id")
    .eq("user_id", userId);

  const currentCount = currentCoffees?.length || 0;

  if (numCount > currentCount) {
    // Add missing coffees
    const { data: priceData } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "coffee_price")
      .single();
    const coffeePrice = parseFloat(priceData?.value || "0.50");

    const toAdd = numCount - currentCount;
    const rows = Array.from({ length: toAdd }, () => ({
      user_id: userId,
      price: coffeePrice,
    }));
    await supabase.from("coffees").insert(rows);
  } else if (numCount < currentCount) {
    // Remove excess coffees (delete oldest first)
    const toRemove = currentCount - numCount;
    const { data: oldest } = await supabase
      .from("coffees")
      .select("id")
      .eq("user_id", userId)
      .order("scanned_at", { ascending: true })
      .limit(toRemove);
    if (oldest && oldest.length > 0) {
      const ids = oldest.map((c) => c.id);
      await supabase.from("coffees").delete().in("id", ids);
    }
  }

  revalidatePath("/admin");
  return { success: true };
}

export async function deleteUser(userId: string) {
  const admin = await verifyAdmin();
  if (!admin) return { error: "Non autorise" };
  if (admin.id === userId)
    return { error: "Tu ne peux pas te supprimer toi-meme" };

  const adminSupabase = getAdminSupabase();
  const { error } = await adminSupabase.auth.admin.deleteUser(userId);
  if (error) return { error: error.message };

  revalidatePath("/admin");
  return { success: true };
}
