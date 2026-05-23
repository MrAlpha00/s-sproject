"use client";

import React, { useState } from "react";
import { ArrowRight, ShieldCheck, Clock, Zap } from "lucide-react";
import { Button } from "./ui/button";

export default function CTABanner() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail("");
    }
  };

  return (
    <section id="cta" className="relative py-24 px-6 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-r from-electric-blue/10 to-accent-purple/10 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute inset-0 grid-bg opacity-[0.04] pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto">
        <div className="glass-panel border-white/[0.05] rounded-3xl p-8 sm:p-12 relative overflow-hidden text-center group shadow-2xl">
          {/* Glowing accents */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-electric-blue/40 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-[150px] bg-accent-purple/5 rounded-full blur-[50px] pointer-events-none -z-10" />

          {/* Icon indicator */}
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-electric-blue/15 border border-electric-blue/30 text-electric-blue mb-8 animate-float">
            <Zap className="w-6 h-6 fill-electric-blue/20" />
          </div>

          {/* Heading */}
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            Deliver Multi-Lingual Broadcasts Today
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto mb-10 leading-relaxed">
            Experience sub-second, voice-cloned live audio translations. Connect your audio feed, choose your languages, and sync with your global audience immediately.
          </p>

          {/* Interactive Input Form */}
          <div className="max-w-md mx-auto mb-8">
            {submitted ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-emerald-400 text-sm font-bold animate-pulse">
                Thank you! Our solutions engineering team will reach out shortly.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter corporate email..."
                  required
                  className="flex-1 bg-zinc-950/80 border border-white/[0.06] rounded-xl px-4 py-3.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-electric-blue/50 focus:ring-1 focus:ring-electric-blue/40 transition-all duration-300"
                />
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-electric-blue to-accent-purple hover:from-electric-blue/90 hover:to-accent-purple/90 text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-[0_0_15px_rgba(0,212,255,0.15)] hover:shadow-[0_0_20px_rgba(0,212,255,0.3)] transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Book Ingest Demo
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </form>
            )}
          </div>

          {/* Trust Signals */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-[10px] sm:text-xs font-bold text-zinc-500 border-t border-white/[0.04] pt-8">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4.5 h-4.5 text-electric-blue" />
              All data encrypted under TLS 1.3
            </div>
            <div className="w-[1px] h-3 bg-white/[0.08] hidden sm:block" />
            <div className="flex items-center gap-2">
              <Clock className="w-4.5 h-4.5 text-accent-purple" />
              10-minute setup, zero hardware required
            </div>
            <div className="w-[1px] h-3 bg-white/[0.08] hidden sm:block" />
            <div className="flex items-center gap-2">
              <Zap className="w-4.5 h-4.5 text-amber-400" />
              99.9% Ingestion Uptime guarantee
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
