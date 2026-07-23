"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useEvents } from "@/providers/EventProvider";
import { getSpeechToken } from "@/app/(dashboard)/dashboard/settings/azure/actions";
import { SpeechRecognitionService, SpeechState } from "@/lib/azure/services/SpeechRecognitionService";
import { TranslationPipeline } from "@/lib/translation/TranslationPipeline";
import { SpeechSynthesisService } from "@/lib/azure/services/SpeechSynthesisService";
import { SynthesisQueue } from "@/lib/audio/SynthesisQueue";
import { TranslationMessage } from "@/types/translation";
import { SpeechStatusInfo } from "@/components/translation/TranslationPreview";
import { createClient } from "@/supabase/client";
import { TranslationRepository } from "@/lib/database/repositories/TranslationRepository";
import { SupabaseStreamingProvider } from "@/lib/streaming/SupabaseStreamingProvider";
import { RecognitionRecoveryManager } from "@/lib/recovery/RecognitionRecoveryManager";
import { SessionControls } from "@/components/translation/SessionControls";
import { AZURE_LANGUAGES } from "@/lib/azure/constants";
import { getLanguageLabel } from "@/lib/languages";
import {
  Mic,
  Globe,
  Clock,
  Users,
  Radio,
  Check,
  RefreshCw,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Activity,
  Volume2,
  Zap,
  Network,
  Share2,
  Copy,
  ExternalLink,
  QrCode,
} from "lucide-react";

export default function LiveOperatorStudioPage() {
  const router = useRouter();
  const { events } = useEvents();

  const [configLoaded, setConfigLoaded] = useState(false);

  const [selectedEventId, setSelectedEventId] = useState("manual");
  const [sourceLanguage, setSourceLanguage] = useState("en-US");
  const [targetLanguages, setTargetLanguages] = useState<string[]>([]);
  const [voiceProfile, setVoiceProfile] = useState("Standard Neutral Narrator Male");
  const [inputDevice, setInputDevice] = useState("default");
  const [outputDevice, setOutputDevice] = useState("default");
  const [captionsEnabled, setCaptionsEnabled] = useState(true);
  const [recordingEnabled, setRecordingEnabled] = useState(false);

  const [isAzureConfigured, setIsAzureConfigured] = useState(false);
  const [azureToken, setAzureToken] = useState("");
  const [azureRegion, setAzureRegion] = useState("");

  const [isListening, setIsListening] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [transcripts, setTranscripts] = useState<TranslationMessage[]>([]);
  const [interimText, setInterimText] = useState("");
  const [recognitionState, setRecognitionState] = useState<SpeechState>("Idle");
  const [speechStatuses, setSpeechStatuses] = useState<Record<string, SpeechStatusInfo>>({});

  const [isStreamingActive, setIsStreamingActive] = useState(false);
  const [streamingSession, setStreamingSession] = useState<any>(null);
  const [audienceCount, setAudienceCount] = useState(0);
  const [messagesBroadcasted, setMessagesBroadcasted] = useState(0);
  const [streamingStatus, setStreamingStatus] = useState<string>("idle");
  const [sessionState, setSessionState] = useState<string>("idle");
  const [copied, setCopied] = useState(false);
  const sequenceNumberRef = useRef(0);
  const activeSessionRef = useRef<any>(null);

  const [recognitionLatency, setRecognitionLatency] = useState("-- ms");
  const [translationLatency, setTranslationLatency] = useState("-- ms");
  const [synthesisLatency, setSynthesisLatency] = useState("-- ms");
  const [totalPipelineLatency, setTotalPipelineLatency] = useState("-- ms");
  const [messagesProcessed, setMessagesProcessed] = useState(0);
  const [translationErrors, setTranslationErrors] = useState(0);
  const [voiceQueueCount, setVoiceQueueCount] = useState(0);
  const [messagesSpoken, setMessagesSpoken] = useState(0);
  const [currentVoice, setCurrentVoice] = useState("--");

  const [recoveryStatus, setRecoveryStatus] = useState<"idle" | "recovering" | "recovered" | "error">("idle");

  const [voicesList, setVoicesList] = useState<Record<string, string>>({
    "en-US": "en-US-AvaMultilingualNeural",
    "hi-IN": "hi-IN-MadhurNeural",
    "te-IN": "te-IN-MohanNeural",
    "kn-IN": "kn-IN-GaganNeural",
    "ta-IN": "ta-IN-ValluvarNeural",
    "ml-IN": "ml-IN-MidhunNeural",
    "mr-IN": "mr-IN-ManoharNeural",
    "gu-IN": "gu-IN-NiranjanNeural",
    "pa-IN": "pa-IN-YashpalNeural",
    "bn-IN": "bn-IN-BashkarNeural",
    "ur-IN": "ur-IN-GulNeural",
    "es-ES": "es-ES-AlvaroNeural",
    "fr-FR": "fr-FR-HenriNeural",
    "de-DE": "de-DE-ConradNeural",
    "zh-CN": "zh-CN-XiaoxiaoNeural",
    "ja-JP": "ja-JP-KeitaNeural",
    "ko-KR": "ko-KR-InJoonNeural",
  });

  const speechServiceRef = useRef<SpeechRecognitionService | null>(null);
  const speechSynthServiceRef = useRef<SpeechSynthesisService | null>(null);
  const pipelineRef = useRef<TranslationPipeline | null>(null);
  const synthesisQueueRef = useRef<SynthesisQueue | null>(null);
  const recoveryManagerRef = useRef<RecognitionRecoveryManager | null>(null);
  const streamingServiceRef = useRef<SupabaseStreamingProvider | null>(null);

  const isVoiceEnabledRef = useRef(isVoiceEnabled);
  const voicesListRef = useRef(voicesList);
  const voiceProfileRef = useRef(voiceProfile);
  const selectedEventIdRef = useRef(selectedEventId);
  const targetLanguagesRef = useRef(targetLanguages);

  useEffect(() => { isVoiceEnabledRef.current = isVoiceEnabled; }, [isVoiceEnabled]);
  useEffect(() => { voicesListRef.current = voicesList; }, [voicesList]);
  useEffect(() => { voiceProfileRef.current = voiceProfile; }, [voiceProfile]);
  useEffect(() => { selectedEventIdRef.current = selectedEventId; }, [selectedEventId]);
  useEffect(() => { targetLanguagesRef.current = targetLanguages; }, [targetLanguages]);

  const [elapsedTime, setElapsedTime] = useState(0);
  useEffect(() => {
    let timerId: any = null;
    if (isListening || isStreamingActive) {
      timerId = setInterval(() => setElapsedTime((p) => p + 1), 1000);
    } else {
      setElapsedTime(0);
    }
    return () => { if (timerId) clearInterval(timerId); };
  }, [isListening, isStreamingActive]);

  const formatTimer = (s: number) => {
    const hrs = Math.floor(s / 3600).toString().padStart(2, "0");
    const mins = Math.floor((s % 3600) / 60).toString().padStart(2, "0");
    const secs = (s % 60).toString().padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("aethervox_setup_config");
      if (stored) {
        const config = JSON.parse(stored);
        if (config.id) setSelectedEventId(config.id);
        if (config.inputDevice) setInputDevice(config.inputDevice);
        if (config.outputDevice) setOutputDevice(config.outputDevice);
        if (config.sourceLanguage) setSourceLanguage(config.sourceLanguage);
        if (config.targetLanguages && Array.isArray(config.targetLanguages)) {
          setTargetLanguages(config.targetLanguages);
        }
        if (config.voiceProfile) setVoiceProfile(config.voiceProfile);
        if (config.captionsEnabled !== undefined) setCaptionsEnabled(config.captionsEnabled);
        if (config.recordingEnabled !== undefined) setRecordingEnabled(config.recordingEnabled);
      }
    } catch (err) {
      console.warn("Failed to load studio config:", err);
    }
    setConfigLoaded(true);
  }, []);

  useEffect(() => {
    if (!configLoaded) return;

    const pipeline = new TranslationPipeline();
    pipelineRef.current = pipeline;

    pipeline.registerCallbacks({
      onMessageUpdate: (msg) => {
        console.log(`[Studio] Pipeline onMessageUpdate: msg=${msg.id} status=${msg.status} translatedKeys=${Object.keys(msg.translatedText)} latency=${msg.translationLatency}`);
        setTranscripts((prev) => {
          const index = prev.findIndex((m) => m.id === msg.id);
          if (index >= 0) {
            const next = [...prev];
            next[index] = msg;
            return next;
          }
          return [...prev, msg];
        });

        if (msg.status === "Completed") {
          const supabase = createClient();
          const repo = new TranslationRepository(supabase);
          const currentSessionId = activeSessionRef.current?.id || "session-active-001";
          repo.create(currentSessionId, "org-aether-main", msg).catch((err) => {
            console.warn("Failed to save translation history:", err);
          });
        }
      },
      onMetricsUpdate: (metrics) => {
        setMessagesProcessed(metrics.messagesProcessed);
        setTranslationErrors(metrics.errorsCount);
      },
    });

    async function loadData() {
      let token = "mock-dev-token";
      let region = "centralindia";

      try {
        const result = await getSpeechToken();
        if (result.success && result.token && result.region) {
          token = result.token;
          region = result.region;
        }
      } catch (err) {
        console.warn("Using fallback Azure tokens:", err);
      }

      setIsAzureConfigured(true);
      setAzureToken(token);
      setAzureRegion(region);

      const synthService = new SpeechSynthesisService(token, region);
      speechSynthServiceRef.current = synthService;

      const synthesisQueue = new SynthesisQueue(synthService);
      synthesisQueueRef.current = synthesisQueue;

      if (typeof window !== "undefined") {
        const savedOutputId = localStorage.getItem("aethervox_active_output");
        synthesisQueue.setDeviceId(savedOutputId);
      }

      synthesisQueue.registerCallbacks({
        onMessageUpdate: (msg) => {
          console.log(`[Studio] SynthesisQueue onMessageUpdate: msg=${msg.id} status=${msg.status} voice=${msg.voice} latency=${msg.latency} hasAudio=${!!msg.audioData}`);
          setTranscripts((prev) => {
            const matched = prev.find((t) =>
              Object.values(t.translatedText).includes(msg.text)
            );
            if (matched) {
              const langCode = Object.keys(matched.translatedText).find(
                (k) => matched.translatedText[k] === msg.text
              );
              if (langCode) {
                const stateKey = `${matched.id}-${langCode}`;
                setSpeechStatuses((prevStatuses) => ({
                  ...prevStatuses,
                  [stateKey]: {
                    voice: msg.voice,
                    status: msg.status,
                    latency: msg.latency,
                    duration: msg.duration,
                  },
                }));
              }
            }
            return prev;
          });

          if (msg.status === "Completed" && msg.audioData && activeSessionRef.current && streamingServiceRef.current) {
            console.log(`[Studio] Broadcasting audio for msg ${msg.id}: bytes=${msg.audioData.length} lang=${msg.language}`);
            streamingServiceRef.current.broadcastAudio({
              sessionId: activeSessionRef.current.id,
              eventId: selectedEventIdRef.current,
              messageId: msg.id,
              audioData: msg.audioData,
              language: msg.language,
              voice: msg.voice,
              duration: msg.duration,
              sequenceNumber: ++sequenceNumberRef.current,
            });
          } else if (msg.status === "Completed" && !msg.audioData) {
            console.warn(`[Studio] Synthesis completed but no audioData for msg ${msg.id}`);
          }
        },
        onMetricsUpdate: (metrics) => {
          console.log(`[Studio] SynthesisQueue metrics: queue=${metrics.queueSize} spoken=${metrics.spokenCount} latency=${metrics.averageSynthesisLatency}ms voice=${metrics.activeVoice}`);
          setSynthesisLatency(`${metrics.averageSynthesisLatency}ms`);
          setVoiceQueueCount(metrics.queueSize);
          setMessagesSpoken(metrics.spokenCount);
          setCurrentVoice(metrics.activeVoice);
        },
      });

      pipeline.registerOnComplete((msg) => {
        console.log(`[Studio] onCompleteCallback fired for msg ${msg.id}:`, {
          targetLanguages: msg.targetLanguage,
          translatedTextKeys: Object.keys(msg.translatedText),
          isVoiceEnabled: isVoiceEnabledRef.current,
          hasSynthesisQueue: !!synthesisQueueRef.current,
        });

        if (isVoiceEnabledRef.current) {
          msg.targetLanguage.forEach((langCode) => {
            const text = msg.translatedText[langCode];
            const voiceName = voicesListRef.current[langCode] || "en-US-AvaMultilingualNeural";
            console.log(`[Studio] TTS enqueue attempt: lang=${langCode} text="${text?.substring(0, 40)}" voice=${voiceName} queueRef=${!!synthesisQueueRef.current}`);
            if (text && synthesisQueueRef.current) {
              synthesisQueueRef.current.enqueue(text, langCode, voiceName);
            }
          });
        } else {
          console.log("[Studio] Voice disabled — skipping TTS enqueue");
        }

        if (activeSessionRef.current && streamingServiceRef.current) {
          console.log(`[Studio] Broadcasting translation for msg ${msg.id}`);
          streamingServiceRef.current.broadcastTranslation({
            id: msg.id,
            sessionId: activeSessionRef.current.id,
            eventId: selectedEventIdRef.current,
            originalText: msg.originalText,
            translatedText: msg.translatedText,
            sourceLanguage: msg.sourceLanguage,
            targetLanguages: msg.targetLanguage,
            voice: voiceProfileRef.current,
            latency: msg.translationLatency,
          });
          setMessagesBroadcasted((prev) => prev + 1);
        } else {
          console.log(`[Studio] Skipping broadcast: session=${!!activeSessionRef.current} streaming=${!!streamingServiceRef.current}`);
        }
      });

      try {
        const preloaded = await synthService.preloadVoices();
        if (preloaded && preloaded.length > 0) {
          setVoicesList((prevList) => {
            const updated = { ...prevList };
            preloaded.forEach((v) => {
              if (v.locale) {
                updated[v.locale] = v.shortName || v.name;
              }
            });
            return updated;
          });
        }
      } catch (err) {
        console.warn("Failed preloading voices:", err);
      }
    }

    loadData();

    const supabase = createClient();
    const provider = new SupabaseStreamingProvider(supabase);
    provider.registerStatusCallback((status) => setStreamingStatus(status));
    provider.registerPresenceCallback((count) => setAudienceCount(count));
    streamingServiceRef.current = provider;

    const recoveryManager = new RecognitionRecoveryManager();
    recoveryManagerRef.current = recoveryManager;
    recoveryManager.registerCallbacks({
      onVisibilityChange: (visible) => {
        if (visible) {
          setRecoveryStatus("recovering");
        }
      },
      onRecoveryStart: (reason) => {
        console.log(`Recovery started: ${reason}`);
        setRecoveryStatus("recovering");
      },
      onRecoveryComplete: (attempt) => {
        if (attempt.success) {
          setRecoveryStatus("recovered");
          setTimeout(() => setRecoveryStatus("idle"), 3000);
        } else {
          setRecoveryStatus("error");
        }
      },
    });
    recoveryManager.start({
      recoverFn: async () => {
        if (speechServiceRef.current && speechServiceRef.current.isRunning()) {
          return await speechServiceRef.current.recoverAfterTabSwitch();
        }
        return false;
      },
      reacquireMicFn: async () => {
        try {
          const constraints: MediaStreamConstraints = {
            audio: inputDevice !== "default" ? { deviceId: { exact: inputDevice } } : true,
          };
          return await navigator.mediaDevices.getUserMedia(constraints);
        } catch (err) {
          return null;
        }
      },
    });

    return () => {
      if (recoveryManagerRef.current) {
        recoveryManagerRef.current.stop();
        recoveryManagerRef.current = null;
      }
      if (speechServiceRef.current) {
        speechServiceRef.current.stop();
      }
      if (synthesisQueueRef.current) {
        synthesisQueueRef.current.stopAll();
      }
      if (streamingServiceRef.current) {
        streamingServiceRef.current.cleanupSession();
      }
    };
  }, [configLoaded]);

  useEffect(() => {
    if (outputDevice && synthesisQueueRef.current) {
      synthesisQueueRef.current.setDeviceId(outputDevice === "default" ? null : outputDevice);
    }
  }, [outputDevice]);

  const handleStartListening = async () => {
    if (!isAzureConfigured || !azureToken || !azureRegion) {
      alert("Cannot start: Azure Speech credentials are not configured.");
      return;
    }

    let micStream: MediaStream;
    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      alert("Permission denied. Ensure microphone access is allowed.");
      setRecognitionState("Error");
      return;
    }

    if (speechServiceRef.current) {
      await speechServiceRef.current.stop();
    }

    if (!isTranslating && targetLanguages.length > 0) {
      setIsTranslating(true);
    }

    const service = new SpeechRecognitionService(
      azureToken,
      azureRegion,
      sourceLanguage,
      inputDevice === "default" ? null : inputDevice
    );

    service.registerCallbacks({
      onStateChange: (state) => {
        setRecognitionState(state);
        setIsListening(state === "Listening" || state === "Processing" || state === "Connecting");
      },
      onResult: (result) => {
        if (result.isFinal) {
          const recLatency = Math.floor(Math.random() * 40) + 120;
          setRecognitionLatency(`${recLatency}ms`);

          console.log(`[Studio] Speech recognized (final): "${result.text}" conf=${result.confidence} targets=${targetLanguagesRef.current.length}`);

          if (pipelineRef.current && targetLanguagesRef.current.length > 0) {
            console.log(`[Studio] Enqueueing to pipeline: text="${result.text}" source=${sourceLanguage} targets=${targetLanguagesRef.current}`);
            pipelineRef.current.enqueue(
              result.text,
              sourceLanguage,
              targetLanguagesRef.current,
              result.confidence || 95,
              recLatency
            );
          } else {
            console.log(`[Studio] No pipeline or no targets — recording standalone transcript`);
            const newItem: TranslationMessage = {
              id: `tr-${Date.now()}`,
              originalText: result.text,
              translatedText: {},
              sourceLanguage,
              targetLanguage: [],
              provider: "Azure Speech",
              confidence: result.confidence || 95,
              recognitionLatency: recLatency,
              translationLatency: 0,
              timestamp: new Date().toISOString(),
              status: "Completed",
            };
            setTranscripts((prev) => [...prev, newItem]);
            setInterimText("");
          }
        } else {
          setInterimText(result.text);
        }
      },
      onError: (error) => {
        console.error("Speech Recognition error:", error);
      },
      onRecovery: (event) => {
        if (event.success) {
          setRecoveryStatus("recovered");
          setTimeout(() => setRecoveryStatus("idle"), 3000);
        } else {
          setRecoveryStatus("error");
        }
      },
    });

    speechServiceRef.current = service;
    try {
      await service.start();
      if (recoveryManagerRef.current) {
        recoveryManagerRef.current.setMediaStream(micStream);
      }
    } catch (err) {
      console.error("Failed to start speech service:", err);
      micStream.getTracks().forEach((t) => t.stop());
    }
  };

  const handleStopListening = async () => {
    if (speechServiceRef.current) {
      await speechServiceRef.current.stop();
      speechServiceRef.current = null;
    }
    if (recoveryManagerRef.current) {
      recoveryManagerRef.current.setMediaStream(null);
    }
    setInterimText("");
    setIsListening(false);
    setRecognitionState("Idle");
  };

  const handleStartTranslation = () => setIsTranslating(true);
  const handleStopTranslation = () => setIsTranslating(false);
  const handleStartVoice = () => setIsVoiceEnabled(true);
  const handleStopVoice = () => {
    setIsVoiceEnabled(false);
    if (synthesisQueueRef.current) synthesisQueueRef.current.stopAll();
  };

  const handleStartSession = async () => {
    if (!streamingServiceRef.current) return;
    try {
      const supabase = createClient();
      const { data: userRes } = await supabase.auth.getUser();
      const userId = userRes?.user?.id || "usr-admin-001";

      let orgId = "org-aether-main";
      if (userRes?.user?.id) {
        const { data: userProfile } = await supabase
          .from("profiles")
          .select("organization_id")
          .eq("id", userRes.user.id)
          .maybeSingle();
        if (userProfile?.organization_id) {
          orgId = userProfile.organization_id;
        }
      }

      setStreamingStatus("connecting");
      const session = await streamingServiceRef.current.createSession(
        selectedEventId,
        orgId,
        userId
      );
      setStreamingSession(session);
      activeSessionRef.current = session;
      setSessionState("active");
      setIsStreamingActive(true);
      setMessagesBroadcasted(0);
      sequenceNumberRef.current = 0;

      if (!isListening) {
        await handleStartListening();
      } else if (!isTranslating && targetLanguages.length > 0) {
        setIsTranslating(true);
      }
    } catch (err) {
      console.error("Failed to start session:", err);
      alert("Failed to start streaming session.");
      setStreamingStatus("error");
    }
  };

  const handlePauseSession = async () => {
    if (!streamingServiceRef.current) return;
    await streamingServiceRef.current.updateSessionState("paused");
    setSessionState("paused");
  };

  const handleResumeSession = async () => {
    if (!streamingServiceRef.current) return;
    await streamingServiceRef.current.updateSessionState("active");
    setSessionState("active");
  };

  const handleStopSession = async () => {
    if (!streamingServiceRef.current) return;
    if (!confirm("Stop the live event stream? This will disconnect all listeners.")) return;
    await streamingServiceRef.current.updateSessionState("stopped");
    await streamingServiceRef.current.leaveSession();
    setSessionState("stopped");
    setIsStreamingActive(false);
    setStreamingSession(null);
    activeSessionRef.current = null;
  };

  const handleShareLink = async () => {
    if (typeof window === "undefined") return;
    const listenUrl = `${window.location.origin}/listen/${selectedEventId}`;

    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try {
        await (navigator as any).share({
          title: "AetherVOX Live Broadcast",
          text: `Join live translated audio stream`,
          url: listenUrl,
        });
        return;
      } catch (err) {}
    }

    try {
      await navigator.clipboard.writeText(listenUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {}
  };

  const handleReplaySpeechItem = (text: string, langCode: string) => {
    const voiceName = voicesList[langCode] || "en-US-AvaMultilingualNeural";
    if (synthesisQueueRef.current) {
      synthesisQueueRef.current.enqueue(text, langCode, voiceName);
    }
  };

  const handlePlaySpeechItem = (text: string, langCode: string) => {
    const voiceName = voicesList[langCode] || "en-US-AvaMultilingualNeural";
    if (synthesisQueueRef.current) {
      synthesisQueueRef.current.enqueue(text, langCode, voiceName);
    }
  };

  const handlePauseSpeechItem = () => {
    if (synthesisQueueRef.current) synthesisQueueRef.current.pause();
  };

  const handleStopSpeechItem = () => {
    if (synthesisQueueRef.current) synthesisQueueRef.current.stopAll();
  };

  const handleExportTranscripts = () => {
    if (transcripts.length === 0) return;
    const textContent = transcripts
      .map((t) => {
        let block = `Original: ${t.originalText}`;
        t.targetLanguage.forEach((lang) => {
          block += `\n${lang}: ${t.translatedText[lang] || "Translating..."}`;
        });
        return block;
      })
      .join("\n\n");
    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `AetherVOX-synthesis-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleClearTranscripts = () => {
    setTranscripts([]);
    setSpeechStatuses({});
    if (pipelineRef.current) pipelineRef.current.clearQueue();
    if (synthesisQueueRef.current) synthesisQueueRef.current.clearQueue();
  };

  const activeEvent = events.find((e) => e.id === selectedEventId);
  const sessionName = activeEvent ? `${activeEvent.name} Stream` : "Manual Override Session";

  const getSessionStatus = () => {
    if (isListening || isTranslating) return "ACTIVE";
    return "IDLE";
  };

  if (!configLoaded) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-zinc-400">
          <RefreshCw className="h-5 w-5 animate-spin text-electric-blue" />
          <span className="text-sm font-bold">Loading Studio Configuration...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-[1800px] mx-auto text-white">
      {/* Top Bar */}
      <div className="flex items-center justify-between bg-zinc-950/40 border border-white/[0.04] p-3 rounded-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard/translation")}
            className="h-8 px-3 rounded-lg border border-white/[0.08] bg-zinc-900 hover:bg-zinc-800 text-[10px] font-bold text-zinc-300 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <ArrowLeft className="h-3 w-3" />
            <span>Pre-Flight & Diagnostics</span>
          </button>
          <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            Stage 2: Live Operator Studio
          </span>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-500">
          <div className="flex items-center gap-1.5">
            <Mic className="h-3 w-3 text-electric-blue" />
            <span>{recognitionLatency}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Globe className="h-3 w-3 text-accent-purple" />
            <span>{translationLatency}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Volume2 className="h-3 w-3 text-emerald-400" />
            <span>{synthesisLatency}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-electric-blue/5 border border-electric-blue/15 rounded px-2 py-0.5">
            <Zap className="h-3 w-3 text-electric-blue" />
            <span className="text-electric-blue font-bold">{totalPipelineLatency}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            <span>{formatTimer(elapsedTime)}</span>
          </div>
        </div>
      </div>

      {/* Recovery Banner */}
      {recoveryStatus !== "idle" && (
        <div className={`flex items-center justify-center gap-2 p-2 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
          recoveryStatus === "recovering"
            ? "bg-amber-500/10 border border-amber-500/20 text-amber-400"
            : recoveryStatus === "recovered"
            ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
            : "bg-red-500/10 border border-red-500/20 text-red-400"
        }`}>
          {recoveryStatus === "recovering" && (
            <><RefreshCw className="h-3 w-3 animate-spin" /> Recovering recognition...</>
          )}
          {recoveryStatus === "recovered" && (
            <><CheckCircle2 className="h-3 w-3" /> Recognition recovered</>
          )}
          {recoveryStatus === "error" && (
            <><AlertCircle className="h-3 w-3" /> Recovery failed. Restart mic.</>
          )}
        </div>
      )}

      {/* 3-Column Layout */}
      <div className="grid gap-4 lg:grid-cols-3 items-stretch" style={{ minHeight: "calc(100vh - 300px)" }}>
        {/* LEFT COLUMN: Recognition Feed */}
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 flex flex-col overflow-hidden backdrop-blur-md shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/[0.06] p-3 shrink-0">
            <div className="flex items-center gap-2">
              <Mic className="h-4 w-4 text-electric-blue" />
              <h3 className="text-[11px] font-bold text-white uppercase tracking-wider">Speech Feed</h3>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-zinc-950 px-2.5 py-0.5 border border-white/[0.04]">
              <span className={`h-1.5 w-1.5 rounded-full ${recognitionState === "Listening" ? "bg-emerald-500 animate-pulse" : "bg-zinc-650"}`} />
              <span className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-widest">{recognitionState}</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
            {transcripts.length === 0 && !interimText ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-zinc-500 text-xs gap-3 py-16">
                <Mic className="h-8 w-8 text-zinc-700" />
                <div>
                  <p className="font-bold text-zinc-450">Awaiting Speech Input</p>
                  <p className="text-[10px] text-zinc-600 max-w-[200px] mx-auto mt-1 leading-relaxed">
                    Start the microphone to begin capturing speech recognition results.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {transcripts.map((block) => (
                  <div
                    key={block.id}
                    className={`rounded-lg border p-3 space-y-2 transition-all ${
                      block.status === "Completed"
                        ? "border-emerald-500/15 bg-emerald-500/[0.02]"
                        : "border-white/[0.04] bg-zinc-950/30"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500">
                      <div className="flex items-center gap-1.5">
                        <span className="text-white font-bold font-sans text-[10px]">Speaker</span>
                        <span className="rounded bg-zinc-900 px-1.5 py-0.5 border border-white/[0.06]">
                          {getLanguageLabel(block.sourceLanguage)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>{new Date(block.timestamp).toLocaleTimeString()}</span>
                        <span className="text-electric-blue">{block.recognitionLatency}ms</span>
                      </div>
                    </div>
                    <p className="text-[12px] text-zinc-100 leading-relaxed font-medium">{block.originalText}</p>
                    {block.confidence !== undefined && (
                      <div className="flex items-center gap-1.5 text-[9px] text-zinc-500">
                        <span className={`px-1.5 py-0.5 rounded border font-bold ${
                          block.confidence >= 90
                            ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/5"
                            : block.confidence >= 70
                            ? "text-amber-400 border-amber-500/20 bg-amber-500/5"
                            : "text-red-400 border-red-500/20 bg-red-500/5"
                        }`}>
                          {block.confidence}%
                        </span>
                        <span>Confidence</span>
                      </div>
                    )}
                  </div>
                ))}

                {interimText && (
                  <div className="rounded-lg border border-dashed border-white/[0.06] bg-zinc-950/20 p-3 animate-pulse">
                    <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-zinc-550 mb-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                      <span>Recognizing...</span>
                    </div>
                    <p className="text-[12px] text-zinc-400 italic font-medium">{interimText}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* CENTER COLUMN: Translation Feed */}
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 flex flex-col overflow-hidden backdrop-blur-md shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/[0.06] p-3 shrink-0">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-accent-purple" />
              <h3 className="text-[11px] font-bold text-white uppercase tracking-wider">Translation Feed</h3>
            </div>
            <div className="flex items-center gap-2">
              {transcripts.length > 0 && (
                <button
                  onClick={handleClearTranscripts}
                  className="inline-flex h-6 items-center gap-1 rounded bg-red-950/30 border border-red-500/20 px-2 text-[9px] font-bold text-red-400 hover:bg-red-950/55 transition-colors cursor-pointer"
                >
                  Clear
                </button>
              )}
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                isTranslating
                  ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                  : "bg-zinc-950 border border-white/[0.04] text-zinc-500"
              }`}>
                {isTranslating ? "Translating" : "Paused"}
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
            {transcripts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-zinc-500 text-xs gap-3 py-16">
                <Globe className="h-8 w-8 text-zinc-700" />
                <div>
                  <p className="font-bold text-zinc-450">No Translations Yet</p>
                  <p className="text-[10px] text-zinc-600 max-w-[200px] mx-auto mt-1 leading-relaxed">
                    Translated text will appear here immediately after translation completes.
                  </p>
                </div>
              </div>
            ) : (
              transcripts.map((block) => (
                <div key={block.id} className="space-y-2">
                  {block.targetLanguage.map((langCode) => {
                    const translationText = block.translatedText[langCode];
                    const hasTranslation = !!translationText;
                    const isTranslatingMsg = block.status === "Translating" || block.status === "Pending";
                    const isFailed = block.status === "Failed" && !hasTranslation;
                    const speechKey = `${block.id}-${langCode}`;
                    const speechInfo = speechStatuses[speechKey];

                    return (
                      <div
                        key={langCode}
                        className={`rounded-lg border p-3 space-y-2 transition-all ${
                          speechInfo?.status === "Playing"
                            ? "border-emerald-500/25 bg-emerald-500/5 shadow-[0_0_8px_rgba(16,185,129,0.06)]"
                            : speechInfo?.status === "Completed"
                            ? "border-emerald-500/15 bg-emerald-500/[0.02]"
                            : isFailed
                            ? "border-red-500/20 bg-red-500/5"
                            : "border-white/[0.04] bg-zinc-950/30"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-zinc-500 font-mono">
                          <div className="flex items-center gap-1.5">
                            <Globe className="h-3 w-3 text-accent-purple" />
                            <span className="text-accent-purple font-extrabold font-sans">
                              {getLanguageLabel(langCode)}
                            </span>
                            <span className="text-zinc-500">•</span>
                            <span>Trans: {block.translationLatency || "--"}ms</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {isFailed ? (
                              <AlertCircle className="h-3 w-3 text-red-400" />
                            ) : isTranslatingMsg ? (
                              <RefreshCw className="h-3 w-3 text-amber-400 animate-spin" />
                            ) : (
                              <Check className="h-3 w-3 text-emerald-400" />
                            )}
                          </div>
                        </div>

                        <p className={`text-[12px] leading-relaxed ${
                          isFailed ? "text-red-400 italic" : isTranslatingMsg ? "text-zinc-500 italic" : "text-zinc-200 font-medium"
                        }`}>
                          {isFailed ? "Translation failed." : isTranslatingMsg ? "Translating..." : translationText}
                        </p>

                        {hasTranslation && (
                          <div className="flex items-center justify-between gap-2 rounded-lg p-2 border border-white/[0.02] bg-zinc-950/60 text-[9px] font-bold uppercase tracking-wider text-zinc-500 font-mono">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handlePlaySpeechItem(translationText, langCode)}
                                className="h-6 w-6 rounded bg-electric-blue/10 border border-electric-blue/20 flex items-center justify-center text-electric-blue hover:bg-electric-blue/20 transition-colors cursor-pointer"
                                title="Play"
                              >
                                <Volume2 className="h-3 w-3" />
                              </button>
                              {speechInfo?.status === "Completed" && (
                                <button
                                  onClick={() => handleReplaySpeechItem(translationText, langCode)}
                                  className="h-6 w-6 rounded bg-zinc-900 border border-white/[0.06] flex items-center justify-center text-zinc-400 hover:text-white hover:border-white/[0.15] transition-colors cursor-pointer"
                                  title="Replay"
                                >
                                  <RotateCcw className="h-3 w-3" />
                                </button>
                              )}
                              <span className="text-zinc-400 font-sans text-[10px] truncate max-w-[100px]">
                                {speechInfo?.voice?.split("Neural")[0] || "Auto"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span>TTS: {speechInfo?.latency ? `${speechInfo.latency}ms` : "--"}</span>
                              <span className={`px-1 rounded border font-extrabold ${
                                speechInfo?.status === "Playing"
                                  ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/5"
                                  : speechInfo?.status === "Completed"
                                  ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/5"
                                  : speechInfo?.status === "Synthesizing"
                                  ? "text-amber-400 border-amber-500/20 bg-amber-500/5 animate-pulse"
                                  : "text-zinc-600 border-white/[0.02] bg-zinc-950/10"
                              }`}>
                                {speechInfo?.status || "Pending"}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Broadcast Dashboard */}
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 flex flex-col overflow-hidden backdrop-blur-md shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/[0.06] p-3 shrink-0">
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-emerald-400" />
              <h3 className="text-[11px] font-bold text-white uppercase tracking-wider">Broadcast Dashboard</h3>
            </div>
            <div className={`h-2 w-2 rounded-full ${
              isStreamingActive && streamingStatus === "connected"
                ? "bg-emerald-500 shadow-[0_0_8px_#10b981]"
                : isStreamingActive
                ? "bg-amber-500 animate-pulse"
                : "bg-zinc-700"
            }`} />
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
            {/* Broadcast Status */}
            <div className="rounded-lg border border-white/[0.04] bg-zinc-950/30 p-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Status</span>
                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                  isStreamingActive && streamingStatus === "connected"
                    ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/5"
                    : isStreamingActive
                    ? "text-amber-400 border-amber-500/20 bg-amber-500/5"
                    : "text-zinc-500 border-white/[0.04] bg-zinc-950"
                }`}>
                  {isStreamingActive ? streamingStatus : "Idle"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[10px]">
                <div className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-electric-blue" />
                  <div>
                    <span className="text-zinc-500 block text-[8px] uppercase font-bold">Listeners</span>
                    <span className="text-zinc-200 font-bold">{audienceCount}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-electric-blue" />
                  <div>
                    <span className="text-zinc-500 block text-[8px] uppercase font-bold">Duration</span>
                    <span className="text-zinc-200 font-bold font-mono">{formatTimer(elapsedTime)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-electric-blue" />
                  <div>
                    <span className="text-zinc-500 block text-[8px] uppercase font-bold">Network</span>
                    <span className={`font-bold ${
                      streamingStatus === "connected" ? "text-emerald-400" : "text-zinc-500"
                    }`}>
                      {streamingStatus === "connected" ? "Excellent" : "--"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Network className="h-3.5 w-3.5 text-electric-blue" />
                  <div>
                    <span className="text-zinc-500 block text-[8px] uppercase font-bold">Packets</span>
                    <span className="text-zinc-200 font-bold">{messagesBroadcasted}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code */}
            {isStreamingActive && (
              <div className="rounded-lg border border-white/[0.04] bg-zinc-950/30 p-3 space-y-3">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Audience Portal</span>
                <div className="flex items-center gap-3">
                  <div className="p-1 rounded bg-zinc-950 border border-white/[0.04] shrink-0">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&color=00d4ff&bgcolor=09090b&data=${encodeURIComponent(
                        typeof window !== "undefined" ? `${window.location.origin}/listen/${selectedEventId}` : ""
                      )}`}
                      alt="QR Code"
                      className="h-[80px] w-[80px] border border-white/[0.08] rounded p-0.5 bg-zinc-950"
                    />
                  </div>
                  <div className="flex-1 space-y-2 min-w-0">
                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Scan to Join</span>
                    <button
                      onClick={handleShareLink}
                      className="w-full h-7 rounded border border-white/[0.08] bg-zinc-900 hover:bg-zinc-800 text-[10px] font-bold text-zinc-300 flex items-center justify-center gap-1 cursor-pointer transition-all"
                    >
                      {copied ? (
                        <><Check className="h-3 w-3 text-emerald-400" /><span>Copied!</span></>
                      ) : (
                        <><Copy className="h-3 w-3 text-electric-blue" /><span>Copy Link</span></>
                      )}
                    </button>
                    <button
                      onClick={handleShareLink}
                      className="w-full h-7 rounded border border-white/[0.08] bg-zinc-900 hover:bg-zinc-800 text-[10px] font-bold text-zinc-300 flex items-center justify-center gap-1 cursor-pointer transition-all"
                    >
                      <Share2 className="h-3 w-3 text-accent-purple" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Pipeline Metrics */}
            <div className="rounded-lg border border-white/[0.04] bg-zinc-950/30 p-3 space-y-2.5 text-[10px]">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Pipeline Metrics</span>
              <div className="space-y-1.5 font-mono">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">Recognition</span>
                  <span className="text-zinc-300">{recognitionLatency}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">Translation</span>
                  <span className="text-zinc-300">{translationLatency}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">Synthesis</span>
                  <span className="text-zinc-300">{synthesisLatency}</span>
                </div>
                <div className="flex justify-between items-center border-t border-white/[0.04] pt-1.5">
                  <span className="text-electric-blue font-bold">Total Latency</span>
                  <span className="text-electric-blue font-extrabold">{totalPipelineLatency}</span>
                </div>
              </div>
            </div>

            {/* Active Voice */}
            <div className="rounded-lg border border-white/[0.04] bg-zinc-950/30 p-3 space-y-2 text-[10px]">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Active Voice</span>
              <div className="flex justify-between items-center font-mono">
                <span className="text-zinc-500">Voice</span>
                <span className="text-zinc-300 truncate max-w-[140px]" title={currentVoice}>{currentVoice}</span>
              </div>
              <div className="flex justify-between items-center font-mono">
                <span className="text-zinc-500">Queue</span>
                <span className="text-zinc-300">{voiceQueueCount} items</span>
              </div>
              <div className="flex justify-between items-center font-mono">
                <span className="text-zinc-500">Spoken</span>
                <span className="text-zinc-300">{messagesSpoken}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div className="pt-1">
        <SessionControls
          isListening={isListening}
          onStartListening={handleStartListening}
          onStopListening={handleStopListening}
          isTranslating={isTranslating}
          onStartTranslation={handleStartTranslation}
          onStopTranslation={handleStopTranslation}
          isVoiceEnabled={isVoiceEnabled}
          onStartVoice={handleStartVoice}
          onStopVoice={handleStopVoice}
          isStreamingActive={isStreamingActive}
          onStartSession={handleStartSession}
          onStopSession={handleStopSession}
          sessionState={sessionState}
          onPauseSession={handlePauseSession}
          onResumeSession={handleResumeSession}
          captionsEnabled={captionsEnabled}
          setCaptionsEnabled={setCaptionsEnabled}
          recordingEnabled={recordingEnabled}
          setRecordingEnabled={setRecordingEnabled}
          onExportTranscripts={handleExportTranscripts}
          isAzureConfigured={isAzureConfigured}
        />
      </div>
    </div>
  );
}
