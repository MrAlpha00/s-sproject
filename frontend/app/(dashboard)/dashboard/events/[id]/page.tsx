"use client";

import { useParams, useRouter } from "next/navigation";
import { useEvents } from "@/providers/EventProvider";
import { EventStatusBadge } from "@/components/events/EventStatusBadge";
import { ArrowLeft, Edit3, Play, Calendar, MapPin, Mic, Languages, Volume2, ShieldAlert, Clock, Plus } from "lucide-react";
import Link from "next/link";

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { events } = useEvents();

  const eventId = params?.id as string;
  const event = events.find((e) => e.id === eventId);

  if (!event) {
    return (
      <div className="max-w-md mx-auto py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20 text-red-400 mx-auto mb-4">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h2 className="text-base font-bold text-white uppercase tracking-wider">
          Event Not Found
        </h2>
        <p className="mt-2 text-xs text-zinc-400">
          The Translation Event you are trying to view does not exist or has been removed.
        </p>
        <Link
          href="/dashboard/events"
          className="mt-6 inline-flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-zinc-900/30 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Events
        </Link>
      </div>
    );
  }

  // Format date nicely
  const eventDate = new Date(`${event.date}T${event.time}`);
  const formattedDate = eventDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const formattedTime = eventDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/[0.06] pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/events"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.06] bg-zinc-900/30 text-zinc-400 hover:border-white/[0.1] hover:text-white transition-colors"
            title="Back to Events List"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                Translation Event Console
              </span>
              <EventStatusBadge status={event.status} />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight -mt-0.5">
              {event.name}
            </h1>
          </div>
        </div>

        <Link
          href={`/dashboard/events/${event.id}/edit`}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/[0.06] bg-zinc-900/30 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
        >
          <Edit3 className="h-4 w-4 text-electric-blue" />
          Edit Event Configuration
        </Link>
      </div>

      {/* Detail Layout Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Configurations Details Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Summary */}
          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-6">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Event Details
            </h2>
            
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3 text-xs text-zinc-300 font-medium">
                  <Calendar className="h-4 w-4 text-electric-blue" />
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Scheduled</span>
                    <span>{formattedDate} at {formattedTime}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-xs text-zinc-300 font-medium">
                  <MapPin className="h-4 w-4 text-electric-blue" />
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Venue</span>
                    <span>{event.venue}</span>
                  </div>
                </div>
              </div>

              {event.description && (
                <div className="border-t border-white/[0.04] pt-4">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold block mb-1">Description</span>
                  <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                    {event.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Language Routing Pipeline */}
          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-6">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Language Routing Pipeline
            </h2>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-white/[0.04] bg-zinc-950/40 p-4">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold block mb-1">Source Audio (Input)</span>
                <span className="rounded bg-electric-blue/10 px-2 py-0.5 text-xs text-electric-blue font-bold inline-block mt-1">
                  {event.sourceLanguage}
                </span>
                <p className="text-[10px] text-zinc-500 mt-2 leading-relaxed">Spoken voice stream monitored for real-time translation processing.</p>
              </div>

              <div className="rounded-lg border border-white/[0.04] bg-zinc-950/40 p-4">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold block mb-1">Target Translations (Output)</span>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {event.targetLanguages.map((lang) => (
                    <span key={lang} className="rounded bg-white/[0.04] px-2 py-0.5 text-xs text-zinc-300 font-semibold border border-white/[0.04]">
                      {lang}
                    </span>
                  ))}
                </div>
                <p className="text-[10px] text-zinc-500 mt-2 leading-relaxed">Synthesized target audio feeds broadcasting to listeners simultaneously.</p>
              </div>
            </div>
          </div>

          {/* Translation Options */}
          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-6">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Neural Translation & Latency Settings
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="border border-white/[0.04] bg-zinc-950/30 rounded-lg p-3 text-xs">
                <span className="text-zinc-500 font-semibold uppercase tracking-wider text-[9px] block">AI Translation Model</span>
                <span className="text-zinc-200 font-bold block mt-1">{event.translationModel}</span>
              </div>
              <div className="border border-white/[0.04] bg-zinc-950/30 rounded-lg p-3 text-xs">
                <span className="text-zinc-500 font-semibold uppercase tracking-wider text-[9px] block">Latency Tuning</span>
                <span className="text-zinc-200 font-bold block mt-1 capitalize">{event.latencyMode.replace("-", " ")}</span>
              </div>
              <div className="border border-white/[0.04] bg-zinc-950/30 rounded-lg p-3 text-xs">
                <span className="text-zinc-500 font-semibold uppercase tracking-wider text-[9px] block">Profanity Filtering</span>
                <span className="text-zinc-200 font-bold block mt-1">{event.profanityFilter ? "Active" : "Bypassed"}</span>
              </div>
            </div>
            {event.targetVocabulary && (
              <div className="mt-4 border-t border-white/[0.04] pt-3 text-xs">
                <span className="text-zinc-500 font-semibold uppercase tracking-wider text-[9px] block">Custom Vocabulary Library</span>
                <p className="text-zinc-300 font-medium mt-1 leading-relaxed">{event.targetVocabulary}</p>
              </div>
            )}
          </div>

          {/* Hardware & Voice Clone Setup */}
          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-6">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Hardware Interfaces & Voice Synthesis
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex gap-3 items-start text-xs border border-white/[0.04] bg-zinc-950/20 rounded-lg p-3">
                <Volume2 className="h-4.5 w-4.5 text-accent-purple shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Audio Interface Channels</span>
                  <p className="text-zinc-300 font-semibold mt-1">In: <span className="text-zinc-400 font-medium">{event.inputDevice}</span></p>
                  <p className="text-zinc-300 font-semibold mt-0.5">Out: <span className="text-zinc-400 font-medium">{event.outputDevice}</span></p>
                </div>
              </div>

              <div className="flex gap-3 items-start text-xs border border-white/[0.04] bg-zinc-950/20 rounded-lg p-3">
                <Mic className="h-4.5 w-4.5 text-accent-purple shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">ElevenLabs Synthesizer Voice</span>
                  <p className="text-zinc-300 font-bold mt-1">{event.voiceProfile}</p>
                  <p className="text-[10px] text-zinc-500 mt-1">Cloned voice print assigned for localized broadcast audio synthesis.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Start Session & Activity Feed Column (1/3 width) */}
        <div className="space-y-6">
          {/* Start Session Card (DISABLED PLACEHOLDER) */}
          <div className="rounded-xl border border-white/[0.04] bg-zinc-900/10 p-6 flex flex-col justify-between items-start gap-4 relative overflow-hidden group">
            {/* Disabled mask */}
            <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-[1px] flex flex-col justify-center items-center p-6 text-center z-10">
              <div className="h-10 w-10 rounded-full bg-zinc-900 border border-white/[0.06] flex items-center justify-center text-zinc-600 mb-3 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                <Play className="h-4 w-4 ml-0.5 fill-current" />
              </div>
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Start Live Session</h4>
              <p className="text-[10px] text-zinc-500 mt-1.5 max-w-[200px] leading-normal">
                Audio streaming and translation options will unlock once the backend WebSocket layer is integrated.
              </p>
            </div>
            
            {/* Background design */}
            <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-electric-blue/10 blur-xl" />
            
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Live Broadcast Control</h3>
            <p className="text-xs text-zinc-500 leading-normal">
              Activate hardware buffers and start translating events into multi-lingual audio channels instantly.
            </p>
            <button
              disabled
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-zinc-800 text-zinc-500 py-2.5 text-xs font-semibold cursor-not-allowed"
            >
              Start Session
            </button>
          </div>

          {/* Recent Activity Timeline */}
          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-6">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Recent Activity Log
            </h2>
            
            <div className="space-y-4">
              <div className="relative pl-6 border-l border-white/[0.06]">
                {/* Timeline node */}
                <div className="absolute -left-[4px] top-1.5 h-2 w-2 rounded-full bg-electric-blue shadow-[0_0_6px_#00d4ff]" />
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Today</span>
                <p className="text-xs text-zinc-300 font-semibold mt-0.5">Voice Profile Assigned</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">Voice &ldquo;{event.voiceProfile}&rdquo; mapped to target channels.</p>
              </div>

              <div className="relative pl-6 border-l border-white/[0.06]">
                {/* Timeline node */}
                <div className="absolute -left-[4px] top-1.5 h-2 w-2 rounded-full bg-electric-blue shadow-[0_0_6px_#00d4ff]" />
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Today</span>
                <p className="text-xs text-zinc-300 font-semibold mt-0.5">Audio Channels Configured</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">Hardware input assigned: {event.inputDevice}.</p>
              </div>

              <div className="relative pl-6">
                {/* Timeline node */}
                <div className="absolute -left-[4px] top-1.5 h-2 w-2 rounded-full bg-zinc-700" />
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">{event.createdAt.slice(0, 10)}</span>
                <p className="text-xs text-zinc-400 font-semibold mt-0.5">Translation Event Created</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">Created and saved by {event.createdBy}.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
