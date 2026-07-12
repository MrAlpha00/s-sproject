"use client";

import { ShieldCheck, ShieldAlert, AlertTriangle } from "lucide-react";

interface AudioHealthCardProps {
  pipelineStatus: "Healthy" | "Warning" | "Critical";
  activeSourceName: string;
  activeDestinationName: string;
  latency: string;
  warnings: string[];
}

export function AudioHealthCard({
  pipelineStatus,
  activeSourceName,
  activeDestinationName,
  latency,
  warnings,
}: AudioHealthCardProps) {
  const statusConfigs = {
    Healthy: {
      text: "Pipeline Healthy",
      textColor: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
      icon: ShieldCheck,
    },
    Warning: {
      text: "Link Warning",
      textColor: "text-amber-400 border-amber-500/20 bg-amber-500/5",
      icon: AlertTriangle,
    },
    Critical: {
      text: "Pipeline Fault",
      textColor: "text-red-400 border-red-500/20 bg-red-500/5",
      icon: ShieldAlert,
    },
  };

  const config = statusConfigs[pipelineStatus] || statusConfigs.Healthy;
  const Icon = config.icon;

  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
          System Diagnostics
        </h3>
        
        <div className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${config.textColor}`}>
          <Icon className="h-3 w-3" />
          <span>{config.text}</span>
        </div>
      </div>

      <div className="space-y-2 text-xs">
        {/* Active Source */}
        <div className="flex justify-between border-b border-white/[0.02] pb-2">
          <span className="text-zinc-500 font-medium">Source Capture</span>
          <span className="text-zinc-300 font-semibold truncate max-w-[150px]">{activeSourceName}</span>
        </div>

        {/* Active Destination */}
        <div className="flex justify-between border-b border-white/[0.02] pb-2">
          <span className="text-zinc-500 font-medium">Destination Output</span>
          <span className="text-zinc-300 font-semibold truncate max-w-[150px]">{activeDestinationName}</span>
        </div>

        {/* Stream Latency */}
        <div className="flex justify-between">
          <span className="text-zinc-500 font-medium">Accumulated Latency</span>
          <span className="text-electric-blue font-bold">{latency}</span>
        </div>
      </div>

      {/* Warnings Panel */}
      <div className="border-t border-white/[0.04] pt-3.5 space-y-2">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
          Diagnostic Alerts
        </span>

        {warnings.length === 0 ? (
          <p className="text-[10px] text-zinc-500 font-medium">No diagnostic issues detected in active audio routing paths.</p>
        ) : (
          <div className="space-y-1.5">
            {warnings.map((w, idx) => (
              <div key={idx} className="flex gap-1.5 text-[10px] text-amber-500 leading-normal items-start font-medium">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <p>{w}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
