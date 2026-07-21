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
  Pause,
  Square,
  Network,
  Users,
  Radio,
  ExternalLink,
  RefreshCw,
  HelpCircle,
  Clock,
  Database,
  Volume1,
  Maximize2,
  Share2,
  Link2,
} from "lucide-react";
import { createClient } from "@/supabase/client";
import { SupabaseStreamingProvider } from "@/lib/streaming/SupabaseStreamingProvider";
import { BroadcastMessage, AudioPacketMetadata, StreamingStatus } from "@/types/streaming";
import { PlaybackState, BufferState } from "@/types/audio-stream";
import { AudioSyncManager } from "@/lib/audio/AudioSyncManager";
import { AudioStreamManager } from "@/lib/audio/AudioStreamManager";
import { normalizeLanguageCode, normalizeLanguageCodes, AZURE_LANGUAGES } from "@/lib/languages";
import { motion, AnimatePresence } from "framer-motion";

export default function ListenPortal({ params }: { params: any }) {
  const resolvedParams = params instanceof Promise ? use(params) : params;
  const eventId = resolvedParams?.eventId;

  const [supabase] = useState(() => createClient());
  const [eventDetails, setEventDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Audio context and managers
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const streamManagerRef = useRef<AudioStreamManager | null>(null);
  const syncManagerRef = useRef<AudioSyncManager | null>(null);
  const joinTimeRef = useRef<number>(0);

  // Connection & Portal states
  const [joined, setJoined] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [volume, setVolume] = useState(80);
  const [mute, setMute] = useState(false);
  const [streamingStatus, setStreamingStatus] = useState<StreamingStatus>("idle");
  const [audienceCount, setAudienceCount] = useState(0);
  const [sessionActive, setSessionActive] = useState(true);
  const [broadcastEnded, setBroadcastEnded] = useState(false);
  const [latestSessionId, setLatestSessionId] = useState("");

  // Telemetry indicators
  const [playbackState, setPlaybackState] = useState<PlaybackState>("idle");
  const [bufferState, setBufferState] = useState<BufferState>({
    queueLength: 0,
    maxQueueLength: 20,
    bufferedDuration: 0,
    droppedPacketsCount: 0,
    completedPacketsCount: 0,
  });
  const [currentVoice, setCurrentVoice] = useState("Detecting...");
  const [estimatedNetworkLatency, setEstimatedNetworkLatency] = useState(0);
  const [copied, setCopied] = useState(false);

  // Subtitles / translated feeds
  const [messages, setMessages] = useState<BroadcastMessage[]>([]);
  const providerRef = useRef<SupabaseStreamingProvider | null>(null);

  // SessionStorage persistence for messages (24hr expiry)
  const STORAGE_KEY = `aethervox-listener-messages-${eventId}`;
  const STORAGE_EXPIRY_KEY = `aethervox-listener-expiry-${eventId}`;
  const STORAGE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

  // Load Event and Session Details on mount
  useEffect(() => {
    if (!eventId) return;

    async function loadEventInfo() {
      try {
        setLoading(true);
        const { data: event, error } = await supabase
          .from("translation_events")
          .select("*, organizations(name)")
          .eq("id", eventId)
          .single();

        if (event && !error) {
          setEventDetails({
            ...event,
            sourceLanguage: normalizeLanguageCode(event.sourceLanguage || "en-US"),
            targetLanguages: normalizeLanguageCodes(event.targetLanguages || []),
          });
          const normalizedTargets = normalizeLanguageCodes(event.targetLanguages || []);
          if (normalizedTargets.length > 0) {
            setSelectedLanguage(normalizedTargets[0]);
          } else {
            setSelectedLanguage("");
          }
          return;
        }

        // Check local repository for event by ID
        const { EventRepository } = await import("@/lib/database/repositories/EventRepository");
        const repo = new EventRepository(supabase);
        const localEvt = await repo.findById(eventId);
        if (localEvt) {
          setEventDetails({
            ...localEvt,
            sourceLanguage: normalizeLanguageCode(localEvt.sourceLanguage || "en-US"),
            targetLanguages: normalizeLanguageCodes(localEvt.targetLanguages || []),
          });
          const normalizedTargets = normalizeLanguageCodes(localEvt.targetLanguages || []);
          if (normalizedTargets.length > 0) {
            setSelectedLanguage(normalizedTargets[0]);
          } else {
            setSelectedLanguage("");
          }
          return;
        }

        // Fallback for any event ID — minimal data, no hardcoded languages
        setEventDetails({
          id: eventId,
          name: "Live Translation Broadcast",
          organizations: { name: "AetherVOX Enterprise" },
          targetLanguages: [],
          sourceLanguage: "en-US",
        });
        setSelectedLanguage("");
      } catch (err) {
        // Fallback for any event ID on error
        setEventDetails({
          id: eventId,
          name: "Live Translation Broadcast",
          organizations: { name: "AetherVOX Enterprise" },
          targetLanguages: [],
          sourceLanguage: "en-US",
        });
        setSelectedLanguage("");
      } finally {
        setLoading(false);
      }
    }

    loadEventInfo();

    // Load persisted messages from sessionStorage (if not expired)
    try {
      const expiry = localStorage.getItem(STORAGE_EXPIRY_KEY);
      if (expiry && Date.now() < Number(expiry)) {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as BroadcastMessage[];
          setMessages(parsed);
        }
      } else {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STORAGE_EXPIRY_KEY);
      }
    } catch {}

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
          setBroadcastEnded(false);
        } else {
          // Use event ID as fallback session ID so join can proceed
          setLatestSessionId(eventId);
          setSessionActive(true);
          setBroadcastEnded(false);
        }
      } catch (e) {
        setLatestSessionId(eventId);
        setSessionActive(true);
        setBroadcastEnded(false);
      }
    }

    checkActiveSession();

    // Periodically check for active session to recover from stale broadcastEnded state
    const sessionCheckInterval = setInterval(async () => {
      if (broadcastEnded || joined) return;
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
          setBroadcastEnded(false);
        }
      } catch (e) {}
    }, 5000);

    return () => clearInterval(sessionCheckInterval);
  }, [eventId, supabase]);

  // Keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!joined || !streamManagerRef.current) return;

      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "SELECT") {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        const state = streamManagerRef.current.getPlaybackState();
        if (state === "playing" || state === "buffering" || state === "idle") {
          streamManagerRef.current.pause();
        } else if (state === "paused") {
          streamManagerRef.current.resume();
        }
      } else if (e.code === "KeyM") {
        e.preventDefault();
        const curMute = streamManagerRef.current.getMute();
        streamManagerRef.current.setMute(!curMute);
      } else if (e.code === "ArrowUp") {
        e.preventDefault();
        const vol = Math.min(100, streamManagerRef.current.getVolume() + 5);
        streamManagerRef.current.setVolume(vol);
      } else if (e.code === "ArrowDown") {
        e.preventDefault();
        const vol = Math.max(0, streamManagerRef.current.getVolume() - 5);
        streamManagerRef.current.setVolume(vol);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [joined]);

  // Persist messages to sessionStorage with 24hr expiry
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
        localStorage.setItem(STORAGE_EXPIRY_KEY, String(Date.now() + STORAGE_EXPIRY_MS));
      } catch {}
    }
  }, [messages, STORAGE_KEY, STORAGE_EXPIRY_KEY]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (providerRef.current) {
        providerRef.current.leaveSession();
      }
      if (streamManagerRef.current) {
        streamManagerRef.current.stop();
      }
    };
  }, []);

  const handleJoin = async () => {
    if (!eventId || joined) return;

    // Ensure a valid language is selected before joining
    const joinLanguage = selectedLanguage || eventDetails?.targetLanguages?.[0] || "";

    try {
      // 1. Initialize browser Web Audio Context
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtxClass();
      setAudioContext(ctx);

      // Record join time to reject older historical packets
      joinTimeRef.current = Date.now();

      // 2. Initialize low-latency managers
      const syncManager = new AudioSyncManager();
      syncManagerRef.current = syncManager;

      const streamManager = new AudioStreamManager(ctx);
      streamManagerRef.current = streamManager;

      streamManager.registerStateCallback(() => {
        setPlaybackState(streamManager.getPlaybackState());
        setBufferState(streamManager.getBufferState());
        setVolume(streamManager.getVolume());
        setMute(streamManager.getMute());
      });

      // 3. Retrieve session ID
      let sessionId = latestSessionId;
      if (!sessionId) {
        try {
          const { data: session } = await supabase
            .from("streaming_sessions")
            .select("id")
            .eq("event_id", eventId)
            .eq("status", "active")
            .maybeSingle();
          sessionId = session?.id || "session-mock-active";
        } catch (e) {
          sessionId = "session-mock-active";
        }
        setLatestSessionId(sessionId);
      }

      // 4. Connect to Supabase Realtime Channels — always use eventId for channel name matching
      const provider = new SupabaseStreamingProvider(supabase);
      providerRef.current = provider;

      provider.registerStatusCallback((status) => {
        setStreamingStatus(status);
      });

      provider.registerPresenceCallback((count) => {
        setAudienceCount(count);
      });

      // Use eventId for channel name to match operator's `streaming:${eventId}`
      await provider.joinSession(
        eventId,
        joinLanguage,
        (msg: BroadcastMessage) => {
          // Late-join filter: ignore historical messages
          const msgTime = new Date(msg.timestamp).getTime();
          if (msgTime < joinTimeRef.current) return;

          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg].slice(-8);
          });
        },
        async (audio: AudioPacketMetadata) => {
          // Late-join filter: ignore older audio chunks
          const audioTime = new Date(audio.timestamp).getTime();
          if (audioTime < joinTimeRef.current) return;

          if (audio.language === joinLanguage && audio.audioData) {
            // Sequence tracking & duplicate filtering
            const orderedPackets = syncManager.processIncomingPacket({
              sessionId: audio.sessionId,
              eventId: audio.eventId,
              messageId: audio.messageId,
              audioData: audio.audioData,
              language: audio.language,
              voice: audio.voice,
              duration: audio.duration,
              sequenceNumber: audio.sequenceNumber,
              timestamp: audio.timestamp,
            });

            // Enqueue ordered packet stream sequentially into player
            for (const packet of orderedPackets) {
              await streamManager.enqueue(packet);
            }

            setCurrentVoice(audio.voice);
            setEstimatedNetworkLatency(syncManager.getLastNetworkLatency());
          }
        },
        () => {
          // Operator stopped broadcast — mark ended but don't call handleLeave immediately
          // to avoid errors on already-disconnected channels. The periodic session check
          // will detect new broadcasts and reset broadcastEnded.
          setSessionActive(false);
          setBroadcastEnded(true);
          if (providerRef.current) {
            providerRef.current.leaveSession().catch(() => {});
            providerRef.current = null;
          }
          if (streamManagerRef.current) {
            streamManagerRef.current.stop();
            streamManagerRef.current = null;
          }
          setJoined(false);
          setStreamingStatus("idle");
          setPlaybackState("idle");
        }
      );

      setJoined(true);
      setSessionActive(true);
    } catch (err) {
      console.error("Failed to start Audio Playback Engine:", err);
      alert("Failed to join. Ensure the event is active and permissions are granted.");
    }
  };

  const handleLeave = async () => {
    if (providerRef.current) {
      try { await providerRef.current.leaveSession(); } catch (e) {}
      providerRef.current = null;
    }
    if (streamManagerRef.current) {
      streamManagerRef.current.stop();
      streamManagerRef.current = null;
    }
    if (syncManagerRef.current) {
      syncManagerRef.current.reset();
      syncManagerRef.current = null;
    }
    
    setJoined(false);
    setStreamingStatus("idle");
    setPlaybackState("idle");
    setMessages([]);
    setCurrentVoice("Detecting...");
    setEstimatedNetworkLatency(0);

    if (audioContext) {
      audioContext.close().catch(() => {});
      setAudioContext(null);
    }
  };

  const handleTogglePlayPause = () => {
    if (!streamManagerRef.current) return;
    const state = streamManagerRef.current.getPlaybackState();
    if (state === "paused") {
      streamManagerRef.current.resume();
    } else {
      streamManagerRef.current.pause();
    }
  };

  const handleToggleMute = () => {
    if (!streamManagerRef.current) return;
    const curMute = streamManagerRef.current.getMute();
    streamManagerRef.current.setMute(!curMute);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = Number(e.target.value);
    setVolume(vol);
    if (streamManagerRef.current) {
      streamManagerRef.current.setVolume(vol);
    }
  };

  const handleManualReconnect = async () => {
    if (!joined) return;
    await handleLeave();
    await handleJoin();
  };

  const getLanguageLabelFromCode = (code: string) => {
    const normalized = normalizeLanguageCode(code);
    const match = AZURE_LANGUAGES.find((l) => l.value === normalized);
    return match ? match.label : normalized;
  };

  const handleShareLink = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${eventDetails?.name || "AetherVOX"} - Live Translation`,
          text: `Listen to live translation: ${eventDetails?.name}`,
          url,
        });
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {}
    }
  };

  const getConnectionQuality = () => {
    if (streamingStatus === "disconnected") return "disconnected";
    if (streamingStatus === "connecting") return "reconnecting";
    const latency = syncManagerRef.current?.getAverageNetworkLatency() || estimatedNetworkLatency;
    if (latency === 0) return "excellent";
    if (latency < 180) return "excellent";
    if (latency < 350) return "good";
    return "poor";
  };

  const getPlaybackStatusLabel = () => {
    const state = playbackState;
    if (state === "playing") return "Playing Live Audio";
    if (state === "buffering") return "Buffering Stream";
    if (state === "paused") return "Audio Paused";
    if (state === "stopped") return "Stream Stopped";
    return "Idle / Awaiting Audio";
  };

  const getEndToEndLatency = () => {
    // End-to-end = network latency + buffer queue length duration
    return estimatedNetworkLatency + bufferState.bufferedDuration;
  };

  if (broadcastEnded) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 text-white text-center selection:bg-electric-blue/30 selection:text-white">
        <div className="max-w-md w-full rounded-xl border border-white/[0.06] bg-zinc-900/40 p-8 space-y-4 backdrop-blur-md shadow-2xl">
          <div className="h-12 w-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
            <Radio className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-white">Broadcast Ended</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            The live translation broadcast session has ended. Thank you for listening!
          </p>
        </div>
      </div>
    );
  }

  if (!loading && !eventDetails) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 text-white text-center selection:bg-electric-blue/30 selection:text-white">
        <div className="max-w-md w-full rounded-xl border border-white/[0.06] bg-zinc-900/40 p-8 space-y-4 backdrop-blur-md shadow-2xl">
          <div className="h-12 w-12 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
            <Radio className="h-6 w-6 animate-pulse" />
          </div>
          <h2 className="text-lg font-bold text-white">No Active Broadcast</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            There is currently no active translation broadcast for this event link. Please verify the URL or wait for the presenter to start broadcasting.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-between p-4 sm:p-6 text-white selection:bg-electric-blue/30 selection:text-white">
      {/* Top Navigation / Brand */}
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

        {/* Dynamic connection and listener statuses */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleShareLink}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-zinc-900/60 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-zinc-400 hover:text-electric-blue hover:border-electric-blue/30 transition-all cursor-pointer"
            title="Share or copy broadcast link"
          >
            {copied ? (
              <>
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="h-3 w-3" />
                <span>Share</span>
              </>
            )}
          </button>

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
            <span>{joined ? "Live Feed" : "Offline"}</span>
          </div>

          {joined && (
            <div className="flex items-center gap-1 rounded bg-zinc-900 border border-white/[0.06] px-2 py-0.5 text-[9px] text-zinc-400 font-bold uppercase">
              <Users className="h-3 w-3 text-electric-blue" />
              <span>{audienceCount} listeners</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex-1 max-w-4xl mx-auto w-full my-6 grid gap-6 md:grid-cols-5 items-stretch">
        
        {/* Left Column: Feeds & Info Sheets (3 Columns) */}
        <div className="md:col-span-3 flex flex-col justify-between gap-6">
          {/* Host Card */}
          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-5 space-y-4 shadow-inner relative overflow-hidden">
            <div className="absolute top-0 right-0 h-32 w-32 bg-electric-blue/5 rounded-full blur-3xl pointer-events-none" />
            
            <div>
              <span className="text-[9px] font-extrabold text-zinc-500 uppercase tracking-widest block">Broadcast Profile</span>
              <h2 className="text-lg font-bold text-white tracking-tight mt-0.5 truncate">{eventDetails?.name}</h2>
              <p className="text-[11px] text-zinc-500">Organization: {eventDetails?.organizations?.name || "AetherVOX Host"}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-white/[0.04] pt-4 text-xs">
              <div>
                <span className="text-[9px] font-bold text-zinc-500 uppercase block">Host Source Language</span>
                <span className="text-zinc-200 mt-0.5 block truncate">{getLanguageLabelFromCode(eventDetails?.sourceLanguage || "en-US")}</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-zinc-500 uppercase block">Your Translated Feed</span>
                <select
                  disabled={joined}
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="h-7 w-full rounded border border-white/[0.06] bg-zinc-950 px-2 py-0.5 text-xs text-zinc-300 focus:outline-none focus:border-electric-blue/50 disabled:opacity-50 mt-0.5"
                >
                  {eventDetails?.targetLanguages?.length > 0 ? (
                    eventDetails.targetLanguages.map((lang: string) => (
                      <option key={lang} value={lang}>
                        {getLanguageLabelFromCode(lang)}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No languages configured</option>
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Subtitles Feeds Panel */}
          <div className="flex-1 rounded-xl border border-white/[0.06] bg-zinc-950/40 p-5 min-h-[220px] max-h-[300px] overflow-y-auto custom-scrollbar flex flex-col justify-end">
            <AnimatePresence>
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center text-zinc-500 text-xs py-10">
                  <div className="space-y-1.5">
                    <Radio className="h-5 w-5 mx-auto text-zinc-650 animate-pulse" />
                    <span>{joined ? "Awaiting live translated transcripts..." : "Join to connect to translation feed"}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {messages.map((msg, idx) => {
                    const translatedText = msg.translatedText[selectedLanguage];
                    const originalText = msg.originalText;
                    const isLast = idx === messages.length - 1;

                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`space-y-1 ${isLast ? "border-l-2 border-electric-blue pl-2.5" : "pl-3 text-zinc-400"}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[8px] text-zinc-500 font-mono">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </span>
                          <span className="text-[8px] text-zinc-600 font-mono">
                            {msg.voice?.split("-").slice(-1)[0] || ""}
                          </span>
                        </div>
                        {translatedText && (
                          <p className={`text-xs leading-relaxed ${isLast ? "text-white font-semibold text-sm" : ""}`}>
                            {translatedText}
                          </p>
                        )}
                        {originalText && originalText !== translatedText && (
                          <p className="text-[10px] text-zinc-500 leading-relaxed italic">
                            {originalText}
                          </p>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column: Audio Telemetry & Controls (2 Columns) */}
        <div className="md:col-span-2 flex flex-col justify-between gap-6">
          
          {/* Telemetry Dashboard Card */}
          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-5 space-y-4 shadow-inner">
            <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
              <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">Audio Telemetry</span>
              
              {/* Connection Quality Badge */}
              <div className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[8px] font-extrabold uppercase ${
                getConnectionQuality() === "excellent"
                  ? "text-emerald-400 bg-emerald-500/10"
                  : getConnectionQuality() === "good"
                  ? "text-blue-400 bg-blue-500/10"
                  : getConnectionQuality() === "poor"
                  ? "text-amber-400 bg-amber-500/10"
                  : "text-red-400 bg-red-500/10"
              }`}>
                <Activity className="h-3 w-3" />
                <span>Link: {getConnectionQuality()}</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 text-[11px] flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-zinc-650" />
                  <span>Est. Latencies</span>
                </span>
                <div className="text-right font-mono text-[10px] space-y-0.5">
                  <div className="text-zinc-400">Net: {joined ? `${estimatedNetworkLatency}ms` : "--"}</div>
                  <div className="text-zinc-400">Play Queue: {joined ? `${Math.round(bufferState.bufferedDuration)}ms` : "--"}</div>
                  <div className="text-electric-blue font-bold">Total: {joined ? `${Math.round(getEndToEndLatency())}ms` : "--"}</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-500 text-[11px] flex items-center gap-1.5">
                  <Database className="h-3.5 w-3.5 text-zinc-650" />
                  <span>Buffer Queue</span>
                </span>
                <span className="text-zinc-300 font-bold font-mono">
                  {joined ? `${bufferState.queueLength} packets` : "0 / 0"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-500 text-[11px] flex items-center gap-1.5">
                  <Network className="h-3.5 w-3.5 text-zinc-650" />
                  <span>Sample / Bitrate</span>
                </span>
                <span className="text-zinc-400 font-mono text-[10px]">
                  {joined ? "16 kHz / 256kbps" : "-- / --"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-500 text-[11px] flex items-center gap-1.5">
                  <HelpCircle className="h-3.5 w-3.5 text-zinc-650" />
                  <span>Packet Sync</span>
                </span>
                <div className="font-mono text-[9px] text-zinc-400 text-right">
                  <div>Recv: {bufferState.completedPacketsCount}</div>
                  <div>Loss/Drop: {bufferState.droppedPacketsCount}</div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-white/[0.04] pt-2">
                <span className="text-zinc-500 text-[11px]">Neural Voice</span>
                <span className="text-zinc-300 font-bold max-w-[130px] truncate block" title={currentVoice}>
                  {joined ? currentVoice.split("-").slice(-2).join("-") : "--"}
                </span>
              </div>
            </div>
          </div>

          {/* Controls Panel */}
          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-5 space-y-4">
            
            {/* Player state feedback label */}
            <div className="text-center">
              <span className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest">Playback Status</span>
              <p className="text-xs font-bold text-zinc-200 mt-0.5">{getPlaybackStatusLabel()}</p>
            </div>

            {/* Volume controls */}
            <div className="space-y-2 border-t border-white/[0.04] pt-3">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Playback Volume</span>
                <span>{mute ? "Muted" : `${volume}%`}</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleToggleMute}
                  disabled={!joined}
                  className="text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer"
                  title="Toggle Mute (Key: M)"
                >
                  {mute ? (
                    <VolumeX className="h-4.5 w-4.5 text-red-500" />
                  ) : volume > 50 ? (
                    <Volume2 className="h-4.5 w-4.5 text-electric-blue" />
                  ) : (
                    <Volume1 className="h-4.5 w-4.5 text-electric-blue" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  disabled={mute || !joined}
                  onChange={handleVolumeChange}
                  className="w-full h-1 bg-zinc-950 rounded-lg appearance-none cursor-pointer accent-electric-blue disabled:opacity-30"
                />
              </div>
            </div>

            {/* Interaction controls */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {!sessionActive ? (
                <div className="col-span-2 rounded border border-red-500/20 bg-red-500/5 p-3 text-center text-red-400 text-xs flex items-center justify-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 animate-pulse" />
                  <span>Live streaming session stopped by host.</span>
                </div>
              ) : !joined ? (
                <button
                  onClick={handleJoin}
                  className="col-span-2 h-11 rounded-lg bg-gradient-to-r from-electric-blue to-accent-purple hover:from-electric-blue/90 hover:to-accent-purple/90 text-black font-bold text-xs tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(0,212,255,0.15)]"
                >
                  <Play className="h-4 w-4 fill-current" />
                  <span>JOIN BROADCAST</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={handleTogglePlayPause}
                    className="h-10 rounded-lg border border-white/[0.08] bg-zinc-900 hover:bg-zinc-800 text-zinc-350 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                    title="Pause / Resume Queue (Key: Space)"
                  >
                    {playbackState === "paused" ? (
                      <>
                        <Play className="h-4 w-4 fill-current text-emerald-400" />
                        <span>Resume</span>
                      </>
                    ) : (
                      <>
                        <Pause className="h-4 w-4 fill-current text-amber-400" />
                        <span>Pause</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={handleLeave}
                    className="h-10 rounded-lg bg-zinc-900 border border-white/[0.08] hover:bg-zinc-800 text-red-400 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Square className="h-3.5 w-3.5 fill-current" />
                    <span>Leave</span>
                  </button>

                  <button
                    onClick={handleManualReconnect}
                    className="col-span-2 h-9 rounded bg-zinc-950 border border-white/[0.06] hover:bg-zinc-900 text-zinc-400 hover:text-white text-[11px] font-bold tracking-wide flex items-center justify-center gap-1.5 cursor-pointer transition-all mt-1"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>MANUAL RECONNECT</span>
                  </button>
                </>
              )}
            </div>
            
            {joined && (
              <span className="text-[9px] text-zinc-650 text-center block leading-none">
                Space: Pause/Resume • M: Mute • Up/Down: Vol
              </span>
            )}
          </div>
        </div>

      </div>

      {/* Footer Branding */}
      <div className="text-center border-t border-white/[0.04] pt-4 mt-6 text-[10px] text-zinc-600 flex flex-col sm:flex-row items-center justify-center gap-2">
        <span>Powered by AetherVOX Real-Time Neural Translation.</span>
        <span className="hidden sm:inline">•</span>
        <span>Low-latency AudioSync engine active.</span>
      </div>
    </div>
  );
}
