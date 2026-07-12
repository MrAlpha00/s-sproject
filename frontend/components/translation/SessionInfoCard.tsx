"use client";

import { Info, Wifi, Hourglass, Mic, Volume2 } from "lucide-react";
import { useEvents } from "@/providers/EventProvider";

interface SessionInfoCardProps {
  selectedEventId: string;
  status: string;
  currentMicrophone: string;
  currentSpeaker: string;
  recognitionLanguage: string;
  translationLanguage: string;
  voiceProfile: string;
  recognitionLatency: string;
  translationLatency: string;
  synthesisLatency: string;
  totalPipelineLatency: string;

  // Module 10 additional fields
  recognitionStatus: string;
  translationStatus: string;
  messagesProcessed: number;
  provider: string;
}

export function SessionInfoCard({
  selectedEventId,
  status,
  currentMicrophone,
  currentSpeaker,
  recognitionLanguage,
  translationLanguage,
  voiceProfile,
  recognitionLatency,
  translationLatency,
  synthesisLatency,
  totalPipelineLatency,
  recognitionStatus,
  translationStatus,
  messagesProcessed,
  provider,
}: SessionInfoCardProps) {
  const { events } = useEvents();
  const linkedEvent = events.find((e) => e.id === selectedEventId);

  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
          Session Information
        </h3>
        <Wifi className="h-3.5 w-3.5 text-zinc-500" />
      </div>

      <div className="space-y-2.5 text-xs">
        {/* Linked Event */}
        <div className="flex items-center justify-between border-b border-white/[0.02] pb-2">
          <span className="text-zinc-500 font-medium">Translation Event</span>
          <span className="text-zinc-200 font-bold max-w-[150px] truncate text-right">
            {linkedEvent ? linkedEvent.name : "Manual Override"}
          </span>
        </div>

        {/* Combined Status */}
        <div className="flex items-center justify-between border-b border-white/[0.02] pb-2">
          <span className="text-zinc-500 font-medium">Session Status</span>
          <span className="rounded bg-zinc-950 border border-white/[0.06] px-2 py-0.5 text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
            {status}
          </span>
        </div>

        {/* Recognition Status */}
        <div className="flex items-center justify-between border-b border-white/[0.02] pb-2">
          <span className="text-zinc-500 font-medium">Recognition Status</span>
          <span className={`font-semibold uppercase ${
            recognitionStatus === "Listening" ? "text-emerald-400" : "text-zinc-400"
          }`}>
            {recognitionStatus}
          </span>
        </div>

        {/* Translation Status */}
        <div className="flex items-center justify-between border-b border-white/[0.02] pb-2">
          <span className="text-zinc-500 font-medium">Translation Status</span>
          <span className={`font-semibold uppercase ${
            translationStatus === "Translating" ? "text-amber-400" : "text-zinc-400"
          }`}>
            {translationStatus}
          </span>
        </div>

        {/* Messages Processed */}
        <div className="flex items-center justify-between border-b border-white/[0.02] pb-2">
          <span className="text-zinc-500 font-medium">Messages Processed</span>
          <span className="text-zinc-300 font-bold font-mono">
            {messagesProcessed}
          </span>
        </div>

        {/* Provider */}
        <div className="flex items-center justify-between border-b border-white/[0.02] pb-2">
          <span className="text-zinc-500 font-medium">Active Provider</span>
          <span className="text-zinc-300 font-semibold">
            {provider}
          </span>
        </div>

        {/* Microphone status */}
        <div className="flex items-center justify-between border-b border-white/[0.02] pb-2">
          <span className="text-zinc-500 font-medium flex items-center gap-1">
            Audio Source
            <Mic className="h-3 w-3 text-zinc-655" />
          </span>
          <span className="text-zinc-350 font-semibold truncate max-w-[150px] text-right">
            {currentMicrophone}
          </span>
        </div>

        {/* Speaker status */}
        <div className="flex items-center justify-between border-b border-white/[0.02] pb-2">
          <span className="text-zinc-500 font-medium flex items-center gap-1">
            Audio Destination
            <Volume2 className="h-3 w-3 text-zinc-655" />
          </span>
          <span className="text-zinc-350 font-semibold truncate max-w-[150px] text-right">
            {currentSpeaker}
          </span>
        </div>

        {/* Recognition language */}
        <div className="flex items-center justify-between border-b border-white/[0.02] pb-2">
          <span className="text-zinc-500 font-medium">Recognition Lang</span>
          <span className="text-zinc-300 font-semibold uppercase">{recognitionLanguage}</span>
        </div>

        {/* Translation language */}
        <div className="flex items-center justify-between border-b border-white/[0.02] pb-2">
          <span className="text-zinc-500 font-medium">Translation Langs</span>
          <span className="text-zinc-300 font-semibold truncate max-w-[150px] text-right uppercase">
            {translationLanguage}
          </span>
        </div>

        {/* Voice profile */}
        <div className="flex items-center justify-between border-b border-white/[0.02] pb-2">
          <span className="text-zinc-500 font-medium">Voice Profile</span>
          <span className="text-zinc-300 font-semibold truncate max-w-[150px] text-right">
            {voiceProfile}
          </span>
        </div>

        {/* Latency Breakdown Header */}
        <div className="pt-2">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">
            Pipeline Latency Metrics
          </span>

          <div className="grid grid-cols-2 gap-2 bg-zinc-950/40 rounded-lg p-2.5 border border-white/[0.02]">
            <div>
              <span className="text-[9px] text-zinc-500 uppercase font-semibold block">Recognition</span>
              <span className="text-xs text-zinc-300 font-bold">{recognitionLatency}</span>
            </div>
            <div>
              <span className="text-[9px] text-zinc-500 uppercase font-semibold block">Translation</span>
              <span className="text-xs text-zinc-300 font-bold">{translationLatency}</span>
            </div>
            <div className="mt-1">
              <span className="text-[9px] text-zinc-500 uppercase font-semibold block">Synthesis</span>
              <span className="text-xs text-zinc-300 font-bold">{synthesisLatency}</span>
            </div>
            <div className="mt-1">
              <span className="text-[9px] text-electric-blue/70 uppercase font-semibold block">Total Pipeline</span>
              <span className="text-xs text-electric-blue font-extrabold">{totalPipelineLatency}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-zinc-950/40 border border-white/[0.03] p-3 text-[10px] text-zinc-500 leading-normal flex gap-1.5">
        <Info className="h-4 w-4 text-zinc-655 shrink-0 mt-0.5" />
        <p>
          Pipeline latencies represent active cloud network travel intervals.
        </p>
      </div>
    </div>
  );
}
