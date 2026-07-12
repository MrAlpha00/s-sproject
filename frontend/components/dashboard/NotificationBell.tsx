"use client";

import { Bell } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  unread: boolean;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [notifications] = useState<Notification[]>([
    {
      id: "1",
      title: "Voice Clone Complete",
      description: "Voice profile 'CEO_Clone_v2' successfully trained and verified.",
      time: "10m ago",
      unread: true,
    },
    {
      id: "2",
      title: "System Update",
      description: "Translation latency optimized. Sub-second performance active.",
      time: "1h ago",
      unread: true,
    },
    {
      id: "3",
      title: "Translation Ready",
      description: "Draft transcript for 'Live Event #402' is now available.",
      time: "1d ago",
      unread: false,
    },
  ]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.06] bg-zinc-900/30 text-zinc-400 transition-all hover:border-white/[0.1] hover:text-white"
        aria-label="View notifications"
      >
        <Bell className="h-4.5 w-4.5" />
        {unreadCount > 0 && (
          <span className="absolute right-2 top-2 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-electric-blue opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-electric-blue"></span>
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 rounded-xl border border-white/[0.06] bg-zinc-950/95 p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in-50 slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between border-b border-white/[0.06] px-3 py-2">
            <h3 className="text-xs font-semibold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <span className="rounded bg-electric-blue/10 px-1.5 py-0.5 text-[10px] font-medium text-electric-blue">
                {unreadCount} New
              </span>
            )}
          </div>

          <div className="mt-1 max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-500">No new notifications</div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex flex-col gap-0.5 px-3 py-2.5 transition-colors hover:bg-white/[0.02] ${
                      notification.unread ? "bg-white/[0.01]" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className={`text-xs font-medium text-zinc-200 ${notification.unread ? "text-white" : ""}`}>
                        {notification.title}
                      </span>
                      <span className="text-[10px] text-zinc-500 whitespace-nowrap">{notification.time}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-zinc-400">{notification.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
