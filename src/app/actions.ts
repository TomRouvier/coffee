"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function changePassword(currentPassword: string, newPassword: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifie" };

  if (newPassword.length < 6) return { error: "Le nouveau mot de passe doit faire au moins 6 caracteres" };

  // Verify current password
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: currentPassword,
  });
  if (signInError) return { error: "Mot de passe actuel incorrect" };

  // Update password
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { error: error.message };

  return { success: true };
}

export async function recordOwnPayment(amount: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifie" };

  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) return { error: "Montant invalide" };

  const { error } = await supabase.from("payments").insert({
    user_id: user.id,
    amount: numAmount,
    recorded_by: user.id,
  });

  if (error) return { error: error.message };

  revalidatePath("/");
  return { success: true };
}

export async function addManualCoffee() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifie" };

  const { data: priceData } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "coffee_price")
    .single();
  const coffeePrice = parseFloat(priceData?.value || "0.50");

  const { error } = await supabase
    .from("coffees")
    .insert({ user_id: user.id, price: coffeePrice });

  if (error) return { error: error.message };

  revalidatePath("/");
  return { success: true };
}
