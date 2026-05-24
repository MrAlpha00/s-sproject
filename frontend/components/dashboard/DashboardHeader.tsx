"use client";

import { ProfileMenu } from "@/components/dashboard/ProfileMenu";
import { useAuth } from "@/hooks/useAuth";

export function DashboardHeader() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-black/60 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-electric-blue to-accent-purple p-[1px] shadow-[0_0_15px_rgba(0,212,255,0.2)]">
            <div className="flex h-full w-full items-center justify-center rounded-lg bg-black">
              <svg
                className="h-4 w-4 text-electric-blue"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m5 8 6 6" />
                <path d="m4 14 6-6 2-3" />
                <path d="M2 5h12" />
                <path d="M7 2h1" />
                <path d="m22 8-7 9" />
                <path d="m21 17-1-2" />
                <path d="M16.5 11a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9Z" />
              </svg>
            </div>
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            Aether
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-electric-blue to-accent-purple font-extrabold">
              VOX
            </span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-1">
          <span className="text-xs text-zinc-500 mr-2">
            {user?.email}
          </span>
          <ProfileMenu />
        </div>

        <div className="md:hidden">
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}
