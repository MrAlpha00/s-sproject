"use client";

import { Cpu, CheckCircle } from "lucide-react";

export default function IntegrationsSettingsPage() {
  const integrations = [
    { name: "Azure Cognitive Services", type: "Translation & Speech", status: "Configured", color: "text-electric-blue bg-electric-blue/10 border-electric-blue/20" },
    { name: "ElevenLabs Synthesizers", type: "High-Fi Neural Voice Cloning", status: "Pending Key Integration", color: "text-accent-purple bg-accent-purple/10 border-accent-purple/20" },
    { name: "Supabase Relational Database", type: "SaaS Tenant Storage & RLS", status: "Active System Core", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" }
  ];

  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-5 space-y-4">
      <div className="flex items-center gap-2 border-b border-white/[0.04] pb-3">
        <Cpu className="h-4 w-4 text-electric-blue" />
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
          API Integration Modules
        </h3>
      </div>

      <div className="space-y-3">
        {integrations.map((item) => (
          <div key={item.name} className="rounded-lg border border-white/[0.03] bg-zinc-950/40 p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded border ${item.color}`}>
                <Cpu className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">{item.name}</span>
                <span className="text-[10px] text-zinc-500 font-medium block">{item.type}</span>
              </div>
            </div>
            <span className="rounded bg-zinc-900 border border-white/[0.06] px-2 py-0.5 text-[9px] text-zinc-400 font-bold uppercase">
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
