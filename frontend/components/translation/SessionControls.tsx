"use client";

import { Play, Square, AlertCircle, RefreshCw, Trash2, Volume2, VolumeX } from "lucide-react";

interface SessionControlsProps {
  isListening: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  
  isTranslating: boolean;
  onStartTranslation: () => void;
  onStopTranslation: () => void;
  onRetryFailed: () => void;
  onClearQueue: () => void;
  
  // Module 11 Voice Output Controls
  isVoiceEnabled: boolean;
  onStartVoice: () => void;
  onStopVoice: () => void;
  onStopAllSpeech: () => void;
  onClearSpeechQueue: () => void;
  
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
  isVoiceEnabled,
  onStartVoice,
  onStopVoice,
  onStopAllSpeech,
  onClearSpeechQueue,
  isAzureConfigured,
  hasFailedTranslations,
}: SessionControlsProps) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4 space-y-4">
      
      <div className="flex flex-col lg:flex-row items-stretch justify-between gap-4">
        
        {/* Panel 1: Speech Recognition controls */}
        <div className="flex flex-col gap-1.5 flex-1 border-b lg:border-b-0 lg:border-r border-white/[0.04] pb-3 lg:pb-0 lg:pr-4">
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
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                Start Listening
              </button>
            ) : (
              <button
                type="button"
                onClick={onStopListening}
                className="flex items-center gap-1.5 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/25 px-4 py-2 text-xs font-bold text-red-500 transition-all shadow-[0_0_10px_rgba(239,68,68,0.05)]"
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
        <div className="flex flex-col gap-1.5 flex-1 border-b lg:border-b-0 lg:border-r border-white/[0.04] pb-3 lg:pb-0 lg:pr-4">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
            Translation Pipeline Control
          </span>
          <div className="flex items-center gap-2">
            {!isTranslating ? (
              <button
                type="button"
                onClick={onStartTranslation}
                disabled={!isAzureConfigured}
                className="flex items-center gap-1.5 rounded-lg bg-electric-blue/10 border border-electric-blue/20 hover:bg-electric-blue/25 px-4 py-2 text-xs font-bold text-electric-blue transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                Start Translation
              </button>
            ) : (
              <button
                type="button"
                onClick={onStopTranslation}
                className="flex items-center gap-1.5 rounded-lg bg-zinc-800 border border-white/[0.06] hover:bg-zinc-700 px-4 py-2 text-xs font-bold text-zinc-300 transition-all"
              >
                <Square className="h-3.5 w-3.5 fill-current" />
                Stop Translation
              </button>
            )}
            <button
              type="button"
              onClick={onRetryFailed}
              disabled={!hasFailedTranslations}
              className={`p-2 rounded-lg border transition-all ${
                hasFailedTranslations
                  ? "bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/25 text-amber-400"
                  : "border-white/[0.04] bg-zinc-900/20 text-zinc-600 cursor-not-allowed"
              }`}
              title="Retry Failed Translations"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={onClearQueue}
              className="p-2 rounded-lg border border-white/[0.04] bg-zinc-900/20 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all"
              title="Clear Translation Queue"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Panel 3: Voice Synthesizers controls */}
        <div className="flex flex-col gap-1.5 flex-1">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
            Voice Synthesis Output
          </span>
          <div className="flex items-center gap-2">
            {!isVoiceEnabled ? (
              <button
                type="button"
                onClick={onStartVoice}
                disabled={!isAzureConfigured}
                className="flex items-center gap-1.5 rounded-lg bg-accent-purple/10 border border-accent-purple/20 hover:bg-accent-purple/25 px-4 py-2 text-xs font-bold text-accent-purple transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Volume2 className="h-3.5 w-3.5" />
                Enable Voice
              </button>
            ) : (
              <button
                type="button"
                onClick={onStopVoice}
                className="flex items-center gap-1.5 rounded-lg bg-zinc-800 border border-white/[0.06] hover:bg-zinc-700 px-4 py-2 text-xs font-bold text-zinc-300 transition-all"
              >
                <VolumeX className="h-3.5 w-3.5" />
                Disable Voice
              </button>
            )}

            <button
              type="button"
              onClick={onStopAllSpeech}
              disabled={!isVoiceEnabled}
              className="p-2 rounded-lg border border-red-500/10 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              title="Stop All Speech Output"
            >
              <Square className="h-3.5 w-3.5 fill-current" />
            </button>

            <button
              type="button"
              onClick={onClearSpeechQueue}
              disabled={!isVoiceEnabled}
              className="p-2 rounded-lg border border-white/[0.04] bg-zinc-900/20 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              title="Clear Speech Output Queue"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
