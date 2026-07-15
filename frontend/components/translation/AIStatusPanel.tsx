"use client";

import { Activity, Mic, Headphones, Cpu, Globe, Zap, Radio, AlertCircle } from "lucide-react";

export type EngineStatus = "Connected" | "Connecting" | "Error" | "Disabled";

interface AIStatusPanelProps {
  azureSpeechStatus?: EngineStatus;
  azureSpeechLatency?: string;
  azureSpeechErrors?: number;

  azureTranslatorStatus?: EngineStatus;
  azureTranslatorLatency?: string;
  azureTranslatorErrors?: number;

  azureSynthesisStatus?: EngineStatus;
  azureSynthesisLatency?: string;
  azureSynthesisQueueSize?: number;

  elevenLabsStatus?: EngineStatus;
  elevenLabsLatency?: string;

  openAiStatus?: EngineStatus;
  openAiLatency?: string;

  streamingStatus?: string;
  streamingCount?: number;
  streamingErrors?: number;

  audioInputName?: string;
  audioOutputName?: string;
}

export function AIStatusPanel({
  azureSpeechStatus = "Disabled",
  azureSpeechLatency = "-- ms",
  azureSpeechErrors = 0,
  azureTranslatorStatus = "Disabled",
  azureTranslatorLatency = "-- ms",
  azureTranslatorErrors = 0,
  azureSynthesisStatus = "Disabled",
  azureSynthesisLatency = "-- ms",
  azureSynthesisQueueSize = 0,
  elevenLabsStatus = "Disabled",
  elevenLabsLatency = "-- ms",
  openAiStatus = "Disabled",
  openAiLatency = "-- ms",
  streamingStatus = "idle",
  streamingCount = 0,
  streamingErrors = 0,
  audioInputName = "Default Mic",
  audioOutputName = "Default Speaker",
}: AIStatusPanelProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Connected":
      case "connected":
      case "active":
        return "bg-emerald-500 shadow-[0_0_8px_#10b981]";
      case "Connecting":
      case "connecting":
      case "paused":
        return "bg-amber-500 shadow-[0_0_8px_#f59e0b] animate-pulse";
      case "Error":
      case "error":
        return "bg-red-500 shadow-[0_0_8px_#ef4444]";
      default:
        return "bg-zinc-750";
    }
  };

  const getStatusText = (status: string) => {
    if (status === "active") return "Connected";
    return status;
  };

  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4 space-y-4 shadow-2xl backdrop-blur-md h-[520px] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 shrink-0">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <Activity className="h-4 w-4 text-electric-blue" />
          <span>Observability & Signals</span>
        </h3>
        <span className="text-[9px] font-extrabold text-zinc-550 uppercase">Active Monitors</span>
      </div>

      {/* Widgets list scrollable */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5 custom-scrollbar">
        {/* 1. Azure Speech */}
        <div className="rounded-lg border border-white/[0.03] bg-zinc-950/30 p-2.5 hover:border-white/[0.06] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-zinc-200 flex items-center gap-1.5">
              <Mic className="h-3.5 w-3.5 text-electric-blue" />
              <span>Azure Speech Recognition</span>
            </span>
            <div className="flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${getStatusColor(azureSpeechStatus)}`} />
              <span className="text-[9px] font-extrabold text-zinc-500 uppercase font-mono">
                {getStatusText(azureSpeechStatus)}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2 pt-1.5 border-t border-white/[0.02] text-[9px] font-mono text-zinc-500">
            <div>
              <span className="text-zinc-650 block text-[8px] uppercase font-bold">Latency</span>
              <span className="text-zinc-350">{azureSpeechLatency}</span>
            </div>
            <div>
              <span className="text-zinc-650 block text-[8px] uppercase font-bold">Errors</span>
              <span className={azureSpeechErrors > 0 ? "text-red-400 font-bold" : "text-zinc-350"}>
                {azureSpeechErrors}
              </span>
            </div>
            <div>
              <span className="text-zinc-650 block text-[8px] uppercase font-bold">Health</span>
              <span className={azureSpeechStatus === "Connected" ? "text-emerald-400 font-bold" : "text-zinc-500"}>
                {azureSpeechStatus === "Connected" ? "100%" : "--"}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Azure Translator */}
        <div className="rounded-lg border border-white/[0.03] bg-zinc-950/30 p-2.5 hover:border-white/[0.06] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-zinc-200 flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-electric-blue" />
              <span>Azure Translator Engine</span>
            </span>
            <div className="flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${getStatusColor(azureTranslatorStatus)}`} />
              <span className="text-[9px] font-extrabold text-zinc-500 uppercase font-mono">
                {getStatusText(azureTranslatorStatus)}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2 pt-1.5 border-t border-white/[0.02] text-[9px] font-mono text-zinc-500">
            <div>
              <span className="text-zinc-650 block text-[8px] uppercase font-bold">Latency</span>
              <span className="text-zinc-350">{azureTranslatorLatency}</span>
            </div>
            <div>
              <span className="text-zinc-650 block text-[8px] uppercase font-bold">Errors</span>
              <span className={azureTranslatorErrors > 0 ? "text-red-400 font-bold" : "text-zinc-350"}>
                {azureTranslatorErrors}
              </span>
            </div>
            <div>
              <span className="text-zinc-650 block text-[8px] uppercase font-bold">Health</span>
              <span className={azureTranslatorStatus === "Connected" ? "text-emerald-400 font-bold" : "text-zinc-500"}>
                {azureTranslatorStatus === "Connected" ? "100%" : "--"}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Azure Speech Synthesis */}
        <div className="rounded-lg border border-white/[0.03] bg-zinc-950/30 p-2.5 hover:border-white/[0.06] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-zinc-200 flex items-center gap-1.5">
              <Headphones className="h-3.5 w-3.5 text-electric-blue" />
              <span>Azure Synthesis (TTS)</span>
            </span>
            <div className="flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${getStatusColor(azureSynthesisStatus)}`} />
              <span className="text-[9px] font-extrabold text-zinc-500 uppercase font-mono">
                {getStatusText(azureSynthesisStatus)}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2 pt-1.5 border-t border-white/[0.02] text-[9px] font-mono text-zinc-500">
            <div>
              <span className="text-zinc-650 block text-[8px] uppercase font-bold">Latency</span>
              <span className="text-zinc-350">{azureSynthesisLatency}</span>
            </div>
            <div>
              <span className="text-zinc-650 block text-[8px] uppercase font-bold">Queue Size</span>
              <span className="text-zinc-350 font-bold">{azureSynthesisQueueSize}</span>
            </div>
            <div>
              <span className="text-zinc-650 block text-[8px] uppercase font-bold">Health</span>
              <span className={azureSynthesisStatus === "Connected" ? "text-emerald-400 font-bold" : "text-zinc-500"}>
                {azureSynthesisStatus === "Connected" ? "100%" : "--"}
              </span>
            </div>
          </div>
        </div>

        {/* 4. ElevenLabs & OpenAI */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-lg border border-white/[0.03] bg-zinc-950/30 p-2 hover:border-white/[0.06] transition-colors">
            <span className="text-[9px] font-bold text-zinc-400 block">ElevenLabs API</span>
            <div className="flex items-center justify-between mt-1 pt-1 border-t border-white/[0.02]">
              <span className="text-[9px] font-mono text-zinc-500">{elevenLabsLatency}</span>
              <span className="text-[8px] text-zinc-600 uppercase font-extrabold font-mono">{elevenLabsStatus}</span>
            </div>
          </div>
          <div className="rounded-lg border border-white/[0.03] bg-zinc-950/30 p-2 hover:border-white/[0.06] transition-colors">
            <span className="text-[9px] font-bold text-zinc-400 block">OpenAI Translation</span>
            <div className="flex items-center justify-between mt-1 pt-1 border-t border-white/[0.02]">
              <span className="text-[9px] font-mono text-zinc-500">{openAiLatency}</span>
              <span className="text-[8px] text-zinc-600 uppercase font-extrabold font-mono">{openAiStatus}</span>
            </div>
          </div>
        </div>

        {/* 5. Streaming Channels */}
        <div className="rounded-lg border border-white/[0.03] bg-zinc-950/30 p-2.5 hover:border-white/[0.06] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-zinc-200 flex items-center gap-1.5">
              <Radio className="h-3.5 w-3.5 text-electric-blue" />
              <span>Real-Time Broadcast</span>
            </span>
            <div className="flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${getStatusColor(streamingStatus)}`} />
              <span className="text-[9px] font-extrabold text-zinc-500 uppercase font-mono">
                {streamingStatus}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2 pt-1.5 border-t border-white/[0.02] text-[9px] font-mono text-zinc-500">
            <div>
              <span className="text-zinc-650 block text-[8px] uppercase font-bold">Listeners</span>
              <span className="text-zinc-350">{streamingCount}</span>
            </div>
            <div>
              <span className="text-zinc-650 block text-[8px] uppercase font-bold">Reconnects</span>
              <span className="text-zinc-350">0</span>
            </div>
            <div>
              <span className="text-zinc-650 block text-[8px] uppercase font-bold">Errors</span>
              <span className="text-zinc-350">{streamingErrors}</span>
            </div>
          </div>
        </div>

        {/* 6. Hardware Routing Summary */}
        <div className="rounded-lg border border-white/[0.03] bg-zinc-950/30 p-2.5 text-[9px] space-y-1.5 text-zinc-550 font-mono">
          <div className="flex justify-between items-center">
            <span className="font-sans font-bold text-zinc-450 uppercase text-[8px]">Active Input</span>
            <span className="text-zinc-300 truncate max-w-[150px]" title={audioInputName}>
              {audioInputName}
            </span>
          </div>
          <div className="flex justify-between items-center border-t border-white/[0.02] pt-1.5">
            <span className="font-sans font-bold text-zinc-450 uppercase text-[8px]">Active Output</span>
            <span className="text-zinc-300 truncate max-w-[150px]" title={audioOutputName}>
              {audioOutputName}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
