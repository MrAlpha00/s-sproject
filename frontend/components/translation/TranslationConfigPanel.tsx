"use client";

import { useEvents } from "@/providers/EventProvider";
import { Info, Volume2, Languages, Mic, Sparkles } from "lucide-react";
import { useEffect } from "react";

interface TranslationConfigPanelProps {
  selectedEventId: string;
  setSelectedEventId: (id: string) => void;
  sourceLanguage: string;
  setSourceLanguage: (lang: string) => void;
  targetLanguages: string[];
  setTargetLanguages: (langs: string[]) => void;
  voiceProfile: string;
  setVoiceProfile: (profile: string) => void;
  translationModel: string;
  setTranslationModel: (model: string) => void;
  latencyMode: "low-latency" | "standard" | "high-fidelity";
  setLatencyMode: (mode: "low-latency" | "standard" | "high-fidelity") => void;
  profanityFilter: boolean;
  setProfanityFilter: (filter: boolean) => void;
  targetVocabulary: string;
  setTargetVocabulary: (vocab: string) => void;
  inputDevice: string;
  setInputDevice: (device: string) => void;
  outputDevice: string;
  setOutputDevice: (device: string) => void;
  speechProvider: string;
  setSpeechProvider: (provider: string) => void;
  translationProvider: string;
  setTranslationProvider: (provider: string) => void;
  outputVoiceEngine: string;
  setOutputVoiceEngine: (engine: string) => void;
  captionsEnabled: boolean;
  setCaptionsEnabled: (enabled: boolean) => void;
  recordingEnabled: boolean;
  setRecordingEnabled: (enabled: boolean) => void;
}

const LANGUAGES_POOL = [
  "English (US)",
  "English (UK)",
  "Spanish (ES)",
  "French (FR)",
  "German (DE)",
  "Mandarin (ZH)",
  "Japanese (JA)",
  "Italian (IT)",
  "Korean (KO)",
];

const VOICE_PROFILES_POOL = [
  "Enterprise Voice Male A (Cloned)",
  "Enterprise Voice Female B (Cloned)",
  "Standard Neutral Narrator Male",
  "Standard Professional Presenter Female",
];

const AUDIO_INPUTS = [
  "Audio Channel 1 (Shure SM7B Mic)",
  "Audio Channel 2 (Sennheiser Array)",
  "Audio Channel 3 (OBS Virtual Cable)",
  "Default System Audio Input",
];

const AUDIO_OUTPUTS = [
  "Audio Channel Out 1 (AetherVOX Mixer)",
  "Audio Channel Out 2 (OBS Audio In)",
  "Audio Channel Out 3 (Speakers)",
  "Default System Audio Output",
];

export function TranslationConfigPanel({
  selectedEventId,
  setSelectedEventId,
  sourceLanguage,
  setSourceLanguage,
  targetLanguages,
  setTargetLanguages,
  voiceProfile,
  setVoiceProfile,
  translationModel,
  setTranslationModel,
  latencyMode,
  setLatencyMode,
  profanityFilter,
  setProfanityFilter,
  targetVocabulary,
  setTargetVocabulary,
  inputDevice,
  setInputDevice,
  outputDevice,
  setOutputDevice,
  speechProvider,
  setSpeechProvider,
  translationProvider,
  setTranslationProvider,
  outputVoiceEngine,
  setOutputVoiceEngine,
  captionsEnabled,
  setCaptionsEnabled,
  recordingEnabled,
  setRecordingEnabled,
}: TranslationConfigPanelProps) {
  const { events } = useEvents();

  // Load selected event defaults when selectedEventId changes
  useEffect(() => {
    if (selectedEventId && selectedEventId !== "manual") {
      const event = events.find((e) => e.id === selectedEventId);
      if (event) {
        setSourceLanguage(event.sourceLanguage);
        setTargetLanguages(event.targetLanguages);
        setVoiceProfile(event.voiceProfile);
        setTranslationModel(event.translationModel);
        setLatencyMode(event.latencyMode);
        setProfanityFilter(event.profanityFilter);
        setTargetVocabulary(event.targetVocabulary);
        setInputDevice(event.inputDevice.replace("Mic", "Mic Channel"));
        setOutputDevice(event.outputDevice.replace("Mixer", "Mixer Channel"));
      }
    }
  }, [selectedEventId, events, setSourceLanguage, setTargetLanguages, setVoiceProfile, setTranslationModel, setLatencyMode, setProfanityFilter, setTargetVocabulary, setInputDevice, setOutputDevice]);

  const handleToggleTarget = (lang: string) => {
    if (lang === sourceLanguage) return;
    if (targetLanguages.includes(lang)) {
      setTargetLanguages(targetLanguages.filter((l) => l !== lang));
    } else {
      setTargetLanguages([...targetLanguages, lang]);
    }
  };

  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-5 space-y-6">
      <h2 className="text-sm font-bold text-white uppercase tracking-wider">
        Session Configuration
      </h2>

      {/* Event Selector */}
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
          Translation Event Link
        </label>
        <select
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
          className="h-9 w-full rounded-lg border border-white/[0.06] bg-zinc-950 px-2.5 text-xs text-zinc-300 focus:outline-none"
        >
          <option value="manual">Manual Override (No Event Link)</option>
          {events.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>
      </div>

      {/* Input / Source Language */}
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
          Source Language
        </label>
        <select
          value={sourceLanguage}
          onChange={(e) => {
            setSourceLanguage(e.target.value);
            setTargetLanguages(targetLanguages.filter((t) => t !== e.target.value));
          }}
          className="h-9 w-full rounded-lg border border-white/[0.06] bg-zinc-950 px-2.5 text-xs text-zinc-300 focus:outline-none"
        >
          {LANGUAGES_POOL.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
      </div>

      {/* Output / Target Languages */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
          Target Languages
        </label>
        <div className="flex flex-wrap gap-1.5 p-2 rounded-lg border border-white/[0.04] bg-zinc-950/40">
          {LANGUAGES_POOL.map((lang) => {
            const isSource = lang === sourceLanguage;
            const isSelected = targetLanguages.includes(lang);

            return (
              <button
                type="button"
                key={lang}
                disabled={isSource}
                onClick={() => handleToggleTarget(lang)}
                className={`rounded px-2 py-1 text-[9px] font-semibold transition-colors border ${
                  isSource
                    ? "bg-zinc-950 border-white/[0.02] text-zinc-700 cursor-not-allowed"
                    : isSelected
                    ? "bg-electric-blue/15 border-electric-blue/30 text-white"
                    : "bg-zinc-950 border-white/[0.04] text-zinc-400 hover:text-white"
                }`}
              >
                {lang}
              </button>
            );
          })}
        </div>
      </div>

      {/* Voice profile */}
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
          Voice Profile
        </label>
        <select
          value={voiceProfile}
          onChange={(e) => setVoiceProfile(e.target.value)}
          className="h-9 w-full rounded-lg border border-white/[0.06] bg-zinc-950 px-2.5 text-xs text-zinc-300 focus:outline-none"
        >
          {VOICE_PROFILES_POOL.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </div>

      {/* Audio Channel Routing (Replaces Microphone) */}
      <div className="space-y-3 border-t border-white/[0.04] pt-4">
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
          Audio Channel Routing
        </span>

        <div className="grid gap-3">
          <div className="space-y-1">
            <label className="text-[9px] font-semibold text-zinc-500 uppercase block">Input Channel</label>
            <select
              value={inputDevice}
              onChange={(e) => setInputDevice(e.target.value)}
              className="h-9 w-full rounded-lg border border-white/[0.06] bg-zinc-950 px-2.5 text-xs text-zinc-300 focus:outline-none"
            >
              {AUDIO_INPUTS.map((input) => (
                <option key={input} value={input}>
                  {input}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-semibold text-zinc-500 uppercase block">Output Channel</label>
            <select
              value={outputDevice}
              onChange={(e) => setOutputDevice(e.target.value)}
              className="h-9 w-full rounded-lg border border-white/[0.06] bg-zinc-950 px-2.5 text-xs text-zinc-300 focus:outline-none"
            >
              {AUDIO_OUTPUTS.map((output) => (
                <option key={output} value={output}>
                  {output}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Placeholders (Engine specifications) */}
      <div className="space-y-3 border-t border-white/[0.04] pt-4">
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
          AI Engine Providers
        </span>

        <div className="grid gap-3">
          {/* Speech Provider */}
          <div className="space-y-1">
            <label className="text-[9px] font-semibold text-zinc-500 uppercase block">Speech Recognition</label>
            <select
              value={speechProvider}
              onChange={(e) => setSpeechProvider(e.target.value)}
              className="h-9 w-full rounded-lg border border-white/[0.06] bg-zinc-950 px-2.5 text-xs text-zinc-400 focus:outline-none"
            >
              <option value="azure">Azure Cognitive Speech Services (Default)</option>
              <option value="whisper">OpenAI Whisper Real-Time Stream (Placeholder)</option>
            </select>
          </div>

          {/* Translation Provider */}
          <div className="space-y-1">
            <label className="text-[9px] font-semibold text-zinc-500 uppercase block">Translation Engine</label>
            <select
              value={translationProvider}
              onChange={(e) => setTranslationProvider(e.target.value)}
              className="h-9 w-full rounded-lg border border-white/[0.06] bg-zinc-950 px-2.5 text-xs text-zinc-400 focus:outline-none"
            >
              <option value="azure-translator">Azure Neural Translator V3 (Default)</option>
              <option value="deepl">DeepL Pro Translation Stream (Placeholder)</option>
            </select>
          </div>

          {/* Output Voice Engine */}
          <div className="space-y-1">
            <label className="text-[9px] font-semibold text-zinc-500 uppercase block">Voice Synthesis Engine</label>
            <select
              value={outputVoiceEngine}
              onChange={(e) => setOutputVoiceEngine(e.target.value)}
              className="h-9 w-full rounded-lg border border-white/[0.06] bg-zinc-950 px-2.5 text-xs text-zinc-400 focus:outline-none"
            >
              <option value="elevenlabs">ElevenLabs Speech Synthesis (Default)</option>
              <option value="azure-tts">Azure Custom Neural Voice TTS (Placeholder)</option>
            </select>
          </div>

          {/* Latency Tuning */}
          <div className="space-y-1">
            <label className="text-[9px] font-semibold text-zinc-500 uppercase block">Latency Tuning Mode</label>
            <select
              value={latencyMode}
              onChange={(e) => setLatencyMode(e.target.value as any)}
              className="h-9 w-full rounded-lg border border-white/[0.06] bg-zinc-950 px-2.5 text-xs text-zinc-400 focus:outline-none"
            >
              <option value="low-latency">Low-Latency (Sub-Second Translation)</option>
              <option value="standard">Standard (Sentence Boundary Analysis)</option>
              <option value="high-fidelity">High-Fidelity (Contextual Refinement)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Switch Toggles */}
      <div className="space-y-3 border-t border-white/[0.04] pt-4">
        {/* Captions Toggle */}
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-zinc-300">Generate Live Captions</span>
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={captionsEnabled}
              onChange={(e) => setCaptionsEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-8 h-4.5 bg-zinc-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-500 after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-electric-blue peer-checked:after:bg-white" />
          </label>
        </div>

        {/* Recording Toggle */}
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-zinc-300">Record Broadcast Streams</span>
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={recordingEnabled}
              onChange={(e) => setRecordingEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-8 h-4.5 bg-zinc-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-500 after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-electric-blue peer-checked:after:bg-white" />
          </label>
        </div>
      </div>
    </div>
  );
}
