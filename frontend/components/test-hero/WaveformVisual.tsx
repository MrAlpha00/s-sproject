"use client";

import dynamic from "next/dynamic";

const WaveformInner = dynamic(() => import("./WaveformInner"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] md:min-h-[600px] flex items-center justify-center bg-gradient-to-b from-electric-blue/5 to-accent-purple/5 rounded-2xl border border-white/[0.04]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-electric-blue/30 border-t-electric-blue rounded-full animate-spin" />
        <span className="text-xs text-zinc-500 font-mono tracking-wider uppercase">
          Loading 3D Engine...
        </span>
      </div>
    </div>
  ),
});

export default function WaveformVisual() {
  return (
    <div className="relative w-full h-full min-h-[400px] md:min-h-[600px] rounded-2xl overflow-hidden">
      {/* Glow backdrop */}
      <div className="absolute inset-0 bg-gradient-to-b from-electric-blue/5 via-accent-purple/[0.02] to-transparent rounded-2xl pointer-events-none z-10" />
      <div className="w-full h-full absolute inset-0">
        <WaveformInner />
      </div>
    </div>
  );
}
