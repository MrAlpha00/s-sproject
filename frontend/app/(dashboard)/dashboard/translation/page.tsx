"use client";

import { useState, useEffect, useRef } from "react";
import { useEvents } from "@/providers/EventProvider";
import { TranslationHeader } from "@/components/translation/TranslationHeader";
import { TranslationConfigPanel, PoolOption } from "@/components/translation/TranslationConfigPanel";
import { SessionInfoCard } from "@/components/translation/SessionInfoCard";
import { TranslationPreview, SpeechStatusInfo } from "@/components/translation/TranslationPreview";
import { SessionControls } from "@/components/translation/SessionControls";
import { AIStatusPanel } from "@/components/translation/AIStatusPanel";
import { getSpeechToken } from "@/app/(dashboard)/dashboard/settings/azure/actions";
import { SpeechRecognitionService, SpeechState } from "@/lib/azure/services/SpeechRecognitionService";
import { TranslationPipeline } from "@/lib/translation/TranslationPipeline";
import { SpeechSynthesisService } from "@/lib/azure/services/SpeechSynthesisService";
import { SynthesisQueue } from "@/lib/audio/SynthesisQueue";
import { TranslationMessage } from "@/types/translation";
import { AZURE_LANGUAGES } from "@/lib/azure/constants";
import { createClient } from "@/supabase/client";
import { VoiceRepository } from "@/lib/database/repositories/VoiceRepository";
import { TranslationRepository } from "@/lib/database/repositories/TranslationRepository";
import { EventRepository } from "@/lib/database/repositories/EventRepository";
import { SetupProfileRepository } from "@/lib/database/repositories/SetupProfileRepository";
import { SupabaseStreamingProvider } from "@/lib/streaming/SupabaseStreamingProvider";
import {
  Radio,
  Users,
  QrCode,
  Copy,
  Check,
  Pause,
  Play,
  Square,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

export default function TranslationStudioPage() {
  const { events } = useEvents();

  // Dynamic pools
  const [languagesPool] = useState<PoolOption[]>(AZURE_LANGUAGES);
  const [voiceProfilesPool, setVoiceProfilesPool] = useState<string[]>([
    "Enterprise Voice Male A (Cloned)",
    "Enterprise Voice Female B (Cloned)",
    "Standard Neutral Narrator Male",
    "Standard Professional Presenter Female",
  ]);
  const [audioInputsPool, setAudioInputsPool] = useState<PoolOption[]>([
    { value: "default", label: "Default System Audio Input" }
  ]);
  const [audioOutputsPool, setAudioOutputsPool] = useState<PoolOption[]>([
    { value: "default", label: "Default System Audio Output" }
  ]);

  // Providers & toggles
  const [speechProvider, setSpeechProvider] = useState("azure");
  const [translationProvider, setTranslationProvider] = useState("azure-translator");
  const [outputVoiceEngine, setOutputVoiceEngine] = useState("elevenlabs");
  const [captionsEnabled, setCaptionsEnabled] = useState(true);
  const [recordingEnabled, setRecordingEnabled] = useState(false);

  // Selections
  const [selectedEventId, setSelectedEventId] = useState("manual");
  const [sourceLanguage, setSourceLanguage] = useState("en-US");
  const [targetLanguages, setTargetLanguages] = useState<string[]>(["es-ES", "zh-CN"]);
  const [voiceProfile, setVoiceProfile] = useState("Standard Neutral Narrator Male");
  const [translationModel, setTranslationModel] = useState("Aether-Large-V3");
  const [latencyMode, setLatencyMode] = useState<"low-latency" | "standard" | "high-fidelity">("low-latency");
  const [profanityFilter, setProfanityFilter] = useState(true);
  const [targetVocabulary, setTargetVocabulary] = useState("");
  
  const [inputDevice, setInputDevice] = useState("default");
  const [outputDevice, setOutputDevice] = useState("default");

  // Connection & session states
  const [isAzureConfigured, setIsAzureConfigured] = useState(false);
  const [azureToken, setAzureToken] = useState("");
  const [azureRegion, setAzureRegion] = useState("");
  
  // Real-time Pipeline States
  const [isListening, setIsListening] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [transcripts, setTranscripts] = useState<TranslationMessage[]>([]);
  const [interimText, setInterimText] = useState("");
  const [recognitionState, setRecognitionState] = useState<SpeechState>("Idle");

  // Speech status logs mapping
  const [speechStatuses, setSpeechStatuses] = useState<Record<string, SpeechStatusInfo>>({});

  // Live Streaming States (Module 12)
  const streamingServiceRef = useRef<SupabaseStreamingProvider | null>(null);
  const [isStreamingActive, setIsStreamingActive] = useState(false);
  const [streamingSession, setStreamingSession] = useState<any>(null);
  const [audienceCount, setAudienceCount] = useState(0);
  const [messagesBroadcasted, setMessagesBroadcasted] = useState(0);
  const [streamingStatus, setStreamingStatus] = useState<string>("idle");
  const [sessionState, setSessionState] = useState<string>("idle");
  const [copied, setCopied] = useState(false);
  const sequenceNumberRef = useRef(0);
  const activeSessionRef = useRef<any>(null);

  const selectedEventIdRef = useRef(selectedEventId);
  useEffect(() => {
    selectedEventIdRef.current = selectedEventId;
  }, [selectedEventId]);

  useEffect(() => {
    const supabase = createClient();
    const provider = new SupabaseStreamingProvider(supabase);
    provider.registerStatusCallback((status) => {
      setStreamingStatus(status);
    });
    provider.registerPresenceCallback((count) => {
      setAudienceCount(count);
    });
    streamingServiceRef.current = provider;

    return () => {
      if (streamingServiceRef.current) {
        streamingServiceRef.current.cleanupSession();
      }
    };
  }, []);

  // Latency & Metrics tracking
  const [averageTranslationTime, setAverageTranslationTime] = useState("-- ms");
  const [translationErrors, setTranslationErrors] = useState(0);
  const [messagesProcessed, setMessagesProcessed] = useState(0);
  const [translationStatus, setTranslationStatus] = useState<"Pending" | "Translating" | "Completed" | "Failed">("Pending");

  // Speech TTS metrics
  const [averageSpeechLatency, setAverageSpeechLatency] = useState("-- ms");
  const [voiceQueueCount, setVoiceQueueCount] = useState(0);
  const [messagesSpoken, setMessagesSpoken] = useState(0);
  const [currentVoice, setCurrentVoice] = useState("--");

  const [recognitionLatency, setRecognitionLatency] = useState("-- ms");
  const [translationLatency, setTranslationLatency] = useState("-- ms");
  const [synthesisLatency, setSynthesisLatency] = useState("-- ms");
  const [totalPipelineLatency, setTotalPipelineLatency] = useState("-- ms");

  const [microphoneStatus, setMicrophoneStatus] = useState("Default System Mic");
  const [speakerStatus, setSpeakerStatus] = useState("Default System Speakers");

  // Azure TTS voices lookup dictionary (auto matching fallbacks)
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
    "ja-JP": "ja-JP-KeitaNeural",
    "ko-KR": "ko-KR-InJoonNeural",
  });

  const speechServiceRef = useRef<SpeechRecognitionService | null>(null);
  const speechSynthServiceRef = useRef<SpeechSynthesisService | null>(null);
  const pipelineRef = useRef<TranslationPipeline | null>(null);
  const synthesisQueueRef = useRef<SynthesisQueue | null>(null);

  // Mount logic: initialize Pipeline, fetch Token, scan Devices, load Voices
  useEffect(() => {
    // 1. Initialize translation queue pipeline
    const pipeline = new TranslationPipeline();
    pipelineRef.current = pipeline;

    pipeline.registerCallbacks({
      onMessageUpdate: (msg) => {
        setTranscripts((prev) => {
          const index = prev.findIndex((m) => m.id === msg.id);
          if (index >= 0) {
            const next = [...prev];
            next[index] = msg;
            return next;
          }
          return [...prev, msg];
        });

        // Async save to database if completed
        if (msg.status === "Completed") {
          const supabase = createClient();
          const repo = new TranslationRepository(supabase);
          repo.create("mock-session-id", "org-aether-main", msg).catch((err) => {
            console.warn("Failed to save translation history row to Supabase:", err);
          });
        }
      },
      onMetricsUpdate: (metrics) => {
        setAverageTranslationTime(`${metrics.averageTranslationTime}ms`);
        setTranslationErrors(metrics.errorsCount);
        setMessagesProcessed(metrics.messagesProcessed);
        setTranslationStatus(metrics.translationStatus);

        const activeMsg = pipeline.getQueue().find((m) => m.status === "Completed");
        if (activeMsg) {
          setTranslationLatency(`${activeMsg.translationLatency}ms`);
        }
      },
    });

    async function loadData() {
      // 2. Fetch Azure tokens
      try {
        const result = await getSpeechToken();
        if (result.success && result.token && result.region) {
          setIsAzureConfigured(true);
          setAzureToken(result.token);
          setAzureRegion(result.region);

          // 3. Initialize Speech Synthesis Service and Queue client-side
          const synthService = new SpeechSynthesisService(result.token, result.region);
          speechSynthServiceRef.current = synthService;

          const synthesisQueue = new SynthesisQueue(synthService);
          synthesisQueueRef.current = synthesisQueue;

          // Connect output route device sink ID from localStorage (Module 6 integration)
          if (typeof window !== "undefined") {
            const savedOutputId = localStorage.getItem("aethervox_active_output");
            synthesisQueue.setDeviceId(savedOutputId);
          }

          synthesisQueue.registerCallbacks({
            onMessageUpdate: (msg) => {
              // Map speech synthesis state back to its translation row
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

              // Broadcast audio packet over Supabase Realtime! (Module 12)
              if (msg.status === "Completed" && msg.audioData && activeSessionRef.current && streamingServiceRef.current) {
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
              }
            },
            onMetricsUpdate: (metrics) => {
              setAverageSpeechLatency(`${metrics.averageSynthesisLatency}ms`);
              setVoiceQueueCount(metrics.queueSize);
              setMessagesSpoken(metrics.spokenCount);
              setCurrentVoice(metrics.activeVoice);
              
              if (metrics.averageSynthesisLatency > 0) {
                setSynthesisLatency(`${metrics.averageSynthesisLatency}ms`);
                // Calculate dynamic total pipeline latency
                setTranscripts((prev) => {
                  const active = prev.find((t) => t.status === "Completed");
                  if (active) {
                    setTotalPipelineLatency(`${active.recognitionLatency + active.translationLatency + metrics.averageSynthesisLatency}ms`);
                  }
                  return prev;
                });
              }
            },
          });

          // 4. Preload Azure voice lists dynamically
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
        }
      } catch (err) {
        console.warn("Failed to load Azure configuration tokens:", err);
      }

      // 5. Scan inputs & destinations
      try {
        if (typeof navigator !== "undefined" && navigator.mediaDevices) {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const inputs = devices
            .filter((d) => d.kind === "audioinput")
            .map((d) => ({
              value: d.deviceId || "default",
              label: d.label || `Audio Source (${d.deviceId.substring(0, 5)})`
            }));
          const outputs = devices
            .filter((d) => d.kind === "audiooutput")
            .map((d) => ({
              value: d.deviceId || "default",
              label: d.label || `Audio Destination (${d.deviceId.substring(0, 5)})`
            }));

          if (inputs.length > 0) setAudioInputsPool(inputs);
          if (outputs.length > 0) setAudioOutputsPool(outputs);
        }
      } catch (err) {
        console.warn("Hardware enumeration failed/denied:", err);
      }

      // 6. Load voices from db voice profiles list
      try {
        const supabase = createClient();
        const voiceRepo = new VoiceRepository(supabase);
        const voices = await voiceRepo.findAll();
        if (voices && voices.length > 0) {
          setVoiceProfilesPool(voices.map((v) => v.name));
          setVoiceProfile(voices[0].name);
        }
      } catch (err) {
        console.warn("Could not query dynamic voice profiles, loading defaults:", err);
      }

      // 7. Load Event Setup configuration from sessionStorage or database
      try {
        if (typeof window !== "undefined") {
          const params = new URLSearchParams(window.location.search);
          const configId = params.get("configId");
          const eventId = params.get("eventId");

          let configObj: any = null;
          const supabase = createClient();

          if (configId) {
            const setupRepo = new SetupProfileRepository(supabase);
            const profile = await setupRepo.findById(configId);
            if (profile) {
              configObj = {
                id: profile.id,
                name: profile.profileName,
                inputDevice: profile.inputDevice,
                outputDevice: profile.outputDevice,
                sourceLanguage: profile.sourceLanguage,
                targetLanguages: profile.targetLanguages,
                voiceSelection: profile.voiceSelection || {},
                azureRegion: profile.azureRegion,
                audioSettings: profile.audioSettings || {},
              };
            }
          } else if (eventId) {
            const eventRepo = new EventRepository(supabase);
            const event = await eventRepo.findById(eventId);
            if (event) {
              configObj = {
                id: event.id,
                name: event.name,
                inputDevice: event.inputDevice || "default",
                outputDevice: event.outputDevice || "default",
                sourceLanguage: event.sourceLanguage,
                targetLanguages: event.targetLanguages,
                voiceSelection: event.voiceProfile ? { [event.targetLanguages[0] || "en-US"]: event.voiceProfile } : {},
                azureRegion: "centralindia",
                audioSettings: {},
              };
            }
          }

          if (!configObj) {
            const stored = sessionStorage.getItem("aethervox_setup_config");
            if (stored) {
              configObj = JSON.parse(stored);
            }
          }

          if (configObj) {
            console.log("Applying Event Setup Wizard config:", configObj);
            if (configObj.id) setSelectedEventId(configObj.id);
            if (configObj.inputDevice) setInputDevice(configObj.inputDevice);
            if (configObj.outputDevice) setOutputDevice(configObj.outputDevice);
            if (configObj.sourceLanguage) setSourceLanguage(configObj.sourceLanguage);
            if (configObj.targetLanguages) setTargetLanguages(configObj.targetLanguages);
            if (configObj.voiceSelection) {
              setVoicesList((prev) => ({
                ...prev,
                ...configObj.voiceSelection,
              }));
              const firstTarget = configObj.targetLanguages?.[0];
              if (firstTarget && configObj.voiceSelection[firstTarget]) {
                setVoiceProfile(configObj.voiceSelection[firstTarget]);
              }
            }
          }
        }
      } catch (err) {
        console.warn("Failed to load setup wizard configurations:", err);
      }
    }

    loadData();

    // Clean up connections on leave
    return () => {
      if (speechServiceRef.current) {
        speechServiceRef.current.stop();
      }
      if (synthesisQueueRef.current) {
        synthesisQueueRef.current.stopAll();
      }
    };
  }, []);

  // Update hardware names based on selections
  useEffect(() => {
    const inputOpt = audioInputsPool.find((o) => o.value === inputDevice);
    if (inputOpt) setMicrophoneStatus(inputOpt.label);

    const outputOpt = audioOutputsPool.find((o) => o.value === outputDevice);
    if (outputOpt) {
      setSpeakerStatus(outputOpt.label);
      if (synthesisQueueRef.current) {
        synthesisQueueRef.current.setDeviceId(outputDevice === "default" ? null : outputDevice);
      }
    }
  }, [inputDevice, outputDevice, audioInputsPool, audioOutputsPool]);

  // Hook pipeline completions to audio synthesis enqueuer
  useEffect(() => {
    if (pipelineRef.current) {
      pipelineRef.current.registerOnComplete((msg) => {
        if (isVoiceEnabled) {
          msg.targetLanguage.forEach((langCode) => {
            const text = msg.translatedText[langCode];
            if (text) {
              const voiceName = voicesList[langCode] || "en-US-AvaMultilingualNeural";
              if (synthesisQueueRef.current) {
                synthesisQueueRef.current.enqueue(text, langCode, voiceName);
              }
            }
          });
        }

        // Broadcast translation message over Supabase Realtime (Module 12)
        if (activeSessionRef.current && streamingServiceRef.current) {
          streamingServiceRef.current.broadcastTranslation({
            id: msg.id,
            sessionId: activeSessionRef.current.id,
            eventId: selectedEventIdRef.current,
            originalText: msg.originalText,
            translatedText: msg.translatedText,
            sourceLanguage: msg.sourceLanguage,
            targetLanguages: msg.targetLanguage,
            voice: voiceProfile,
            latency: msg.translationLatency,
          });
          setMessagesBroadcasted((prev) => prev + 1);
        }
      });
    }
  }, [isVoiceEnabled, voicesList, voiceProfile]);

  // Transcripts handlers
  const handleClearTranscripts = () => {
    setTranscripts([]);
    setSpeechStatuses({});
    if (pipelineRef.current) {
      pipelineRef.current.clearQueue();
    }
    if (synthesisQueueRef.current) {
      synthesisQueueRef.current.clearQueue();
    }
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

  // Audio capture controls
  const handleStartListening = async () => {
    if (!isAzureConfigured || !azureToken || !azureRegion) {
      alert("Cannot start: Azure Speech credentials are not configured.");
      return;
    }

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      alert("Permission denied. Ensure microphone access is allowed.");
      setRecognitionState("Error");
      return;
    }

    if (speechServiceRef.current) {
      await speechServiceRef.current.stop();
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
          const recLatency = Math.floor(Math.random() * 40) + 120; // 120-160ms
          setRecognitionLatency(`${recLatency}ms`);

          // Pipe final recognized sentence to Translation Pipeline
          if (pipelineRef.current && isTranslating) {
            pipelineRef.current.enqueue(
              result.text,
              sourceLanguage,
              targetLanguages,
              result.confidence || 95,
              recLatency
            );
          } else {
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
        console.error("Speech Recognition Service error:", error);
      },
    });

    speechServiceRef.current = service;
    try {
      await service.start();
    } catch (err) {
      console.error("Failed to start speech service:", err);
    }
  };

  const handleStopListening = async () => {
    if (speechServiceRef.current) {
      await speechServiceRef.current.stop();
      speechServiceRef.current = null;
    }
    setInterimText("");
    setIsListening(false);
    setRecognitionState("Idle");
  };

  // Translation controls
  const handleStartTranslation = () => {
    setIsTranslating(true);
  };

  const handleStopTranslation = () => {
    setIsTranslating(false);
  };

  const handleRetryFailed = () => {
    if (pipelineRef.current) {
      pipelineRef.current.retryFailed();
    }
  };

  // Speech playback controls
  const handleStartVoice = () => {
    setIsVoiceEnabled(true);
  };

  const handleStopVoice = () => {
    setIsVoiceEnabled(false);
    if (synthesisQueueRef.current) {
      synthesisQueueRef.current.stopAll();
    }
  };

  const handleStopAllSpeech = () => {
    if (synthesisQueueRef.current) {
      synthesisQueueRef.current.stopAll();
    }
  };

  const handleClearSpeechQueue = () => {
    if (synthesisQueueRef.current) {
      synthesisQueueRef.current.clearQueue();
    }
  };

  // Playback handlers from translated cards list items
  const handlePlaySpeechItem = (text: string, langCode: string, key: string) => {
    const voiceName = voicesList[langCode] || "en-US-AvaMultilingualNeural";
    if (synthesisQueueRef.current) {
      synthesisQueueRef.current.enqueue(text, langCode, voiceName);
    }
  };

  const handlePauseSpeechItem = (key: string) => {
    if (synthesisQueueRef.current) {
      synthesisQueueRef.current.pause();
    }
  };

  const handleStopSpeechItem = (key: string) => {
    if (synthesisQueueRef.current) {
      synthesisQueueRef.current.stopAll();
    }
  };

  // Session management handlers (Module 12)
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
    } catch (err) {
      console.error("Failed to start session:", err);
      alert("Failed to start streaming session. Ensure database connection is available.");
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
    if (!confirm("Are you sure you want to stop the live event stream? This will disconnect all listeners.")) return;
    await streamingServiceRef.current.updateSessionState("stopped");
    await streamingServiceRef.current.leaveSession();
    setSessionState("stopped");
    setIsStreamingActive(false);
    setStreamingSession(null);
    activeSessionRef.current = null;
  };

  const copyListenLink = () => {
    if (typeof window === "undefined") return;
    const link = `${window.location.origin}/listen/${selectedEventId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSessionStatus = () => {
    if (isListening || isTranslating) return "ACTIVE";
    return "IDLE";
  };

  const activeEvent = events.find((e) => e.id === selectedEventId);
  const sessionName = activeEvent ? `${activeEvent.name} Stream` : "Manual Override Session";

  const getSourceLangLabel = () => {
    const lang = languagesPool.find((l) => l.value === sourceLanguage);
    return lang ? lang.label : sourceLanguage;
  };

  const getTargetLangsLabel = () => {
    if (targetLanguages.length === 0) return "None Selected";
    return targetLanguages
      .map((val) => {
        const lang = languagesPool.find((l) => l.value === val);
        return lang ? lang.label.split(" (")[0] : val;
      })
      .join(", ");
  };

  const hasFailedTranslations = transcripts.some((m) => m.status === "Failed");

  return (
    <div className="space-y-6">
      {/* Top Workspace Header */}
      <TranslationHeader sessionName={sessionName} status={getSessionStatus()} />

      {/* Main Workspace 3-Column Layout */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Left Column: Config Panel & Info Card */}
        <div className="lg:col-span-1 space-y-6 flex flex-col">
          <TranslationConfigPanel
            selectedEventId={selectedEventId}
            setSelectedEventId={setSelectedEventId}
            sourceLanguage={sourceLanguage}
            setSourceLanguage={setSourceLanguage}
            targetLanguages={targetLanguages}
            setTargetLanguages={setTargetLanguages}
            voiceProfile={voiceProfile}
            setVoiceProfile={setVoiceProfile}
            translationModel={translationModel}
            setTranslationModel={setTranslationModel}
            latencyMode={latencyMode}
            setLatencyMode={setLatencyMode}
            profanityFilter={profanityFilter}
            setProfanityFilter={setProfanityFilter}
            targetVocabulary={targetVocabulary}
            setTargetVocabulary={setTargetVocabulary}
            inputDevice={inputDevice}
            setInputDevice={setInputDevice}
            outputDevice={outputDevice}
            setOutputDevice={setOutputDevice}
            speechProvider={speechProvider}
            setSpeechProvider={setSpeechProvider}
            translationProvider={translationProvider}
            setTranslationProvider={setTranslationProvider}
            outputVoiceEngine={outputVoiceEngine}
            setOutputVoiceEngine={setOutputVoiceEngine}
            captionsEnabled={captionsEnabled}
            setCaptionsEnabled={setCaptionsEnabled}
            recordingEnabled={recordingEnabled}
            setRecordingEnabled={setRecordingEnabled}
            
            // Dynamic Pools
            languagesPool={languagesPool}
            voiceProfilesPool={voiceProfilesPool}
            audioInputsPool={audioInputsPool}
            audioOutputsPool={audioOutputsPool}
            speechProvidersPool={[
              { value: "azure", label: "Azure Speech Services (Default)" },
              { value: "whisper", label: "OpenAI Whisper API (Standard)" }
            ]}
            translationProvidersPool={[
              { value: "azure-translator", label: "Azure Translator V3 (Neural)" },
              { value: "deepl", label: "DeepL Pro API (Standard)" }
            ]}
            voiceEnginesPool={[
              { value: "elevenlabs", label: "ElevenLabs Synthesis (High-Fi)" },
              { value: "azure-tts", label: "Azure Neural TTS (Standard)" }
            ]}
          />
          <SessionInfoCard
            selectedEventId={selectedEventId}
            status={getSessionStatus()}
            currentMicrophone={microphoneStatus}
            currentSpeaker={speakerStatus}
            recognitionLanguage={getSourceLangLabel()}
            translationLanguage={getTargetLangsLabel()}
            voiceProfile={voiceProfile}
            recognitionLatency={recognitionLatency}
            translationLatency={translationLatency}
            synthesisLatency={synthesisLatency}
            totalPipelineLatency={totalPipelineLatency}
            
            // Metrics
            recognitionStatus={isListening ? "Listening" : "Idle"}
            translationStatus={isTranslating ? translationStatus : "Idle"}
            messagesProcessed={messagesProcessed}
            provider="Azure Cognitive AI"
            
            // Synthesis props (Module 11)
            speechEngine="Azure Speech Synthesis"
            currentVoice={currentVoice}
            voiceQueueCount={voiceQueueCount}
            messagesSpoken={messagesSpoken}
          />
        </div>

        {/* Center Columns: Preview & Controls */}
        <div className="lg:col-span-2 space-y-6 flex flex-col justify-between">
          <div className="flex-1">
            <TranslationPreview
              transcripts={transcripts}
              interimText={interimText}
              recognitionState={recognitionState}
              onClearTranscripts={handleClearTranscripts}
              onExportTranscripts={handleExportTranscripts}
              
              // Speech controllers (Module 11)
              speechStatuses={speechStatuses}
              onPlaySpeech={handlePlaySpeechItem}
              onPauseSpeech={handlePauseSpeechItem}
              onStopSpeech={handleStopSpeechItem}
            />
          </div>
          <SessionControls
            isListening={isListening}
            onStartListening={handleStartListening}
            onStopListening={handleStopListening}
            
            isTranslating={isTranslating}
            onStartTranslation={handleStartTranslation}
            onStopTranslation={handleStopTranslation}
            onRetryFailed={handleRetryFailed}
            onClearQueue={handleClearTranscripts}

            // Voice Speech Controls
            isVoiceEnabled={isVoiceEnabled}
            onStartVoice={handleStartVoice}
            onStopVoice={handleStopVoice}
            onStopAllSpeech={handleStopAllSpeech}
            onClearSpeechQueue={handleClearSpeechQueue}
            
            isAzureConfigured={isAzureConfigured}
            hasFailedTranslations={hasFailedTranslations}
          />
        </div>

        {/* Right Column: AI Status Panel */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <AIStatusPanel
            azureSpeechStatus={isListening ? "Connected" : "Disabled"}
            azureSpeechLatency={recognitionLatency}
            
            azureTranslatorStatus={isTranslating ? "Connected" : "Disabled"}
            azureTranslatorLatency={translationLatency}
            
            azureSynthesisStatus={isVoiceEnabled && isListening ? "Connected" : "Disabled"}
            azureSynthesisLatency={synthesisLatency}
            
            elevenLabsStatus="Connected"
            elevenLabsLatency="210ms"
            
            openAiStatus="Connected"
            openAiLatency={translationLatency}

            // Audio & queue (Module 11)
            outputDeviceName={speakerStatus}
            voiceQueueCount={voiceQueueCount}
            averageSpeechLatency={averageSpeechLatency}
          />

          {/* Operator Live Session Card (Module 12) */}
          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-5 space-y-4 shadow-inner relative overflow-hidden">
            <div className="absolute top-0 right-0 h-24 w-24 bg-electric-blue/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[9px] font-extrabold text-zinc-500 uppercase tracking-widest block">Live Stream Console</span>
                <h3 className="text-sm font-bold tracking-tight text-white mt-0.5">Audience Portal</h3>
              </div>
              <div className={`h-2.5 w-2.5 rounded-full ${
                isStreamingActive && streamingStatus === "connected"
                  ? "bg-emerald-500 shadow-[0_0_8px_#10b981]"
                  : isStreamingActive
                  ? "bg-amber-500 animate-pulse"
                  : "bg-zinc-700"
              }`} />
            </div>

            <div className="space-y-3.5 border-t border-white/[0.04] pt-3.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 text-[11px]">Session ID</span>
                <span className="font-mono text-[10px] text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded border border-white/[0.04] max-w-[120px] truncate">
                  {streamingSession?.id || "None Active"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 text-[11px]">Stream Status</span>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  sessionState === "active" ? "text-emerald-400" : sessionState === "paused" ? "text-amber-400" : "text-zinc-500"
                }`}>
                  {sessionState || "inactive"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 text-[11px]">Listeners Connected</span>
                <div className="flex items-center gap-1.5 text-electric-blue font-bold">
                  <Users className="h-3.5 w-3.5" />
                  <span>{audienceCount}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 text-[11px]">Messages Broadcasted</span>
                <span className="text-zinc-300 font-bold">{messagesBroadcasted}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 text-[11px]">Transport Layer</span>
                <span className="text-zinc-400 font-mono text-[10px]">Supabase Realtime</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 text-[11px]">Reconnect Status</span>
                <span className="text-zinc-400 text-[10px] uppercase font-bold">{streamingStatus}</span>
              </div>
            </div>

            {isStreamingActive && (
              <div className="border-t border-white/[0.04] pt-4 space-y-3">
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block text-center">Scan to Join Broadcast</span>
                <div className="p-2.5 rounded bg-zinc-950 border border-white/[0.04] flex flex-col items-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&color=00d4ff&bgcolor=09090b&data=${encodeURIComponent(
                      typeof window !== "undefined" ? `${window.location.origin}/listen/${selectedEventId}` : ""
                    )}`}
                    alt="Audience QR Code"
                    className="h-28 w-28 border border-white/[0.08] rounded p-1 bg-zinc-950"
                  />
                  <div className="flex items-center gap-2 mt-3 w-full">
                    <button
                      onClick={copyListenLink}
                      className="flex-1 h-8 rounded border border-white/[0.08] bg-zinc-900 hover:bg-zinc-800 text-[11px] font-bold text-zinc-300 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5 text-electric-blue" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>
                    <a
                      href={`/listen/${selectedEventId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-8 w-8 rounded border border-white/[0.08] bg-zinc-900 hover:bg-zinc-800 flex items-center justify-center text-zinc-300 transition-all"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-electric-blue" />
                    </a>
                  </div>
                </div>
              </div>
            )}

            <div className="border-t border-white/[0.04] pt-4 grid grid-cols-2 gap-2.5">
              {!isStreamingActive ? (
                <button
                  onClick={handleStartSession}
                  className="col-span-2 h-9 rounded bg-gradient-to-r from-electric-blue to-accent-purple hover:from-electric-blue/90 hover:to-accent-purple/90 text-black font-bold text-[11px] tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>START BROADCAST</span>
                </button>
              ) : (
                <>
                  {sessionState === "active" ? (
                    <button
                      onClick={handlePauseSession}
                      className="h-9 rounded border border-white/[0.08] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                    >
                      <Pause className="h-3.5 w-3.5 fill-current" />
                      <span>PAUSE</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleResumeSession}
                      className="h-9 rounded bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>RESUME</span>
                    </button>
                  )}
                  <button
                    onClick={handleStopSession}
                    className="h-9 rounded bg-red-950/40 border border-red-500/20 hover:bg-red-900/30 text-red-400 font-bold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Square className="h-3.5 w-3.5 fill-current" />
                    <span>STOP</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
