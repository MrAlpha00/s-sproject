"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, User, Settings, CreditCard } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function ProfileMenu() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSignOut() {
    await signOut();
    setOpen(false);
    router.push("/login");
    router.refresh();
  }

  const initials = user?.email?.charAt(0).toUpperCase() ?? "U";

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-electric-blue to-accent-purple text-xs font-bold text-white shadow-lg transition-transform hover:scale-105"
        title={user?.email ?? "User"}
      >
        {initials}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-56 rounded-xl border border-white/[0.06] bg-zinc-900/95 p-1.5 shadow-2xl backdrop-blur-xl">
          <div className="border-b border-white/[0.06] px-3 py-2.5">
            <p className="text-sm font-medium text-white truncate">
              {user?.user_metadata?.full_name ?? "User"}
            </p>
            <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
          </div>

          <div className="mt-1 space-y-0.5">
            <button
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              <User className="h-4 w-4" />
              Profile
            </button>
            <button
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              <Settings className="h-4 w-4" />
              Settings
            </button>
            <button
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              <CreditCard className="h-4 w-4" />
              Subscription
            </button>
          </div>

          <div className="mt-1 border-t border-white/[0.06] pt-1">
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
