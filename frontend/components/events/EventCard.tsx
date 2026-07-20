"use client";

import Link from "next/link";
import { Calendar, MapPin, Languages, Mic, Copy, Trash2, Eye, Edit3, ArrowRight } from "lucide-react";
import { TranslationEvent } from "@/types/event";
import { EventStatusBadge } from "@/components/events/EventStatusBadge";
import { useEvents } from "@/providers/EventProvider";
import { useState } from "react";
import { motion } from "framer-motion";

interface EventCardProps {
  event: TranslationEvent;
}

export function EventCard({ event }: EventCardProps) {
  const { deleteEvent, duplicateEvent, deleteEventPlaceholder, duplicateEventPlaceholder } = useEvents();
  const handleDuplicate = duplicateEvent || duplicateEventPlaceholder;
  const handleDelete = deleteEvent || deleteEventPlaceholder;
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Format date nicely
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
    <>
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ duration: 0.2 }}
        className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-white/[0.06] bg-zinc-900/40 p-5 transition-all duration-200 hover:border-white/[0.12] hover:bg-zinc-900/60"
      >
        {/* Top line: Name and Status */}
        <div>
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="font-semibold text-white group-hover:text-electric-blue transition-colors text-sm sm:text-base line-clamp-1">
              {event.name}
            </h3>
            <EventStatusBadge status={event.status} />
          </div>

          <p className="text-xs text-zinc-400 line-clamp-2 mb-4 leading-relaxed">
            {event.description || "No description provided."}
          </p>

          {/* Details list */}
          <div className="space-y-2 mb-4 text-xs font-medium text-zinc-400">
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
              <span>{formattedDate} at {formattedTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
              <span className="truncate">{event.venue}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mic className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
              <span className="truncate">Voice: {event.voiceProfile}</span>
            </div>
          </div>

          {/* Languages visual path */}
          <div className="rounded-lg bg-zinc-950/40 border border-white/[0.03] p-2.5 mb-4">
            <div className="flex items-center gap-2 text-xs font-medium">
              <span className="text-zinc-500 flex items-center gap-1">
                <Languages className="h-3 w-3" />
                Source:
              </span>
              <span className="rounded bg-electric-blue/10 px-1.5 py-0.5 text-[10px] text-electric-blue font-bold">
                {event.sourceLanguage}
              </span>
            </div>
            
            <div className="flex items-center gap-1.5 mt-2 text-xs font-medium">
              <span className="text-zinc-500 shrink-0">Target:</span>
              <div className="flex flex-wrap gap-1">
                {event.targetLanguages.map((lang) => (
                  <span
                    key={lang}
                    className="rounded bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-zinc-300 font-semibold border border-white/[0.04]"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions and metadata */}
        <div className="border-t border-white/[0.04] pt-4 mt-auto">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[10px] text-zinc-500 truncate" title={`Created by ${event.createdBy}`}>
              By: {event.createdBy}
            </span>
            
            <div className="flex items-center gap-1.5">
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
                onClick={() => setShowDeleteConfirm(true)}
                className="flex h-7 w-7 items-center justify-center rounded bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
                title="Delete Event"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Delete confirmation modal placeholder */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative w-full max-w-sm rounded-xl border border-white/[0.06] bg-zinc-950 p-6 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-150">
            <h3 className="text-sm font-semibold text-white">Delete Translation Event</h3>
            <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
              Are you sure you want to delete &ldquo;{event.name}&rdquo;? This action is permanent and cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-lg border border-white/[0.06] bg-zinc-900/30 px-3.5 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  deleteEventPlaceholder(event.id);
                }}
                className="rounded-lg bg-red-500/15 border border-red-500/30 px-3.5 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
