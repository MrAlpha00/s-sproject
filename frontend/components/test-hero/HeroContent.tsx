"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatCards from "./StatCards";

export default function HeroContent() {
  return (
    <div className="flex flex-col justify-center gap-6 lg:gap-8">
      {/* Brand pill */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-full glass-panel border border-white/[0.06]"
      >
        <span className="flex h-2 w-2 rounded-full bg-electric-blue animate-pulse" />
        <span className="text-[11px] font-bold tracking-[0.15em] uppercase text-zinc-300">
          AetherVOX
        </span>
        <span className="text-[10px] text-zinc-600 hidden sm:inline">—</span>
        <span className="text-[10px] text-zinc-500 hidden sm:inline font-medium tracking-wide">
          AI Speech Translation Infrastructure
        </span>
      </motion.div>

      {/* Tagline pill */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.08, ease: "easeOut" }}
        className="inline-flex items-center gap-1.5 self-start px-3 py-1 rounded-full bg-electric-blue/10 border border-electric-blue/20 text-electric-blue text-[11px] font-semibold tracking-wide"
      >
        <Sparkles className="w-3 h-3" />
        Live Translation • Real-Time AI
      </motion.div>

      {/* Main headline */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
        className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-white leading-[1.05] max-w-3xl"
      >
        Real-Time Multilingual
        <span className="block bg-clip-text text-transparent bg-gradient-to-r from-electric-blue via-accent-purple to-purple-400">
          Translation for Live Events
        </span>
      </motion.h1>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.25, ease: "easeOut" }}
        className="text-base sm:text-lg text-zinc-400 max-w-xl leading-relaxed"
      >
        Break language barriers at scale. AetherVOX delivers sub-second, AI-powered
        speech translation for conferences, broadcasts, and live events across 50+
        languages with enterprise-grade reliability.
      </motion.p>

      {/* CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.35, ease: "easeOut" }}
        className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4"
      >
        <Button
          size="lg"
          className="w-full sm:w-auto bg-gradient-to-r from-electric-blue to-accent-purple hover:from-electric-blue/90 hover:to-accent-purple/90 text-white font-bold text-base px-8 py-6 rounded-xl shadow-[0_0_30px_rgba(0,212,255,0.25)] hover:shadow-[0_0_40px_rgba(0,212,255,0.4)] transition-all duration-300 group cursor-pointer"
        >
          Book Demo
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Button>

        <Button
          size="lg"
          variant="outline"
          className="w-full sm:w-auto glass-panel border-white/[0.08] hover:border-white/[0.2] hover:bg-white/[0.02] text-white hover:text-white font-semibold text-base px-8 py-6 rounded-xl transition-all duration-300 group cursor-pointer"
        >
          <Play className="w-4 h-4 fill-white text-white group-hover:scale-110 transition-transform" />
          Start Free Trial
        </Button>
      </motion.div>

      {/* Stat Cards */}
      <StatCards />
    </div>
  );
}
