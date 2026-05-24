"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Presentation, Calendar, Video, Laptop, Gamepad } from "lucide-react";

interface UseCase {
  id: string;
  tabLabel: string;
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  benefits: string[];
  mockupTitle: string;
  mockupDetails: {
    label: string;
    value: string;
  }[];
  accentColor: string;
}

export default function UseCases() {
  const useCases: UseCase[] = [
    {
      id: "keynotes",
      tabLabel: "Stage Keynotes",
      icon: Presentation,
      title: "Mainstage Multi-Lingual Broadcasts",
      description: "Deliver massive global keynotes where thousands of on-site and remote attendees can tune into high-fidelity translated voice clones instantly in their native languages.",
      benefits: [
        "Duplicate the original speaker's vocal timbre and pitch signature.",
        "Zero-latency translation nodes sync perfectly with big-screen video.",
        "High-definition analog output integrates into stage sound boards.",
      ],
      mockupTitle: "STAGE CONTROLLER (KEYNOTE)",
      mockupDetails: [
        { label: "Channel Latency", value: "1.15s (Optimal)" },
        { label: "Mainstage Output", value: "48kHz Dante Feed" },
        { label: "Active Clones", value: "Aria Winters (HD)" },
      ],
      accentColor: "from-electric-blue to-cyan-500",
    },
    {
      id: "webinars",
      tabLabel: "Global Webinars",
      icon: Calendar,
      title: "Interactive Virtual Summits & Webinars",
      description: "Scale virtual events, panels, and digital Q&As across standard web platforms. Remote audiences ask questions and hear speakers dynamically translate in real time.",
      benefits: [
        "Direct integration with Zoom, Teams, Webex, and custom stream players.",
        "Simultaneously translate panels containing up to 10 active speakers.",
        "Secure enterprise streams with military-grade transport encryption.",
      ],
      mockupTitle: "STREAM INGEST (WEBINAR)",
      mockupDetails: [
        { label: "Zoom SRT Link", value: "Connected" },
        { label: "Active Speakers", value: "4 Concurrent Panels" },
        { label: "Replica Sync", value: "Global (12 clusters)" },
      ],
      accentColor: "from-accent-purple to-purple-500",
    },
    {
      id: "gaming",
      tabLabel: "Esports & Streams",
      icon: Gamepad,
      title: "Ultra Low-Latency Esports Broadcasts",
      description: "Engage international esports fanbases instantly. Translate high-energy shoutcasting streams into global languages without losing the emotional excitement of the play-by-play.",
      benefits: [
        "Adapt speech synthesis profiles to match shouting and casting energies.",
        "Broadcast-ready closed captions sync with live stream overlay templates.",
        "Supports dynamic game-audio ducking features inside OBS mixer.",
      ],
      mockupTitle: "MIXER DESK (SHOUTCAST)",
      mockupDetails: [
        { label: "Shoutcast Gain", value: "-3dB (Autoducked)" },
        { label: "OBS SRT Output", value: "Ready (RTMP Active)" },
        { label: "Target Accent", value: "High-Energy Spanish" },
      ],
      accentColor: "from-amber-400 to-orange-500",
    },
    {
      id: "meetings",
      tabLabel: "Corporate Meetings",
      icon: Laptop,
      title: "Seamless Internal Global Collaboration",
      description: "Enable cross-border corporate teams to communicate transparently. Conduct live quarterly business reviews and technical syncs with multilingual audio streams.",
      benefits: [
        "Zero-configuration calendar invites link directly to translation rooms.",
        "Generates automated summaries and transcripts in all languages.",
        "Enterprise access management ensures strict privacy controls.",
      ],
      mockupTitle: "COLLAB NODE (ENTERPRISE)",
      mockupDetails: [
        { label: "SSO Validation", value: "OK (Active Direct)" },
        { label: "Transcripts", value: "Saved to cloud-secure" },
        { label: "Live Dial-In", value: "14 Global Offices" },
      ],
      accentColor: "from-emerald-400 to-teal-500",
    },
  ];

  const [activeTab, setActiveTab] = useState(useCases[0]);

  const barHeights = useMemo(
    () => Array.from({ length: 18 }, (_, i) => `${Math.max(8, Math.round(25 + Math.sin(i * 0.8 + 0.5) * 55))}%`),
    []
  );

  return (
    <section id="usecases" className="relative py-28 px-6 bg-black/45 border-t border-b border-white/[0.04] overflow-hidden">
      {/* Soft ambient background glows */}
      <div className="absolute top-[35%] left-[5%] w-[300px] h-[300px] bg-electric-blue/5 rounded-full blur-[80px] pointer-events-none -z-10" />
      <div className="absolute bottom-[35%] right-[5%] w-[300px] h-[300px] bg-accent-purple/5 rounded-full blur-[80px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
            Built for Enterprise Event Scales
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base">
            From single-speaker executive keynotes to multi-caster esports broadcasts. Discover how AetherVOX power channels.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex justify-center mb-12">
          <div className="glass-panel border-white/[0.05] p-1.5 rounded-xl flex gap-1 sm:gap-2 flex-wrap sm:flex-nowrap justify-center">
            {useCases.map((useCase) => {
              const TabIcon = useCase.icon;
              return (
                <button
                  key={useCase.id}
                  onClick={() => setActiveTab(useCase)}
                  className={`px-4 sm:px-5 py-2.5 rounded-lg text-xs font-bold transition-all duration-300 flex items-center gap-2 ${
                    activeTab.id === useCase.id
                      ? "bg-gradient-to-r from-electric-blue/20 to-accent-purple/20 border border-electric-blue/30 text-white shadow-[0_0_15px_rgba(0,212,255,0.08)]"
                      : "bg-transparent border border-transparent text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <TabIcon className="w-4 h-4" />
                  {useCase.tabLabel}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab content panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch"
          >
            {/* Left Col: Description & Benefits (7 Columns) */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-4 tracking-tight leading-tight">
                  {activeTab.title}
                </h3>
                <p className="text-zinc-400 text-sm sm:text-base leading-relaxed mb-8">
                  {activeTab.description}
                </p>

                <div className="flex flex-col gap-4 mb-8">
                  {activeTab.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-electric-blue/10 border border-electric-blue/20 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 text-electric-blue" />
                      </div>
                      <span className="text-sm font-semibold text-zinc-300 leading-relaxed">
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Col: Graphical Mockup Card (5 Columns) */}
            <div className="lg:col-span-5 flex items-center justify-center">
              <div className="w-full glass-panel border-white/[0.05] rounded-2xl p-6 relative overflow-hidden group shadow-2xl">
                {/* Glow border based on accent color */}
                <div className={`absolute inset-0 bg-gradient-to-r ${activeTab.accentColor} opacity-5 blur-md pointer-events-none rounded-2xl`} />

                {/* Mock UI Control Panel */}
                <div className="bg-black/90 rounded-xl border border-white/[0.04] p-4 text-left">
                  <div className="flex items-center justify-between border-b border-white/[0.05] pb-3 mb-4">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase font-mono tracking-widest">
                      {activeTab.mockupTitle}
                    </span>
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                  </div>

                  <div className="flex flex-col gap-4 mb-4">
                    {activeTab.mockupDetails.map((detail, index) => (
                      <div key={index} className="flex justify-between items-center bg-zinc-950/60 rounded-lg p-3 border border-white/[0.03]">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase">{detail.label}</span>
                        <span className="text-xs font-mono font-bold text-white">{detail.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Visual simulated monitor graph */}
                  <div className="h-10 bg-zinc-950/60 rounded-lg border border-white/[0.03] p-2 flex items-end justify-between gap-1 overflow-hidden">
                    {barHeights.map((height, i) => (
                      <span
                        key={i}
                        className={`flex-1 rounded-t-sm min-h-[4px] bg-gradient-to-t ${activeTab.accentColor}`}
                        style={{ height }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  );
}
