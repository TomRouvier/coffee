"use server";

import { createClient } from "@/lib/supabase/server";

export async function recordCoffee(): Promise<{
  success: boolean;
  alreadyScanned?: boolean;
}> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false };
  }

  // Anti-double-scan: check if a coffee was recorded in the last 30 seconds
  const thirtySecondsAgo = new Date(Date.now() - 30000).toISOString();
  const { data: recent } = await supabase
    .from("coffees")
    .select("id")
    .eq("user_id", user.id)
    .gte("scanned_at", thirtySecondsAgo)
    .limit(1);

  if (recent && recent.length > 0) {
    return { success: true, alreadyScanned: true };
  }

  const { error } = await supabase
    .from("coffees")
    .insert({ user_id: user.id });

  return { success: !error };
}
