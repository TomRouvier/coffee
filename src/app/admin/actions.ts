"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function resetUserCoffees(userId: string) {
  const supabase = createClient();

  // Verify caller is admin
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

  const { error } = await supabase
    .from("coffees")
    .delete()
    .eq("user_id", userId);

  if (error) return { error: error.message };

  revalidatePath("/admin");
  return { success: true };
}
