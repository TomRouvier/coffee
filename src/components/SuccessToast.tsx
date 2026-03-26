"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const messages: Record<string, { text: string; color: string }> = {
  success: { text: "Cafe enregistre ! ☕", color: "bg-green-500" },
  already: { text: "Deja enregistre (double scan)", color: "bg-amber-500" },
  error: { text: "Erreur lors de l enregistrement", color: "bg-red-500" },
};

export default function SuccessToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const toast = searchParams.get("toast");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (toast && messages[toast]) {
      setVisible(true);
      // Clean the URL
      const url = new URL(window.location.href);
      url.searchParams.delete("toast");
      window.history.replaceState({}, "", url.toString());

      const timer = setTimeout(() => setVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast, router]);

  if (!visible || !toast || !messages[toast]) return null;

  return (
    <div
      className={`fixed top-4 left-4 right-4 ${messages[toast].color} text-white px-4 py-3 rounded-xl text-center font-semibold shadow-lg z-50 animate-bounce`}
    >
      {messages[toast].text}
    </div>
  );
}
