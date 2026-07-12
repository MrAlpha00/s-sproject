"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Radio,
  Languages,
  Mic,
  Volume2,
  BarChart3,
  CreditCard,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

export const SIDEBAR_NAV_ITEMS = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    allowedRoles: ["SUPER_ADMIN", "ORGANIZATION", "TEAM_MEMBER"],
  },
  {
    title: "Live Events",
    icon: Radio,
    href: "/dashboard/events",
    allowedRoles: ["SUPER_ADMIN", "ORGANIZATION", "TEAM_MEMBER"],
  },
  {
    title: "Translation Studio",
    icon: Languages,
    href: "/dashboard/translation",
    allowedRoles: ["SUPER_ADMIN", "ORGANIZATION", "TEAM_MEMBER"],
  },
  {
    title: "Voice Profiles",
    icon: Mic,
    href: "/dashboard/voices",
    allowedRoles: ["SUPER_ADMIN", "ORGANIZATION", "TEAM_MEMBER"],
  },
  {
    title: "Audio Devices",
    icon: Volume2,
    href: "/dashboard/audio",
    allowedRoles: ["SUPER_ADMIN", "ORGANIZATION", "TEAM_MEMBER"],
  },
  {
    title: "Analytics",
    icon: BarChart3,
    href: "/dashboard/analytics",
    allowedRoles: ["SUPER_ADMIN", "ORGANIZATION", "TEAM_MEMBER"],
  },
  {
    title: "Billing",
    icon: CreditCard,
    href: "/dashboard/billing",
    allowedRoles: ["SUPER_ADMIN", "ORGANIZATION", "TEAM_MEMBER"],
  },
  {
    title: "Team",
    icon: Users,
    href: "/dashboard/team",
    allowedRoles: ["SUPER_ADMIN", "ORGANIZATION", "TEAM_MEMBER"],
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
    allowedRoles: ["SUPER_ADMIN", "ORGANIZATION", "TEAM_MEMBER"],
  },
];

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ collapsed, setCollapsed, mobileOpen = false, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();

  const handleLinkClick = () => {
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between">
      <div>
        {/* Logo Section */}
        <div className={`flex h-16 items-center border-b border-white/[0.06] px-4 ${collapsed ? "justify-center" : "justify-between"}`}>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-electric-blue to-accent-purple p-[1px] shadow-[0_0_15px_rgba(0,212,255,0.25)]">
              <div className="flex h-full w-full items-center justify-center rounded-lg bg-black">
                <svg
                  className="h-4 w-4 text-electric-blue"
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
                  <path d="M7 2h1" />
                  <path d="m22 8-7 9" />
                  <path d="m21 17-1-2" />
                  <path d="M16.5 11a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9Z" />
                </svg>
              </div>
            </div>
            {!collapsed && (
              <span className="text-md font-bold tracking-tight text-white animate-in fade-in duration-300">
                Aether
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-electric-blue to-accent-purple font-extrabold">
                  VOX
                </span>
              </span>
            )}
          </div>
          {mobileOpen && onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="rounded-lg p-1 text-zinc-500 hover:bg-white/[0.06] hover:text-white lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1 px-2 py-4">
          {SIDEBAR_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleLinkClick}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-electric-blue/10 to-accent-purple/5 text-white border-l-2 border-electric-blue shadow-[inset_1px_0_0_rgba(255,255,255,0.02)]"
                    : "text-zinc-400 border-l-2 border-transparent hover:bg-white/[0.03] hover:text-white"
                }`}
              >
                <Icon
                  className={`h-4.5 w-4.5 shrink-0 transition-colors ${
                    isActive ? "text-electric-blue" : "text-zinc-400 group-hover:text-white"
                  }`}
                />
                {!collapsed && <span className="truncate">{item.title}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Collapse Desktop Toggle Button at bottom */}
      {!mobileOpen && (
        <div className="hidden border-t border-white/[0.06] p-2 lg:block">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex w-full items-center justify-center rounded-lg p-2 text-zinc-500 hover:bg-white/[0.06] hover:text-white transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Drawer (with Backdrop Overlay) */}
      <div
        className={`fixed inset-0 z-50 flex lg:hidden transition-opacity duration-300 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop overlay */}
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onCloseMobile}
        />
        
        {/* Sliding Panel */}
        <div
          className={`relative flex w-full max-w-xs flex-col bg-zinc-950 border-r border-white/[0.06] transition-transform duration-300 ease-in-out ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {sidebarContent}
        </div>
      </div>

      {/* Desktop Sidebar (Permanent) */}
      <aside
        className={`hidden lg:flex flex-col h-screen fixed top-0 left-0 bg-zinc-950/85 border-r border-white/[0.06] backdrop-blur-xl transition-all duration-300 ease-in-out z-30 ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
