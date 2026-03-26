import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // ignore
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // ignore
          }
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/login?redirect=/scan`, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  }

  // Anti-double-scan: check last 5 seconds
  const fiveSecondsAgo = new Date(Date.now() - 5000).toISOString();
  const { data: recent } = await supabase
    .from("coffees")
    .select("id")
    .eq("user_id", user.id)
    .gte("scanned_at", fiveSecondsAgo)
    .limit(1);

  let toast = "success";

  if (recent && recent.length > 0) {
    toast = "already";
  } else {
    const { error } = await supabase
      .from("coffees")
      .insert({ user_id: user.id });
    if (error) toast = "error";
  }

  // Redirect with timestamp to prevent browser caching the redirect
  const t = Date.now();
  return NextResponse.redirect(`${origin}/?toast=${toast}&t=${t}`, {
    status: 302,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}
