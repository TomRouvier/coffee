"use server";

import { createClient } from "@/lib/supabase/server";

export async function markNotificationsRead(notificationIds: number[]) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifie" };

  if (notificationIds.length === 0) return { success: true };

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .in("id", notificationIds)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  return { success: true };
}
