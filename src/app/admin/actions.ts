"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateCoffeePrice(price: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifie" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!profile?.is_admin) return { error: "Non autorise" };

  const numPrice = parseFloat(price);
  if (isNaN(numPrice) || numPrice < 0) return { error: "Prix invalide" };

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
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifie" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!profile?.is_admin) return { error: "Non autorise" };

  // Upsert the payment_info setting
  const { error } = await supabase
    .from("settings")
    .upsert({ key: "payment_info", value: info }, { onConflict: "key" });

  if (error) return { error: error.message };

  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true };
}

export async function recordPayment(userId: string, amount: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifie" };

  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) return { error: "Montant invalide" };

  const { error } = await supabase.from("payments").insert({
    user_id: userId,
    amount: numAmount,
    recorded_by: user.id,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true };
}
