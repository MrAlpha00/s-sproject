"use client";

import { useEffect, useState } from "react";
import { Mic, Volume2 } from "lucide-react";

interface AudioLevelMeterProps {
  inputL: number;
  inputR: number;
  outputL: number;
  outputR: number;
  isTestingInput: boolean;
  isTestingOutput: boolean;
}

export function AudioLevelMeter({
  inputL,
  inputR,
  outputL,
  outputR,
  isTestingInput,
  isTestingOutput,
}: AudioLevelMeterProps) {

  const renderMeterBars = (percentage: number) => {
    // Generate 20 small segments
    const totalSegments = 24;
    const activeSegments = Math.round((percentage / 100) * totalSegments);

    return (
      <div className="flex gap-0.5 w-full h-3.5 bg-zinc-950 rounded p-[2px] border border-white/[0.03]">
        {Array.from({ length: totalSegments }).map((_, idx) => {
          const isActive = idx < activeSegments;
          
          let colorClass = "bg-zinc-900";
          if (isActive) {
            if (idx < 15) {
              colorClass = "bg-emerald-500 shadow-[0_0_6px_#10b981]";
            } else if (idx < 21) {
              colorClass = "bg-amber-400 shadow-[0_0_6px_#f59e0b]";
            } else {
              colorClass = "bg-red-500 shadow-[0_0_6px_#ef4444]";
            }
          }

          return (
            <div
              key={idx}
              className={`flex-1 h-full rounded-[1px] transition-all duration-75 ${colorClass}`}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-5 space-y-5">
      <h3 className="text-xs font-bold text-white uppercase tracking-wider">
        Volume Level Meters
      </h3>

      <div className="space-y-4">
        {/* Input Meter (Audio Source) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
            <span className="flex items-center gap-1.5 text-zinc-300">
              <Mic className="h-3.5 w-3.5 text-electric-blue" />
              Source Channel Input
            </span>
            <span className={isTestingInput ? "text-electric-blue font-extrabold animate-pulse" : ""}>
              {isTestingInput ? "Live Monitored" : "Idle"}
            </span>
          </div>

          <div className="space-y-1.5 bg-zinc-900/30 rounded-lg p-2.5 border border-white/[0.02]">
            <div className="flex items-center gap-2">
              <span className="text-[8px] font-bold text-zinc-600 w-3 shrink-0">L</span>
              {renderMeterBars(inputL)}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[8px] font-bold text-zinc-600 w-3 shrink-0">R</span>
              {renderMeterBars(inputR)}
            </div>
          </div>
        </div>

        {/* Output Meter (Audio Destination) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
            <span className="flex items-center gap-1.5 text-zinc-300">
              <Volume2 className="h-3.5 w-3.5 text-accent-purple" />
              Destination Channel Output
            </span>
            <span className={isTestingOutput ? "text-accent-purple font-extrabold animate-pulse" : ""}>
              {isTestingOutput ? "Streaming Tone" : "Idle"}
            </span>
          </div>

          <div className="space-y-1.5 bg-zinc-900/30 rounded-lg p-2.5 border border-white/[0.02]">
            <div className="flex items-center gap-2">
              <span className="text-[8px] font-bold text-zinc-600 w-3 shrink-0">L</span>
              {renderMeterBars(outputL)}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[8px] font-bold text-zinc-600 w-3 shrink-0">R</span>
              {renderMeterBars(outputR)}
            </div>
          </div>
        </div>
      </div>
      
      {/* dB scale labels */}
      <div className="flex justify-between px-6 text-[8px] font-bold text-zinc-600 uppercase tracking-widest mt-1">
        <span>-60 dB</span>
        <span>-36 dB</span>
        <span>-18 dB</span>
        <span>-6 dB</span>
        <span>0 dB</span>
      </div>
    </div>
  );
}
