"use client";

import {
  Mic,
  MicOff,
  Globe,
  Languages,
  Radio,
  Pause,
  Play,
  Square,
  Volume2,
  VolumeX,
  Cc,
  Disc,
  Download,
} from "lucide-react";

interface SessionControlsProps {
  // Recognition
  isListening: boolean;
  onStartListening: () => void;
  onStopListening: () => void;

  // Translation
  isTranslating: boolean;
  onStartTranslation: () => void;
  onStopTranslation: () => void;

  // Voice Speech
  isVoiceEnabled: boolean;
  onStartVoice: () => void;
  onStopVoice: () => void;

  // Broadcast Streaming
  isStreamingActive: boolean;
  onStartSession: () => void;
  onStopSession: () => void;
  sessionState: string;
  onPauseSession: () => void;
  onResumeSession: () => void;

  // Captions
  captionsEnabled: boolean;
  setCaptionsEnabled: (val: boolean) => void;

  // Record
  recordingEnabled: boolean;
  setRecordingEnabled: (val: boolean) => void;

  // Export
  onExportTranscripts: () => void;

  // Configurations
  isAzureConfigured: boolean;
}

export function SessionControls({
  isListening,
  onStartListening,
  onStopListening,
  isTranslating,
  onStartTranslation,
  onStopTranslation,
  isVoiceEnabled,
  onStartVoice,
  onStopVoice,
  isStreamingActive,
  onStartSession,
  onStopSession,
  sessionState,
  onPauseSession,
  onResumeSession,
  captionsEnabled,
  setCaptionsEnabled,
  recordingEnabled,
  setRecordingEnabled,
  onExportTranscripts,
  isAzureConfigured,
}: SessionControlsProps) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-zinc-950/80 p-3 shadow-2xl backdrop-blur-lg flex flex-wrap items-center justify-center gap-2 max-w-6xl mx-auto">
      {/* 1. Audio Capture (Mic) */}
      <div className="flex items-center">
        {isListening ? (
          <button
            onClick={onStopListening}
            className="h-10 px-4 rounded-lg bg-red-500 hover:bg-red-600 text-black font-extrabold text-[11px] tracking-wider transition-colors inline-flex items-center gap-2 cursor-pointer min-w-[125px] justify-center"
            title="Stop Audio Capture"
          >
            <MicOff className="h-4 w-4" />
            <span>MIC OFF</span>
          </button>
        ) : (
          <button
            onClick={onStartListening}
            disabled={!isAzureConfigured}
            className="h-10 px-4 rounded-lg bg-zinc-900 border border-white/[0.08] hover:bg-zinc-800 text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed font-extrabold text-[11px] tracking-wider transition-colors inline-flex items-center gap-2 cursor-pointer min-w-[125px] justify-center"
            title="Start Audio Capture"
          >
            <Mic className="h-4 w-4 text-electric-blue" />
            <span>MIC ON</span>
          </button>
        )}
      </div>

      {/* 2. Translation */}
      <div className="flex items-center">
        {isTranslating ? (
          <button
            onClick={onStopTranslation}
            className="h-10 px-4 rounded-lg bg-red-500 hover:bg-red-600 text-black font-extrabold text-[11px] tracking-wider transition-colors inline-flex items-center gap-2 cursor-pointer min-w-[130px] justify-center"
            title="Stop Translation Pipeline"
          >
            <Globe className="h-4 w-4" />
            <span>STOP TRANS</span>
          </button>
        ) : (
          <button
            onClick={onStartTranslation}
            disabled={!isAzureConfigured}
            className="h-10 px-4 rounded-lg bg-zinc-900 border border-white/[0.08] hover:bg-zinc-800 text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed font-extrabold text-[11px] tracking-wider transition-colors inline-flex items-center gap-2 cursor-pointer min-w-[130px] justify-center"
            title="Start Translation Pipeline"
          >
            <Globe className="h-4 w-4 text-electric-blue" />
            <span>START TRANS</span>
          </button>
        )}
      </div>

      {/* 3. Broadcast Stream */}
      <div className="flex items-center gap-1.5">
        {!isStreamingActive ? (
          <button
            onClick={onStartSession}
            className="h-10 px-4 rounded-lg bg-gradient-to-r from-electric-blue to-accent-purple hover:from-electric-blue/90 hover:to-accent-purple/90 text-black font-extrabold text-[11px] tracking-wider transition-all inline-flex items-center gap-2 cursor-pointer min-w-[145px] justify-center shadow-[0_0_15px_rgba(0,212,255,0.15)]"
            title="Start Live Event Broadcast"
          >
            <Radio className="h-4 w-4" />
            <span>START BROADCAST</span>
          </button>
        ) : (
          <>
            {sessionState === "active" ? (
              <button
                onClick={onPauseSession}
                className="h-10 px-4 rounded-lg bg-zinc-900 border border-white/[0.08] hover:bg-zinc-800 text-amber-400 font-extrabold text-[11px] tracking-wider transition-colors inline-flex items-center gap-2 cursor-pointer min-w-[95px] justify-center"
                title="Pause Live Event Broadcast"
              >
                <Pause className="h-4 w-4" />
                <span>PAUSE</span>
              </button>
            ) : (
              <button
                onClick={onResumeSession}
                className="h-10 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-[11px] tracking-wider transition-colors inline-flex items-center gap-2 cursor-pointer min-w-[95px] justify-center"
                title="Resume Live Event Broadcast"
              >
                <Play className="h-4 w-4" />
                <span>RESUME</span>
              </button>
            )}
            <button
              onClick={onStopSession}
              className="h-10 px-4 rounded-lg bg-red-950/40 border border-red-500/30 hover:bg-red-900/30 text-red-450 font-extrabold text-[11px] tracking-wider transition-colors inline-flex items-center gap-2 cursor-pointer min-w-[95px] justify-center"
              title="Stop Live Event Broadcast"
            >
              <Square className="h-4 w-4" />
              <span>STOP</span>
            </button>
          </>
        )}
      </div>

      {/* 4. Voice Enable / Disable */}
      <div className="flex items-center">
        {isVoiceEnabled ? (
          <button
            onClick={onStopVoice}
            className="h-10 px-4 rounded-lg bg-zinc-900 border border-white/[0.08] hover:bg-zinc-800 text-zinc-300 font-extrabold text-[11px] tracking-wider transition-colors inline-flex items-center gap-2 cursor-pointer min-w-[130px] justify-center"
            title="Disable TTS Voice Output"
          >
            <VolumeX className="h-4 w-4 text-electric-blue" />
            <span>VOICE ACTIVE</span>
          </button>
        ) : (
          <button
            onClick={onStartVoice}
            className="h-10 px-4 rounded-lg bg-zinc-900 border border-white/[0.08] hover:bg-zinc-800 text-zinc-550 font-extrabold text-[11px] tracking-wider transition-colors inline-flex items-center gap-2 cursor-pointer min-w-[130px] justify-center"
            title="Enable TTS Voice Output"
          >
            <Volume2 className="h-4 w-4" />
            <span>VOICE MUTED</span>
          </button>
        )}
      </div>

      {/* 5. Captions */}
      <button
        onClick={() => setCaptionsEnabled(!captionsEnabled)}
        className={`h-10 px-3 rounded-lg border font-extrabold text-[11px] tracking-wider transition-colors inline-flex items-center gap-1.5 cursor-pointer min-w-[110px] justify-center ${
          captionsEnabled
            ? "bg-zinc-900 border-electric-blue/30 text-electric-blue"
            : "bg-zinc-900 border-white/[0.08] text-zinc-550"
        }`}
        title="Toggle Live Captions"
      >
        <Cc className="h-4 w-4" />
        <span>CAPTIONS</span>
      </button>

      {/* 6. Record */}
      <button
        onClick={() => setRecordingEnabled(!recordingEnabled)}
        className={`h-10 px-3 rounded-lg border font-extrabold text-[11px] tracking-wider transition-colors inline-flex items-center gap-1.5 cursor-pointer min-w-[100px] justify-center ${
          recordingEnabled
            ? "bg-zinc-900 border-red-500/30 text-red-500"
            : "bg-zinc-900 border-white/[0.08] text-zinc-550"
        }`}
        title="Toggle Session Recording"
      >
        <Disc className={`h-4 w-4 ${recordingEnabled ? "animate-pulse" : ""}`} />
        <span>RECORD</span>
      </button>

      {/* 7. Export */}
      <button
        onClick={onExportTranscripts}
        className="h-10 px-3 rounded-lg bg-zinc-900 border border-white/[0.08] hover:bg-zinc-800 text-zinc-300 font-extrabold text-[11px] tracking-wider transition-colors inline-flex items-center gap-1.5 cursor-pointer min-w-[95px] justify-center"
        title="Export Transcripts"
      >
        <Download className="h-4 w-4" />
        <span>EXPORT</span>
      </button>
    </div>
  );
}
