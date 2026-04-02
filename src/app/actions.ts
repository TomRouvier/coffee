"use server";

import { createClient } from "@/lib/supabase/server";
import { getAdminSupabase } from "@/lib/supabase/admin";
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

export async function recordOwnPayment(amount: string, method?: string) {
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
    method: method || null,
  });

  if (error) return { error: error.message };

  // Notify admins (non-blocking: don't let notification failure break the payment)
  try {
    const adminSupabase = getAdminSupabase();
    const { data: actorProfile } = await adminSupabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .single();

    const { data: admins, error: adminsError } = await adminSupabase
      .from("profiles")
      .select("id")
      .eq("is_admin", true);

    console.log("[recordOwnPayment] admins query:", { admins, adminsError });
    console.log("[recordOwnPayment] SERVICE_ROLE_KEY defined:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);

    if (admins && admins.length > 0) {
      const notifications = admins
        .filter((a) => a.id !== user.id)
        .map((a) => ({
          user_id: a.id,
          type: "payment_recorded",
          message: `${actorProfile?.display_name || "Un utilisateur"} a enregistre un paiement de ${numAmount.toFixed(2)} €${method ? ` (${method})` : ""}`,
          metadata: { amount: numAmount, method: method || null, payer_id: user.id },
        }));

      console.log("[recordOwnPayment] inserting notifications:", notifications.length);

      if (notifications.length > 0) {
        const { error: notifError } = await adminSupabase.from("notifications").insert(notifications);
        console.log("[recordOwnPayment] notification insert result:", { notifError });
      }
    }
  } catch (err) {
    console.error("[recordOwnPayment] notification error:", err);
  }

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
