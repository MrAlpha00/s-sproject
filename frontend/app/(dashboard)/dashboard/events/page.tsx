"use client";

import { useState } from "react";
import { useEvents } from "@/providers/EventProvider";
import { EventHeader } from "@/components/events/EventHeader";
import { EventCard } from "@/components/events/EventCard";
import { EventTable } from "@/components/events/EventTable";
import { EventEmptyState } from "@/components/events/EventEmptyState";
import { Radio, Calendar, CheckCircle2 } from "lucide-react";

export default function EventsPage() {
  const { events } = useEvents();

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Reset helper
  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setLanguageFilter("all");
    setSortBy("newest");
  };

  // Filter & Sort Logic
  const filteredEvents = events
    .filter((event) => {
      // 1. Search Query
      const matchSearch =
        event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase()));

      // 2. Status
      const matchStatus = statusFilter === "all" || event.status === statusFilter;

      // 3. Language
      const matchLanguage =
        languageFilter === "all" ||
        event.sourceLanguage === languageFilter ||
        event.targetLanguages.includes(languageFilter);

      return matchSearch && matchStatus && matchLanguage;
    })
    .sort((a, b) => {
      // Sort by Date & Time
      const dateA = new Date(`${a.date}T${a.time}`).getTime();
      const dateB = new Date(`${b.date}T${b.time}`).getTime();
      return sortBy === "newest" ? dateB - dateA : dateA - dateB;
    });

  // Calculate quick stats
  const totalCount = filteredEvents.length;
  const liveCount = events.filter((e) => e.status === "live").length;
  const scheduledCount = events.filter((e) => e.status === "scheduled").length;
  const completedCount = events.filter((e) => e.status === "completed").length;

  const hasActiveFilters = searchQuery !== "" || statusFilter !== "all" || languageFilter !== "all";

  return (
    <div className="space-y-8">
      {/* Quick Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Events */}
        <div className="rounded-xl border border-white/[0.04] bg-zinc-900/10 p-4">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Total Events</p>
          <p className="text-xl font-bold text-white mt-1">{events.length}</p>
        </div>
        
        {/* Live Now */}
        <div className="rounded-xl border border-white/[0.04] bg-zinc-900/10 p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Live Now</p>
            <p className="text-xl font-bold text-emerald-400 mt-1">{liveCount}</p>
          </div>
          {liveCount > 0 && (
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          )}
        </div>

        {/* Scheduled */}
        <div className="rounded-xl border border-white/[0.04] bg-zinc-900/10 p-4">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Scheduled</p>
          <p className="text-xl font-bold text-blue-400 mt-1">{scheduledCount}</p>
        </div>

        {/* Completed */}
        <div className="rounded-xl border border-white/[0.04] bg-zinc-900/10 p-4">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Completed</p>
          <p className="text-xl font-bold text-zinc-400 mt-1">{completedCount}</p>
        </div>
      </div>

      {/* Header Controls */}
      <EventHeader
        totalCount={totalCount}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        languageFilter={languageFilter}
        setLanguageFilter={setLanguageFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {/* List content */}
      {totalCount === 0 ? (
        <EventEmptyState hasFilters={hasActiveFilters} onResetFilters={handleResetFilters} />
      ) : viewMode === "grid" ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="hidden lg:block">
          <EventTable events={filteredEvents} />
        </div>
      )}

      {/* Fallback for table view on mobile/tablet */}
      {viewMode === "table" && totalCount > 0 && (
        <div className="lg:hidden grid gap-6 sm:grid-cols-2">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
