"use client";

import React, { useState, useEffect, useRef, use } from "react";
import {
  Volume2,
  VolumeX,
  Languages,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Play,
  Square,
  Network,
  Users,
  Compass,
  Radio,
  ExternalLink,
} from "lucide-react";
import { createClient } from "@/supabase/client";
import { SupabaseStreamingProvider } from "@/lib/streaming/SupabaseStreamingProvider";
import { BroadcastMessage, AudioPacketMetadata, StreamingStatus } from "@/types/streaming";
import { AZURE_LANGUAGES } from "@/lib/azure/constants";
import { motion, AnimatePresence } from "framer-motion";

export default function ListenPortal({ params }: { params: any }) {
  // Safe Next.js 14-16 parameters resolution
  const resolvedParams = params instanceof Promise ? use(params) : params;
  const eventId = resolvedParams?.eventId;

  const [supabase] = useState(() => createClient());
  const [eventDetails, setEventDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Audio state
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [joined, setJoined] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [volume, setVolume] = useState(80);
  const [mute, setMute] = useState(false);

  // Streaming statuses
  const [streamingStatus, setStreamingStatus] = useState<StreamingStatus>("idle");
  const [audienceCount, setAudienceCount] = useState(0);
  const [sessionActive, setSessionActive] = useState(true);
  const [latestSessionId, setLatestSessionId] = useState("");

  // Subtitles / translated feeds
  const [messages, setMessages] = useState<BroadcastMessage[]>([]);
  
  const providerRef = useRef<SupabaseStreamingProvider | null>(null);
  const volumeRef = useRef(80);
  const muteRef = useRef(false);

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  useEffect(() => {
    muteRef.current = mute;
  }, [mute]);

  // Load Event and Session Details on mount
  useEffect(() => {
    if (!eventId) return;

    async function loadEventInfo() {
      try {
        setLoading(true);
        // Query the translation event.
        const { data: event, error } = await supabase
          .from("translation_events")
          .select("*, organizations(name)")
          .eq("id", eventId)
          .single();

        if (error) {
          throw error;
        }

        if (event) {
          setEventDetails(event);
          // Set initial target language
          if (event.targetLanguages && event.targetLanguages.length > 0) {
            setSelectedLanguage(event.targetLanguages[0]);
          }
        }
      } catch (err) {
        console.warn("Failed to retrieve event metadata from Supabase, loading fallbacks:", err);
        // Fallback mock event details
        setEventDetails({
          id: eventId,
          name: "Global AI Leadership Summit (Fallback)",
          organizations: { name: "AetherVOX Enterprise" },
          targetLanguages: ["hi-IN", "es-ES", "zh-CN"],
        });
        setSelectedLanguage("hi-IN");
      } finally {
        setLoading(false);
      }
    }

    loadEventInfo();

    // Query active streaming session for this event
    async function checkActiveSession() {
      try {
        const { data: session } = await supabase
          .from("streaming_sessions")
          .select("id, status")
          .eq("event_id", eventId)
          .eq("status", "active")
          .maybeSingle();

        if (session) {
          setLatestSessionId(session.id);
          setSessionActive(true);
        } else {
          setSessionActive(false);
        }
      } catch (e) {
        console.warn("Session query failed, assuming fallback active session ID");
        setLatestSessionId("session-mock-active");
        setSessionActive(true);
      }
    }

    checkActiveSession();
  }, [eventId, supabase]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (providerRef.current) {
        providerRef.current.leaveSession();
      }
    };
  }, []);

  const handleJoin = async () => {
    if (!eventId || joined) return;

    try {
      // 1. Initialize browser Web Audio Context
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtxClass();
      setAudioContext(ctx);

      // 2. Fetch session ID if not set
      let sessionId = latestSessionId;
      if (!sessionId) {
        // Query active sessions fallback
        try {
          const { data: session } = await supabase
            .from("streaming_sessions")
            .select("id")
            .eq("event_id", eventId)
            .eq("status", "active")
            .maybeSingle();
          if (session) {
            sessionId = session.id;
            setLatestSessionId(session.id);
          } else {
            sessionId = "session-mock-active";
          }
        } catch (e) {
          sessionId = "session-mock-active";
        }
      }

      // 3. Connect to Supabase Realtime via abstract StreamingService
      const provider = new SupabaseStreamingProvider(supabase);
      providerRef.current = provider;

      provider.registerStatusCallback((status) => {
        setStreamingStatus(status);
        if (status === "error") {
          console.warn("Realtime channel subscription error.");
        }
      });

      provider.registerPresenceCallback((count) => {
        setAudienceCount(count);
      });

      // Join Realtime Channel and start listening
      await provider.joinSession(
        sessionId,
        selectedLanguage,
        (msg: BroadcastMessage) => {
          // Received translation message
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg].slice(-10); // keep last 10
          });
        },
        async (audio: AudioPacketMetadata) => {
          // Received synthesized audio packet. Verify language match
          if (audio.language === selectedLanguage && audio.audioData) {
            playAudioData(ctx, audio.audioData);
          }
        },
        () => {
          // Session stopped by operator
          setSessionActive(false);
          setJoined(false);
          alert("The operator has stopped the live event broadcasting session.");
        }
      );

      setJoined(true);
      setSessionActive(true);
    } catch (err) {
      console.error("Failed to join live streaming session:", err);
      alert("Failed to join event stream. Ensure the operator has started the live event.");
    }
  };

  const handleLeave = async () => {
    if (providerRef.current) {
      await providerRef.current.leaveSession();
      providerRef.current = null;
    }
    setJoined(false);
    setStreamingStatus("idle");
    setMessages([]);
    if (audioContext) {
      audioContext.close().catch(() => {});
      setAudioContext(null);
    }
  };

  // Decode base64 WAV buffers and play back automatically
  const playAudioData = async (ctx: AudioContext, base64Data: string) => {
    if (muteRef.current) return;
    try {
      const binary = atob(base64Data);
      const len = binary.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      
      const audioBuffer = await ctx.decodeAudioData(bytes.buffer);
      
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      
      const gainNode = ctx.createGain();
      gainNode.gain.value = volumeRef.current / 100;
      
      source.connect(gainNode);
      gainNode.connect(ctx.destination);
      source.start(0);
    } catch (err) {
      console.error("Audience Portal Web Audio playback error:", err);
    }
  };

  const getLanguageLabel = (code: string) => {
    const list = AZURE_LANGUAGES;
    const match = list.find((l) => l.value === code);
    return match ? match.label : code;
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-electric-blue border-t-transparent" />
          <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Loading Live Event...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-between p-4 sm:p-6 text-white selection:bg-electric-blue/30 selection:text-white">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-electric-blue to-accent-purple p-[1px]">
            <div className="h-full w-full rounded-lg bg-black flex items-center justify-center text-[10px] text-electric-blue font-extrabold">
              AV
            </div>
          </div>
          <span className="text-sm font-bold tracking-tight text-white">
            Aether<span className="bg-clip-text text-transparent bg-gradient-to-r from-electric-blue to-accent-purple font-extrabold">VOX</span> Live
          </span>
        </div>

        {/* Live Audience status */}
        <div className="flex items-center gap-2">
          <div className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
            joined && streamingStatus === "connected"
              ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/5"
              : "text-zinc-500 border-white/[0.04] bg-zinc-950/40"
          }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${
              joined && streamingStatus === "connected"
                ? "bg-emerald-500 shadow-[0_0_8px_#10b981]"
                : "bg-zinc-700"
            }`} />
            <span>{joined ? "Listening" : "Idle"}</span>
          </div>

          {joined && (
            <div className="flex items-center gap-1 rounded bg-zinc-900 border border-white/[0.06] px-2 py-0.5 text-[9px] text-zinc-400 font-bold uppercase">
              <Users className="h-3 w-3 text-electric-blue" />
              <span>{audienceCount} listeners</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 max-w-lg mx-auto w-full my-6 flex flex-col justify-between gap-6">
        
        {/* Session details glass card */}
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-5 space-y-4 shadow-inner relative overflow-hidden">
          <div className="absolute top-0 right-0 h-32 w-32 bg-electric-blue/5 rounded-full blur-3xl pointer-events-none" />
          
          <div>
            <span className="text-[9px] font-extrabold text-zinc-500 uppercase tracking-widest block">Event Broadcast Info</span>
            <h2 className="text-lg font-bold text-white tracking-tight mt-0.5 truncate">{eventDetails?.name}</h2>
            <p className="text-[11px] text-zinc-500">Host: {eventDetails?.organizations?.name || "Independent Host"}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-white/[0.04] pt-4 text-xs">
            <div>
              <span className="text-[9px] font-bold text-zinc-500 uppercase block">Source Language</span>
              <span className="text-zinc-200 mt-0.5 block truncate">{getLanguageLabel(eventDetails?.sourceLanguage || "en-US")}</span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-zinc-500 uppercase block">Select Listening Language</span>
              <select
                disabled={joined}
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="h-7 w-full rounded border border-white/[0.06] bg-zinc-950 px-2 py-0.5 text-xs text-zinc-300 focus:outline-none focus:border-electric-blue/50 disabled:opacity-50 mt-0.5"
              >
                {eventDetails?.targetLanguages?.map((lang: string) => (
                  <option key={lang} value={lang}>
                    {getLanguageLabel(lang)}
                  </option>
                ))}
                {(!eventDetails?.targetLanguages || eventDetails.targetLanguages.length === 0) && (
                  <option value="hi-IN">Hindi (हिंदी)</option>
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Live Subtitle preview panels */}
        <div className="flex-1 rounded-xl border border-white/[0.06] bg-zinc-950/40 p-4 min-h-[180px] max-h-[250px] overflow-y-auto custom-scrollbar flex flex-col justify-end">
          <AnimatePresence>
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center text-zinc-500 text-xs py-10">
                <div className="space-y-1.5">
                  <Radio className="h-5 w-5 mx-auto text-zinc-650 animate-pulse" />
                  <span>{joined ? "Waiting for live host transcripts..." : "Join to connect to translation stream"}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5">
                {messages.map((msg, idx) => {
                  const text = msg.translatedText[selectedLanguage] || msg.originalText;
                  const isLast = idx === messages.length - 1;

                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`space-y-1 ${isLast ? "border-l-2 border-electric-blue pl-2.5" : "pl-3 text-zinc-400"}`}
                    >
                      <span className="text-[8px] text-zinc-500 block font-mono">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                      <p className={`text-xs leading-relaxed ${isLast ? "text-white font-semibold text-sm" : ""}`}>
                        {text}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Calibration Panel */}
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-5 space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Playback Audio Controls</span>
            
            <button
              onClick={() => setMute(!mute)}
              className="text-zinc-400 hover:text-white"
            >
              {mute ? <VolumeX className="h-4.5 w-4.5 text-red-500" /> : <Volume2 className="h-4.5 w-4.5 text-electric-blue" />}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <VolumeX className="h-3.5 w-3.5 text-zinc-500" />
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              disabled={mute}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-full h-1 bg-zinc-950 rounded-lg appearance-none cursor-pointer accent-electric-blue disabled:opacity-30"
            />
            <Volume2 className="h-3.5 w-3.5 text-zinc-300" />
          </div>

          {/* Action button */}
          {!sessionActive ? (
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3.5 text-center text-red-400 text-xs flex items-center justify-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>Host session is currently inactive. Waiting for broadcast...</span>
            </div>
          ) : !joined ? (
            <button
              onClick={handleJoin}
              className="w-full h-11 rounded-lg bg-gradient-to-r from-electric-blue to-accent-purple hover:from-electric-blue/90 hover:to-accent-purple/90 text-black font-bold text-xs tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(0,212,255,0.15)]"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>JOIN BROADCAST</span>
            </button>
          ) : (
            <button
              onClick={handleLeave}
              className="w-full h-11 rounded-lg bg-zinc-900 border border-white/[0.08] hover:bg-zinc-800 text-red-400 font-bold text-xs tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Square className="h-4 w-4 fill-current" />
              <span>LEAVE BROADCAST</span>
            </button>
          )}
        </div>

      </div>

      {/* Footer */}
      <div className="text-center border-t border-white/[0.04] pt-4 mt-6 text-[10px] text-zinc-600">
        <span>Powered by AetherVOX Real-Time Neural Translation. Listener portal isolation active.</span>
      </div>
    </div>
  );
}
