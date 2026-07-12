"use client";

import { AudioDeviceStatus, AudioDeviceHealth } from "@/types/audio";

interface AudioStatusBadgeProps {
  value: AudioDeviceStatus | AudioDeviceHealth;
  type?: "status" | "health";
}

export function AudioStatusBadge({ value, type = "status" }: AudioStatusBadgeProps) {
  if (type === "status") {
    const status = value as AudioDeviceStatus;
    const configs = {
      active: {
        text: "Active",
        textColor: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
        dotColor: "bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse",
      },
      connected: {
        text: "Connected",
        textColor: "text-blue-400 border-blue-500/20 bg-blue-500/5",
        dotColor: "bg-blue-500 shadow-[0_0_8px_#3b82f6]",
      },
      standby: {
        text: "Standby",
        textColor: "text-amber-400 border-amber-500/20 bg-amber-500/5",
        dotColor: "bg-amber-500 shadow-[0_0_8px_#f59e0b]",
      },
      disconnected: {
        text: "Offline",
        textColor: "text-red-400 border-red-500/20 bg-red-500/5",
        dotColor: "bg-red-500 shadow-[0_0_8px_#ef4444]",
      },
    };

    const config = configs[status] || configs.standby;

    return (
      <div className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${config.textColor}`}>
        <span className={`h-1 w-1 rounded-full ${config.dotColor}`} />
        <span>{config.text}</span>
      </div>
    );
  } else {
    const health = value as AudioDeviceHealth;
    const configs = {
      good: {
        text: "Healthy",
        textColor: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
      },
      degraded: {
        text: "Degraded",
        textColor: "text-amber-400 border-amber-500/20 bg-amber-500/5",
      },
      critical: {
        text: "Critical",
        textColor: "text-red-400 border-red-500/20 bg-red-500/5",
      },
    };

    const config = configs[health] || configs.good;

    return (
      <div className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-widest ${config.textColor}`}>
        <span>{config.text}</span>
      </div>
    );
  }
}
