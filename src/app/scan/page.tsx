import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { recordCoffee } from "./actions";

export default async function ScanPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/scan");
  }

  const result = await recordCoffee();

  if (result.success) {
    if (result.alreadyScanned) {
      redirect("/?toast=already");
    }
    redirect("/?toast=success");
  }

  redirect("/?toast=error");
}
