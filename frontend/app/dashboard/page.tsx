import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import {
  Languages,
  Mic,
  BarChart3,
  Calendar,
  ArrowUpRight,
  Globe,
  Clock,
} from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const stats = [
    {
      label: "Events Created",
      value: "0",
      icon: Calendar,
      change: null,
    },
    {
      label: "Languages Used",
      value: "0",
      icon: Globe,
      change: null,
    },
    {
      label: "Minutes Translated",
      value: "0",
      icon: Clock,
      change: null,
    },
    {
      label: "Usage This Month",
      value: "0%",
      icon: BarChart3,
      change: null,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Welcome back, {user.user_metadata?.full_name ?? "User"}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-zinc-900/40 p-5 transition-all hover:border-white/[0.1] hover:bg-zinc-900/60"
            >
              <div className="flex items-start justify-between">
                <div className="rounded-lg bg-electric-blue/10 p-2.5 ring-1 ring-electric-blue/20">
                  <stat.icon className="h-4 w-4 text-electric-blue" />
                </div>
                {stat.change && (
                  <span className="flex items-center gap-0.5 text-xs font-medium text-emerald-400">
                    <ArrowUpRight className="h-3 w-3" />
                    {stat.change}
                  </span>
                )}
              </div>
              <p className="mt-4 text-2xl font-bold tracking-tight text-white">
                {stat.value}
              </p>
              <p className="mt-1 text-xs text-zinc-500">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white">
                Recent Events
              </h2>
              <span className="text-xs text-zinc-500">Today</span>
            </div>
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Mic className="mb-3 h-8 w-8 text-zinc-700" />
              <p className="text-sm text-zinc-500">No events yet</p>
              <p className="mt-1 text-xs text-zinc-600">
                Create your first translation event to get started
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white">
                Quick Actions
              </h2>
            </div>
            <div className="space-y-3">
              <button className="w-full rounded-lg border border-white/[0.06] bg-zinc-800/30 px-4 py-3 text-left text-sm text-zinc-300 transition-colors hover:bg-zinc-800/50 hover:text-white flex items-center gap-3">
                <Languages className="h-4 w-4 text-electric-blue" />
                New Translation Event
              </button>
              <button className="w-full rounded-lg border border-white/[0.06] bg-zinc-800/30 px-4 py-3 text-left text-sm text-zinc-300 transition-colors hover:bg-zinc-800/50 hover:text-white flex items-center gap-3">
                <Mic className="h-4 w-4 text-accent-purple" />
                Voice Cloning Lab
              </button>
              <button className="w-full rounded-lg border border-white/[0.06] bg-zinc-800/30 px-4 py-3 text-left text-sm text-zinc-300 transition-colors hover:bg-zinc-800/50 hover:text-white flex items-center gap-3">
                <BarChart3 className="h-4 w-4 text-emerald-400" />
                View Usage Analytics
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
