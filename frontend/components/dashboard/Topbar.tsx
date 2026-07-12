"use client";

import { Menu, ChevronDown, Building, Plus } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Breadcrumb } from "@/components/dashboard/Breadcrumb";
import { SearchBar } from "@/components/dashboard/SearchBar";
import { NotificationBell } from "@/components/dashboard/NotificationBell";
import { ProfileDropdown } from "@/components/dashboard/ProfileDropdown";

interface TopbarProps {
  onOpenMobile: () => void;
}

export function Topbar({ onOpenMobile }: TopbarProps) {
  const [orgOpen, setOrgOpen] = useState(false);
  const orgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (orgRef.current && !orgRef.current.contains(e.target as Node)) {
        setOrgOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-white/[0.06] bg-zinc-950/75 px-6 backdrop-blur-md">
      {/* Left side: Hamburger (mobile) + Breadcrumbs */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenMobile}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.06] bg-zinc-900/30 text-zinc-400 hover:border-white/[0.1] hover:text-white lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="hidden sm:block">
          <Breadcrumb />
        </div>
      </div>

      {/* Right side: Search, Org, Notifications, Profile */}
      <div className="flex items-center gap-3">
        {/* Search Bar Placeholder */}
        <div className="hidden md:block">
          <SearchBar />
        </div>

        {/* Organization Switcher Placeholder */}
        <div ref={orgRef} className="relative">
          <button
            onClick={() => setOrgOpen(!orgOpen)}
            className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-zinc-900/30 px-3 py-1.5 text-xs font-semibold text-zinc-200 transition-all hover:border-white/[0.1] hover:bg-zinc-900/50"
          >
            <Building className="h-3.5 w-3.5 text-electric-blue" />
            <span className="max-w-[100px] truncate sm:max-w-none">My Organization</span>
            <ChevronDown className="h-3 w-3 text-zinc-500" />
          </button>

          {orgOpen && (
            <div className="absolute right-0 top-9 z-50 w-56 rounded-xl border border-white/[0.06] bg-zinc-950/95 p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in-50 slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 border-b border-white/[0.06]">
                <p className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500">Active Tenant</p>
              </div>
              <div className="mt-1 space-y-0.5">
                <button
                  onClick={() => setOrgOpen(false)}
                  className="flex w-full items-center justify-between rounded-lg bg-electric-blue/10 px-3 py-2 text-xs font-medium text-white transition-colors"
                >
                  <span className="truncate">My Organization</span>
                  <div className="h-1.5 w-1.5 rounded-full bg-electric-blue" />
                </button>
                <button
                  disabled
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-zinc-500 cursor-not-allowed transition-colors hover:bg-white/[0.02]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Create Organization
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <NotificationBell />

        {/* Separator */}
        <div className="h-5 w-[1px] bg-white/[0.06]" />

        {/* Profile Dropdown */}
        <ProfileDropdown />
      </div>
    </header>
  );
}
