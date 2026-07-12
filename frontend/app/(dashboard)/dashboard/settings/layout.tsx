"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  Building2,
  Cpu,
  BrainCircuit,
  CreditCard,
  Lock,
  Cloud,
} from "lucide-react";

interface SettingsLayoutProps {
  children: ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const pathname = usePathname();

  const navItems = [
    {
      name: "General",
      href: "/dashboard/settings",
      icon: User,
    },
    {
      name: "Organization",
      href: "/dashboard/settings/organization",
      icon: Building2,
    },
    {
      name: "API Integrations",
      href: "/dashboard/settings/integrations",
      icon: Cpu,
    },
    {
      name: "Azure AI",
      href: "/dashboard/settings/azure",
      icon: Cloud,
    },
    {
      name: "ElevenLabs",
      href: "/dashboard/settings/elevenlabs",
      icon: BrainCircuit,
    },
    {
      name: "Billing",
      href: "/dashboard/settings/billing",
      icon: CreditCard,
    },
    {
      name: "Security",
      href: "/dashboard/settings/security",
      icon: Lock,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.04] bg-zinc-900/20 p-6 md:p-8">
        <div className="absolute -left-16 -top-16 h-36 w-36 rounded-full bg-electric-blue/5 blur-3xl pointer-events-none" />
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">Settings Console</h1>
        <p className="mt-1.5 text-xs md:text-sm text-zinc-400 font-medium">
          Calibrate workspace configurations, credential keys, billing invoices, and profiles.
        </p>
      </div>

      {/* Settings Grid */}
      <div className="grid gap-6 md:grid-cols-4 items-start">
        {/* Left Side: Settings Navigation */}
        <div className="md:col-span-1 rounded-xl border border-white/[0.06] bg-zinc-900/40 p-3 space-y-1">
          <span className="px-3 py-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">
            Sections
          </span>
          
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              const activeClass = isActive
                ? "bg-electric-blue/10 border-electric-blue/20 text-electric-blue font-semibold"
                : "border-transparent text-zinc-400 hover:bg-zinc-800/40 hover:text-white";

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-xs transition-colors ${activeClass}`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Side: Tab View Child Page */}
        <div className="md:col-span-3">
          {children}
        </div>
      </div>
    </div>
  );
}
