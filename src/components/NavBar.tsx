"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavBar({ isAdmin }: { isAdmin?: boolean }) {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Accueil", icon: "☕" },
    { href: "/stats", label: "Stats", icon: "📊" },
    ...(isAdmin ? [{ href: "/admin", label: "Admin", icon: "⚙️" }] : []),
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-amber-200 px-2 py-2 z-50">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
                active
                  ? "text-amber-700 bg-amber-100"
                  : "text-amber-500 hover:text-amber-700"
              }`}
            >
              <span className="text-xl">{link.icon}</span>
              <span className="text-xs font-medium">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
