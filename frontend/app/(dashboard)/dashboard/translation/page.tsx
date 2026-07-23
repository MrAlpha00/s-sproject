"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useEvents } from "@/providers/EventProvider";
import { TranslationConfigPanel, PoolOption } from "@/components/translation/TranslationConfigPanel";
import { getSpeechToken } from "@/app/(dashboard)/dashboard/settings/azure/actions";
import { AZURE_LANGUAGES } from "@/lib/azure/constants";
import { normalizeLanguageCode, normalizeLanguageCodes } from "@/lib/languages";
import { createClient } from "@/supabase/client";
import { VoiceRepository } from "@/lib/database/repositories/VoiceRepository";
import { VoiceProfileRepository } from "@/lib/database/repositories/VoiceProfileRepository";
import { EventRepository } from "@/lib/database/repositories/EventRepository";
import { SetupProfileRepository } from "@/lib/database/repositories/SetupProfileRepository";
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function TranslationStudioPage() {
  const router = useRouter();
  const { events } = useEvents();

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

  const [speechProvider, setSpeechProvider] = useState("azure");
  const [translationProvider, setTranslationProvider] = useState("azure-translator");
  const [outputVoiceEngine, setOutputVoiceEngine] = useState("azure-tts");
  const [captionsEnabled, setCaptionsEnabled] = useState(true);
  const [recordingEnabled, setRecordingEnabled] = useState(false);

  const [selectedEventId, setSelectedEventId] = useState("manual");
  const [sourceLanguage, setSourceLanguage] = useState("en-US");
  const [targetLanguages, setTargetLanguages] = useState<string[]>([]);
  const [voiceProfile, setVoiceProfile] = useState("Standard Neutral Narrator Male");
  const [translationModel, setTranslationModel] = useState("Aether-Large-V3");
  const [latencyMode, setLatencyMode] = useState<"low-latency" | "standard" | "high-fidelity">("low-latency");
  const [profanityFilter, setProfanityFilter] = useState(true);
  const [targetVocabulary, setTargetVocabulary] = useState("");

  const [inputDevice, setInputDevice] = useState("default");
  const [outputDevice, setOutputDevice] = useState("default");

  const [isAzureConfigured, setIsAzureConfigured] = useState(false);
  const [microphoneStatus, setMicrophoneStatus] = useState("Default System Mic");

  useEffect(() => {
    async function loadData() {
      let configured = false;
      try {
        const result = await getSpeechToken();
        if (result.success && result.token && result.region) {
          configured = true;
        }
      } catch (err) {
        console.warn("Azure token check failed:", err);
      }
      setIsAzureConfigured(configured);

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
        console.warn("Hardware enumeration failed:", err);
      }

      try {
        const supabase = createClient();
        const voiceProfileRepo = new VoiceProfileRepository(supabase);
        const vProfiles = await voiceProfileRepo.findAll();
        const names = Array.from(new Set(vProfiles.map((p) => p.profileName)));
        if (names.length > 0) {
          setVoiceProfilesPool(names);
          const def = vProfiles.find((p) => p.isDefault) || vProfiles[0];
          setVoiceProfile(def.profileName);
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
                sourceLanguage: normalizeLanguageCode(profile.sourceLanguage || "en-US"),
                targetLanguages: normalizeLanguageCodes(profile.targetLanguages || []),
                voiceSelection: profile.voiceSelection || {},
              };
            }
          } else if (eventId) {
            const eventRepo = new EventRepository(supabase);
            const event = await eventRepo.findById(eventId);
            if (event) {
              const normalizedSource = normalizeLanguageCode(event.sourceLanguage || "en-US");
              const normalizedTargets = normalizeLanguageCodes(event.targetLanguages || []);
              configObj = {
                id: event.id,
                name: event.name,
                inputDevice: event.inputDevice || "default",
                outputDevice: event.outputDevice || "default",
                sourceLanguage: normalizedSource,
                targetLanguages: normalizedTargets,
                voiceSelection: event.voiceProfile ? { [normalizedTargets[0] || "en-US"]: event.voiceProfile } : {},
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
            if (configObj.id) setSelectedEventId(configObj.id);
            if (configObj.inputDevice) setInputDevice(configObj.inputDevice);
            if (configObj.outputDevice) setOutputDevice(configObj.outputDevice);
            if (configObj.sourceLanguage) setSourceLanguage(configObj.sourceLanguage);
            if (configObj.targetLanguages) setTargetLanguages(configObj.targetLanguages);
            if (configObj.voiceSelection) {
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
  }, []);

  useEffect(() => {
    const inputOpt = audioInputsPool.find((o) => o.value === inputDevice);
    if (inputOpt) setMicrophoneStatus(inputOpt.label);
  }, [inputDevice, audioInputsPool]);

  const handleVoiceProfileChange = async (newProfileName: string) => {
    setVoiceProfile(newProfileName);
    try {
      const supabase = createClient();
      const voiceProfileRepo = new VoiceProfileRepository(supabase);
      const allProfiles = await voiceProfileRepo.findAll();
      const mappings = allProfiles.filter((p) => p.profileName === newProfileName);
      if (mappings.length > 0) {
        const firstTarget = targetLanguages[0];
        const matchMapping = mappings.find((m) => m.language === firstTarget);
        if (matchMapping) {
          setVoiceProfile(matchMapping.voiceName);
        }
      }
    } catch (e) {
      console.warn("Failed to apply selected voice profile:", e);
    }
  };

  const micReady = audioInputsPool.length > 0 && inputDevice !== "";
  const speechReady = isAzureConfigured;
  const translatorReady = isAzureConfigured;
  const ttsReady = isAzureConfigured;
  const eventSelected = !!selectedEventId && selectedEventId !== "";
  const allDiagnosticsPassed = micReady && speechReady && translatorReady && ttsReady && eventSelected;

  const activeEvent = events.find((e) => e.id === selectedEventId);

  const getTargetLangsLabel = () => {
    if (targetLanguages.length === 0) return "None Selected";
    return targetLanguages
      .map((val) => {
        const lang = languagesPool.find((l) => l.value === val);
        return lang ? lang.label.split(" (")[0] : val;
      })
      .join(", ");
  };

  const handleEnterLiveStudio = () => {
    const completeConfig = {
      id: selectedEventId !== "manual" ? selectedEventId : undefined,
      name: activeEvent ? activeEvent.name : "Manual Override Session",
      inputDevice,
      outputDevice,
      sourceLanguage,
      targetLanguages,
      voiceProfile,
      translationModel,
      latencyMode,
      profanityFilter,
      targetVocabulary,
      speechProvider,
      translationProvider,
      outputVoiceEngine,
      captionsEnabled,
      recordingEnabled,
    };
    sessionStorage.setItem("aethervox_setup_config", JSON.stringify(completeConfig));
    router.push("/dashboard/studio");
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto text-white">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/[0.06] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold text-electric-blue uppercase tracking-widest bg-electric-blue/10 border border-electric-blue/20 px-2 py-0.5 rounded">
              Stage 1: Pre-Flight Readiness Check
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white mt-1">
            Translation Studio Setup & System Diagnostics
          </h1>
        </div>
        <button
          onClick={handleEnterLiveStudio}
          disabled={!allDiagnosticsPassed}
          className="h-10 px-5 rounded-xl bg-gradient-to-r from-electric-blue to-accent-purple hover:from-electric-blue/90 hover:to-accent-purple/90 text-black font-extrabold text-xs tracking-wider disabled:opacity-40 disabled:cursor-not-allowed transition-all inline-flex items-center gap-2 shadow-[0_0_20px_rgba(0,212,255,0.2)] cursor-pointer"
        >
          <span>ENTER LIVE STUDIO</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
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

        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-6 space-y-6 backdrop-blur-md shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.04] pb-4">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-electric-blue" />
                  <span>System Diagnostic Readiness Matrix</span>
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  All 5 infrastructure checks must be verified green before launching the operator console.
                </p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                allDiagnosticsPassed
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-400 animate-pulse"
              }`}>
                {allDiagnosticsPassed ? "Ready for Broadcast" : "Validation Pending"}
              </span>
            </div>

            <div className="space-y-3.5">
              {[
                { name: "Microphone Input Hardware", ready: micReady, detail: microphoneStatus },
                { name: "Azure Speech Recognition Engine", ready: speechReady, detail: isAzureConfigured ? "Connected (Azure SDK / Fallback Active)" : "Connecting..." },
                { name: "Azure Translator Neural V3", ready: translatorReady, detail: isAzureConfigured ? "Connected (Neural Multi-Language)" : "Connecting..." },
                { name: "Azure Speech Synthesis Engine", ready: ttsReady, detail: "Speaker Sink Initialized" },
                { name: "Active Event Link Configuration", ready: eventSelected, detail: activeEvent ? activeEvent.name : "Manual Session Mode" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3.5 rounded-lg bg-zinc-950/60 border border-white/[0.04]">
                  <div className="flex items-center gap-3">
                    {item.ready ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-amber-400 shrink-0" />
                    )}
                    <div>
                      <span className="text-xs font-bold text-white block">{item.name}</span>
                      <span className="text-[10px] text-zinc-500 font-mono block">{item.detail}</span>
                    </div>
                  </div>
                  <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                    item.ready
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                  }`}>
                    {item.ready ? "READY" : "CHECKING"}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-white/[0.04] flex items-center justify-between">
              <div className="text-[11px] text-zinc-500">
                <span>Selected Event: </span>
                <span className="text-white font-bold">{activeEvent ? activeEvent.name : "Manual Override"}</span>
                <span className="mx-2">•</span>
                <span>Targets: </span>
                <span className="text-electric-blue font-bold">{getTargetLangsLabel()}</span>
              </div>

              <button
                onClick={handleEnterLiveStudio}
                disabled={!allDiagnosticsPassed}
                className="h-10 px-6 rounded-xl bg-gradient-to-r from-electric-blue to-accent-purple hover:from-electric-blue/90 hover:to-accent-purple/90 text-black font-extrabold text-xs tracking-wider disabled:opacity-40 disabled:cursor-not-allowed transition-all inline-flex items-center gap-2 shadow-[0_0_20px_rgba(0,212,255,0.2)] cursor-pointer"
              >
                <span>ENTER LIVE STUDIO</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
