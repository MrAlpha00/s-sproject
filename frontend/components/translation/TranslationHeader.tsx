"use client";

import { Activity, Clock, Users, Zap, Volume2, Globe, Radio, Mic } from "lucide-react";

interface TranslationHeaderProps {
  sessionName: string;
  status: string;
  broadcastStatus: string;
  listenerCount: number;
  recognitionLatency: string;
  translationLatency: string;
  synthesisLatency: string;
  totalPipelineLatency: string;
  timerString: string;
}

export function TranslationHeader({
  sessionName,
  status,
  broadcastStatus,
  listenerCount,
  recognitionLatency,
  translationLatency,
  synthesisLatency,
  totalPipelineLatency,
  timerString,
}: TranslationHeaderProps) {
  return (
    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
      {/* Title block */}
      <div>
        <span className="text-[9px] font-extrabold text-zinc-500 uppercase tracking-widest block">
          Enterprise Broadcasting Studio
        </span>
        <h1 className="text-lg font-bold text-white tracking-tight -mt-0.5">
          {sessionName}
        </h1>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 xl:flex xl:items-center gap-2">
        {/* Session Status */}
        <div className="rounded-lg border border-white/[0.04] bg-zinc-900/30 p-2 xl:px-3.5 xl:py-1.5 flex flex-col justify-center min-w-[90px]">
          <span className="text-[8px] font-extrabold text-zinc-500 uppercase tracking-wider block">Session</span>
          <span className={`text-[10px] font-bold mt-0.5 uppercase ${
            status === "ACTIVE" ? "text-emerald-400" : "text-zinc-400"
          }`}>
            {status}
          </span>
        </div>

        {/* Broadcast Status */}
        <div className="rounded-lg border border-white/[0.04] bg-zinc-900/30 p-2 xl:px-3.5 xl:py-1.5 flex flex-col justify-center min-w-[100px]">
          <span className="text-[8px] font-extrabold text-zinc-500 uppercase tracking-wider block">Broadcast</span>
          <span className={`text-[10px] font-bold mt-0.5 uppercase ${
            broadcastStatus === "active" || broadcastStatus === "connected"
              ? "text-emerald-400"
              : broadcastStatus === "paused"
              ? "text-amber-400"
              : "text-zinc-500"
          }`}>
            {broadcastStatus}
          </span>
        </div>

        {/* Timer */}
        <div className="rounded-lg border border-white/[0.04] bg-zinc-900/30 p-2 xl:px-3.5 xl:py-1.5 flex items-center gap-2 min-w-[90px]">
          <Clock className="h-4 w-4 text-electric-blue shrink-0" />
          <div>
            <span className="text-[8px] font-extrabold text-zinc-500 uppercase tracking-wider block">Timer</span>
            <span className="text-[10px] font-bold font-mono text-zinc-350">{timerString}</span>
          </div>
        </div>

        {/* Listeners */}
        <div className="rounded-lg border border-white/[0.04] bg-zinc-900/30 p-2 xl:px-3.5 xl:py-1.5 flex items-center gap-2 min-w-[95px]">
          <Users className="h-4 w-4 text-electric-blue shrink-0" />
          <div>
            <span className="text-[8px] font-extrabold text-zinc-500 uppercase tracking-wider block">Listeners</span>
            <span className="text-[10px] font-bold text-zinc-350">{listenerCount} Connected</span>
          </div>
        </div>

        {/* Recognition Latency */}
        <div className="rounded-lg border border-white/[0.04] bg-zinc-900/30 p-2 xl:px-3.5 xl:py-1.5 flex items-center gap-2 min-w-[90px]">
          <Mic className="h-4 w-4 text-electric-blue shrink-0" />
          <div>
            <span className="text-[8px] font-extrabold text-zinc-500 uppercase tracking-wider block">Rec Latency</span>
            <span className="text-[10px] font-bold font-mono text-zinc-350">{recognitionLatency}</span>
          </div>
        </div>

        {/* Translation Latency */}
        <div className="rounded-lg border border-white/[0.04] bg-zinc-900/30 p-2 xl:px-3.5 xl:py-1.5 flex items-center gap-2 min-w-[90px]">
          <Globe className="h-4 w-4 text-electric-blue shrink-0" />
          <div>
            <span className="text-[8px] font-extrabold text-zinc-500 uppercase tracking-wider block">Trans Latency</span>
            <span className="text-[10px] font-bold font-mono text-zinc-350">{translationLatency}</span>
          </div>
        </div>

        {/* Synthesis Latency */}
        <div className="rounded-lg border border-white/[0.04] bg-zinc-900/30 p-2 xl:px-3.5 xl:py-1.5 flex items-center gap-2 min-w-[90px]">
          <Volume2 className="h-4 w-4 text-electric-blue shrink-0" />
          <div>
            <span className="text-[8px] font-extrabold text-zinc-500 uppercase tracking-wider block">TTS Latency</span>
            <span className="text-[10px] font-bold font-mono text-zinc-350">{synthesisLatency}</span>
          </div>
        </div>

        {/* Total Latency */}
        <div className="rounded-lg border border-white/[0.04] bg-zinc-900/30 p-2 xl:px-3.5 xl:py-1.5 flex items-center gap-2 min-w-[95px] bg-electric-blue/5 border-electric-blue/15">
          <Zap className="h-4 w-4 text-electric-blue shrink-0" />
          <div>
            <span className="text-[8px] font-extrabold text-electric-blue uppercase tracking-wider block">Total Latency</span>
            <span className="text-[10px] font-extrabold font-mono text-electric-blue">{totalPipelineLatency}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
