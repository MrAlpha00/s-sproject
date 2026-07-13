"use client";

import React from "react";
import { WifiOff, RotateCcw } from "lucide-react";

export default function OfflinePage() {
  const handleRetry = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 text-white">
      <div className="w-full max-w-md rounded-2xl border border-white/[0.06] bg-zinc-900/40 p-8 text-center space-y-6 backdrop-blur-md">
        <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
          <WifiOff className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight">You are Offline</h2>
          <p className="text-xs text-zinc-500 leading-relaxed max-w-xs mx-auto">
            AetherVOX was unable to establish a secure connection to our real-time streaming nodes. Please check your network cables or Wi-Fi settings.
          </p>
        </div>
        <div className="pt-2">
          <button
            onClick={handleRetry}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-electric-blue text-black font-bold text-xs px-6 hover:bg-electric-blue/90 cursor-pointer transition-all shadow-[0_0_15px_rgba(0,212,255,0.2)]"
          >
            <RotateCcw className="h-4 w-4" />
            <span>RETRY CONNECTION</span>
          </button>
        </div>
      </div>
    </div>
  );
}
