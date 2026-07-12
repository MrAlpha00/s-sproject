"use client";

import { Play, Square, AlertCircle, RefreshCw, Trash2 } from "lucide-react";

interface SessionControlsProps {
  isListening: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  
  isTranslating: boolean;
  onStartTranslation: () => void;
  onStopTranslation: () => void;
  onRetryFailed: () => void;
  onClearQueue: () => void;
  
  isAzureConfigured: boolean;
  hasFailedTranslations: boolean;
}

export function SessionControls({
  isListening,
  onStartListening,
  onStopListening,
  isTranslating,
  onStartTranslation,
  onStopTranslation,
  onRetryFailed,
  onClearQueue,
  isAzureConfigured,
  hasFailedTranslations,
}: SessionControlsProps) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4 space-y-4">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Panel 1: Speech Recognition controls */}
        <div className="flex flex-col gap-1.5 flex-1 border-b md:border-b-0 md:border-r border-white/[0.04] pb-3 md:pb-0 md:pr-4">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
            Audio Capture Control
          </span>
          <div className="flex items-center gap-2">
            {!isListening ? (
              <button
                type="button"
                onClick={onStartListening}
                disabled={!isAzureConfigured}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/25 px-4 py-2 text-xs font-bold text-emerald-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_10px_rgba(16,185,129,0.05)]"
                title="Start continuous speech recognition stream"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                Start Listening
              </button>
            ) : (
              <button
                type="button"
                onClick={onStopListening}
                className="flex items-center gap-1.5 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/25 px-4 py-2 text-xs font-bold text-red-500 transition-all shadow-[0_0_10px_rgba(239,68,68,0.05)]"
                title="Stop audio recognition"
              >
                <Square className="h-3.5 w-3.5 fill-current" />
                Stop Listening
              </button>
            )}
            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${
              isListening ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/5 animate-pulse" : "text-zinc-500 border-white/[0.06] bg-zinc-950/20"
            }`}>
              {isListening ? "Active" : "Idle"}
            </span>
          </div>
        </div>

        {/* Panel 2: Translation Queue controls */}
        <div className="flex flex-col gap-1.5 flex-[1.5]">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
            Translation Pipeline Control
          </span>
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Start / Stop Translation */}
            {!isTranslating ? (
              <button
                type="button"
                onClick={onStartTranslation}
                disabled={!isAzureConfigured}
                className="flex items-center gap-1.5 rounded-lg bg-electric-blue/10 border border-electric-blue/20 hover:bg-electric-blue/25 px-3 py-2 text-xs font-bold text-electric-blue transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                title="Enable translation pipeline"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                Start Translation
              </button>
            ) : (
              <button
                type="button"
                onClick={onStopTranslation}
                className="flex items-center gap-1.5 rounded-lg bg-zinc-800 border border-white/[0.06] hover:bg-zinc-700 px-3 py-2 text-xs font-bold text-zinc-300 transition-all"
                title="Stop translation pipeline"
              >
                <Square className="h-3.5 w-3.5 fill-current" />
                Stop Translation
              </button>
            )}

            {/* Retry Failed */}
            <button
              type="button"
              onClick={onRetryFailed}
              disabled={!hasFailedTranslations}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${
                hasFailedTranslations
                  ? "bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/25 text-amber-400"
                  : "border-white/[0.04] bg-zinc-900/20 text-zinc-600 cursor-not-allowed"
              }`}
              title="Manually retry failed translator requests"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry Failed
            </button>

            {/* Clear Queue */}
            <button
              type="button"
              onClick={onClearQueue}
              className="flex items-center gap-1.5 rounded-lg border border-white/[0.04] bg-zinc-900/20 hover:bg-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition-all"
              title="Wipe pipeline transcripts buffer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear Queue
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
