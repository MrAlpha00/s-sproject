"use client";

import { useState } from "react";
import { User, Sun, Moon, Laptop, Languages, Save } from "lucide-react";

export default function GeneralSettingsPage() {
  const [fullName, setFullName] = useState("AetherVOX Operator");
  const [email] = useState("admin@aethervox.com");
  const [theme, setTheme] = useState<"dark" | "light" | "system">("dark");
  const [uiLanguage, setUiLanguage] = useState("en");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert("General settings saved successfully!");
  };

  return (
    <div className="space-y-6">
      {/* Profile Settings */}
      <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/[0.04] pb-3">
          <User className="h-4 w-4 text-electric-blue" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Operator Profile
          </h3>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase block">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-9 w-full rounded border border-white/[0.06] bg-zinc-950 px-3 text-xs text-zinc-300 focus:outline-none focus:border-electric-blue/40"
              />
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase block">Email Address</label>
              <input
                type="email"
                value={email}
                disabled
                className="h-9 w-full rounded border border-white/[0.06] bg-zinc-950/60 px-3 text-xs text-zinc-500 cursor-not-allowed focus:outline-none"
              />
            </div>
          </div>

          {/* Theme Preferences */}
          <div className="space-y-2 border-t border-white/[0.04] pt-4">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
              Interface Theme Mode
            </span>
            <div className="grid grid-cols-3 gap-3">
              {(["light", "dark", "system"] as const).map((t) => {
                const Icon = t === "light" ? Sun : t === "dark" ? Moon : Laptop;
                const isSelected = theme === t;
                const borderClass = isSelected
                  ? "border-electric-blue bg-electric-blue/5 text-white"
                  : "border-white/[0.06] bg-zinc-950 text-zinc-400 hover:text-white";

                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTheme(t)}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs gap-1.5 transition-all uppercase font-bold tracking-wider ${borderClass}`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-[9px]">{t}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* System Interface Language */}
          <div className="space-y-2 border-t border-white/[0.04] pt-4">
            <div className="flex items-center gap-1.5">
              <Languages className="h-3.5 w-3.5 text-zinc-500" />
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                System Interface Language
              </span>
            </div>

            <select
              value={uiLanguage}
              onChange={(e) => setUiLanguage(e.target.value)}
              className="h-9 w-full rounded border border-white/[0.06] bg-zinc-950 px-2.5 py-0.5 text-xs text-zinc-300 focus:outline-none"
            >
              <option value="en">English (US)</option>
              <option value="es">Español (ES)</option>
              <option value="fr">Français (FR)</option>
              <option value="zh">中文 (ZH)</option>
            </select>
          </div>

          <div className="flex justify-end pt-2 border-t border-white/[0.04]">
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg bg-zinc-800 border border-white/[0.06] px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-700 transition-colors"
            >
              <Save className="h-3.5 w-3.5" />
              Save Preferences
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
