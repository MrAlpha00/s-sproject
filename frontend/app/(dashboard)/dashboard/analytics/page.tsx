import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.04] bg-zinc-900/20 p-6 md:p-8">
        <div className="absolute -left-16 -top-16 h-36 w-36 rounded-full bg-electric-blue/5 blur-3xl pointer-events-none" />
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">Analytics</h1>
        <p className="mt-1.5 text-xs md:text-sm text-zinc-400 font-medium">
          Track translation usage minutes, character counts, and language distribution trends.
        </p>
      </div>

      {/* Feature Placeholder */}
      <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-12 flex flex-col items-center justify-center text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-950 border border-white/[0.06] text-zinc-500 mb-4 shadow-inner">
          <BarChart3 className="h-5 w-5 text-electric-blue" />
        </div>
        <h3 className="text-sm font-semibold text-white">Usage & Metric Analysis</h3>
        <p className="mt-1.5 text-xs text-zinc-500 max-w-sm leading-relaxed">
          Monitor dashboard event throughput, translation workloads, and system efficiency metrics. Detailed visualizations will be deployed once usage trackers are live.
        </p>
      </div>
    </div>
  );
}
