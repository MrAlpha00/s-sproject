"use client";

import { Lock, ShieldAlert } from "lucide-react";

export default function SecuritySettingsPage() {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-5 space-y-4">
      <div className="flex items-center gap-2 border-b border-white/[0.04] pb-3">
        <Lock className="h-4 w-4 text-electric-blue" />
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
          Workspace Access Credentials
        </h3>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-500 uppercase block">Current password</label>
            <input
              type="password"
              placeholder="••••••••"
              disabled
              className="h-9 w-full rounded border border-white/[0.06] bg-zinc-950/60 px-3 text-xs text-zinc-500 cursor-not-allowed focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-500 uppercase block">New password</label>
            <input
              type="password"
              placeholder="••••••••"
              disabled
              className="h-9 w-full rounded border border-white/[0.06] bg-zinc-950/60 px-3 text-xs text-zinc-500 cursor-not-allowed focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-white/[0.04]">
          <button
            type="submit"
            disabled
            className="flex items-center gap-1.5 rounded-lg bg-zinc-800 border border-white/[0.06] px-4 py-2 text-xs font-semibold text-zinc-400 cursor-not-allowed"
          >
            Update Password
          </button>
        </div>
      </form>
    </div>
  );
}
