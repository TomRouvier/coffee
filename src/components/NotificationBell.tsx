"use client";

import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { useData } from "@/lib/DataContext";
import { markNotificationsRead } from "@/app/notifications/actions";

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "a l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  return `il y a ${diffD}j`;
}

export default function NotificationBell() {
  const { notifications, refreshData } = useData();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const handleOpen = async () => {
    const wasOpen = open;
    setOpen(!open);

    if (!wasOpen && unreadCount > 0) {
      const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
      await markNotificationsRead(unreadIds);
      refreshData();
    }
  };

  return (
    <div ref={ref} className="fixed top-3 right-14 z-50">
      <button
        onClick={handleOpen}
        className="relative w-9 h-9 flex items-center justify-center rounded-full bg-white/80 backdrop-blur shadow-md border border-amber-200 text-amber-600 hover:bg-amber-50 active:scale-95 transition-all"
        aria-label="Notifications"
      >
        <Bell size={16} strokeWidth={2.5} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-11 right-0 w-72 max-h-80 overflow-y-auto rounded-xl bg-white shadow-xl border border-amber-100 z-50">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-400">
              Aucune notification
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className={`px-4 py-3 text-sm ${
                    !n.is_read ? "bg-amber-50/60" : ""
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!n.is_read && (
                      <span className="mt-1.5 w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-gray-700 leading-snug">{n.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {timeAgo(n.created_at)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
