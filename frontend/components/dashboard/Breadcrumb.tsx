"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

const ROUTE_NAME_MAP: Record<string, string> = {
  dashboard: "Dashboard",
  events: "Live Events",
  translation: "Translation Studio",
  voices: "Voice Profiles",
  audio: "Audio Devices",
  analytics: "Analytics",
  billing: "Billing",
  team: "Team",
  settings: "Settings",
};

export function Breadcrumb() {
  const pathname = usePathname();
  
  // Split path and filter out empty segments
  const segments = pathname ? pathname.split("/").filter(Boolean) : [];

  return (
    <nav aria-label="Breadcrumb" className="flex items-center space-x-1.5 text-xs font-medium text-zinc-400">
      <Link
        href="/dashboard"
        className="flex items-center gap-1 transition-colors hover:text-white"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>
      
      {segments.map((segment, idx) => {
        const isLast = idx === segments.length - 1;
        const path = `/${segments.slice(0, idx + 1).join("/")}`;
        const label = ROUTE_NAME_MAP[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);

        // If the first segment is "dashboard" and it's the only one, we don't need to show it twice
        if (segment === "dashboard" && idx === 0 && segments.length > 1) {
          return null; // Skip rendering 'dashboard' if there are subpages
        }

        return (
          <div key={path} className="flex items-center space-x-1.5" role="presentation">
            <ChevronRight className="h-3.5 w-3.5 text-zinc-600 shrink-0" />
            {isLast ? (
              <span className="text-zinc-200 font-semibold truncate max-w-[120px] sm:max-w-none">
                {label}
              </span>
            ) : (
              <Link
                href={path}
                className="transition-colors hover:text-white truncate max-w-[120px] sm:max-w-none"
              >
                {label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
