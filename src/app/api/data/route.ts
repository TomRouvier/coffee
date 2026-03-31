import { fetchAppData } from "@/lib/fetchAppData";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await fetchAppData();

  if (!data) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  return NextResponse.json(data);
}
