"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, User, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function ProfileDropdown() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
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
  const fullName = user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "User";

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-electric-blue to-accent-purple text-xs font-bold text-white shadow-lg transition-transform hover:scale-105"
        title={user?.email ?? "User Profile"}
      >
        {initials}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-56 rounded-xl border border-white/[0.06] bg-zinc-950/95 p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in-50 slide-in-from-top-2 duration-150">
          <div className="border-b border-white/[0.06] px-3 py-2.5">
            <p className="text-xs font-semibold text-white truncate">{fullName}</p>
            <p className="text-[10px] text-zinc-500 truncate">{user?.email}</p>
          </div>

          <div className="mt-1 space-y-0.5">
            <button
              onClick={() => {
                setOpen(false);
                router.push("/dashboard/settings"); // Profile settings
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              <User className="h-3.5 w-3.5" />
              Profile
            </button>
            <button
              onClick={() => {
                setOpen(false);
                router.push("/dashboard/settings");
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              <Settings className="h-3.5 w-3.5" />
              Settings
            </button>
          </div>

          <div className="mt-1 border-t border-white/[0.06] pt-1">
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-red-400 transition-colors hover:bg-red-500/10"
            >
              <LogOut className="h-3.5 w-3.5" />
              Log Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
