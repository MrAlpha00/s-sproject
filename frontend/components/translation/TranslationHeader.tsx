"use client";

import { Activity, Clock, Users } from "lucide-react";

interface TranslationHeaderProps {
  sessionName: string;
  status: string;
}

export function TranslationHeader({ sessionName, status }: TranslationHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/[0.06] pb-5">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
            Workspace Console
          </span>
          <div className="inline-flex items-center gap-1 rounded bg-zinc-900 border border-white/[0.06] px-1.5 py-0.5 text-[9px] text-zinc-400 font-semibold uppercase">
            {status}
          </div>
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight -mt-0.5">
          {sessionName}
        </h1>
      </div>

      {/* Stream Metrics Banner */}
      <div className="flex items-center gap-4 text-xs font-semibold">
        {/* Elapsed Timer */}
        <div className="flex items-center gap-2 rounded-lg border border-white/[0.04] bg-zinc-900/10 px-3.5 py-1.5 text-zinc-400 shadow-inner">
          <Clock className="h-3.5 w-3.5 text-zinc-500" />
          <span>00:00:00</span>
        </div>

        {/* Listeners */}
        <div className="flex items-center gap-2 rounded-lg border border-white/[0.04] bg-zinc-900/10 px-3.5 py-1.5 text-zinc-400 shadow-inner">
          <Users className="h-3.5 w-3.5 text-zinc-500" />
          <span>0 Listeners</span>
        </div>

        {/* Live indicator (greyed out since idle) */}
        <div className="flex items-center gap-1.5 rounded-lg border border-white/[0.04] bg-zinc-900/10 px-3.5 py-1.5 text-zinc-500 shadow-inner">
          <Activity className="h-3.5 w-3.5" />
          <span className="uppercase tracking-wider text-[9px] font-bold">Offline</span>
        </div>
      </div>
    </div>
  );
}
