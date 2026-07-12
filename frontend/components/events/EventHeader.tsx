"use client";

import Link from "next/link";
import { Plus, Search, SlidersHorizontal, LayoutGrid, List } from "lucide-react";
import { TranslationEventStatus } from "@/types/event";

interface EventHeaderProps {
  totalCount: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  languageFilter: string;
  setLanguageFilter: (lang: string) => void;
  sortBy: string;
  setSortBy: (sortBy: string) => void;
  viewMode: "grid" | "table";
  setViewMode: (mode: "grid" | "table") => void;
}

export function EventHeader({
  totalCount,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  languageFilter,
  setLanguageFilter,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
}: EventHeaderProps) {
  const statuses: { label: string; value: string }[] = [
    { label: "All Statuses", value: "all" },
    { label: "Draft", value: "draft" },
    { label: "Scheduled", value: "scheduled" },
    { label: "Live Now", value: "live" },
    { label: "Completed", value: "completed" },
    { label: "Cancelled", value: "cancelled" },
  ];

  const languages: string[] = [
    "All Languages",
    "English (US)",
    "English (UK)",
    "Spanish (ES)",
    "Mandarin (ZH)",
    "French (FR)",
    "German (DE)",
    "Japanese (JA)",
    "Italian (IT)",
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Translation Events
          </h1>
          <p className="text-xs md:text-sm text-zinc-400 font-medium mt-1">
            Create and coordinate live audio translation channels ({totalCount} events found).
          </p>
        </div>
        
        <Link
          href="/dashboard/events/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-electric-blue to-accent-purple px-4 py-2 text-xs font-semibold text-white shadow-lg transition-transform hover:scale-102 hover:opacity-95 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Create Translation Event
        </Link>
      </div>

      {/* Filter and Control Panel */}
      <div className="rounded-xl border border-white/[0.06] bg-zinc-900/20 p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:max-w-xs shrink-0">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full rounded-lg border border-white/[0.06] bg-zinc-900/40 pl-9 pr-3 text-xs text-zinc-300 placeholder-zinc-500 focus:border-electric-blue/50 focus:outline-none transition-colors"
          />
        </div>

        {/* Dropdowns & View toggles */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-start md:justify-end">
          {/* Status filter */}
          <div className="flex items-center gap-1">
            <SlidersHorizontal className="h-3.5 w-3.5 text-zinc-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-lg border border-white/[0.06] bg-zinc-900/40 px-2 py-1 text-xs text-zinc-300 focus:outline-none"
            >
              {statuses.map((s) => (
                <option key={s.value} value={s.value} className="bg-zinc-950 text-zinc-300">
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Language filter */}
          <select
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value)}
            className="h-9 rounded-lg border border-white/[0.06] bg-zinc-900/40 px-2 py-1 text-xs text-zinc-300 focus:outline-none"
          >
            {languages.map((l) => (
              <option key={l} value={l === "All Languages" ? "all" : l} className="bg-zinc-950 text-zinc-300">
                {l}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-9 rounded-lg border border-white/[0.06] bg-zinc-900/40 px-2 py-1 text-xs text-zinc-300 focus:outline-none"
          >
            <option value="newest" className="bg-zinc-950 text-zinc-300">Newest First</option>
            <option value="oldest" className="bg-zinc-950 text-zinc-300">Oldest First</option>
          </select>

          {/* Divider */}
          <div className="hidden sm:block h-6 w-[1px] bg-white/[0.06]" />

          {/* View toggle */}
          <div className="flex items-center gap-1 bg-zinc-900/60 rounded-lg p-0.5 border border-white/[0.06]">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === "grid" ? "bg-electric-blue/15 text-electric-blue" : "text-zinc-500 hover:text-white"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === "table" ? "bg-electric-blue/15 text-electric-blue" : "text-zinc-500 hover:text-white"
              }`}
              title="Table View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
