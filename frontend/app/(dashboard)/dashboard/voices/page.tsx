import { Mic } from "lucide-react";

export default function VoiceProfilesPage() {
  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.04] bg-zinc-900/20 p-6 md:p-8">
        <div className="absolute -left-16 -top-16 h-36 w-36 rounded-full bg-electric-blue/5 blur-3xl pointer-events-none" />
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">Voice Profiles</h1>
        <p className="mt-1.5 text-xs md:text-sm text-zinc-400 font-medium">
          Create, train, and select high-fidelity neural voice clones.
        </p>
      </div>

      {/* Feature Placeholder */}
      <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-12 flex flex-col items-center justify-center text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-950 border border-white/[0.06] text-zinc-500 mb-4 shadow-inner">
          <Mic className="h-5 w-5 text-electric-blue" />
        </div>
        <h3 className="text-sm font-semibold text-white">Voice Synthesis Lab</h3>
        <p className="mt-1.5 text-xs text-zinc-500 max-w-sm leading-relaxed">
          Record speaker samples, initiate neural voice training, and configure active speaker profiles. Integration with ElevenLabs voice synthesis engine is currently pending.
        </p>
      </div>
    </div>
  );
}
