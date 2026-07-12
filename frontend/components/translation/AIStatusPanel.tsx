"use client";

import { Activity, Info } from "lucide-react";

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
}: AIStatusPanelProps) {
  const integrations = [
    {
      name: "Azure Speech Service",
      status: azureSpeechStatus,
      region: "Central India (Pune)",
      connection: azureSpeechStatus === "Connected" ? "WebSocket Active" : azureSpeechStatus === "Connecting" ? "Connecting..." : "Disconnected",
      latency: azureSpeechLatency,
    },
    {
      name: "Azure Neural Translator",
      status: azureTranslatorStatus,
      region: "Global (Multi-region)",
      connection: azureTranslatorStatus === "Connected" ? "API Route Ready" : azureTranslatorStatus === "Connecting" ? "Connecting..." : "Disabled",
      latency: azureTranslatorLatency,
    },
    {
      name: "Azure Neural Synthesis (TTS)",
      status: azureSynthesisStatus,
      region: "Central India (Pune)",
      connection: azureSynthesisStatus === "Connected" ? "Stream Ready" : "Disabled",
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
      name: "OpenAI LLM Engine",
      status: openAiStatus,
      region: "US East (Virginia)",
      connection: openAiStatus === "Connected" ? "API Endpoint Active" : "Disabled",
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
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
          AI Engine Status
        </h3>
        <Activity className="h-3.5 w-3.5 text-zinc-500" />
      </div>

      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
        {integrations.map((item) => {
          const config = statusConfigs[item.status];

          return (
            <div
              key={item.name}
              className={`rounded-lg border p-3.5 space-y-3 transition-colors ${
                item.status === "Disabled" ? "border-white/[0.02] bg-zinc-950/20" : "border-white/[0.04] bg-zinc-950/40"
              }`}
            >
              {/* Header: Service Name & Status Badge */}
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

              {/* Grid: Detailed stats */}
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

      <div className="rounded-lg bg-zinc-950/40 border border-white/[0.03] p-3 text-[10px] text-zinc-500 leading-normal flex gap-1.5">
        <Info className="h-4 w-4 text-zinc-600 shrink-0 mt-0.5" />
        <p>
          Configured engines transition to <span className="text-emerald-400 font-semibold">Connected</span> state once continuous streaming begins.
        </p>
      </div>
    </div>
  );
}
