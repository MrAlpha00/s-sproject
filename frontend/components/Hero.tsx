"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Play, Cpu, ShieldAlert, Sparkles, Mic } from "lucide-react";
import { Button } from "./ui/button";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-20 overflow-hidden px-6">
      {/* Background Neon Glow Overlay */}
      <div className="absolute inset-0 glow-overlay-blue pointer-events-none -z-15" />
      <div className="absolute inset-0 glow-overlay-purple pointer-events-none -z-15" />
      
      {/* Decorative Grid Lines */}
      <div className="absolute inset-0 grid-bg opacity-[0.15] pointer-events-none -z-10" />

      {/* Floating Glowing Spheres */}
      <div className="absolute top-[25%] left-[10%] w-[300px] h-[300px] bg-electric-blue/10 rounded-full blur-[80px] animate-pulse-slow pointer-events-none -z-10" />
      <div className="absolute bottom-[20%] right-[10%] w-[300px] h-[300px] bg-accent-purple/10 rounded-full blur-[80px] animate-pulse-slow pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto text-center flex flex-col items-center z-10">
        {/* Animated Pill Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border-white/[0.08] shadow-[0_0_15px_rgba(0,212,255,0.05)] hover:border-electric-blue/30 hover:shadow-[0_0_20px_rgba(0,212,255,0.15)] transition-all duration-300 mb-8 cursor-pointer group"
        >
          <span className="flex h-2 w-2 rounded-full bg-electric-blue animate-ping" />
          <span className="text-xs font-semibold tracking-wider text-zinc-300 uppercase flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-electric-blue" />
            Live Speech Synthesis v3.2 Available
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-1 group-hover:text-white transition-all duration-300" />
        </motion.div>

        {/* Hero Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1] mb-6 max-w-4xl"
        >
          Real-Time AI Speech
          <span className="block bg-clip-text text-transparent bg-gradient-to-r from-electric-blue via-accent-purple to-purple-400 font-black drop-shadow-[0_0_30px_rgba(0,212,255,0.15)]">
            Translation for Live Events
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-lg sm:text-xl text-zinc-400 max-w-2xl mb-10 leading-relaxed"
        >
          Translate speeches instantly into multiple languages with AI-powered voice output and realtime event infrastructure. Built for enterprise keynotes, broadcasts, and global webinars.
        </motion.p>

        {/* Call to Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center gap-4 mb-16 w-full sm:w-auto"
        >
          {/* Primary CTA */}
          <Button
            asChild
            size="lg"
            className="w-full sm:w-auto bg-gradient-to-r from-electric-blue to-accent-purple hover:from-electric-blue/90 hover:to-accent-purple/90 text-white font-bold text-base px-8 py-6 rounded-xl shadow-[0_0_30px_rgba(0,212,255,0.25)] hover:shadow-[0_0_40px_rgba(0,212,255,0.4)] transition-all duration-300 group cursor-pointer"
          >
            <a href="#cta">
              Book Demo
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </Button>

          {/* Secondary CTA */}
          <Button
            asChild
            size="lg"
            variant="outline"
            className="w-full sm:w-auto glass-panel border-white/[0.08] hover:border-white/[0.2] hover:bg-white/[0.02] text-white hover:text-white font-semibold text-base px-8 py-6 rounded-xl transition-all duration-300 group cursor-pointer"
          >
            <a href="#pricing" className="flex items-center gap-2">
              <Play className="w-4 h-4 fill-white text-white group-hover:scale-110 transition-transform" />
              Start Free Trial
            </a>
          </Button>
        </motion.div>

        {/* Hero Interactive Console Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
          className="w-full max-w-4xl glass-panel rounded-2xl border-white/[0.08] p-1.5 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative group"
        >
          {/* Glowing Border effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-electric-blue/20 to-accent-purple/20 rounded-2xl blur-md opacity-50 group-hover:opacity-80 transition-opacity duration-500 pointer-events-none -z-10" />

          {/* Mock Console Layout */}
          <div className="bg-black/85 rounded-xl border border-white/[0.04] p-4 sm:p-6 text-left">
            {/* Top Header Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/[0.06] pb-4 mb-4 gap-3">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500/80" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <span className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="h-4 w-[1px] bg-white/[0.08]" />
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  LIVE STREAM FEED: KEYNOTE_ROOM_B
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.06] px-3 py-1 rounded-md text-xs font-medium text-zinc-300">
                <Cpu className="w-3.5 h-3.5 text-electric-blue" />
                Latency: <span className="text-electric-blue font-bold">1.42s</span>
              </div>
            </div>

            {/* Simulated Live UI Content */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Left Side: Waveform & Audio Profile */}
              <div className="md:col-span-4 bg-zinc-950/60 rounded-lg p-4 border border-white/[0.04]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                    <Mic className="w-4 h-4 text-electric-blue" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-300">Elena Rostova</div>
                    <div className="text-[10px] text-zinc-500">Keynote Speaker • English</div>
                  </div>
                </div>

                {/* Waveform Generator Mockup */}
                <div className="h-16 flex items-end justify-between gap-[3px] py-1">
                  {[30, 60, 45, 90, 75, 40, 60, 85, 100, 70, 50, 80, 95, 60, 45, 80].map((height, i) => (
                    <span
                      key={i}
                      className="flex-1 bg-gradient-to-t from-electric-blue/30 to-electric-blue rounded-full min-h-[4px]"
                      style={{
                        height: `${height * 0.6}%`,
                        animation: `hero-wave ${1.5 + (i % 3) * 0.3}s ease-in-out infinite`,
                        animationDelay: `${i * 0.08}s`,
                      }}
                    />
                  ))}
                </div>
                <div className="text-[10px] text-zinc-500 text-center mt-3 font-mono">AUDIO ENGINE NOMINAL • 48KHZ BUFFER</div>
              </div>

              {/* Right Side: Translation Feed */}
              <div className="md:col-span-8 flex flex-col gap-3">
                <div className="bg-zinc-950/60 rounded-lg p-3 border border-white/[0.04] relative">
                  <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-1">Speaker Source Speech</div>
                  <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                    "Welcome everyone. Today we are launching the next generation of real-time speech systems, allowing instant global connections without any language barriers."
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-electric-blue/[0.02] border border-electric-blue/15 rounded-lg p-3 relative shadow-[inset_0_0_15px_rgba(0,212,255,0.02)]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] uppercase font-extrabold text-electric-blue tracking-wider">Spanish Neural Out</span>
                      <span className="text-[9px] text-zinc-500 font-mono">1.2s delay</span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      "Bienvenidos a todos. Hoy estamos lanzando la próxima generación de sistemas de voz en tiempo real, permitiendo conexiones globales instantáneas..."
                    </p>
                  </div>

                  <div className="bg-accent-purple/[0.02] border border-accent-purple/15 rounded-lg p-3 relative shadow-[inset_0_0_15px_rgba(175,64,255,0.02)]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] uppercase font-extrabold text-accent-purple tracking-wider">Japanese Neural Out</span>
                      <span className="text-[9px] text-zinc-500 font-mono">1.35s delay</span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed font-mono">
                      「皆さん、ようこそ。本日私たちは次世代のリアルタイム音声システムをローンチし、言語の壁を越えた瞬時のグローバル接続を実現します...」
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      <style>{`
        @keyframes hero-wave {
          0%, 100% { height: 30%; }
          50% { height: 100%; }
        }
      `}</style>
    </section>
  );
}
