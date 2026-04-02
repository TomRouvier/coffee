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

  return NextResponse.json({ success: true });
}
