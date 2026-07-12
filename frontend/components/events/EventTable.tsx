"use client";

import Link from "next/link";
import { Eye, Edit3, Copy, Trash2, Calendar, Languages } from "lucide-react";
import { TranslationEvent } from "@/types/event";
import { EventStatusBadge } from "@/components/events/EventStatusBadge";
import { useEvents } from "@/providers/EventProvider";
import { useState } from "react";

interface EventTableProps {
  events: TranslationEvent[];
}

export function EventTable({ events }: EventTableProps) {
  const { deleteEventPlaceholder, duplicateEventPlaceholder } = useEvents();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedEventName, setSelectedEventName] = useState<string>("");

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-white/[0.06] bg-zinc-900/20 backdrop-blur-sm">
      <table className="w-full border-collapse text-left text-xs sm:text-sm">
        <thead>
          <tr className="border-b border-white/[0.06] bg-zinc-950/40 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            <th className="px-6 py-4">Translation Event</th>
            <th className="px-6 py-4">Date & Time</th>
            <th className="px-6 py-4">Language Pipeline</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.04] text-zinc-300">
          {events.map((event) => {
            const eventDate = new Date(`${event.date}T${event.time}`);
            const formattedDate = eventDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });
            const formattedTime = eventDate.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <tr key={event.id} className="group hover:bg-white/[0.01] transition-colors">
                {/* Event Title/Venue */}
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-white group-hover:text-electric-blue transition-colors">
                      {event.name}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-medium">
                      Venue: {event.venue}
                    </span>
                  </div>
                </td>
                
                {/* Date / Time */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                    <span>{formattedDate} at {formattedTime}</span>
                  </div>
                </td>
                
                {/* Languages */}
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-zinc-500 font-semibold uppercase">Src:</span>
                      <span className="rounded bg-electric-blue/10 px-1 py-0.5 text-[9px] text-electric-blue font-bold">
                        {event.sourceLanguage}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-zinc-500 font-semibold uppercase">Trg:</span>
                      <div className="flex gap-0.5 max-w-[150px] overflow-hidden truncate">
                        {event.targetLanguages.slice(0, 3).map((lang) => (
                          <span
                            key={lang}
                            className="rounded bg-white/[0.04] px-1 py-0.5 text-[9px] text-zinc-400 font-medium"
                          >
                            {lang.split(" ")[0]}
                          </span>
                        ))}
                        {event.targetLanguages.length > 3 && (
                          <span className="text-[9px] text-zinc-500 font-bold px-1">
                            +{event.targetLanguages.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                
                {/* Status */}
                <td className="px-6 py-4">
                  <EventStatusBadge status={event.status} />
                </td>
                
                {/* Actions */}
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Link
                      href={`/dashboard/events/${event.id}`}
                      className="flex h-7 w-7 items-center justify-center rounded bg-zinc-800/40 border border-white/[0.06] text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                      title="View Details"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Link>
                    <Link
                      href={`/dashboard/events/${event.id}/edit`}
                      className="flex h-7 w-7 items-center justify-center rounded bg-zinc-800/40 border border-white/[0.06] text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                      title="Edit Event"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </Link>
                    <button
                      onClick={() => duplicateEventPlaceholder(event.id)}
                      className="flex h-7 w-7 items-center justify-center rounded bg-zinc-800/40 border border-white/[0.06] text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                      title="Duplicate Event"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedEventId(event.id);
                        setSelectedEventName(event.name);
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
                      title="Delete Event"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Delete confirmation modal */}
      {selectedEventId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedEventId(null)} />
          <div className="relative w-full max-w-sm rounded-xl border border-white/[0.06] bg-zinc-950 p-6 shadow-2xl backdrop-blur-xl">
            <h3 className="text-sm font-semibold text-white">Delete Translation Event</h3>
            <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
              Are you sure you want to delete &ldquo;{selectedEventName}&rdquo;? This action is permanent and cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setSelectedEventId(null)}
                className="rounded-lg border border-white/[0.06] bg-zinc-900/30 px-3.5 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteEventPlaceholder(selectedEventId);
                  setSelectedEventId(null);
                }}
                className="rounded-lg bg-red-500/15 border border-red-500/30 px-3.5 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
