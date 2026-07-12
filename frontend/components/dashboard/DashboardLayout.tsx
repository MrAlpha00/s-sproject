"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Layout-based authentication protection
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  // Handle ESC key to close mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex items-center justify-center">
            {/* Spinning Glow Ring */}
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-zinc-800 border-t-electric-blue border-b-accent-purple"></div>
            {/* Logo Mark */}
            <div className="absolute h-5 w-5 rounded-md bg-zinc-900 border border-white/[0.06] flex items-center justify-center">
              <svg
                className="h-3 w-3 text-electric-blue"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m5 8 6 6" />
                <path d="m4 14 6-6 2-3" />
                <path d="M2 5h12" />
              </svg>
            </div>
          </div>
          <span className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">
            Securing AetherVOX Connection...
          </span>
        </div>
      </div>
    );
  }

  // If no user, render nothing while redirecting
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Collapsible Left Sidebar */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Layout Area */}
      <div className={`transition-all duration-300 min-h-screen flex flex-col ${collapsed ? "lg:pl-16" : "lg:pl-64"}`}>
        {/* Top Navigation */}
        <Topbar onOpenMobile={() => setMobileOpen(true)} />

        {/* Content Area */}
        <main className="flex-1 w-full bg-zinc-950/20">
          <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 animate-in fade-in-50 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
