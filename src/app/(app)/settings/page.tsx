"use client";

import NavBar from "@/components/NavBar";
import ChangePasswordForm from "@/components/ChangePasswordForm";
import LogoutButton from "@/components/LogoutButton";
import { useData } from "@/lib/DataContext";

export default function SettingsPage() {
  const { isAdmin } = useData();

  return (
    <div className="min-h-screen bg-amber-50 pb-20">
      <div className="bg-gradient-to-b from-amber-600 to-amber-500 text-white px-4 pt-8 pb-6 rounded-b-3xl">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold">Parametres</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-4">
        <ChangePasswordForm />

        <div className="mt-6 text-center">
          <LogoutButton />
        </div>
      </div>

      <NavBar isAdmin={isAdmin} />
    </div>
  );
}
