"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";

export function SearchBar() {
  const [shortcutText, setShortcutText] = useState("⌘K");

  useEffect(() => {
    // Detect OS to show correct shortcut key
    if (typeof window !== "undefined") {
      const isMac = navigator.userAgent.toLowerCase().includes("mac");
      setShortcutText(isMac ? "⌘K" : "Ctrl+K");
    }
  }, []);

  return (
    <div className="relative w-full max-w-xs sm:max-w-sm">
      <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-zinc-500">
        <Search className="h-4 w-4" />
      </div>
      <input
        type="text"
        placeholder="Search console..."
        disabled
        className="h-9 w-full rounded-lg border border-white/[0.06] bg-zinc-900/30 pl-9 pr-12 text-sm text-zinc-400 placeholder-zinc-500 shadow-inner transition-colors duration-200 hover:border-white/[0.1] focus:outline-none cursor-not-allowed"
      />
      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
        <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-0.5 rounded border border-white/[0.08] bg-zinc-950 px-1.5 font-mono text-[10px] font-medium text-zinc-500 shadow-sm">
          {shortcutText}
        </kbd>
      </div>
    </div>
  );
}
