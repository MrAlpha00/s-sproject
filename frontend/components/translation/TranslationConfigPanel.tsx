"use client";

import { useEvents } from "@/providers/EventProvider";
import {
  Info,
  Calendar,
  Globe,
  Mic,
  Headphones,
  Cpu,
  Sliders,
  ChevronDown,
  ChevronUp,
  Search,
  Star,
  X,
  Languages,
} from "lucide-react";
import { useEffect, useState } from "react";
import { normalizeLanguageCode, normalizeLanguageCodes } from "@/lib/languages";

export interface PoolOption {
  value: string;
  label: string;
}

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

  // Dynamically injected pools
  languagesPool: PoolOption[];
  voiceProfilesPool: string[];
  audioInputsPool: PoolOption[];
  audioOutputsPool: PoolOption[];
  speechProvidersPool: PoolOption[];
  translationProvidersPool: PoolOption[];
  voiceEnginesPool: PoolOption[];
}

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

  languagesPool,
  voiceProfilesPool,
  audioInputsPool,
  audioOutputsPool,
  speechProvidersPool,
  translationProvidersPool,
  voiceEnginesPool,
}: TranslationConfigPanelProps) {
  const { events } = useEvents();

  // Accordion active tab
  const [activeSection, setActiveSection] = useState<string>("event");

  // Language selectors search & favorites
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>(["en-US", "hi-IN", "es-ES"]);

  // Load selected event defaults when selectedEventId changes
  useEffect(() => {
    if (selectedEventId && selectedEventId !== "manual") {
      const event = events.find((e) => e.id === selectedEventId);
      if (event) {
        setSourceLanguage(normalizeLanguageCode(event.sourceLanguage));
        setTargetLanguages(normalizeLanguageCodes(event.targetLanguages));
        setVoiceProfile(event.voiceProfile);
        setTranslationModel(event.translationModel);
        setLatencyMode(event.latencyMode);
        setProfanityFilter(event.profanityFilter);
        setTargetVocabulary(event.targetVocabulary);
        setInputDevice(event.inputDevice);
        setOutputDevice(event.outputDevice);
      }
    }
  }, [
    selectedEventId,
    events,
    setSourceLanguage,
    setTargetLanguages,
    setVoiceProfile,
    setTranslationModel,
    setLatencyMode,
    setProfanityFilter,
    setTargetVocabulary,
    setInputDevice,
    setOutputDevice,
  ]);

  const handleToggleTarget = (langVal: string) => {
    if (langVal === sourceLanguage) return;
    if (targetLanguages.includes(langVal)) {
      setTargetLanguages(targetLanguages.filter((l) => l !== langVal));
    } else {
      setTargetLanguages([...targetLanguages, langVal]);
    }
  };

  const toggleFavorite = (langVal: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (favorites.includes(langVal)) {
      setFavorites(favorites.filter((f) => f !== langVal));
    } else {
      setFavorites([...favorites, langVal]);
    }
  };

  const isIndianLang = (langVal: string) => langVal.endsWith("-IN");

  const filteredLangs = languagesPool.filter(
    (lang) =>
      lang.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.value.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Favorites first, Indian languages next (pinned), other languages last
  const favoritedLangs = filteredLangs.filter((lang) => favorites.includes(lang.value));
  const indianLangs = filteredLangs.filter(
    (lang) => isIndianLang(lang.value) && !favorites.includes(lang.value)
  );
  const otherLangs = filteredLangs.filter(
    (lang) => !isIndianLang(lang.value) && !favorites.includes(lang.value)
  );

  const sortedLangs = [...favoritedLangs, ...indianLangs, ...otherLangs];

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? "" : section);
  };

  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 divide-y divide-white/[0.04] overflow-hidden flex flex-col h-full">
      {/* 1. Event Section */}
      <div>
        <button
          onClick={() => toggleSection("event")}
          className="w-full flex items-center justify-between px-4 py-3 text-left text-xs font-bold text-zinc-350 hover:text-white hover:bg-white/[0.01] transition-colors"
        >
          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-electric-blue" />
            <span>Event Link Setup</span>
          </span>
          {activeSection === "event" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {activeSection === "event" && (
          <div className="p-4 bg-zinc-950/40 space-y-3 animate-in fade-in duration-200">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                Select Active Event
              </label>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="h-9 w-full rounded-lg border border-white/[0.06] bg-zinc-950 px-2.5 text-xs text-zinc-300 focus:outline-none focus:border-electric-blue cursor-pointer"
              >
                <option value="manual">Manual Override (No Event Link)</option>
                {events.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* 2. Languages Section */}
      <div>
        <button
          onClick={() => toggleSection("languages")}
          className="w-full flex items-center justify-between px-4 py-3 text-left text-xs font-bold text-zinc-350 hover:text-white hover:bg-white/[0.01] transition-colors"
        >
          <span className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-electric-blue" />
            <span>Languages & Translation</span>
          </span>
          {activeSection === "languages" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {activeSection === "languages" && (
          <div className="p-4 bg-zinc-950/40 space-y-4 animate-in fade-in duration-200">
            {/* Source Selector */}
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
                className="h-9 w-full rounded-lg border border-white/[0.06] bg-zinc-950 px-2.5 text-xs text-zinc-300 focus:outline-none focus:border-electric-blue cursor-pointer"
              >
                {languagesPool.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Selectors */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                Target Translation Languages
              </label>

              {/* Selected Chips */}
              <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 rounded-lg border border-white/[0.04] bg-zinc-950/40">
                {targetLanguages.length === 0 ? (
                  <span className="text-[10px] text-zinc-650 italic self-center">None selected</span>
                ) : (
                  targetLanguages.map((val) => {
                    const lOpt = languagesPool.find((l) => l.value === val);
                    return (
                      <span
                        key={val}
                        className="inline-flex items-center gap-1 rounded bg-electric-blue/10 border border-electric-blue/20 px-2 py-0.5 text-[9px] font-bold text-electric-blue"
                      >
                        <span>{lOpt ? lOpt.label.split(" (")[0] : val}</span>
                        <button
                          onClick={() => handleToggleTarget(val)}
                          className="hover:bg-electric-blue/20 rounded-full p-[1px]"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </span>
                    );
                  })
                )}
              </div>

              {/* Search Target */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search and add target language..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-8.5 pl-8 pr-3 rounded bg-zinc-950 border border-white/[0.06] text-xs focus:outline-none focus:border-electric-blue text-zinc-200"
                />
              </div>

              {/* Language List Scroll area */}
              <div className="max-h-[140px] overflow-y-auto rounded-lg border border-white/[0.04] bg-zinc-950/20 divide-y divide-white/[0.02]">
                {sortedLangs.map((lang) => {
                  const isSource = lang.value === sourceLanguage;
                  const isSelected = targetLanguages.includes(lang.value);
                  const isFav = favorites.includes(lang.value);
                  const isInd = isIndianLang(lang.value);

                  return (
                    <div
                      key={lang.value}
                      onClick={() => !isSource && handleToggleTarget(lang.value)}
                      className={`flex items-center justify-between px-2.5 py-1.5 text-[10px] cursor-pointer transition-colors ${
                        isSource
                          ? "opacity-30 cursor-not-allowed bg-zinc-950"
                          : isSelected
                          ? "bg-electric-blue/5 text-white"
                          : "text-zinc-400 hover:bg-white/[0.02]"
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={isSource}
                          readOnly
                          className="rounded border-zinc-800 text-electric-blue focus:ring-0"
                        />
                        <span>{lang.label}</span>
                        {isInd && (
                          <span className="text-[8px] bg-zinc-900 text-zinc-500 border border-white/[0.06] px-1 py-[1px] rounded uppercase font-bold tracking-wider">
                            IN
                          </span>
                        )}
                      </span>
                      <button
                        onClick={(e) => toggleFavorite(lang.value, e)}
                        className="text-zinc-650 hover:text-amber-400"
                      >
                        <Star className={`h-3 w-3 ${isFav ? "fill-amber-400 text-amber-400" : ""}`} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Voice Profiles Section */}
      <div>
        <button
          onClick={() => toggleSection("voices")}
          className="w-full flex items-center justify-between px-4 py-3 text-left text-xs font-bold text-zinc-350 hover:text-white hover:bg-white/[0.01] transition-colors"
        >
          <span className="flex items-center gap-2">
            <Languages className="h-4 w-4 text-electric-blue" />
            <span>Voice Profiles</span>
          </span>
          {activeSection === "voices" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {activeSection === "voices" && (
          <div className="p-4 bg-zinc-950/40 space-y-3 animate-in fade-in duration-200">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                Active Voice Profile
              </label>
              <select
                value={voiceProfile}
                onChange={(e) => setVoiceProfile(e.target.value)}
                className="h-9 w-full rounded-lg border border-white/[0.06] bg-zinc-950 px-2.5 text-xs text-zinc-300 focus:outline-none focus:border-electric-blue cursor-pointer"
              >
                {voiceProfilesPool.length > 0 ? (
                  voiceProfilesPool.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))
                ) : (
                  <option value="none">No voices available</option>
                )}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* 4. Audio Routing Section */}
      <div>
        <button
          onClick={() => toggleSection("audio")}
          className="w-full flex items-center justify-between px-4 py-3 text-left text-xs font-bold text-zinc-350 hover:text-white hover:bg-white/[0.01] transition-colors"
        >
          <span className="flex items-center gap-2">
            <Mic className="h-4 w-4 text-electric-blue" />
            <span>Audio Device Routing</span>
          </span>
          {activeSection === "audio" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {activeSection === "audio" && (
          <div className="p-4 bg-zinc-950/40 space-y-3.5 animate-in fade-in duration-200">
            <div className="space-y-1">
              <label className="text-[9px] font-semibold text-zinc-500 uppercase block">Input Device Source</label>
              <select
                value={inputDevice}
                onChange={(e) => setInputDevice(e.target.value)}
                className="h-9 w-full rounded-lg border border-white/[0.06] bg-zinc-950 px-2.5 text-xs text-zinc-350 focus:outline-none focus:border-electric-blue cursor-pointer"
              >
                {audioInputsPool.map((input) => (
                  <option key={input.value} value={input.value}>
                    {input.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-semibold text-zinc-500 uppercase block">Output Device Destination</label>
              <select
                value={outputDevice}
                onChange={(e) => setOutputDevice(e.target.value)}
                className="h-9 w-full rounded-lg border border-white/[0.06] bg-zinc-950 px-2.5 text-xs text-zinc-350 focus:outline-none focus:border-electric-blue cursor-pointer"
              >
                {audioOutputsPool.map((output) => (
                  <option key={output.value} value={output.value}>
                    {output.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* 5. AI Providers Section */}
      <div>
        <button
          onClick={() => toggleSection("providers")}
          className="w-full flex items-center justify-between px-4 py-3 text-left text-xs font-bold text-zinc-350 hover:text-white hover:bg-white/[0.01] transition-colors"
        >
          <span className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-electric-blue" />
            <span>AI Provider Engines</span>
          </span>
          {activeSection === "providers" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {activeSection === "providers" && (
          <div className="p-4 bg-zinc-950/40 space-y-3 animate-in fade-in duration-200">
            <div className="space-y-1">
              <label className="text-[9px] font-semibold text-zinc-500 uppercase block">Speech Recognition</label>
              <select
                value={speechProvider}
                onChange={(e) => setSpeechProvider(e.target.value)}
                className="h-9 w-full rounded-lg border border-white/[0.06] bg-zinc-950 px-2.5 text-xs text-zinc-350 focus:outline-none focus:border-electric-blue cursor-pointer"
              >
                {speechProvidersPool.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-semibold text-zinc-500 uppercase block">Translation Engine</label>
              <select
                value={translationProvider}
                onChange={(e) => setTranslationProvider(e.target.value)}
                className="h-9 w-full rounded-lg border border-white/[0.06] bg-zinc-950 px-2.5 text-xs text-zinc-350 focus:outline-none focus:border-electric-blue cursor-pointer"
              >
                {translationProvidersPool.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-semibold text-zinc-500 uppercase block">Voice Synthesis Engine</label>
              <select
                value={outputVoiceEngine}
                onChange={(e) => setOutputVoiceEngine(e.target.value)}
                className="h-9 w-full rounded-lg border border-white/[0.06] bg-zinc-950 px-2.5 text-xs text-zinc-350 focus:outline-none focus:border-electric-blue cursor-pointer"
              >
                {voiceEnginesPool.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* 6. Advanced Settings Section */}
      <div>
        <button
          onClick={() => toggleSection("advanced")}
          className="w-full flex items-center justify-between px-4 py-3 text-left text-xs font-bold text-zinc-350 hover:text-white hover:bg-white/[0.01] transition-colors"
        >
          <span className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-electric-blue" />
            <span>Advanced Configurations</span>
          </span>
          {activeSection === "advanced" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {activeSection === "advanced" && (
          <div className="p-4 bg-zinc-950/40 space-y-3.5 animate-in fade-in duration-200">
            <div className="space-y-1">
              <label className="text-[9px] font-semibold text-zinc-500 uppercase block">Latency Mode</label>
              <select
                value={latencyMode}
                onChange={(e) => setLatencyMode(e.target.value as any)}
                className="h-9 w-full rounded-lg border border-white/[0.06] bg-zinc-950 px-2.5 text-xs text-zinc-350 focus:outline-none focus:border-electric-blue cursor-pointer"
              >
                <option value="low-latency">Low-Latency (Sub-Second Translation)</option>
                <option value="standard">Standard (Sentence Boundary Analysis)</option>
                <option value="high-fidelity">High-Fidelity (Contextual Refinement)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-semibold text-zinc-500 uppercase block">Vocabulary Profile</label>
              <input
                type="text"
                placeholder="Comma separated vocab lists..."
                value={targetVocabulary}
                onChange={(e) => setTargetVocabulary(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-white/[0.06] bg-zinc-950 text-xs focus:outline-none focus:border-electric-blue text-zinc-300"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1">
              <span className="font-semibold text-zinc-400">Profanity Filtering</span>
              <input
                type="checkbox"
                checked={profanityFilter}
                onChange={(e) => setProfanityFilter(e.target.checked)}
                className="rounded border-zinc-800 text-electric-blue focus:ring-0 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-zinc-400">Generate Live Captions</span>
              <input
                type="checkbox"
                checked={captionsEnabled}
                onChange={(e) => setCaptionsEnabled(e.target.checked)}
                className="rounded border-zinc-800 text-electric-blue focus:ring-0 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-zinc-400">Record Broadcast Streams</span>
              <input
                type="checkbox"
                checked={recordingEnabled}
                onChange={(e) => setRecordingEnabled(e.target.checked)}
                className="rounded border-zinc-800 text-electric-blue focus:ring-0 cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
