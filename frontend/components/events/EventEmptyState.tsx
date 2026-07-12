"use client";

import Link from "next/link";
import { CalendarX, SearchX, Plus, RefreshCw } from "lucide-react";

interface EventEmptyStateProps {
  hasFilters: boolean;
  onResetFilters?: () => void;
}

export function EventEmptyState({ hasFilters, onResetFilters }: EventEmptyStateProps) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-900/20 p-12 flex flex-col items-center justify-center text-center backdrop-blur-sm animate-in fade-in duration-300">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-950 border border-white/[0.06] text-zinc-500 mb-5 shadow-inner">
        {hasFilters ? (
          <SearchX className="h-6 w-6 text-accent-purple" />
        ) : (
          <CalendarX className="h-6 w-6 text-electric-blue" />
        )}
      </div>

      <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
        {hasFilters ? "No matching translation events" : "No translation events yet"}
      </h3>
      
      <p className="mt-2 text-xs text-zinc-400 max-w-sm leading-relaxed">
        {hasFilters
          ? "We couldn't find any events matching your active search keywords or filters. Try adjusting them or resetting."
          : "Create your first real-time translation event to configure audio routing, select target languages, and assign cloned voices."}
      </p>

      <div className="mt-6 flex flex-wrap gap-3 justify-center">
        {hasFilters && onResetFilters && (
          <button
            onClick={onResetFilters}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-zinc-900/30 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reset Filters
          </button>
        )}
        
        <Link
          href="/dashboard/events/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-electric-blue to-accent-purple px-4 py-2 text-xs font-semibold text-white shadow-lg transition-transform hover:scale-102 hover:opacity-95"
        >
          <Plus className="h-3.5 w-3.5" />
          Create Translation Event
        </Link>
      </div>
    </div>
  );
}
