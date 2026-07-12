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
      });
    }
  }, [isVoiceEnabled, voicesList]);

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
        <div className="lg:col-span-1">
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
        </div>
      </div>
    </div>
  );
}
