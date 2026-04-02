import { getAdminSupabase } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email, password, displayName } = await request.json();

  const emailLower = email.toLowerCase();
  if (!emailLower.endsWith("@autajon.com") && !emailLower.endsWith("@autajon.int")) {
    return NextResponse.json(
      { error: "Seules les adresses @autajon.com et @autajon.int sont autorisées" },
      { status: 400 }
    );
  }

  const admin = getAdminSupabase();
  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: displayName },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Notifier les admins de la création du compte
  const { data: admins } = await admin
    .from("profiles")
    .select("id")
    .eq("is_admin", true);

  if (admins && admins.length > 0) {
    await admin.from("notifications").insert(
      admins.map((a) => ({
        user_id: a.id,
        type: "new_user",
        message: `${displayName} (${email}) vient de créer un compte.`,
      }))
    );
  }

  return NextResponse.json({ success: true });
}
