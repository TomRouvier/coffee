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

export async function recordPayment(userId: string, amount: string) {
  const admin = await verifyAdmin();
  if (!admin) return { error: "Non autorise" };

  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) return { error: "Montant invalide" };

  const supabase = createClient();
  const { error } = await supabase.from("payments").insert({
    user_id: userId,
    amount: numAmount,
    recorded_by: admin.id,
  });

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
