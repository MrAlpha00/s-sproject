"use client";

import { ShieldCheck, ShieldAlert, Key, Mic } from "lucide-react";

interface AudioPermissionCardProps {
  permissionStatus: "prompt" | "granted" | "denied";
  onEnable: () => void;
}

export function AudioPermissionCard({ permissionStatus, onEnable }: AudioPermissionCardProps) {
  const configs = {
    prompt: {
      title: "Audio Capture Disabled",
      description: "Permission is required to list physical input/output hardware and analyze active sound waves.",
      buttonText: "Enable Audio Hardware",
      bgColor: "bg-zinc-900/40 border-white/[0.06]",
      iconColor: "text-electric-blue bg-electric-blue/10 border-electric-blue/20",
      buttonColor: "bg-gradient-to-r from-electric-blue to-accent-purple text-white shadow-[0_0_15px_rgba(0,212,255,0.15)] hover:scale-102",
      icon: Key,
    },
    granted: {
      title: "Microphone Access Authorized",
      description: "AetherVOX is connected to your system's hardware channels. Live signal testing is ready.",
      buttonText: "Revoke Access (System Settings)",
      bgColor: "bg-emerald-950/20 border-emerald-500/10",
      iconColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      buttonColor: "bg-zinc-950 border border-white/[0.06] text-zinc-400 cursor-not-allowed",
      icon: ShieldCheck,
    },
    denied: {
      title: "Permission Denied by Browser",
      description: "Microphone permission has been blocked. Please enable microphone access in your browser settings to list local audio sources.",
      buttonText: "Blocked (Check Settings)",
      bgColor: "bg-red-950/20 border-red-500/10",
      iconColor: "text-red-400 bg-red-500/10 border-red-500/20",
      buttonColor: "bg-zinc-950 border border-red-500/25 text-red-500/70 cursor-not-allowed",
      icon: ShieldAlert,
    },
  };

  const current = configs[permissionStatus] || configs.prompt;
  const IconComponent = current.icon;

  return (
    <div className={`rounded-xl border p-5 transition-all duration-300 flex flex-col sm:flex-row items-center gap-5 justify-between ${current.bgColor}`}>
      <div className="flex items-center gap-4.5 text-center sm:text-left flex-col sm:flex-row">
        {/* Dynamic Icon */}
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${current.iconColor}`}>
          <IconComponent className="h-5.5 w-5.5" />
        </div>

        <div className="space-y-1">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">{current.title}</h4>
          <p className="text-xs text-zinc-400 max-w-[450px] leading-relaxed">
            {current.description}
          </p>
        </div>
      </div>

      {permissionStatus === "prompt" ? (
        <button
          type="button"
          onClick={onEnable}
          className={`flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-xs font-bold transition-all shrink-0 ${current.buttonColor}`}
        >
          <Mic className="h-4 w-4" />
          {current.buttonText}
        </button>
      ) : (
        <button
          type="button"
          disabled
          className={`flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-xs font-bold transition-all shrink-0 cursor-not-allowed ${current.buttonColor}`}
        >
          {current.buttonText}
        </button>
      )}
    </div>
  );
}
