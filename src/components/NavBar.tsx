"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Coffee, BarChart3, Settings, ShieldCheck, type LucideIcon } from "lucide-react";
import { type ReactNode } from "react";

function AnimatedIcon({ icon: Icon, active }: { icon: LucideIcon; active: boolean }) {
  return (
    <Icon
      size={22}
      strokeWidth={active ? 2.5 : 2}
      className={`transition-all duration-300 ${
        active ? "scale-110" : "group-hover:scale-110 group-hover:-translate-y-0.5"
      }`}
    />
  );
}

export default function NavBar({ isAdmin }: { isAdmin?: boolean }) {
  const pathname = usePathname();

  const links: { href: string; label: string; icon: LucideIcon }[] = [
    { href: "/", label: "Accueil", icon: Coffee },
    { href: "/stats", label: "Stats", icon: BarChart3 },
    { href: "/settings", label: "Parametres", icon: Settings },
    ...(isAdmin ? [{ href: "/admin", label: "Admin", icon: ShieldCheck }] : []),
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
              className={`group flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
                active
                  ? "text-amber-700 bg-amber-100"
                  : "text-amber-500 hover:text-amber-700"
              }`}
            >
              <AnimatedIcon icon={link.icon} active={active} />
              <span className="text-xs font-medium">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
