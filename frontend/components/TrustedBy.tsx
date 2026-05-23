"use client";

import React from "react";
import { motion } from "framer-motion";
import { Globe, Video, Radio, GraduationCap, Trophy } from "lucide-react";

export default function TrustedBy() {
  // Simulating modern high-profile enterprise partners
  const partners = [
    { name: "Vercel", logo: "VERCEL" },
    { name: "Stripe", logo: "stripe" },
    { name: "ElevenLabs", logo: "ElevenLabs" },
    { name: "Linear", logo: "Linear" },
    { name: "Figma", logo: "Figma" },
    { name: "Supabase", logo: "SUPABASE" },
    { name: "Retool", logo: "RETOOL" },
  ];

  const doublePartners = [...partners, ...partners];

  const eventTypes = [
    {
      title: "Global Keynotes",
      desc: "Instant voice overlays for thousands of live international attendees.",
      icon: Globe,
      color: "text-electric-blue",
      bgGlow: "group-hover:bg-electric-blue/10",
      borderGlow: "group-hover:border-electric-blue/40",
    },
    {
      title: "Enterprise Broadcasts",
      desc: "Sub-second broadcast captions and low latency neural streaming channels.",
      icon: Radio,
      color: "text-accent-purple",
      bgGlow: "group-hover:bg-accent-purple/10",
      borderGlow: "group-hover:border-accent-purple/40",
    },
    {
      title: "Virtual Webinars",
      desc: "Integrate directly into Zoom, Teams, and Webex with real-time audio cloning.",
      icon: Video,
      color: "text-purple-400",
      bgGlow: "group-hover:bg-purple-500/10",
      borderGlow: "group-hover:border-purple-500/40",
    },
    {
      title: "Global Academies",
      desc: "Simultaneously translate curriculum and live virtual lessons for global learning.",
      icon: GraduationCap,
      color: "text-emerald-400",
      bgGlow: "group-hover:bg-emerald-500/10",
      borderGlow: "group-hover:border-emerald-500/40",
    },
    {
      title: "Esports Broadcasts",
      desc: "Ultra low-latency audio translation for international shoutcasting streams.",
      icon: Trophy,
      color: "text-amber-400",
      bgGlow: "group-hover:bg-amber-500/10",
      borderGlow: "group-hover:border-amber-500/40",
    },
  ];

  return (
    <section className="relative py-24 bg-black/45 overflow-hidden border-t border-b border-white/[0.04]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Title */}
        <div className="text-center mb-10">
          <p className="text-xs font-bold tracking-widest text-zinc-500 uppercase">
            Powering Global Broadcasts & Live Audio Infrastructures
          </p>
        </div>

        {/* Ticker using Framer Motion */}
        <div className="relative w-full flex items-center overflow-hidden py-4 mask-gradient mb-20 pointer-events-none select-none">
          {/* Gradient Mask Overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-black to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-black to-transparent z-10" />

          <motion.div
            className="flex items-center gap-16 whitespace-nowrap min-w-full"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              ease: "linear",
              duration: 25,
              repeat: Infinity,
            }}
          >
            {doublePartners.map((partner, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors duration-300"
              >
                <span className="font-sans font-black tracking-tighter text-xl sm:text-2xl opacity-60 hover:opacity-100 transition-opacity">
                  {partner.logo}
                </span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scalable Event Types Grid */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-white tracking-tight mb-4">
            Engineered for Every Type of Event Scale
          </h2>
          <p className="text-zinc-400 text-sm">
            Whether broadcasting a single mainstage keynote globally or running hundreds of concurrent breakout workshops, our AI real-time translation scales on-demand.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {eventTypes.map((item, idx) => (
            <div
              key={idx}
              className={`group glass-panel border-white/[0.05] p-6 rounded-xl relative overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.4)] ${item.borderGlow}`}
            >
              {/* Glow overlay inside the card */}
              <div
                className={`absolute inset-0 bg-transparent rounded-xl transition-all duration-500 -z-10 ${item.bgGlow}`}
              />

              <div className="mb-4">
                <item.icon className={`w-8 h-8 ${item.color} group-hover:scale-110 transition-transform duration-300`} />
              </div>
              <h3 className="text-base font-bold text-white mb-2 tracking-tight">
                {item.title}
              </h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Custom Inline CSS for Mask Gradients */}
      <style jsx global>{`
        .mask-gradient {
          mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        }
      `}</style>
    </section>
  );
}
