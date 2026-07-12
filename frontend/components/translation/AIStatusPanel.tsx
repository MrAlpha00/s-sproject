"use client";

import { Activity, Info, Volume2, ShieldCheck, AlertCircle } from "lucide-react";

export type EngineStatus = "Connected" | "Connecting" | "Error" | "Disabled";

interface AIStatusPanelProps {
  azureSpeechStatus?: EngineStatus;
  azureSpeechLatency?: string;
  
  azureTranslatorStatus?: EngineStatus;
  azureTranslatorLatency?: string;
  
  azureSynthesisStatus?: EngineStatus;
  azureSynthesisLatency?: string;
  
  elevenLabsStatus?: EngineStatus;
  elevenLabsLatency?: string;
  
  openAiStatus?: EngineStatus;
  openAiLatency?: string;

  // Module 11 additional fields
  outputDeviceName?: string;
  voiceQueueCount?: number;
  averageSpeechLatency?: string;
}

export function AIStatusPanel({
  azureSpeechStatus = "Disabled",
  azureSpeechLatency = "-- ms",
  azureTranslatorStatus = "Disabled",
  azureTranslatorLatency = "-- ms",
  azureSynthesisStatus = "Disabled",
  azureSynthesisLatency = "-- ms",
  elevenLabsStatus = "Disabled",
  elevenLabsLatency = "-- ms",
  openAiStatus = "Disabled",
  openAiLatency = "-- ms",
  outputDeviceName = "Default Output Speaker",
  voiceQueueCount = 0,
  averageSpeechLatency = "-- ms",
}: AIStatusPanelProps) {
  const integrations = [
    {
      name: "Azure Speech Recognition",
      status: azureSpeechStatus,
      region: "Central India (Pune)",
      connection: azureSpeechStatus === "Connected" ? "WebSocket Active" : "Disconnected",
      latency: azureSpeechLatency,
    },
    {
      name: "Azure Translator Engine",
      status: azureTranslatorStatus,
      region: "Global (Multi-region)",
      connection: azureTranslatorStatus === "Connected" ? "API Route Active" : "Disabled",
      latency: azureTranslatorLatency,
    },
    {
      name: "Azure Speech Synthesis (TTS)",
      status: azureSynthesisStatus,
      region: "Central India (Pune)",
      connection: azureSynthesisStatus === "Connected" ? "Playback Ready" : "Disabled",
      latency: azureSynthesisLatency,
    },
    {
      name: "ElevenLabs Voice Synthesizer",
      status: elevenLabsStatus,
      region: "Global (Edge)",
      connection: elevenLabsStatus === "Connected" ? "Socket Connected" : "Disabled",
      latency: elevenLabsLatency,
    },
    {
      name: "OpenAI Translation LLM",
      status: openAiStatus,
      region: "US East (Virginia)",
      connection: openAiStatus === "Connected" ? "Endpoint Active" : "Disabled",
      latency: openAiLatency,
    },
  ];

  const statusConfigs = {
    Connected: {
      textColor: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
      dotColor: "bg-emerald-500 shadow-[0_0_8px_#10b981]",
    },
    Connecting: {
      textColor: "text-amber-400 border-amber-500/20 bg-amber-500/5",
      dotColor: "bg-amber-500 shadow-[0_0_8px_#f59e0b] animate-pulse",
    },
    Error: {
      textColor: "text-red-400 border-red-500/20 bg-red-500/5",
      dotColor: "bg-red-500 shadow-[0_0_8px_#ef4444]",
    },
    Disabled: {
      textColor: "text-zinc-500 border-white/[0.04] bg-zinc-950/40",
      dotColor: "bg-zinc-700",
    },
  };

  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-5 space-y-5">
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 shrink-0">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
          AI Engine Status
        </h3>
        <Activity className="h-3.5 w-3.5 text-zinc-500" />
      </div>

      {/* Synthesis Live Queue Metrics Summary */}
      <div className="rounded-lg bg-zinc-950/50 border border-white/[0.04] p-3 text-[10px] space-y-2">
        <span className="text-[9px] font-bold text-zinc-500 uppercase block tracking-wider">
          Voice Playback Pipeline
        </span>
        <div className="grid grid-cols-2 gap-3 text-zinc-400">
          <div>
            <span className="text-zinc-650 block font-semibold">Active Destination</span>
            <span className="text-zinc-200 font-bold block truncate mt-0.5" title={outputDeviceName}>
              {outputDeviceName}
            </span>
          </div>
          <div>
            <span className="text-zinc-650 block font-semibold">Voice Queue Size</span>
            <span className="text-accent-purple font-extrabold block mt-0.5 text-xs font-mono">
              {voiceQueueCount} items
            </span>
          </div>
          <div className="col-span-2 border-t border-white/[0.02] pt-1.5 flex justify-between">
            <span className="text-zinc-650 font-semibold">Avg TTS Latency</span>
            <span className="text-electric-blue font-bold font-mono">{averageSpeechLatency}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar shrink-0">
        {integrations.map((item) => {
          const config = statusConfigs[item.status];

          return (
            <div
              key={item.name}
              className={`rounded-lg border p-3 transition-colors ${
                item.status === "Disabled" ? "border-white/[0.02] bg-zinc-950/10" : "border-white/[0.04] bg-zinc-950/30"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-zinc-900 border border-white/[0.06] text-zinc-500">
                    <span className="text-[8px] font-bold uppercase">AI</span>
                  </div>
                  <span className={`text-xs font-bold ${item.status === "Disabled" ? "text-zinc-500" : "text-white"}`}>
                    {item.name}
                  </span>
                </div>
                
                <div className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${config.textColor}`}>
                  <span className={`h-1 w-1 rounded-full ${config.dotColor}`} />
                  <span>{item.status}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 border-t border-white/[0.03] pt-2 text-[9px] font-medium text-zinc-400">
                <div>
                  <span className="text-zinc-500 block uppercase font-semibold">Region</span>
                  <span className={`${item.status === "Disabled" ? "text-zinc-650" : "text-zinc-300"} block truncate mt-0.5`}>
                    {item.region}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block uppercase font-semibold">Connection</span>
                  <span className={`${item.status === "Disabled" ? "text-zinc-650" : "text-zinc-300"} block truncate mt-0.5`}>
                    {item.connection}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block uppercase font-semibold">Latency</span>
                  <span className={`${item.status === "Disabled" ? "text-zinc-650" : "text-zinc-300"} block truncate mt-0.5`}>
                    {item.latency}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
