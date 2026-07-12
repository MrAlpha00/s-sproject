"use client";

import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  change?: string | null;
  glowColor?: "blue" | "purple" | "emerald" | "amber";
}

export function StatCard({ label, value, icon: Icon, change = null, glowColor = "blue" }: StatCardProps) {
  const glowClasses = {
    blue: "bg-electric-blue/10 ring-electric-blue/20 text-electric-blue shadow-[0_0_15px_rgba(0,212,255,0.1)]",
    purple: "bg-accent-purple/10 ring-accent-purple/20 text-accent-purple shadow-[0_0_15px_rgba(175,64,255,0.1)]",
    emerald: "bg-emerald-500/10 ring-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.1)]",
    amber: "bg-amber-500/10 ring-amber-500/20 text-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.1)]",
  };

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-zinc-900/40 p-5 transition-all duration-200 hover:border-white/[0.12] hover:bg-zinc-900/60"
    >
      {/* Background radial glow */}
      <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-electric-blue/5 blur-2xl group-hover:bg-electric-blue/10 transition-colors duration-300" />

      <div className="flex items-start justify-between">
        <div className={`rounded-lg p-2.5 ring-1 ${glowClasses[glowColor]}`}>
          <Icon className="h-4 w-4" />
        </div>
        {change && (
          <span className="flex items-center gap-0.5 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full ring-1 ring-emerald-500/20">
            {change}
          </span>
        )}
      </div>
      
      <p className="mt-4 text-2xl font-bold tracking-tight text-white">
        {value}
      </p>
      <p className="mt-1 text-xs text-zinc-500 font-medium uppercase tracking-wider">{label}</p>
    </motion.div>
  );
}
