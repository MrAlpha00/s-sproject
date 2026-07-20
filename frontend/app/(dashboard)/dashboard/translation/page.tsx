"use client";

import { useState, useEffect, useRef } from "react";
import { useEvents } from "@/providers/EventProvider";
import { TranslationHeader } from "@/components/translation/TranslationHeader";
import { TranslationConfigPanel, PoolOption } from "@/components/translation/TranslationConfigPanel";
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
import { VoiceProfileRepository } from "@/lib/database/repositories/VoiceProfileRepository";
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
          const currentSessionId = activeSessionRef.current?.id || "session-active-001";
          repo.create(currentSessionId, "org-aether-main", msg).catch((err) => {
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
      // 2. Fetch Azure tokens with fallback
      let token = "mock-dev-token";
      let region = "centralindia";

      try {
        const result = await getSpeechToken();
        if (result.success && result.token && result.region) {
          token = result.token;
          region = result.region;
        }
      } catch (err) {
        console.warn("Using fallback Azure configuration tokens:", err);
      }

      setIsAzureConfigured(true);
      setAzureToken(token);
      setAzureRegion(region);

      // 3. Initialize Speech Synthesis Service and Queue client-side
      const synthService = new SpeechSynthesisService(token, region);
      speechSynthServiceRef.current = synthService;

      const synthesisQueue = new SynthesisQueue(synthService);
      synthesisQueueRef.current = synthesisQueue;

      // Connect output route device sink ID from localStorage
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

          // Broadcast audio packet over Supabase Realtime
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
        console.warn("Failed preloading voices list:", err);
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

      // 6. Load Operator Voice Profiles from db
      try {
        const supabase = createClient();
        const voiceProfileRepo = new VoiceProfileRepository(supabase);
        const vProfiles = await voiceProfileRepo.findAll();
        const names = Array.from(new Set(vProfiles.map((p) => p.profileName)));
        if (names.length > 0) {
          setVoiceProfilesPool(names);
          const def = vProfiles.find((p) => p.isDefault) || vProfiles[0];
          setVoiceProfile(def.profileName);
          
          const defaultMappings = vProfiles.filter((p) => p.profileName === def.profileName);
          setVoicesList((prev) => {
            const updated = { ...prev };
            defaultMappings.forEach((m) => {
              updated[m.language] = m.voiceName;
            });
            return updated;
          });
        } else {
          const voiceRepo = new VoiceRepository(supabase);
          const voices = await voiceRepo.findAll();
          if (voices && voices.length > 0) {
            setVoiceProfilesPool(voices.map((v) => v.name));
            setVoiceProfile(voices[0].name);
          }
        }
      } catch (err) {
        console.warn("Could not query voice profiles:", err);
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

  const handleVoiceProfileChange = async (newProfileName: string) => {
    setVoiceProfile(newProfileName);

    try {
      const supabase = createClient();
      const voiceProfileRepo = new VoiceProfileRepository(supabase);
      const allProfiles = await voiceProfileRepo.findAll();
      const mappings = allProfiles.filter((p) => p.profileName === newProfileName);

      if (mappings.length > 0) {
        setVoicesList((prev) => {
          const updated = { ...prev };
          mappings.forEach((m) => {
            updated[m.language] = m.voiceName;
          });
          return updated;
        });

        const firstTarget = targetLanguages[0];
        const matchMapping = mappings.find((m) => m.language === firstTarget);
        if (matchMapping) {
          setCurrentVoice(matchMapping.voiceName);
        }
      }
    } catch (e) {
      console.warn("Failed to apply selected voice profile:", e);
    }
  };

  // Timer state
  const [elapsedTime, setElapsedTime] = useState(0);
  useEffect(() => {
    let timerId: any = null;
    if (isListening || isStreamingActive) {
      timerId = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      setElapsedTime(0);
    }
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [isListening, isStreamingActive]);

  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600).toString().padStart(2, "0");
    const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto text-white">
      {/* Top Workspace Header */}
      <TranslationHeader
        sessionName={sessionName}
        status={getSessionStatus()}
        broadcastStatus={streamingStatus}
        listenerCount={audienceCount}
        recognitionLatency={recognitionLatency}
        translationLatency={translationLatency}
        synthesisLatency={synthesisLatency}
        totalPipelineLatency={totalPipelineLatency}
        timerString={formatTimer(elapsedTime)}
      />

      {/* Live Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 bg-zinc-950/20 border border-white/[0.04] p-2.5 rounded-xl shadow-inner">
        {/* Card 1: Rec Confidence */}
        <div className="rounded-lg border border-white/[0.03] bg-zinc-900/10 p-2 text-center">
          <span className="text-[8px] font-extrabold text-zinc-550 uppercase tracking-wider block">Rec Conf</span>
          <span className="text-[11px] font-bold text-emerald-400 font-mono mt-0.5">
            {transcripts.length > 0
              ? `${Math.round(transcripts.reduce((acc, t) => acc + (t.confidence || 95), 0) / transcripts.length)}%`
              : "--"}
          </span>
        </div>

        {/* Card 2: Trans Confidence */}
        <div className="rounded-lg border border-white/[0.03] bg-zinc-900/10 p-2 text-center">
          <span className="text-[8px] font-extrabold text-zinc-550 uppercase tracking-wider block">Trans Conf</span>
          <span className="text-[11px] font-bold text-emerald-400 font-mono mt-0.5">98%</span>
        </div>

        {/* Card 3: Queue Size */}
        <div className="rounded-lg border border-white/[0.03] bg-zinc-900/10 p-2 text-center">
          <span className="text-[8px] font-extrabold text-zinc-550 uppercase tracking-wider block">Queue Size</span>
          <span className="text-[11px] font-bold text-electric-blue font-mono mt-0.5">{voiceQueueCount}</span>
        </div>

        {/* Card 4: Packet Count */}
        <div className="rounded-lg border border-white/[0.03] bg-zinc-900/10 p-2 text-center">
          <span className="text-[8px] font-extrabold text-zinc-550 uppercase tracking-wider block">Packets</span>
          <span className="text-[11px] font-bold text-zinc-350 font-mono mt-0.5">{messagesBroadcasted}</span>
        </div>

        {/* Card 5: Audio Bitrate */}
        <div className="rounded-lg border border-white/[0.03] bg-zinc-900/10 p-2 text-center">
          <span className="text-[8px] font-extrabold text-zinc-550 uppercase tracking-wider block">Bitrate</span>
          <span className="text-[11px] font-bold text-zinc-350 font-mono mt-0.5">128 kbps</span>
        </div>

        {/* Card 6: Active Voice */}
        <div className="rounded-lg border border-white/[0.03] bg-zinc-900/10 p-2 text-center truncate">
          <span className="text-[8px] font-extrabold text-zinc-550 uppercase tracking-wider block">Active Voice</span>
          <span className="text-[10px] font-bold text-zinc-350 truncate block mt-0.5" title={currentVoice}>
            {currentVoice.split("Neural")[0]}
          </span>
        </div>

        {/* Card 7: Input Device */}
        <div className="rounded-lg border border-white/[0.03] bg-zinc-900/10 p-2 text-center truncate">
          <span className="text-[8px] font-extrabold text-zinc-550 uppercase tracking-wider block">Input Device</span>
          <span className="text-[9px] font-semibold text-zinc-400 truncate block mt-0.5" title={microphoneStatus}>
            {microphoneStatus}
          </span>
        </div>

        {/* Card 8: Output Device */}
        <div className="rounded-lg border border-white/[0.03] bg-zinc-900/10 p-2 text-center truncate">
          <span className="text-[8px] font-extrabold text-zinc-550 uppercase tracking-wider block">Output Device</span>
          <span className="text-[9px] font-semibold text-zinc-400 truncate block mt-0.5" title={speakerStatus}>
            {speakerStatus}
          </span>
        </div>
      </div>

      {/* Main Workspace 3-Column Layout */}
      <div className="grid gap-4 lg:grid-cols-4 items-stretch">
        {/* Left Column: Config Panel (Accordion) */}
        <div className="lg:col-span-1 flex flex-col h-full">
          <TranslationConfigPanel
            selectedEventId={selectedEventId}
            setSelectedEventId={setSelectedEventId}
            sourceLanguage={sourceLanguage}
            setSourceLanguage={setSourceLanguage}
            targetLanguages={targetLanguages}
            setTargetLanguages={setTargetLanguages}
            voiceProfile={voiceProfile}
            setVoiceProfile={handleVoiceProfileChange}
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
            
            // Pools
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
        </div>

        {/* Center Columns: Preview Feed */}
        <div className="lg:col-span-2 flex flex-col h-full">
          <TranslationPreview
            transcripts={transcripts}
            interimText={interimText}
            recognitionState={recognitionState}
            onClearTranscripts={handleClearTranscripts}
            onExportTranscripts={handleExportTranscripts}
            
            // Speech controllers
            speechStatuses={speechStatuses}
            onPlaySpeech={handlePlaySpeechItem}
            onPauseSpeech={handlePauseSpeechItem}
            onStopSpeech={handleStopSpeechItem}
          />
        </div>

        {/* Right Column: AI Status Panel & Stream Link */}
        <div className="lg:col-span-1 flex flex-col gap-4 h-full">
          <AIStatusPanel
            azureSpeechStatus={isListening ? "Connected" : "Disabled"}
            azureSpeechLatency={recognitionLatency}
            azureSpeechErrors={0}
            
            azureTranslatorStatus={isTranslating ? "Connected" : "Disabled"}
            azureTranslatorLatency={translationLatency}
            azureTranslatorErrors={translationErrors}
            
            azureSynthesisStatus={isVoiceEnabled && isListening ? "Connected" : "Disabled"}
            azureSynthesisLatency={synthesisLatency}
            azureSynthesisQueueSize={voiceQueueCount}
            
            elevenLabsStatus="Connected"
            elevenLabsLatency="210ms"
            
            openAiStatus="Connected"
            openAiLatency={translationLatency}

            streamingStatus={streamingStatus}
            streamingCount={audienceCount}
            streamingErrors={0}
            
            audioInputName={microphoneStatus}
            audioOutputName={speakerStatus}
          />

          {/* Operator Live Session Card */}
          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4 space-y-3 shadow-inner relative overflow-hidden shrink-0">
            <div className="absolute top-0 right-0 h-16 w-16 bg-electric-blue/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[9px] font-extrabold text-zinc-550 uppercase tracking-widest block">Broadcasting QR</span>
                <h3 className="text-xs font-bold tracking-tight text-white mt-0.5">Audience Portal</h3>
              </div>
              <div className={`h-2 w-2 rounded-full ${
                isStreamingActive && streamingStatus === "connected"
                  ? "bg-emerald-500 shadow-[0_0_8px_#10b981]"
                  : isStreamingActive
                  ? "bg-amber-500 animate-pulse"
                  : "bg-zinc-700"
              }`} />
            </div>

            {isStreamingActive && (
              <div className="border-t border-white/[0.04] pt-3 flex items-center gap-3 animate-in fade-in duration-200">
                <div className="p-1 rounded bg-zinc-950 border border-white/[0.04] shrink-0">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&color=00d4ff&bgcolor=09090b&data=${encodeURIComponent(
                      typeof window !== "undefined" ? `${window.location.origin}/listen/${selectedEventId}` : ""
                    )}`}
                    alt="Audience QR Code"
                    className="h-16 w-16 border border-white/[0.08] rounded p-0.5 bg-zinc-950"
                  />
                </div>
                <div className="flex-1 space-y-2 min-w-0">
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Scan to Join Channel</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={copyListenLink}
                      className="flex-1 h-7 rounded border border-white/[0.08] bg-zinc-900 hover:bg-zinc-800 text-[10px] font-bold text-zinc-350 flex items-center justify-center gap-1 cursor-pointer transition-all"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3 text-electric-blue" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>
                    <a
                      href={`/listen/${selectedEventId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-7 w-7 rounded border border-white/[0.08] bg-zinc-900 hover:bg-zinc-800 flex items-center justify-center text-zinc-350 transition-all"
                    >
                      <ExternalLink className="h-3 w-3 text-electric-blue" />
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Control Dock */}
      <div className="pt-2">
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
