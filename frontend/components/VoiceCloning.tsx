"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Check, Play, Square, Sparkles, AudioLines, RefreshCcw } from "lucide-react";
import { Button } from "./ui/button";

interface Speaker {
  id: string;
  name: string;
  avatar: string;
  description: string;
  sampleText: string;
  metrics: {
    clarity: string;
    similarity: string;
    timbre: string;
  };
}

export default function VoiceCloning() {
  const speakers: Speaker[] = [
    {
      id: "aria",
      name: "Aria Winters",
      avatar: "AW",
      description: "Warm, professional keynote speaker tone.",
      sampleText: "Enterprise scaling requires robust real-time nodes and resilient pipeline integration.",
      metrics: { clarity: "99.2%", similarity: "98.8%", timbre: "Warm, Bright" },
    },
    {
      id: "marcus",
      name: "Marcus Thorne",
      avatar: "MT",
      description: "Deep, authoritative tech panel host.",
      sampleText: "We successfully processed forty streams globally with zero regional replica synchronization drift.",
      metrics: { clarity: "98.7%", similarity: "99.1%", timbre: "Resonant, Authoritative" },
    },
    {
      id: "elena",
      name: "Elena Rostova",
      avatar: "ER",
      description: "High-clarity presenter with neutral accent.",
      sampleText: "Surgical robotics integrated perfectly across Kyoto nodes with under fifty milliseconds of delay.",
      metrics: { clarity: "99.5%", similarity: "98.4%", timbre: "Articulate, Balanced" },
    },
  ];

  const [activeSpeaker, setActiveSpeaker] = useState<Speaker>(speakers[0]);
  const [isCloning, setIsCloning] = useState(false);
  const [cloneStep, setCloneStep] = useState(0);
  const [isPlayingClone, setIsPlayingClone] = useState(false);

  const cloneSteps = [
    "Analyzing input audio footprint...",
    "Extracting deep neural voice envelope...",
    "Configuring accent adaptation channels...",
    "Voice template successfully synchronized!",
  ];

  const startVoiceCloning = () => {
    setIsCloning(true);
    setCloneStep(0);
    setIsPlayingClone(false);

    const stepInterval = setInterval(() => {
      setCloneStep((prev) => {
        if (prev < cloneSteps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(stepInterval);
          setTimeout(() => {
            setIsCloning(false);
            setIsPlayingClone(true);
          }, 800);
          return prev;
        }
      });
    }, 1000);
  };

  const stopPlayback = () => {
    setIsPlayingClone(false);
  };

  return (
    <section id="voicelab" className="relative py-28 px-6 overflow-hidden">
      {/* Background Neon glows */}
      <div className="absolute top-[45%] right-0 w-[400px] h-[400px] bg-electric-blue/5 rounded-full blur-[80px] pointer-events-none -z-10" />
      <div className="absolute bottom-[20%] left-0 w-[400px] h-[400px] bg-accent-purple/5 rounded-full blur-[80px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Visual copy (5 Columns) */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-electric-blue/10 border border-electric-blue/20 text-xs font-semibold text-electric-blue mb-4 w-fit">
              <Mic className="w-3.5 h-3.5" />
              Voice Synthesis Lab
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-6">
              AI Voice Cloning & Zero-Shot Synthesis
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed mb-8">
              Maintain speaker brand identity globally. Our zero-shot neural cloning technology duplicates vocal profiles from just a three-second sample, allowing speakers to instantly deliver local speeches in multiple languages with their own natural voice inflection.
            </p>

            <ul className="flex flex-col gap-4 text-sm font-semibold text-zinc-300">
              {[
                "Preserves emotional timbre and vocal pitch patterns",
                "High-definition 48kHz neural synthesis output",
                "Multi-dialect accent leveling and tone mapping",
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-electric-blue/15 border border-electric-blue/30 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-electric-blue" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Right Column: Interactive voice cloning console (7 Columns) */}
          <div className="lg:col-span-7 glass-panel border-white/[0.05] rounded-2xl p-6 sm:p-8 relative shadow-2xl overflow-hidden group">
            {/* Pulsing grid shadow */}
            <div className="absolute inset-0 bg-gradient-to-br from-electric-blue/5 to-accent-purple/5 pointer-events-none rounded-2xl -z-10" />
            
            <div className="flex flex-col gap-6">
              {/* Speaker Select Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/[0.05] pb-4 gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">Vocal Profile Sync Console</h3>
                  <span className="text-[10px] text-zinc-500 font-mono">STATUS: CLONING ENGINE IDLE</span>
                </div>
                
                <div className="flex gap-2">
                  {speakers.map((spk) => (
                    <button
                      key={spk.id}
                      onClick={() => {
                        if (!isCloning) {
                          setActiveSpeaker(spk);
                          setIsPlayingClone(false);
                        }
                      }}
                      disabled={isCloning}
                      className={`px-3 py-1 rounded-md text-xs font-bold transition-all duration-200 ${
                        activeSpeaker.id === spk.id
                          ? "bg-electric-blue/10 border border-electric-blue/30 text-electric-blue"
                          : "bg-zinc-950 border border-white/[0.04] text-zinc-500 hover:text-zinc-300 disabled:opacity-50"
                      }`}
                    >
                      {spk.name.split(" ")[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sandbox Speaker Visual Card */}
              <div className="bg-zinc-950/80 rounded-xl border border-white/[0.04] p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-electric-blue to-accent-purple p-[1px] flex items-center justify-center shrink-0">
                  <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center font-bold text-sm text-white">
                    {activeSpeaker.avatar}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 gap-1">
                    <span className="text-sm font-bold text-white">{activeSpeaker.name}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">{activeSpeaker.metrics.timbre}</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed italic">
                    "{activeSpeaker.sampleText}"
                  </p>
                </div>
              </div>

              {/* Live Analyzer Circle Grid */}
              <div className="h-44 bg-zinc-950/60 rounded-xl border border-white/[0.03] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 grid-bg opacity-[0.05]" />
                
                {/* Circular Wave Analyzer Graphic */}
                <AnimatePresence mode="wait">
                  {isCloning ? (
                    <motion.div
                      key="cloning"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex flex-col items-center justify-center z-10"
                    >
                      {/* Circular loading node */}
                      <div className="relative w-20 h-20 flex items-center justify-center mb-3">
                        <div className="absolute inset-0 rounded-full border-4 border-white/[0.02]" />
                        <div className="absolute inset-0 rounded-full border-4 border-t-electric-blue border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                        <Mic className="w-6 h-6 text-electric-blue animate-pulse" />
                      </div>
                      <span className="text-xs text-zinc-400 font-mono font-bold animate-pulse text-center">
                        {cloneSteps[cloneStep]}
                      </span>
                    </motion.div>
                  ) : isPlayingClone ? (
                    <motion.div
                      key="playing"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center z-10 w-full px-8"
                    >
                      <div className="flex gap-1.5 items-center justify-center mb-4 h-16 w-full max-w-sm">
                        {Array.from({ length: 12 }).map((_, i) => (
                          <span
                            key={i}
                            className="flex-1 bg-gradient-to-t from-electric-blue to-accent-purple rounded-full min-h-[4px]"
                            style={{
                              animation: `vc-wave ${0.8 + (i % 4) * 0.2}s ease-in-out infinite`,
                              animationDelay: `${i * 0.12}s`,
                            }}
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-4 justify-between w-full border-t border-white/[0.04] pt-3">
                        <span className="text-[10px] text-zinc-500 font-mono uppercase">Vocal footprint synced</span>
                        <button
                          onClick={stopPlayback}
                          className="flex items-center gap-1 text-[10px] font-bold text-red-400 hover:text-red-300"
                        >
                          <Square className="w-3.5 h-3.5 fill-red-400" /> STOP PLAYBACK
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center z-10 text-center"
                    >
                      <AudioLines className="w-10 h-10 text-zinc-600 mb-2 group-hover:scale-110 transition-transform duration-300" />
                      <span className="text-xs text-zinc-500 font-bold mb-1">VOICE ENVELOPE SYNCHRONIZER</span>
                      <p className="text-[10px] text-zinc-600 max-w-[240px] leading-relaxed">
                        Clone speaker voice sample, generating fully dynamic synthetic voice parameters instantly.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button
                  onClick={startVoiceCloning}
                  disabled={isCloning || isPlayingClone}
                  className="w-full py-5 rounded-xl font-bold bg-white text-zinc-950 hover:bg-zinc-200 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-zinc-950" />
                  Synthesize Voice Profile
                </Button>
                
                <Button
                  onClick={() => {
                    setIsPlayingClone(false);
                    setIsCloning(false);
                  }}
                  variant="outline"
                  disabled={!isPlayingClone && !isCloning}
                  className="w-full py-5 rounded-xl font-semibold glass-panel border-white/[0.06] text-white hover:bg-white/[0.02] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <RefreshCcw className="w-4 h-4" />
                  Reset Sandbox
                </Button>
              </div>

              {/* Technical Profile Sync Details */}
              <div className="grid grid-cols-3 gap-2 border-t border-white/[0.05] pt-4 text-center">
                {[
                  { label: "Timbre Clarity", val: activeSpeaker.metrics.clarity },
                  { label: "Profile Similarity", val: activeSpeaker.metrics.similarity },
                  { label: "Accent Adaptation", val: "Ready (HD)" },
                ].map((stat, i) => (
                  <div key={i} className="flex flex-col gap-0.5">
                    <span className="text-[9px] uppercase font-bold text-zinc-500">{stat.label}</span>
                    <span className="text-xs font-mono font-bold text-zinc-200">{stat.val}</span>
                  </div>
                ))}
              </div>

            </div>
          </div>

        </div>
      </div>
      <style>{`
        @keyframes vc-wave {
          0%, 100% { height: 20%; }
          50% { height: 90%; }
        }
      `}</style>
    </section>
  );
}

