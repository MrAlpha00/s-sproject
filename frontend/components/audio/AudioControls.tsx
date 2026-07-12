"use client";

import { RefreshCw, Play, Square, Save } from "lucide-react";

interface AudioControlsProps {
  isTestingInput: boolean;
  setIsTestingInput: (val: boolean) => void;
  isTestingOutput: boolean;
  setIsTestingOutput: (val: boolean) => void;
  onRefresh: () => void;
  onSave: () => void;
}

export function AudioControls({
  isTestingInput,
  setIsTestingInput,
  isTestingOutput,
  setIsTestingOutput,
  onRefresh,
  onSave,
}: AudioControlsProps) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-[10px] text-zinc-500 font-medium">
          Calibrate volume levels and test audio paths before linking translation pipelines.
        </p>

        <div className="flex flex-wrap gap-2">
          {/* Refresh Devices */}
          <button
            type="button"
            onClick={onRefresh}
            className="flex items-center gap-1.5 rounded-lg border border-white/[0.04] bg-zinc-900/20 px-3.5 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh Devices
          </button>

          {/* Test Input */}
          <button
            type="button"
            onClick={() => setIsTestingInput(!isTestingInput)}
            className={`flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-xs font-semibold transition-colors ${
              isTestingInput
                ? "bg-electric-blue/15 border-electric-blue text-white"
                : "border-white/[0.04] bg-zinc-900/20 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            }`}
          >
            {isTestingInput ? <Square className="h-3.5 w-3.5 fill-current" /> : <Play className="h-3.5 w-3.5 fill-current" />}
            {isTestingInput ? "Stop Input Test" : "Test Input"}
          </button>

          {/* Test Output */}
          <button
            type="button"
            onClick={() => setIsTestingOutput(!isTestingOutput)}
            className={`flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-xs font-semibold transition-colors ${
              isTestingOutput
                ? "bg-accent-purple/15 border-accent-purple text-white"
                : "border-white/[0.04] bg-zinc-900/20 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            }`}
          >
            {isTestingOutput ? <Square className="h-3.5 w-3.5 fill-current" /> : <Play className="h-3.5 w-3.5 fill-current" />}
            {isTestingOutput ? "Stop Output Test" : "Test Output"}
          </button>

          {/* Save Configuration */}
          <button
            type="button"
            onClick={onSave}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-electric-blue to-accent-purple px-4 py-2 text-xs font-semibold text-white shadow-lg transition-transform hover:scale-102 hover:opacity-95"
          >
            <Save className="h-3.5 w-3.5" />
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
