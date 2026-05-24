"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  Play, 
  Sparkles, 
  Languages, 
  Activity, 
  Globe, 
  AudioLines,
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import { Button } from "./ui/button";
import WaveSculpture3D from "./WaveSculpture3D";

export default function PremiumHero() {
  // Stagger animation container properties
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
    },
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-[#060609] text-white overflow-hidden selection:bg-electric-blue/30 select-none">
      
      {/* Premium Cinematic Background Elements */}
      <div className="absolute inset-0 grid-bg opacity-[0.12] pointer-events-none -z-10" />
      
      {/* Glowing neon backdrops (Electric Blue & Purple) */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-electric-blue/5 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-accent-purple/5 blur-[130px] pointer-events-none -z-10" />
      <div className="absolute top-[30%] right-[20%] w-[400px] h-[400px] rounded-full bg-electric-blue/3 blur-[100px] pointer-events-none -z-10" />

      {/* 1. TOP BRAND ROW */}
      <header className="relative w-full z-50 border-b border-white/[0.04] bg-[#060609]/75 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-electric-blue to-accent-purple p-[1px] shadow-[0_0_15px_rgba(0,212,255,0.15)]">
              <div className="w-full h-full bg-[#060609] rounded-lg flex items-center justify-center">
                <Languages className="w-4.5 h-4.5 text-electric-blue group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-electric-blue to-accent-purple rounded-lg blur-sm opacity-40 group-hover:opacity-90 transition-opacity duration-300 -z-10" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white flex items-center">
              Aether
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-electric-blue to-accent-purple font-extrabold ml-[1px]">
                VOX
              </span>
            </span>
          </a>

          {/* Status / Version indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.05] bg-zinc-950/40 text-[11px] font-medium text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>v4.0 Alpha Live Feed</span>
          </div>

          {/* Header Action */}
          <div className="flex items-center gap-4">
            <span className="hidden md:inline text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer mr-2">
              Enterprise Portal
            </span>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="glass-panel border-white/[0.06] hover:border-electric-blue/40 text-white font-medium hover:bg-white/[0.02] cursor-pointer"
            >
              <a href="#demo-section">
                Book Demo
              </a>
            </Button>
          </div>
        </div>
      </header>

      {/* 2. MAIN HERO SECTION CONTENT */}
      <main className="flex-1 flex items-center relative z-10 max-w-7xl mx-auto px-6 py-12 md:py-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center w-full">
          
          {/* LEFT COLUMN: Content Panel */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-7 flex flex-col justify-center text-left"
          >
            {/* Animated Pill Badge */}
            <motion.div
              variants={itemVariants}
              className="self-start inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border-white/[0.06] shadow-[0_0_15px_rgba(0,212,255,0.02)] hover:border-electric-blue/30 transition-all duration-300 mb-6 group cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-electric-blue animate-pulse" />
              <span className="text-[11px] font-bold tracking-wider text-zinc-300 uppercase">
                AI Live Speech Translation Infrastructure
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:translate-x-0.5 transition-transform" />
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.08] mb-6"
            >
              Multilingual Live
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-electric-blue via-accent-purple to-purple-400 font-black drop-shadow-[0_0_35px_rgba(0,212,255,0.18)]">
                Translation for Events
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg text-zinc-400 max-w-xl mb-10 leading-relaxed font-medium"
            >
              Translate keynotes, broadcasts, and global summits in real-time with sub-second neural latency. Connect custom SDI, NDI, or XLR hardware directly to our low-level AI speech synthesis core.
            </motion.p>

            {/* Call to Action Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center gap-4 mb-16 w-full sm:w-auto"
            >
              {/* API Connection Hook note:
                  Future integration: Hook up onClick handler to trigger demo-registration modal or Supabase auth flow.
              */}
              <Button
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-electric-blue to-accent-purple hover:from-electric-blue/90 hover:to-accent-purple/90 text-black font-bold text-sm px-7 py-5.5 rounded-xl shadow-[0_0_25px_rgba(0,212,255,0.15)] hover:shadow-[0_0_35px_rgba(0,212,255,0.3)] hover:-translate-y-[1px] transition-all duration-300 group cursor-pointer"
                onClick={() => {
                  console.log("Future API / Supabase integration: Book Demo triggered");
                }}
              >
                Book Demo
                <ArrowRight className="w-4 h-4 ml-1.5 text-black group-hover:translate-x-1 transition-transform" />
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto glass-panel border-white/[0.08] hover:border-white/[0.18] hover:bg-white/[0.02] text-white hover:text-white font-semibold text-sm px-7 py-5.5 rounded-xl hover:-translate-y-[1px] transition-all duration-300 group cursor-pointer"
                onClick={() => {
                  console.log("Future API / Supabase integration: Start Free Trial triggered");
                }}
              >
                <Play className="w-3.5 h-3.5 fill-white text-white mr-2 group-hover:scale-110 transition-transform" />
                Start Free Trial
              </Button>
            </motion.div>

            {/* 3. SMALL TRUST / STAT CARDS UNDER HERO */}
            {/* API Connection Hook note:
                Future integration: These statistics can be loaded dynamically from Supabase database variables
                or a local caching endpoint to display actual realtime network load/language presets.
            */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full"
            >
              {/* Stat 1: Latency */}
              <div className="glass-panel rounded-xl border-white/[0.04] p-4 hover:border-electric-blue/20 hover:bg-zinc-900/40 transition-all duration-300 relative group overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-electric-blue/2 rounded-full blur-xl pointer-events-none" />
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="p-1.5 rounded-lg bg-electric-blue/10 border border-electric-blue/10">
                    <Activity className="w-4 h-4 text-electric-blue" />
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Latency Peak</span>
                </div>
                <div className="text-2xl font-extrabold text-white tracking-tight">1–3s</div>
                <div className="text-[10px] text-zinc-400 mt-1 font-medium flex items-center gap-1">
                  <span className="h-1 w-1 rounded-full bg-emerald-500" />
                  Sub-second neural sync
                </div>
              </div>

              {/* Stat 2: Languages */}
              <div className="glass-panel rounded-xl border-white/[0.04] p-4 hover:border-accent-purple/20 hover:bg-zinc-900/40 transition-all duration-300 relative group overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-accent-purple/2 rounded-full blur-xl pointer-events-none" />
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="p-1.5 rounded-lg bg-accent-purple/10 border border-accent-purple/10">
                    <Globe className="w-4 h-4 text-accent-purple" />
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Multilingual</span>
                </div>
                <div className="text-2xl font-extrabold text-white tracking-tight">50+</div>
                <div className="text-[10px] text-zinc-400 mt-1 font-medium">
                  Dialects & accents preset
                </div>
              </div>

              {/* Stat 3: Audio Integration */}
              <div className="glass-panel rounded-xl border-white/[0.04] p-4 hover:border-electric-blue/20 hover:bg-zinc-900/40 transition-all duration-300 relative group overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-electric-blue/2 rounded-full blur-xl pointer-events-none" />
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="p-1.5 rounded-lg bg-electric-blue/10 border border-electric-blue/10">
                    <AudioLines className="w-4 h-4 text-electric-blue" />
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Audio Sync</span>
                </div>
                <div className="text-[15px] font-bold text-white tracking-tight leading-tight pt-1">
                  Enterprise Integration
                </div>
                <div className="text-[10px] text-zinc-400 mt-1 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-electric-blue" />
                  SDI / NDI / XLR ready
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* RIGHT COLUMN: 3D Waveform Visual Panel */}
          <div className="lg:col-span-5 relative w-full flex items-center justify-center">
            {/* Glowing orbital border backdrop card */}
            <div className="relative w-full max-w-lg glass-panel rounded-2xl border-white/[0.06] p-2 shadow-[0_0_50px_rgba(0,0,0,0.6)] group">
              <div className="absolute inset-0 bg-gradient-to-tr from-electric-blue/15 via-[#060609]/0 to-accent-purple/15 rounded-2xl blur-md opacity-60 group-hover:opacity-100 transition-opacity duration-500 -z-10 pointer-events-none" />
              
              {/* Dynamic 3D Waveform Component */}
              <div className="w-full bg-[#060609]/90 rounded-xl border border-white/[0.04] overflow-hidden">
                <WaveSculpture3D />
              </div>
            </div>
          </div>

        </div>
      </main>

    </div>
  );
}
