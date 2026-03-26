import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year in seconds

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options, maxAge: COOKIE_MAX_AGE });
          } catch {
            // Server Component — ignore
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // Server Component — ignore
          }
        },
      },
    }
  );
}
