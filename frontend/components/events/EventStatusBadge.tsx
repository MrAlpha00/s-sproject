"use client";

import { TranslationEventStatus } from "@/types/event";

interface EventStatusBadgeProps {
  status: TranslationEventStatus;
}

export function EventStatusBadge({ status }: EventStatusBadgeProps) {
  const configs = {
    live: {
      text: "Live Now",
      textColor: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
      dotClass: "bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse",
    },
    scheduled: {
      text: "Scheduled",
      textColor: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
      dotClass: "bg-blue-500 shadow-[0_0_8px_#3b82f6]",
    },
    completed: {
      text: "Completed",
      textColor: "text-zinc-400",
      bgColor: "bg-zinc-800/40",
      borderColor: "border-zinc-800/60",
      dotClass: "bg-zinc-500",
    },
    cancelled: {
      text: "Cancelled",
      textColor: "text-red-400",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/20",
      dotClass: "bg-red-500 shadow-[0_0_8px_#ef4444]",
    },
    draft: {
      text: "Draft",
      textColor: "text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
      dotClass: "bg-amber-500 shadow-[0_0_8px_#f59e0b]",
    },
  };

  const config = configs[status] || configs.draft;

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 ${config.bgColor} ${config.borderColor}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dotClass}`} />
      <span className={`text-[10px] font-bold uppercase tracking-wider ${config.textColor}`}>
        {config.text}
      </span>
    </div>
  );
}
