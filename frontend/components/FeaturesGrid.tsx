"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Zap,
  Globe2,
  Sliders,
  FileText,
  Volume2,
  Activity,
  Server,
  Sparkles,
} from "lucide-react";

export default function FeaturesGrid() {
  const [latency, setLatency] = useState(1.48);

  useEffect(() => {
    const timer = setInterval(() => {
      // Simulating a tiny real-time variance in low-latency processing
      setLatency(Number((1.2 + Math.random() * 0.45).toFixed(2)));
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const languages = [
    "Spanish",
    "Japanese",
    "German",
    "Mandarin",
    "French",
    "Hindi",
    "Korean",
    "Italian",
    "Arabic",
    "Portuguese",
    "Turkish",
  ];

  return (
    <section id="features" className="relative py-28 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-electric-blue/10 border border-electric-blue/20 text-xs font-semibold text-electric-blue mb-4"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Cutting Edge Audio Technologies
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4"
          >
            Fully Integrated Enterprise Suite
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-zinc-400 text-base sm:text-lg"
          >
            Engineered with raw speed and precision. Connect our AI audio nodes to your event, and translate live conversations immediately.
          </motion.p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Card 1: 1-3s Ultra Low Latency (5 Columns) */}
          <div className="md:col-span-5 glass-panel border-white/[0.05] p-8 rounded-2xl flex flex-col justify-between overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-electric-blue/10 rounded-full blur-[40px] pointer-events-none -z-10 group-hover:scale-110 transition-transform duration-500" />
            <div>
              <div className="w-10 h-10 rounded-xl bg-electric-blue/10 border border-electric-blue/20 flex items-center justify-center mb-6">
                <Zap className="w-5 h-5 text-electric-blue" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">1–3 Second Latency</h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                Sub-second audio ingestion and instant neural speech output, ensuring your international streams sync perfectly with video frames.
              </p>
            </div>
            
            {/* Interactive Live Speed Ticker Mockup */}
            <div className="bg-zinc-950/80 rounded-xl border border-white/[0.04] p-4 flex items-center justify-between shadow-2xl">
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-0.5">Active Ingest Delay</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-mono font-black text-white tracking-tighter">
                    {latency}
                  </span>
                  <span className="text-xs font-bold text-electric-blue">sec</span>
                </div>
              </div>
              <div className="flex flex-col gap-1 items-end">
                <span className="text-[9px] uppercase font-extrabold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 animate-pulse">
                  OPTIMAL
                </span>
                <span className="text-[10px] font-mono text-zinc-500">Node: us-east-1</span>
              </div>
            </div>
          </div>

          {/* Card 2: Multilingual Support (7 Columns) */}
          <div className="md:col-span-7 glass-panel border-white/[0.05] p-8 rounded-2xl flex flex-col justify-between overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-40 h-40 bg-accent-purple/10 rounded-full blur-[50px] pointer-events-none -z-10 group-hover:scale-110 transition-transform duration-500" />
            <div>
              <div className="w-10 h-10 rounded-xl bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center mb-6">
                <Globe2 className="w-5 h-5 text-accent-purple" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Multilingual Support</h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                Translate across 50+ languages simultaneously. Automatically detect incoming regional accents and optimize speech models for dialects.
              </p>
            </div>
            
            {/* Interactive Floating Badge Cloud */}
            <div className="flex flex-wrap gap-2 py-2">
              {languages.map((lang, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-zinc-950/70 border border-white/[0.05] text-zinc-300 hover:text-white hover:border-electric-blue/40 hover:shadow-[0_0_12px_rgba(0,212,255,0.1)] transition-all duration-300 cursor-default"
                >
                  {lang}
                </span>
              ))}
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-electric-blue/20 to-accent-purple/20 border border-white/[0.08] text-white">
                +40 More
              </span>
            </div>
          </div>

          {/* Card 3: Event-Ready Audio Integration (4 Columns) */}
          <div className="md:col-span-4 glass-panel border-white/[0.05] p-8 rounded-2xl flex flex-col justify-between overflow-hidden relative group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6">
                <Sliders className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Event-Ready Audio</h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                Seamless ingestion with Dante, SRT, RTMP, and high-fidelity XLR stage sound systems. Keep professional noise-gated channels.
              </p>
            </div>

            {/* Simulated Mixer Desk Slider Controls */}
            <div className="bg-zinc-950/60 rounded-xl border border-white/[0.04] p-4 flex flex-col gap-3">
              {[
                { label: "Main Input Gain", value: "85%", slider: 85, color: "bg-electric-blue" },
                { label: "AI Denoise Filter", value: "92%", slider: 92, color: "bg-accent-purple" },
              ].map((slider, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400">
                    <span>{slider.label}</span>
                    <span className="font-mono">{slider.value}</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-white/[0.03]">
                    <div className={`h-full ${slider.slider === 85 ? "w-[85%]" : "w-[92%]"} ${slider.color} rounded-full`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 4: Realtime Captions (4 Columns) */}
          <div className="md:col-span-4 glass-panel border-white/[0.05] p-8 rounded-2xl flex flex-col justify-between overflow-hidden relative group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6">
                <FileText className="w-5 h-5 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Realtime Captions</h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                Broadcast-grade, fully compliant closed caption overlays in WebVTT or SRT formats for custom video players and OBS.
              </p>
            </div>

            {/* Captions Feed Ticker Simulator */}
            <div className="bg-zinc-950/60 rounded-xl border border-white/[0.04] p-3 shadow-inner">
              <div className="h-14 font-sans text-xs text-zinc-400 flex flex-col justify-between select-none leading-relaxed">
                <div>
                  <span className="text-zinc-600 font-bold mr-1">00:14.02:</span>
                  <span className="text-zinc-300">"This system handles captions</span>{" "}
                  <span className="text-white font-extrabold bg-electric-blue/20 rounded px-0.5">instantly</span>
                </div>
                <div className="text-zinc-500 text-[10px] font-mono flex items-center gap-1.5 mt-2">
                  <span className="h-2 w-2 bg-indigo-400 rounded-full animate-pulse" />
                  SRT BROADCAST INJECTOR ACTIVE
                </div>
              </div>
            </div>
          </div>

          {/* Card 5: AI Voice Synthesis (4 Columns) */}
          <div className="md:col-span-4 glass-panel border-white/[0.05] p-8 rounded-2xl flex flex-col justify-between overflow-hidden relative group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mb-6">
                <Volume2 className="w-5 h-5 text-pink-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">AI Voice Synthesis</h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                Neural output with zero-shot cloning. Preserve original speaking velocity, inflection, pitch, and emotional timbre perfectly.
              </p>
            </div>

            {/* Rotating Synthesis Modulator Wave */}
            <div className="bg-zinc-950/60 rounded-xl border border-white/[0.04] p-3 flex items-center justify-center">
              <div className="flex items-center gap-1 h-12 w-full px-4">
                {[20, 45, 15, 60, 80, 50, 95, 30, 75, 40, 20, 65, 80, 35, 10, 55, 90, 45].map((height, idx) => (
                  <span
                    key={idx}
                    className="flex-1 bg-gradient-to-t from-pink-500 to-accent-purple rounded-full h-1"
                    style={{
                      height: `${height}%`,
                      transformOrigin: "center",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Card 6: Enterprise Dashboard (6 Columns) */}
          <div className="md:col-span-6 glass-panel border-white/[0.05] p-8 rounded-2xl flex flex-col justify-between overflow-hidden relative group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
                <Activity className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Enterprise Dashboard</h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                Monitor audio metrics, language usage statistics, billing budgets, and node connectivity states dynamically inside our analytics system.
              </p>
            </div>

            {/* Dashboard Graphical Elements */}
            <div className="bg-zinc-950/70 rounded-xl border border-white/[0.04] p-4 flex gap-4">
              <div className="flex-1 flex flex-col justify-between">
                <span className="text-[9px] uppercase font-bold text-zinc-500">Live Streams</span>
                <span className="text-lg font-black text-white font-mono">148,829 <span className="text-[10px] text-zinc-500">concurrent</span></span>
                <div className="h-6 flex items-end gap-1 pt-1.5">
                  {[20, 40, 35, 60, 50, 80, 95, 75].map((val, i) => (
                    <span key={i} className="flex-1 bg-emerald-500/30 rounded-t" style={{ height: `${val}%` }} />
                  ))}
                </div>
              </div>
              <div className="w-[1px] bg-white/[0.08]" />
              <div className="flex-1 flex flex-col justify-between">
                <span className="text-[9px] uppercase font-bold text-zinc-500">Node Load</span>
                <span className="text-lg font-black text-emerald-400 font-mono">24%</span>
                <div className="text-[9px] text-zinc-500 leading-tight">All clusters online. Multi-region replica sync healthy.</div>
              </div>
            </div>
          </div>

          {/* Card 7: Scalable Cloud Infrastructure (6 Columns) */}
          <div className="md:col-span-6 glass-panel border-white/[0.05] p-8 rounded-2xl flex flex-col justify-between overflow-hidden relative group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6">
                <Server className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Scalable Infrastructure</h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                Distributed translation nodes across AWS, GCP, and Cloudflare Edge. Automatic load balancers route speech seamlessly to the closest cluster.
              </p>
            </div>

            {/* Graphical Cloud Diagram mock */}
            <div className="bg-zinc-950/70 rounded-xl border border-white/[0.04] p-4 flex items-center justify-between">
              <div className="flex gap-2 items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-mono font-bold text-zinc-300">Cluster: multi-edge-v4</span>
              </div>
              <div className="flex gap-1.5">
                {["US", "EU", "AP", "SA"].map((region, i) => (
                  <span
                    key={i}
                    className="text-[9px] font-mono px-2 py-0.5 bg-white/[0.04] border border-white/[0.06] rounded text-zinc-400"
                  >
                    {region}: OK
                  </span>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
