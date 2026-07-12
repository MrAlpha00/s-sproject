import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/dashboard/StatCard";
import { ActionCard } from "@/components/dashboard/ActionCard";
import { StatusCard } from "@/components/dashboard/StatusCard";
import {
  Radio,
  Globe,
  Clock,
  BarChart3,
  Mic,
  Languages,
  ArrowRight,
} from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const fullName = user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "User";

  const stats = [
    {
      label: "Active Events",
      value: "0",
      icon: Radio,
      glowColor: "blue" as const,
    },
    {
      label: "Languages Used",
      value: "0",
      icon: Globe,
      glowColor: "emerald" as const,
    },
    {
      label: "Minutes Translated",
      value: "0",
      icon: Clock,
      glowColor: "purple" as const,
    },
    {
      label: "Monthly Usage",
      value: "0%",
      icon: BarChart3,
      glowColor: "amber" as const,
    },
  ];

  const systemServices = [
    { name: "Azure", status: "Pending" as const },
    { name: "ElevenLabs", status: "Pending" as const },
    { name: "Backend", status: "Pending" as const },
    { name: "Supabase", status: "Pending" as const },
  ];

  return (
    <div className="space-y-8">
      {/* Header Panel */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.04] bg-zinc-900/20 p-6 md:p-8">
        <div className="absolute -left-16 -top-16 h-36 w-36 rounded-full bg-electric-blue/5 blur-3xl pointer-events-none" />
        <div className="absolute -right-16 -bottom-16 h-36 w-36 rounded-full bg-accent-purple/5 blur-3xl pointer-events-none" />
        
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
          Welcome back, <span className="bg-clip-text text-transparent bg-gradient-to-r from-electric-blue via-accent-purple to-purple-400 font-extrabold">{fullName}</span>
        </h1>
        <p className="mt-1.5 text-xs md:text-sm text-zinc-400 font-medium">
          Monitor your real-time translation pipelines, manage neural voice clones, and view live broadcast statuses.
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            glowColor={stat.glowColor}
          />
        ))}
      </div>

      {/* Grid: Actions & Recent / System Status */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions (2/3 width on large screens) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-6">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Quick Actions
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <ActionCard
                title="Translation Studio"
                description="Launch real-time translation session"
                icon={Languages}
                href="/dashboard/translation"
                iconColor="blue"
              />
              <ActionCard
                title="Voice Cloning Lab"
                description="Manage voice signatures and training"
                icon={Mic}
                href="/dashboard/voices"
                iconColor="purple"
              />
              <ActionCard
                title="Analytics & Usage"
                description="View live usage and billing charts"
                icon={BarChart3}
                href="/dashboard/analytics"
                iconColor="amber"
              />
            </div>
          </div>

          {/* Recent Events Empty State */}
          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Recent Events
              </h2>
              <span className="text-[10px] font-semibold text-zinc-500 bg-white/[0.03] px-2 py-0.5 rounded border border-white/[0.04]">
                Today
              </span>
            </div>
            
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-950 border border-white/[0.06] text-zinc-600 mb-4 shadow-inner">
                <Radio className="h-5 w-5 animate-pulse" />
              </div>
              <h3 className="text-xs font-semibold text-zinc-300">No active events found</h3>
              <p className="mt-1 text-[11px] leading-relaxed text-zinc-500 max-w-xs">
                To start translating and streaming, create a new event in the Live Events page or Translation Studio.
              </p>
            </div>
          </div>
        </div>

        {/* System Status (1/3 width) */}
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              System Integrations
            </h2>
            <div className="space-y-3">
              {systemServices.map((service) => (
                <StatusCard
                  key={service.name}
                  serviceName={service.name}
                  status={service.status}
                />
              ))}
            </div>
          </div>

          <div className="mt-6 border-t border-white/[0.04] pt-4">
            <p className="text-[10px] text-zinc-500 leading-normal">
              Services are currently set to <span className="text-amber-400 font-semibold">Pending</span> as API integrations are being provisioned. Once configured, connections will transition dynamically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
