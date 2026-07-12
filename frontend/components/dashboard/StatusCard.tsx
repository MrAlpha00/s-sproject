"use client";

import { AlertCircle, CheckCircle2, Clock } from "lucide-react";

export type SystemStatusType = "Connected" | "Disconnected" | "Pending";

interface StatusCardProps {
  serviceName: string;
  status: SystemStatusType;
}

export function StatusCard({ serviceName, status }: StatusCardProps) {
  const statusConfig = {
    Connected: {
      text: "Connected",
      textColor: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
      dotColor: "bg-emerald-500 shadow-[0_0_8px_#10b981]",
      icon: CheckCircle2,
    },
    Disconnected: {
      text: "Disconnected",
      textColor: "text-red-400",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/20",
      dotColor: "bg-red-500 shadow-[0_0_8px_#ef4444]",
      icon: AlertCircle,
    },
    Pending: {
      text: "Pending",
      textColor: "text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
      dotColor: "bg-amber-500 shadow-[0_0_8px_#f59e0b]",
      icon: Clock,
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-zinc-900/20 p-3 hover:bg-zinc-900/30 transition-all duration-200">
      <div className="flex items-center gap-3">
        <div className="flex h-7 w-7 items-center justify-center rounded bg-zinc-950 border border-white/[0.06] text-zinc-400">
          <span className="text-[10px] font-bold tracking-wider uppercase text-zinc-500">
            {serviceName.slice(0, 2)}
          </span>
        </div>
        <span className="text-xs font-semibold text-zinc-200">{serviceName}</span>
      </div>

      <div className={`flex items-center gap-2 rounded-full px-2.5 py-0.5 border ${config.bgColor} ${config.borderColor}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${config.dotColor}`} />
        <span className={`text-[10px] font-bold uppercase tracking-wider ${config.textColor}`}>
          {config.text}
        </span>
      </div>
    </div>
  );
}
