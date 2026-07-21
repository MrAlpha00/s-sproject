"use client";

import { useEffect, useRef } from "react";
import {
  MessageSquare,
  Sparkles,
  Trash2,
  Download,
  Check,
  AlertCircle,
  RefreshCw,
  Volume2,
  Pause,
  Square,
  VolumeX,
  RotateCcw,
  ArrowDownToLine,
  Mic,
  Globe,
  Speaker,
} from "lucide-react";
import { TranslationMessage } from "@/types/translation";
import { getLanguageLabel } from "@/lib/languages";

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

  // Speech bindings
  speechStatuses: Record<string, SpeechStatusInfo>;
  onPlaySpeech: (text: string, lang: string, key: string) => void;
  onPauseSpeech: (key: string) => void;
  onStopSpeech: (key: string) => void;
  onReplaySpeech: (text: string, lang: string, key: string) => void;
  onDownloadAudio: (key: string) => void;
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
  onReplaySpeech,
  onDownloadAudio,
}: TranslationPreviewProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Smooth auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcripts, interimText]);

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
        return "text-emerald-400 border-emerald-500/20 bg-emerald-500/5";
      case "Failed":
        return "text-red-400 border-red-500/20 bg-red-500/5";
      case "Pending":
      default:
        return "text-zinc-650 border-white/[0.02] bg-zinc-950/10";
    }
  };

  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4 flex flex-col h-[520px] shadow-2xl relative overflow-hidden backdrop-blur-md">
      {/* Top action bar */}
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-electric-blue shadow-[0_0_8px_#00d4ff] animate-pulse" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Live Feed monitor
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {transcripts.length > 0 && (
            <div className="flex items-center gap-1.5 border-r border-white/[0.08] pr-2 mr-1">
              <button
                type="button"
                onClick={onExportTranscripts}
                className="inline-flex h-7 items-center gap-1 rounded bg-zinc-800 border border-white/[0.06] px-2.5 text-[10px] font-bold text-zinc-300 hover:text-white transition-colors cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export TXT</span>
              </button>

              <button
                type="button"
                onClick={onClearTranscripts}
                className="inline-flex h-7 items-center gap-1 rounded bg-red-950/30 border border-red-500/20 px-2.5 text-[10px] font-bold text-red-400 hover:bg-red-950/55 transition-colors cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Clear</span>
              </button>
            </div>
          )}

          <div className="flex items-center gap-1.5 rounded-full bg-zinc-950 px-2.5 py-0.5 border border-white/[0.04]">
            <span className={`h-1.5 w-1.5 rounded-full ${recognitionState === "Listening" ? "bg-emerald-500 animate-pulse" : "bg-zinc-650"}`} />
            <span className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-widest">
              {recognitionState}
            </span>
          </div>
        </div>
      </div>

      {/* Scrolling Feed Container */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 custom-scrollbar">
        {transcripts.length === 0 && !interimText ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-zinc-500 text-xs gap-3.5 py-16">
            <div className="h-10 w-10 rounded-full bg-white/[0.02] border border-white/[0.06] flex items-center justify-center text-zinc-650">
              <VolumeX className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-zinc-450">Broadcast Feed Inactive</p>
              <p className="text-[10px] text-zinc-600 max-w-[260px] mx-auto mt-1 leading-relaxed">
                Start listening or enable the translation engine below to stream live audio.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3.5">
            {transcripts.map((block) => {
              const allTranslationsDone = block.targetLanguage.every(
                (lang) => block.translatedText[lang]
              );
              const anySpeechPlaying = block.targetLanguage.some((lang) => {
                const info = speechStatuses[`${block.id}-${lang}`];
                return info?.status === "Playing" || info?.status === "Synthesizing";
              });
              const anySpeechCompleted = block.targetLanguage.some((lang) => {
                const info = speechStatuses[`${block.id}-${lang}`];
                return info?.status === "Completed";
              });

              return (
                <div
                  key={block.id}
                  className={`bg-zinc-950/40 border rounded-xl p-4.5 space-y-4 transition-all shadow-inner ${
                    anySpeechPlaying
                      ? "border-emerald-500/25 shadow-[0_0_12px_rgba(16,185,129,0.06)]"
                      : allTranslationsDone && anySpeechCompleted
                      ? "border-emerald-500/15"
                      : block.status === "Failed"
                      ? "border-red-500/20"
                      : "border-white/[0.04] hover:border-white/[0.08]"
                  }`}
                >
                  {/* === Section 1: Speaker Recognition === */}
                  <div className="flex gap-3 items-start">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-electric-blue/10 border border-electric-blue/20 text-electric-blue">
                      <Mic className="h-3 w-3" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-[9px] font-bold uppercase tracking-wider text-zinc-550 font-mono">
                        <div className="flex items-center gap-1.5">
                          <span className="text-white font-bold font-sans">Speaker</span>
                          <span className="rounded bg-zinc-900 px-1.5 py-0.5 text-zinc-400 font-semibold border border-white/[0.06]">
                            {getLanguageLabel(block.sourceLanguage)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
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
                      <p className="text-[12px] text-zinc-150 mt-1.5 leading-relaxed font-medium">
                        {block.originalText}
                      </p>
                    </div>
                  </div>

                  {/* === Section 2: Translations + Voice (grouped) === */}
                  <div className="pl-9 border-l border-white/[0.04] space-y-3.5">
                    {block.targetLanguage.map((langCode) => {
                      const translationText = block.translatedText[langCode];
                      const hasTranslation = !!translationText;
                      const isTranslating = block.status === "Translating" || block.status === "Pending";
                      const isFailed = block.status === "Failed" && !hasTranslation;

                      const speechKey = `${block.id}-${langCode}`;
                      const speechInfo = speechStatuses[speechKey] || {
                        voice: "Matching...",
                        status: "Pending" as const,
                        latency: 0,
                        duration: 0,
                      };

                      return (
                        <div key={langCode} className="space-y-2">
                          {/* Translation header */}
                          <div className="flex items-center justify-between gap-3 text-[9px] font-bold uppercase tracking-wider text-zinc-550 font-mono">
                            <div className="flex items-center gap-1.5">
                              <Globe className="h-3 w-3 text-accent-purple" />
                              <span className="text-accent-purple font-extrabold font-sans">
                                {getLanguageLabel(langCode)}
                              </span>
                              <span>•</span>
                              <span className="text-zinc-500">Trans: {block.translationLatency || "--"}ms</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(isFailed ? "Failed" : isTranslating ? "Translating" : "Completed")}
                            </div>
                          </div>

                          {/* Translated text */}
                          <p className={`text-[12px] leading-relaxed ${
                            isFailed ? "text-red-400 italic" : isTranslating ? "text-zinc-500 italic" : "text-zinc-250 font-medium"
                          }`}>
                            {isFailed
                              ? "Translation failed. Check connection."
                              : isTranslating
                              ? "Translating phrase..."
                              : translationText}
                          </p>

                          {/* === Section 3: Voice Playback Controls === */}
                          {hasTranslation && (
                            <div className={`flex items-center justify-between gap-2.5 rounded-lg p-2 border text-[9px] font-bold uppercase tracking-wider text-zinc-500 font-mono transition-all ${
                              speechInfo.status === "Playing"
                                ? "bg-emerald-500/5 border-emerald-500/15"
                                : speechInfo.status === "Completed"
                                ? "bg-emerald-500/3 border-emerald-500/10"
                                : "bg-zinc-950/60 border-white/[0.02]"
                            }`}>
                              <div className="flex items-center gap-1.5">
                                {/* Play / Pause toggle */}
                                {speechInfo.status === "Playing" ? (
                                  <button
                                    type="button"
                                    onClick={() => onPauseSpeech(speechKey)}
                                    className="h-5.5 w-5.5 rounded bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-400 hover:bg-amber-500/25 transition-colors cursor-pointer"
                                    title="Pause"
                                  >
                                    <Pause className="h-2.5 w-2.5 fill-current" />
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => onPlaySpeech(translationText, langCode, speechKey)}
                                    className="h-5.5 w-5.5 rounded bg-electric-blue/10 border border-electric-blue/20 flex items-center justify-center text-electric-blue hover:bg-electric-blue/20 transition-colors cursor-pointer"
                                    title="Play"
                                  >
                                    <Volume2 className="h-2.5 w-2.5 fill-current" />
                                  </button>
                                )}

                                {/* Stop */}
                                {(speechInfo.status === "Playing" || speechInfo.status === "Paused" || speechInfo.status === "Synthesizing") && (
                                  <button
                                    type="button"
                                    onClick={() => onStopSpeech(speechKey)}
                                    className="h-5.5 w-5.5 rounded bg-zinc-900 border border-red-500/20 flex items-center justify-center text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                                    title="Stop"
                                  >
                                    <Square className="h-2.5 w-2.5 fill-current" />
                                  </button>
                                )}

                                {/* Replay (only when completed) */}
                                {speechInfo.status === "Completed" && (
                                  <button
                                    type="button"
                                    onClick={() => onReplaySpeech(translationText, langCode, speechKey)}
                                    className="h-5.5 w-5.5 rounded bg-zinc-900 border border-white/[0.06] flex items-center justify-center text-zinc-400 hover:text-white hover:border-white/[0.15] transition-colors cursor-pointer"
                                    title="Replay"
                                  >
                                    <RotateCcw className="h-2.5 w-2.5" />
                                  </button>
                                )}

                                {/* Download audio (only when completed with audio data) */}
                                {speechInfo.status === "Completed" && (
                                  <button
                                    type="button"
                                    onClick={() => onDownloadAudio(speechKey)}
                                    className="h-5.5 w-5.5 rounded bg-zinc-900 border border-white/[0.06] flex items-center justify-center text-zinc-400 hover:text-electric-blue hover:border-electric-blue/20 transition-colors cursor-pointer"
                                    title="Download Audio"
                                  >
                                    <ArrowDownToLine className="h-2.5 w-2.5" />
                                  </button>
                                )}

                                <span className="text-zinc-400 font-bold truncate max-w-[120px] font-sans">
                                  {speechInfo.voice.split("Neural")[0]}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <span>TTS: {speechInfo.latency ? `${speechInfo.latency}ms` : "--"}</span>
                                <span>•</span>
                                <span>Len: {speechInfo.duration ? `${(speechInfo.duration / 1000).toFixed(1)}s` : "--"}</span>
                                <span>•</span>
                                <span className={`px-1 rounded border font-extrabold ${getSpeechStatusColor(speechInfo.status)}`}>
                                  {speechInfo.status === "Completed" && (
                                    <Check className="h-2 w-2 inline mr-0.5" />
                                  )}
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
              );
            })}

            {/* Live Interim Input */}
            {interimText && (
              <div className="flex gap-3 items-start bg-zinc-950/20 border border-dashed border-white/[0.06] rounded-xl p-4 animate-pulse">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-zinc-900 border border-white/[0.06] text-zinc-500 text-[10px] font-bold">
                  LIVE
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-zinc-550 font-mono">
                    <span>Recognizing Input Speech...</span>
                  </div>
                  <p className="text-[12px] text-zinc-400 mt-1.5 leading-relaxed italic font-medium">
                    {interimText}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
        {/* Ref for smooth scroll */}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
