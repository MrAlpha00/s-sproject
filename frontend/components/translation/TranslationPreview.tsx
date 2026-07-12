"use client";

import { MessageSquare, ShieldCheck, AlertCircle, Sparkles } from "lucide-react";

export interface TranscriptItem {
  id: string;
  speaker: string;
  text: string;
  confidence?: number; // 0 to 100
  lang: string;
}

interface TranslationPreviewProps {
  transcripts: TranscriptItem[];
  interimText: string;
  recognitionState: string;
}

export function TranslationPreview({ transcripts, interimText, recognitionState }: TranslationPreviewProps) {
  const getConfidenceColor = (score?: number) => {
    if (!score) return "text-zinc-500 border-white/[0.06] bg-zinc-950";
    if (score >= 90) return "text-emerald-400 border-emerald-500/20 bg-emerald-500/5";
    if (score >= 70) return "text-amber-400 border-amber-500/20 bg-amber-500/5";
    return "text-red-400 border-red-500/20 bg-red-500/5";
  };

  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-5 flex flex-col h-[400px]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
          Live Translation Preview
        </h3>
        
        <div className="flex items-center gap-2">
          <span className={`flex h-1.5 w-1.5 rounded-full ${recognitionState === "Listening" ? "bg-emerald-500 animate-pulse" : "bg-zinc-600"}`} />
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
            {recognitionState}
          </span>
        </div>
      </div>

      {/* Scrolling transcripts window */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar flex flex-col justify-end">
        {transcripts.length === 0 && !interimText && (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-zinc-500 text-xs gap-2 py-10">
            <MessageSquare className="h-6 w-6 text-zinc-700" />
            <p>No audio captured yet.</p>
            <p className="text-[10px] text-zinc-600 max-w-[250px]">
              Ensure your audio device is connected, and toggle "Start Session" to open hardware capture channels.
            </p>
          </div>
        )}

        {/* Finalized transcript blocks */}
        <div className="space-y-4 overflow-y-auto max-h-[300px] pr-1">
          {transcripts.map((block) => (
            <div key={block.id} className="flex gap-2.5 items-start bg-zinc-950/20 border border-white/[0.02] rounded-lg p-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-electric-blue/10 border border-electric-blue/20 text-electric-blue mt-0.5">
                <MessageSquare className="h-3.5 w-3.5" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">{block.speaker}</span>
                    <span className="text-[9px] text-zinc-500 font-medium">({block.lang})</span>
                  </div>

                  {block.confidence !== undefined && (
                    <div className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider ${getConfidenceColor(block.confidence)}`}>
                      <Sparkles className="h-2 w-2" />
                      <span>{block.confidence}% Conf</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-zinc-200 mt-1 leading-relaxed">
                  {block.text}
                </p>
              </div>
            </div>
          ))}

          {/* Intermediate/Live Hypothesis Text */}
          {interimText && (
            <div className="flex gap-2.5 items-start bg-zinc-950/10 border border-dashed border-white/[0.04] rounded-lg p-3 animate-pulse">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-zinc-900 border border-white/[0.06] text-zinc-500 mt-0.5">
                <MessageSquare className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Live Input</span>
                  <span className="text-[8px] text-zinc-600 font-bold uppercase">Recognizing...</span>
                </div>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed italic">
                  {interimText}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
