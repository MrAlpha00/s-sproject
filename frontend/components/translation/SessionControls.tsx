"use client";

import { Play, Pause, Square, CheckSquare, RefreshCcw } from "lucide-react";

export function SessionControls() {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Helper Status Tip */}
        <p className="text-[10px] text-zinc-500 font-medium text-center sm:text-left">
          Ensure audio channels are routed and providers show <span className="text-amber-400 font-semibold">Pending</span> before starting a live session.
        </p>

        {/* Buttons Deck */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {/* Test Configuration */}
          <button
            disabled
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-white/[0.04] bg-zinc-900/20 px-3.5 py-2 text-xs font-semibold text-zinc-600 cursor-not-allowed transition-all"
            title="Test stream routes and API latency"
          >
            <CheckSquare className="h-3.5 w-3.5" />
            Test Configuration
          </button>

          {/* Start Session */}
          <button
            disabled
            type="button"
            className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2 text-xs font-bold text-emerald-500/50 cursor-not-allowed transition-all"
            title="Start translating and synthesizing stream"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            Start Session
          </button>

          {/* Pause */}
          <button
            disabled
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-white/[0.04] bg-zinc-900/20 p-2 text-xs font-semibold text-zinc-600 cursor-not-allowed transition-all"
            title="Pause translation session"
          >
            <Pause className="h-3.5 w-3.5" />
          </button>

          {/* Resume */}
          <button
            disabled
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-white/[0.04] bg-zinc-900/20 p-2 text-xs font-semibold text-zinc-600 cursor-not-allowed transition-all"
            title="Resume translation session"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
          </button>

          {/* Stop */}
          <button
            disabled
            type="button"
            className="flex items-center gap-1.5 rounded-lg bg-red-500/10 border border-red-500/20 p-2 text-xs font-semibold text-red-500/50 cursor-not-allowed transition-all"
            title="Terminate translation session"
          >
            <Square className="h-3.5 w-3.5 fill-current" />
          </button>
        </div>
      </div>
    </div>
  );
}
