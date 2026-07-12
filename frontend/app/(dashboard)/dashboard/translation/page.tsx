"use client";

import { useState, useEffect, useRef } from "react";
import { useEvents } from "@/providers/EventProvider";
import { TranslationHeader } from "@/components/translation/TranslationHeader";
import { TranslationConfigPanel, PoolOption } from "@/components/translation/TranslationConfigPanel";
import { SessionInfoCard } from "@/components/translation/SessionInfoCard";
import { TranslationPreview } from "@/components/translation/TranslationPreview";
import { SessionControls } from "@/components/translation/SessionControls";
import { AIStatusPanel } from "@/components/translation/AIStatusPanel";
import { getSpeechToken } from "@/app/(dashboard)/dashboard/settings/azure/actions";
import { SpeechRecognitionService, SpeechState } from "@/lib/azure/services/SpeechRecognitionService";
import { TranslationPipeline } from "@/lib/translation/TranslationPipeline";
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

  // Providers & toggles
  const [speechProvider, setSpeechProvider] = useState("azure");
  const [translationProvider, setTranslationProvider] = useState("azure-translator");
  const [outputVoiceEngine, setOutputVoiceEngine] = useState("elevenlabs");
  const [captionsEnabled, setCaptionsEnabled] = useState(true);
  const [recordingEnabled, setRecordingEnabled] = useState(false);

  // Connection & session states
  const [isAzureConfigured, setIsAzureConfigured] = useState(false);
  const [azureToken, setAzureToken] = useState("");
  const [azureRegion, setAzureRegion] = useState("");
  
  // Real-time Pipeline States
  const [isListening, setIsListening] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [transcripts, setTranscripts] = useState<TranslationMessage[]>([]);
  const [interimText, setInterimText] = useState("");
  const [recognitionState, setRecognitionState] = useState<SpeechState>("Idle");

  // Latency & Metrics tracking
  const [averageTranslationTime, setAverageTranslationTime] = useState("-- ms");
  const [translationErrors, setTranslationErrors] = useState(0);
  const [messagesProcessed, setMessagesProcessed] = useState(0);
  const [translationStatus, setTranslationStatus] = useState<"Pending" | "Translating" | "Completed" | "Failed">("Pending");

  const [recognitionLatency, setRecognitionLatency] = useState("-- ms");
  const [translationLatency, setTranslationLatency] = useState("-- ms");
  const [synthesisLatency, setSynthesisLatency] = useState("-- ms");
  const [totalPipelineLatency, setTotalPipelineLatency] = useState("-- ms");

  const [microphoneStatus, setMicrophoneStatus] = useState("Default System Mic");
  const [speakerStatus, setSpeakerStatus] = useState("Default System Speakers");

  const speechServiceRef = useRef<SpeechRecognitionService | null>(null);
  const pipelineRef = useRef<TranslationPipeline | null>(null);

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

        // Update latency meters dynamically if there's a latency reading
        const activeMsg = pipeline.getQueue().find((m) => m.status === "Completed");
        if (activeMsg) {
          setTranslationLatency(`${activeMsg.translationLatency}ms`);
          setSynthesisLatency("210ms"); // Mock TTS latency
          setTotalPipelineLatency(`${activeMsg.recognitionLatency + activeMsg.translationLatency + 210}ms`);
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
        }
      } catch (err) {
        console.warn("Failed to load Azure token:", err);
      }

      // 3. Scan browser inputs & destinations
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
        console.warn("Hardware enumeration not allowed/supported:", err);
      }

      // 4. Load database voices
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

    // Clean up streams on leave
    return () => {
      if (speechServiceRef.current) {
        speechServiceRef.current.stop();
      }
    };
  }, []);

  // Update hardware names based on selections
  useEffect(() => {
    const inputOpt = audioInputsPool.find((o) => o.value === inputDevice);
    if (inputOpt) setMicrophoneStatus(inputOpt.label);

    const outputOpt = audioOutputsPool.find((o) => o.value === outputDevice);
    if (outputOpt) setSpeakerStatus(outputOpt.label);
  }, [inputDevice, outputDevice, audioInputsPool, audioOutputsPool]);

  // Transcripts handlers
  const handleClearTranscripts = () => {
    setTranscripts([]);
    if (pipelineRef.current) {
      pipelineRef.current.clearQueue();
    }
  };

  const handleExportTranscripts = () => {
    if (transcripts.length === 0) return;
    
    // Create clean transcript output containing original + target translations
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
    link.download = `AetherVOX-translation-${Date.now()}.txt`;
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

          // Automatically pipe final recognized sentence to Translation Pipeline
          if (pipelineRef.current && isTranslating) {
            pipelineRef.current.enqueue(
              result.text,
              sourceLanguage,
              targetLanguages,
              result.confidence || 95,
              recLatency
            );
          } else {
            // Push transcript block locally with no translations
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

  // Mapped statuses
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
            
            // Module 10 stats
            recognitionStatus={isListening ? "Listening" : "Idle"}
            translationStatus={isTranslating ? translationStatus : "Idle"}
            messagesProcessed={messagesProcessed}
            provider="Azure Cognitive AI"
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
            
            azureSynthesisStatus={isListening ? "Connected" : "Disabled"}
            azureSynthesisLatency={synthesisLatency}
            
            elevenLabsStatus="Connected"
            elevenLabsLatency="210ms"
            
            openAiStatus="Connected"
            openAiLatency={translationLatency}
          />
        </div>
      </div>
    </div>
  );
}
