import { redirect } from "next/navigation";
import { fetchAppData } from "@/lib/fetchAppData";
import { DataProvider } from "@/lib/DataContext";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await fetchAppData();

  if (!data) {
    redirect("/login");
  }

  return <DataProvider initialData={data}>{children}</DataProvider>;
}
