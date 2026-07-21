"use client";

import { Check, Info } from "lucide-react";
import { AZURE_LANGUAGES } from "@/lib/azure/constants";

interface LanguageSelectorProps {
  sourceLanguage: string;
  setSourceLanguage: (lang: string) => void;
  targetLanguages: string[];
  setTargetLanguages: (langs: string[]) => void;
}

export function LanguageSelector({
  sourceLanguage,
  setSourceLanguage,
  targetLanguages,
  setTargetLanguages,
}: LanguageSelectorProps) {
  const handleToggleTarget = (langVal: string) => {
    if (langVal === sourceLanguage) return;

    if (targetLanguages.includes(langVal)) {
      setTargetLanguages(targetLanguages.filter((l) => l !== langVal));
    } else {
      setTargetLanguages([...targetLanguages, langVal]);
    }
  };

  const handleSourceChange = (newSource: string) => {
    setSourceLanguage(newSource);
    setTargetLanguages(targetLanguages.filter((l) => l !== newSource));
  };

  return (
    <div className="space-y-6">
      {/* Source Language Select */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
          Source Language
        </label>
        <p className="text-[11px] text-zinc-500">
          Select the primary spoken language of the speaker/broadcaster.
        </p>
        <select
          value={sourceLanguage}
          onChange={(e) => handleSourceChange(e.target.value)}
          className="h-10 w-full rounded-lg border border-white/[0.06] bg-zinc-900 px-3 py-2 text-xs text-zinc-300 focus:border-electric-blue/50 focus:outline-none"
        >
          {AZURE_LANGUAGES.map((lang) => (
            <option key={lang.value} value={lang.value} className="bg-zinc-950 text-zinc-300">
              {lang.label}
            </option>
          ))}
        </select>
      </div>

      {/* Target Languages Multi-select */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Target Translation Languages
          </label>
          <span className="text-[10px] text-zinc-500 font-semibold bg-white/[0.03] px-2 py-0.5 rounded border border-white/[0.04]">
            {targetLanguages.length} Selected
          </span>
        </div>
        <p className="text-[11px] text-zinc-500">
          Select all languages you want to translate the source audio into simultaneously.
        </p>
        
        {/* Languages Grid Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {AZURE_LANGUAGES.map((lang) => {
            const isSource = lang.value === sourceLanguage;
            const isSelected = targetLanguages.includes(lang.value);

            return (
              <button
                type="button"
                key={lang.value}
                disabled={isSource}
                onClick={() => handleToggleTarget(lang.value)}
                className={`flex items-center justify-between rounded-lg border p-2.5 text-left text-xs transition-all duration-150 ${
                  isSource
                    ? "bg-zinc-900/20 border-white/[0.02] text-zinc-600 cursor-not-allowed"
                    : isSelected
                    ? "bg-electric-blue/10 border-electric-blue/35 text-white font-semibold"
                    : "bg-zinc-900 border-white/[0.04] text-zinc-400 hover:border-white/[0.1] hover:text-white"
                }`}
              >
                <span className="truncate">{lang.label}</span>
                {isSelected && <Check className="h-3.5 w-3.5 text-electric-blue shrink-0 ml-1.5" />}
                {isSource && <span className="text-[9px] uppercase font-bold text-zinc-600 shrink-0 ml-1.5">Source</span>}
              </button>
            );
          })}
        </div>
        
        {/* Warning if source is in targets */}
        <div className="flex gap-2 rounded-lg bg-zinc-900/10 border border-white/[0.03] p-3 text-[10px] text-zinc-500">
          <Info className="h-4 w-4 text-zinc-500 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Target audio channels will be generated in real-time. Unselected languages will not be processed by the neural synthesizer.
          </p>
        </div>
      </div>
    </div>
  );
}
