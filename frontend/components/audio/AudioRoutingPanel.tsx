"use client";

import { Mic, Cpu, Languages, Volume2, ArrowRight } from "lucide-react";

interface AudioRoutingPanelProps {
  activeSourceName: string;
  activeDestinationName: string;
  translationModel: string;
  targetLanguages: string[];
}

export function AudioRoutingPanel({
  activeSourceName,
  activeDestinationName,
  translationModel,
  targetLanguages,
}: AudioRoutingPanelProps) {
  const languageSummary = targetLanguages.length > 0 
    ? targetLanguages.map((l) => l.split(" ")[0]).slice(0, 3).join(", ") + (targetLanguages.length > 3 ? "..." : "")
    : "None Selected";

  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-5 space-y-4">
      <h3 className="text-xs font-bold text-white uppercase tracking-wider">
        Active Audio Routing Pipeline
      </h3>

      {/* Horizontal Pipeline Diagram */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3 items-center justify-between py-2">
        {/* Node 1: Audio Source */}
        <div className="md:col-span-1 rounded-lg border border-white/[0.04] bg-zinc-950 p-3 flex flex-col items-center text-center gap-1.5 h-full justify-center">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-electric-blue/10 border border-electric-blue/20 text-electric-blue">
            <Mic className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider block">Source</span>
            <span className="text-[10px] text-zinc-300 font-semibold block truncate max-w-[100px]" title={activeSourceName}>
              {activeSourceName}
            </span>
          </div>
        </div>

        {/* Connector 1 */}
        <div className="hidden md:flex md:col-span-1 justify-center items-center relative h-full">
          {/* Animated line dots */}
          <div className="w-full h-[2px] bg-zinc-900 relative">
            <div className="absolute top-[-3px] left-0 h-2 w-2 rounded-full bg-electric-blue/80 shadow-[0_0_8px_#00d4ff] animate-ping" style={{ animationDelay: '0s', animationDuration: '2s' }} />
          </div>
          <ArrowRight className="h-4 w-4 text-zinc-700 absolute right-0" />
        </div>

        {/* Node 2: AI Processor */}
        <div className="md:col-span-1 rounded-lg border border-white/[0.04] bg-zinc-950 p-3 flex flex-col items-center text-center gap-1.5 h-full justify-center">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-electric-blue/10 border border-electric-blue/20 text-electric-blue">
            <Cpu className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider block">AI Processor</span>
            <span className="text-[10px] text-zinc-300 font-semibold block truncate">
              Azure Speech SDK
            </span>
          </div>
        </div>

        {/* Connector 2 */}
        <div className="hidden md:flex md:col-span-1 justify-center items-center relative h-full">
          <div className="w-full h-[2px] bg-zinc-900 relative">
            <div className="absolute top-[-3px] left-0 h-2 w-2 rounded-full bg-accent-purple/80 shadow-[0_0_8px_#af40ff] animate-ping" style={{ animationDelay: '0.6s', animationDuration: '2s' }} />
          </div>
          <ArrowRight className="h-4 w-4 text-zinc-700 absolute right-0" />
        </div>

        {/* Node 3: Translation */}
        <div className="md:col-span-1 rounded-lg border border-white/[0.04] bg-zinc-950 p-3 flex flex-col items-center text-center gap-1.5 h-full justify-center">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-purple/10 border border-accent-purple/20 text-accent-purple">
            <Languages className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider block">Translation</span>
            <span className="text-[10px] text-zinc-300 font-semibold block truncate" title={`${translationModel} (${languageSummary})`}>
              {languageSummary}
            </span>
          </div>
        </div>

        {/* Connector 3 */}
        <div className="hidden md:flex md:col-span-1 justify-center items-center relative h-full">
          <div className="w-full h-[2px] bg-zinc-900 relative">
            <div className="absolute top-[-3px] left-0 h-2 w-2 rounded-full bg-accent-purple/80 shadow-[0_0_8px_#af40ff] animate-ping" style={{ animationDelay: '1.2s', animationDuration: '2s' }} />
          </div>
          <ArrowRight className="h-4 w-4 text-zinc-700 absolute right-0" />
        </div>

        {/* Node 4: Audio Destination */}
        <div className="md:col-span-1 rounded-lg border border-white/[0.04] bg-zinc-950 p-3 flex flex-col items-center text-center gap-1.5 h-full justify-center">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-purple/10 border border-accent-purple/20 text-accent-purple">
            <Volume2 className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider block">Destination</span>
            <span className="text-[10px] text-zinc-300 font-semibold block truncate max-w-[100px]" title={activeDestinationName}>
              {activeDestinationName}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
