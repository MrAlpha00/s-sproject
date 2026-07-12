"use client";

import { CreditCard } from "lucide-react";

export default function BillingSettingsPage() {
  const invoices = [
    { id: "INV-9284", date: "2026-07-01", amount: "$49.00", status: "Paid" },
    { id: "INV-8172", date: "2026-06-01", amount: "$49.00", status: "Paid" }
  ];

  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-5 space-y-5">
      {/* Current Subscription Card */}
      <div className="flex items-center gap-2 border-b border-white/[0.04] pb-3">
        <CreditCard className="h-4 w-4 text-electric-blue" />
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
          Workspace Subscription Plan
        </h3>
      </div>

      <div className="rounded-lg border border-white/[0.03] bg-zinc-950/40 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="rounded bg-electric-blue/10 border border-electric-blue/20 px-2 py-0.5 text-[9px] text-electric-blue font-bold uppercase tracking-wider">
            Active Pro Plan
          </span>
          <p className="text-xs text-zinc-300 font-semibold mt-1">Unlimited Live Translation Streams</p>
          <p className="text-[10px] text-zinc-500 mt-0.5">Next renewal: August 01, 2026</p>
        </div>
        <button
          type="button"
          disabled
          className="rounded-lg border border-white/[0.06] bg-zinc-900/20 px-3.5 py-2 text-xs font-semibold text-zinc-500 cursor-not-allowed"
        >
          Manage Plan (Stripe)
        </button>
      </div>

      {/* Invoices List */}
      <div className="space-y-3">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
          Invoice History
        </span>

        <div className="overflow-hidden rounded-lg border border-white/[0.04] bg-zinc-950/30 text-xs">
          {invoices.map((inv) => (
            <div key={inv.id} className="flex items-center justify-between border-b border-white/[0.03] p-3 last:border-b-0">
              <span className="font-mono text-zinc-400">{inv.id}</span>
              <span className="text-zinc-500">{inv.date}</span>
              <span className="text-zinc-300 font-bold">{inv.amount}</span>
              <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 text-[9px] text-emerald-400 font-bold uppercase">
                {inv.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
