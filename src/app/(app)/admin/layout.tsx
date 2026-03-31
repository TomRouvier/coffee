"use client";

import { useData } from "@/lib/DataContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdmin } = useData();
  const router = useRouter();

  useEffect(() => {
    if (!isAdmin) router.push("/");
  }, [isAdmin, router]);

  if (!isAdmin) return null;

  return <>{children}</>;
}
