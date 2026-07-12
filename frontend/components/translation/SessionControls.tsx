"use client";

import { Play, Pause, Square, CheckSquare, RefreshCcw, Mic, MicOff } from "lucide-react";

interface SessionControlsProps {
  isListening: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  isAzureConfigured: boolean;
}

export function SessionControls({
  isListening,
  onStartListening,
  onStopListening,
  isAzureConfigured,
}: SessionControlsProps) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Helper Status Tip */}
        <p className="text-[10px] text-zinc-500 font-medium text-center sm:text-left">
          {!isAzureConfigured 
            ? "Configure Azure AI credentials in Settings before starting a session."
            : isListening 
              ? "Session active: captures microphone input and transcribes in real-time."
              : "Calibrate settings and click 'Start Session' to begin speech recognition."}
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

          {/* Start Session (Starts Speech Recognition) */}
          {!isListening ? (
            <button
              type="button"
              onClick={onStartListening}
              disabled={!isAzureConfigured}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/25 px-4 py-2 text-xs font-bold text-emerald-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_10px_rgba(16,185,129,0.05)]"
              title="Start translating and synthesizing stream"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              Start Session
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="flex items-center gap-1.5 rounded-lg bg-zinc-950 border border-white/[0.04] px-4 py-2 text-xs font-bold text-zinc-600 cursor-not-allowed"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              Start Session
            </button>
          )}

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

          {/* Stop Session (Stops Speech Recognition) */}
          <button
            type="button"
            onClick={onStopListening}
            disabled={!isListening}
            className={`flex items-center gap-1.5 rounded-lg p-2 text-xs font-semibold transition-all ${
              isListening
                ? "bg-red-500/10 border border-red-500/20 hover:bg-red-500/25 text-red-500"
                : "border-white/[0.04] bg-zinc-900/20 text-zinc-600 cursor-not-allowed"
            }`}
            title="Terminate translation session"
          >
            <Square className="h-3.5 w-3.5 fill-current" />
          </button>
        </div>
      </div>
    </div>
  );
}
