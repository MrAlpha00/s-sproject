"use client";

import { Info, Wifi, Hourglass, Mic, HelpCircle } from "lucide-react";
import { useEvents } from "@/providers/EventProvider";

interface SessionInfoCardProps {
  selectedEventId: string;
  status: string;
  latencyMode: string;
  recognitionLatency: string;
  microphoneStatus: string;
  recognitionLanguage: string;
}

export function SessionInfoCard({
  selectedEventId,
  status,
  latencyMode,
  recognitionLatency,
  microphoneStatus,
  recognitionLanguage,
}: SessionInfoCardProps) {
  const { events } = useEvents();
  const linkedEvent = events.find((e) => e.id === selectedEventId);

  // Generate dynamic latency info based on setting
  const getLatencyText = () => {
    switch (latencyMode) {
      case "low-latency":
        return "Sub-second (< 450ms)";
      case "standard":
        return "Standard (~ 1.2s)";
      case "high-fidelity":
        return "High-Fidelity (~ 2.8s)";
      default:
        return "-- ms";
    }
  };

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
            {linkedEvent ? linkedEvent.name : "Manual Session"}
          </span>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between border-b border-white/[0.02] pb-2">
          <span className="text-zinc-500 font-medium">Status</span>
          <span className="rounded bg-zinc-950 border border-white/[0.06] px-2 py-0.5 text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
            {status}
          </span>
        </div>

        {/* Microphone status */}
        <div className="flex items-center justify-between border-b border-white/[0.02] pb-2">
          <span className="text-zinc-500 font-medium flex items-center gap-1">
            Capture Input
            <Mic className="h-3 w-3 text-zinc-600" />
          </span>
          <span className="text-zinc-300 font-semibold truncate max-w-[150px] text-right">
            {microphoneStatus}
          </span>
        </div>

        {/* Recognition language */}
        <div className="flex items-center justify-between border-b border-white/[0.02] pb-2">
          <span className="text-zinc-500 font-medium">Capture Language</span>
          <span className="text-zinc-300 font-semibold">
            {recognitionLanguage}
          </span>
        </div>

        {/* Recognition Latency */}
        <div className="flex items-center justify-between border-b border-white/[0.02] pb-2">
          <span className="text-zinc-500 font-medium">Recognition Latency</span>
          <span className="text-electric-blue font-bold">
            {recognitionLatency}
          </span>
        </div>

        {/* Expected Latency */}
        <div className="flex items-center justify-between border-b border-white/[0.02] pb-2">
          <span className="text-zinc-500 font-medium flex items-center gap-1">
            Expected Latency
            <Hourglass className="h-3 w-3 text-zinc-600" />
          </span>
          <span className="text-zinc-400 font-medium">
            {getLatencyText()}
          </span>
        </div>

        {/* Connected Listeners */}
        <div className="flex items-center justify-between">
          <span className="text-zinc-500 font-medium">Connected Listeners</span>
          <span className="text-zinc-300 font-semibold">0 Users</span>
        </div>
      </div>

      <div className="rounded-lg bg-zinc-950/40 border border-white/[0.03] p-3 text-[10px] text-zinc-500 leading-normal flex gap-1.5">
        <Info className="h-4 w-4 text-zinc-600 shrink-0 mt-0.5" />
        <p>
          Speech Recognition continuously transcribes locally. Ensure appropriate audio channel levels are calibrated.
        </p>
      </div>
    </div>
  );
}
