"use client";

import { motion } from "framer-motion";
import { Zap, Globe, AudioWaveform } from "lucide-react";

const stats = [
  {
    icon: Zap,
    label: "Latency",
    value: "1–3s",
    description: "Sub-second speech translation",
  },
  {
    icon: Globe,
    label: "Languages",
    value: "50+",
    description: "Multilingual live coverage",
  },
  {
    icon: AudioWaveform,
    label: "Integration",
    value: "Enterprise",
    description: "Audio pipeline ready",
  },
];

export default function StatCards() {
  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 + i * 0.1, ease: "easeOut" }}
            className="glass-panel rounded-xl p-3 sm:p-4 border border-white/[0.06] hover:border-electric-blue/20 transition-colors duration-300"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <Icon className="w-3.5 h-3.5 text-electric-blue" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                {stat.label}
              </span>
            </div>
            <div className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {stat.value}
            </div>
            <div className="text-[11px] text-zinc-500 mt-0.5 hidden sm:block">
              {stat.description}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
