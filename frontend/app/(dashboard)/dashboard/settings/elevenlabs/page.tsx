"use client";

import { BrainCircuit, Save } from "lucide-react";

export default function ElevenLabsSettingsPage() {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-5 space-y-4">
      <div className="flex items-center gap-2 border-b border-white/[0.04] pb-3">
        <BrainCircuit className="h-4 w-4 text-electric-blue" />
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
          ElevenLabs Voice Synthesizer
        </h3>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-zinc-500 uppercase block">ElevenLabs API Secret Key</label>
          <input
            type="password"
            placeholder="••••••••••••••••••••••••••••••••"
            disabled
            className="h-9 w-full rounded border border-white/[0.06] bg-zinc-950/60 px-3 text-xs text-zinc-500 cursor-not-allowed focus:outline-none"
          />
          <p className="text-[10px] text-zinc-500 leading-normal">
            Synthesis integrations use server-side environment parameters by default. Keys are kept isolated from web scopes.
          </p>
        </div>

        <div className="flex justify-end pt-2 border-t border-white/[0.04]">
          <button
            type="submit"
            disabled
            className="flex items-center gap-1.5 rounded-lg bg-zinc-800 border border-white/[0.06] px-4 py-2 text-xs font-semibold text-zinc-400 cursor-not-allowed"
          >
            Save ElevenLabs Settings
          </button>
        </div>
      </form>
    </div>
  );
}
