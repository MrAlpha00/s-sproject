"use client";

import React from "react";
import { Languages, ArrowRight } from "lucide-react";

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

          <div className="flex items-center gap-3">
            {/* Twitter / X Custom SVG */}
            <a
              href="#"
              className="w-8 h-8 rounded-lg bg-zinc-950 border border-white/[0.04] flex items-center justify-center text-zinc-500 hover:text-white hover:border-electric-blue/30 transition-all duration-300"
              aria-label="Twitter"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>

            {/* GitHub Custom SVG */}
            <a
              href="#"
              className="w-8 h-8 rounded-lg bg-zinc-950 border border-white/[0.04] flex items-center justify-center text-zinc-500 hover:text-white hover:border-electric-blue/30 transition-all duration-300"
              aria-label="GitHub"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
              </svg>
            </a>

            {/* LinkedIn Custom SVG */}
            <a
              href="#"
              className="w-8 h-8 rounded-lg bg-zinc-950 border border-white/[0.04] flex items-center justify-center text-zinc-500 hover:text-white hover:border-electric-blue/30 transition-all duration-300"
              aria-label="LinkedIn"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
