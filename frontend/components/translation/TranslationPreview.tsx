"use client";

import { MessageSquare, Sparkles, Trash2, Download, Check, AlertCircle, RefreshCw, Volume2, Pause, Square } from "lucide-react";
import { TranslationMessage } from "@/types/translation";

export interface SpeechStatusInfo {
  voice: string;
  status: "Pending" | "Synthesizing" | "Playing" | "Paused" | "Completed" | "Failed";
  latency: number;
  duration: number;
}

interface TranslationPreviewProps {
  transcripts: TranslationMessage[];
  interimText: string;
  recognitionState: string;
  onClearTranscripts: () => void;
  onExportTranscripts: () => void;

  // Module 11 speech bindings
  speechStatuses: Record<string, SpeechStatusInfo>;
  onPlaySpeech: (text: string, lang: string, key: string) => void;
  onPauseSpeech: (key: string) => void;
  onStopSpeech: (key: string) => void;
}

export function TranslationPreview({
  transcripts,
  interimText,
  recognitionState,
  onClearTranscripts,
  onExportTranscripts,
  speechStatuses,
  onPlaySpeech,
  onPauseSpeech,
  onStopSpeech,
}: TranslationPreviewProps) {
  const getConfidenceColor = (score?: number) => {
    if (!score) return "text-zinc-500 border-white/[0.06] bg-zinc-950";
    if (score >= 90) return "text-emerald-400 border-emerald-500/20 bg-emerald-500/5";
    if (score >= 70) return "text-amber-400 border-amber-500/20 bg-amber-500/5";
    return "text-red-400 border-red-500/20 bg-red-500/5";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <Check className="h-3 w-3 text-emerald-400 shrink-0" />;
      case "Translating":
      case "Pending":
        return <RefreshCw className="h-3 w-3 text-amber-400 animate-spin shrink-0" />;
      case "Failed":
      default:
        return <AlertCircle className="h-3 w-3 text-red-400 shrink-0" />;
    }
  };

  const getSpeechStatusColor = (status: string) => {
    switch (status) {
      case "Playing":
        return "text-emerald-400 border-emerald-500/20 bg-emerald-500/5";
      case "Synthesizing":
        return "text-amber-400 border-amber-500/20 bg-amber-500/5 animate-pulse";
      case "Paused":
        return "text-zinc-400 border-white/[0.04] bg-zinc-950/20";
      case "Completed":
        return "text-blue-400 border-blue-500/20 bg-blue-500/5";
      case "Failed":
        return "text-red-400 border-red-500/20 bg-red-500/5";
      case "Pending":
      default:
        return "text-zinc-650 border-white/[0.02] bg-zinc-950/10";
    }
  };

  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-5 flex flex-col h-[400px]">
      {/* Header Panel */}
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-4 shrink-0">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
          Live Translation Studio Feed
        </h3>
        
        <div className="flex items-center gap-3">
          {/* Controls Deck */}
          {transcripts.length > 0 && (
            <div className="flex items-center gap-1.5 border-r border-white/[0.06] pr-3 mr-1">
              {/* Export TXT */}
              <button
                type="button"
                onClick={onExportTranscripts}
                className="p-1.5 rounded bg-zinc-800 border border-white/[0.06] hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                title="Export transcript as TXT"
              >
                <Download className="h-3 w-3" />
              </button>

              {/* Clear */}
              <button
                type="button"
                onClick={onClearTranscripts}
                className="p-1.5 rounded bg-zinc-850 border border-red-500/10 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors"
                title="Clear transcript feed"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Connection Status Indicator */}
          <div className="flex items-center gap-1.5">
            <span className={`flex h-1.5 w-1.5 rounded-full ${recognitionState === "Listening" ? "bg-emerald-500 animate-pulse" : "bg-zinc-600"}`} />
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
              {recognitionState}
            </span>
          </div>
        </div>
      </div>

      {/* Scrolling transcripts window */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        {transcripts.length === 0 && !interimText && (
          <div className="h-full flex flex-col items-center justify-center text-center text-zinc-500 text-xs gap-2 py-12">
            <MessageSquare className="h-6 w-6 text-zinc-700" />
            <p>No translation streams active.</p>
            <p className="text-[10px] text-zinc-650 max-w-[280px]">
              Toggle 'Start Listening' or 'Start Translation' to stream microphone data into Azure.
            </p>
          </div>
        )}

        {/* Finalized transcript blocks with translations */}
        <div className="space-y-4">
          {transcripts.map((block) => (
            <div key={block.id} className="bg-zinc-950/30 border border-white/[0.03] rounded-xl p-4 space-y-3.5 shadow-sm">
              
              {/* Original sentence header & content */}
              <div className="flex gap-2.5 items-start">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-electric-blue/10 border border-electric-blue/20 text-electric-blue mt-0.5">
                  <MessageSquare className="h-3.5 w-3.5" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <span className="text-white">Presenter</span>
                      <span className="rounded bg-zinc-900 border border-white/[0.06] px-1.5 py-0.5 text-zinc-400 font-semibold font-mono text-[9px]">
                        {block.sourceLanguage}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-zinc-500 font-semibold font-mono text-[9px]">
                      <span>{new Date(block.timestamp).toLocaleTimeString()}</span>
                      <span>•</span>
                      <span>Rec: {block.recognitionLatency}ms</span>
                      {block.confidence !== undefined && (
                        <>
                          <span>•</span>
                          <span className={`inline-flex items-center gap-0.5 rounded border px-1 ${getConfidenceColor(block.confidence)}`}>
                            <Sparkles className="h-2 w-2" />
                            {block.confidence}%
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-zinc-200 mt-1.5 leading-relaxed font-semibold">
                    {block.originalText}
                  </p>
                </div>
              </div>

              {/* Nested translation results */}
              <div className="pl-8 border-l border-white/[0.04] space-y-4">
                {block.targetLanguage.map((langCode) => {
                  const translationText = block.translatedText[langCode];
                  const hasTranslation = !!translationText;
                  const isTranslating = block.status === "Translating" || block.status === "Pending";
                  const isFailed = block.status === "Failed" && !hasTranslation;

                  // Retrieve dynamic Speech status details
                  const speechKey = `${block.id}-${langCode}`;
                  const speechInfo = speechStatuses[speechKey] || {
                    voice: "Matching...",
                    status: "Pending",
                    latency: 0,
                    duration: 0,
                  };

                  return (
                    <div key={langCode} className="space-y-1.5">
                      {/* Translation block header info */}
                      <div className="flex flex-wrap items-center justify-between gap-3 text-[9px] font-bold uppercase tracking-wider">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="rounded bg-zinc-900/60 border border-white/[0.04] px-1.5 py-0.2 text-zinc-400 font-mono">
                            {langCode}
                          </span>
                          <span className="text-zinc-500">➔</span>
                          <span className="rounded bg-electric-blue/5 border border-electric-blue/10 px-1 py-0.2 text-electric-blue text-[8px] font-extrabold">
                            Azure Translator
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-zinc-500 font-mono text-[8px]">
                          <span>Trans: {block.translationLatency || "--"}ms</span>
                          <span>•</span>
                          {getStatusIcon(isFailed ? "Failed" : isTranslating ? "Translating" : "Completed")}
                        </div>
                      </div>

                      {/* Content */}
                      <p className={`text-xs leading-relaxed ${
                        isFailed ? "text-red-400 italic" : isTranslating ? "text-zinc-500 italic" : "text-zinc-300"
                      }`}>
                        {isFailed 
                          ? "Translation failed. Check connection." 
                          : isTranslating 
                            ? "Translating phrase..." 
                            : translationText}
                      </p>

                      {/* Speech Synthesis controls row */}
                      {hasTranslation && (
                        <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-950/40 rounded-lg p-2 border border-white/[0.02] text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                          {/* Audio playback controls */}
                          <div className="flex items-center gap-1.5">
                            {speechInfo.status === "Playing" ? (
                              <button
                                type="button"
                                onClick={() => onPauseSpeech(speechKey)}
                                className="flex h-5.5 w-5.5 items-center justify-center rounded bg-zinc-900 border border-white/[0.06] text-zinc-400 hover:text-white transition-colors"
                              >
                                <Pause className="h-2.5 w-2.5" />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => onPlaySpeech(translationText, langCode, speechKey)}
                                className="flex h-5.5 w-5.5 items-center justify-center rounded bg-electric-blue/10 border border-electric-blue/20 text-electric-blue hover:bg-electric-blue/20 transition-colors"
                              >
                                <Volume2 className="h-2.5 w-2.5" />
                              </button>
                            )}

                            {(speechInfo.status === "Playing" || speechInfo.status === "Paused" || speechInfo.status === "Synthesizing") && (
                              <button
                                type="button"
                                onClick={() => onStopSpeech(speechKey)}
                                className="flex h-5.5 w-5.5 items-center justify-center rounded bg-zinc-900 border border-red-500/20 text-zinc-400 hover:text-red-400 transition-colors"
                              >
                                <Square className="h-2.5 w-2.5 fill-current" />
                              </button>
                            )}
                            
                            <span className="font-mono text-zinc-400 truncate max-w-[120px]">
                              {speechInfo.voice.split("Neural")[0]}
                            </span>
                          </div>

                          {/* Speech metrics details */}
                          <div className="flex items-center gap-2 font-mono text-[8px] text-zinc-650">
                            <span>TTS: {speechInfo.latency ? `${speechInfo.latency}ms` : "--"}</span>
                            <span>•</span>
                            <span>Len: {speechInfo.duration ? `${(speechInfo.duration / 1000).toFixed(1)}s` : "--"}</span>
                            <span>•</span>
                            <span className={`px-1 rounded border uppercase font-extrabold ${getSpeechStatusColor(speechInfo.status)}`}>
                              {speechInfo.status}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
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
                  <span className="text-[8px] text-zinc-650 font-bold uppercase">Recognizing...</span>
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
