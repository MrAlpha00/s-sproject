"use client";

import { Activity, ShieldCheck, AlertCircle, Info, HardDrive } from "lucide-react";

interface StatusItemProps {
  name: string;
  status: "Pending" | "Not Connected" | "Connected";
  region: string;
  connection: string;
  latency: string;
  icon: string;
}

export function AIStatusPanel() {
  const integrations: StatusItemProps[] = [
    {
      name: "Azure Speech Service",
      status: "Pending",
      region: "US East (Virginia)",
      connection: "WebSocket Initiating",
      latency: "-- ms",
      icon: "speech",
    },
    {
      name: "Azure Neural Translator",
      status: "Pending",
      region: "Global (Multi-region)",
      connection: "Endpoint Standby",
      latency: "-- ms",
      icon: "translate",
    },
    {
      name: "ElevenLabs Synthesizer",
      status: "Pending",
      region: "Global (Edge)",
      connection: "Socket Initializing",
      latency: "-- ms",
      icon: "voice",
    },
    {
      name: "Audio Channels",
      status: "Not Connected",
      region: "Local hardware",
      connection: "No stream detected",
      latency: "-- ms",
      icon: "audio",
    },
  ];

  const statusConfigs = {
    Connected: {
      textColor: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
      dotColor: "bg-emerald-500 shadow-[0_0_8px_#10b981]",
    },
    Pending: {
      textColor: "text-amber-400 border-amber-500/20 bg-amber-500/5",
      dotColor: "bg-amber-500 shadow-[0_0_8px_#f59e0b] animate-pulse",
    },
    "Not Connected": {
      textColor: "text-red-400 border-red-500/20 bg-red-500/5",
      dotColor: "bg-red-500 shadow-[0_0_8px_#ef4444]",
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

      <div className="space-y-4">
        {integrations.map((item) => {
          const config = statusConfigs[item.status];

          return (
            <div
              key={item.name}
              className="rounded-lg border border-white/[0.03] bg-zinc-950/40 p-3.5 space-y-3"
            >
              {/* Header: Service Name & Status Badge */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-zinc-900 border border-white/[0.06] text-zinc-500">
                    <span className="text-[8px] font-bold uppercase">
                      {item.name === "Audio Channels" ? "HW" : "AI"}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-white">{item.name}</span>
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
                  <span className="text-zinc-300 block truncate mt-0.5">{item.region}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block uppercase font-semibold">Connection</span>
                  <span className="text-zinc-300 block truncate mt-0.5">{item.connection}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block uppercase font-semibold">Latency</span>
                  <span className="text-zinc-300 block truncate mt-0.5">{item.latency}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Warning */}
      <div className="rounded-lg bg-zinc-950/40 border border-white/[0.03] p-3 text-[10px] text-zinc-500 leading-normal flex gap-1.5">
        <Info className="h-4 w-4 text-zinc-600 shrink-0 mt-0.5" />
        <p>
          Integrations show <span className="text-amber-400 font-semibold">Pending</span> until API credentials are wired. Connection indicators will transition to live status upon starting.
        </p>
      </div>
    </div>
  );
}
