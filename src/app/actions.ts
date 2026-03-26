"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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
