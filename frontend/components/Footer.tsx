"use client";

import React from "react";
import { Languages, Twitter, Github, Linkedin, ArrowRight } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: "Product",
      links: [
        { label: "Neural Translator", href: "#features" },
        { label: "Zero-Shot Cloner", href: "#voicelab" },
        { label: "Dante/SRT Nodes", href: "#features" },
        { label: "OBS Caption Plugin", href: "#features" },
        { label: "Developer SDKs", href: "#pricing" },
      ],
    },
    {
      title: "Solutions",
      links: [
        { label: "Mainstage Keynotes", href: "#usecases" },
        { label: "Corporate Webinars", href: "#usecases" },
        { label: "Gaming Broadcasts", href: "#usecases" },
        { label: "Multilingual Syncs", href: "#usecases" },
        { label: "Custom Clusters", href: "#pricing" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "API Reference", href: "#pricing" },
        { label: "Status Monitor", href: "#" },
        { label: "Latency Benchmark", href: "#" },
        { label: "Compliance Docs", href: "#" },
        { label: "Vocal Privacy Policy", href: "#" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About Us", href: "#" },
        { label: "Engineering Blog", href: "#" },
        { label: "Careers (Hiring)", href: "#" },
        { label: "Security Trust Hub", href: "#" },
        { label: "Contact Sales", href: "#cta" },
      ],
    },
  ];

  return (
    <footer className="relative bg-zinc-950 border-t border-white/[0.04] pt-20 pb-12 px-6 overflow-hidden">
      {/* Glow highlight */}
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-electric-blue/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-16">
          
          {/* Brand Col: Logo, text, system status (4 Columns) */}
          <div className="md:col-span-4 flex flex-col justify-between gap-6">
            <div>
              {/* Logo */}
              <a href="#" className="flex items-center gap-2 group mb-4 w-fit">
                <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-electric-blue to-accent-purple p-[1px] shadow-[0_0_10px_rgba(0,212,255,0.15)]">
                  <div className="w-full h-full bg-black rounded-lg flex items-center justify-center">
                    <Languages className="w-3.5 h-3.5 text-electric-blue group-hover:rotate-12 transition-transform duration-300" />
                  </div>
                </div>
                <span className="font-bold text-lg tracking-tight text-white flex items-center">
                  Aether
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-electric-blue to-accent-purple font-extrabold">
                    VOX
                  </span>
                </span>
              </a>
              
              <p className="text-zinc-500 text-xs leading-relaxed max-w-sm">
                Deliver ultra low-latency live speech translation. Powered by next-generation zero-shot neural voice cloning networks and scalable global cloud replicas.
              </p>
            </div>

            {/* Live Operational Status Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 w-fit">
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              ALL GLOBAL PROCESSING CLUSTERS OPERATIONAL
            </div>
          </div>

          {/* Links Grid: (8 Columns) */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {footerLinks.map((category, index) => (
              <div key={index} className="flex flex-col gap-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                  {category.title}
                </h4>
                <ul className="flex flex-col gap-2.5">
                  {category.links.map((link, idx) => (
                    <li key={idx}>
                      <a
                        href={link.href}
                        className="text-xs font-semibold text-zinc-500 hover:text-white transition-colors duration-200"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

        </div>

        {/* Footer Bottom: Rights, social icons, language */}
        <div className="flex flex-col sm:flex-row justify-between items-center border-t border-white/[0.05] pt-8 gap-4">
          <span className="text-[10px] sm:text-xs font-semibold text-zinc-500">
            © {currentYear} AetherVOX Inc. All rights reserved. Cloud replication networks compliant under GDPR & SOC-2.
          </span>

          <div className="flex items-center gap-4">
            {/* Social Link icons */}
            {[
              { icon: Twitter, href: "#" },
              { icon: Github, href: "#" },
              { icon: Linkedin, href: "#" },
            ].map((soc, index) => (
              <a
                key={index}
                href={soc.href}
                className="w-8 h-8 rounded-lg bg-zinc-950 border border-white/[0.04] flex items-center justify-center text-zinc-500 hover:text-white hover:border-electric-blue/30 transition-all duration-300"
              >
                <soc.icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}
