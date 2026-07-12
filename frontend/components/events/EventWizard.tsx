"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Check, Sparkles, Volume2, Mic2, FileText, Settings, Languages } from "lucide-react";
import { TranslationEvent, TranslationEventStatus } from "@/types/event";
import { LanguageSelector } from "@/components/events/LanguageSelector";
import { motion, AnimatePresence } from "framer-motion";

interface EventWizardProps {
  initialData?: TranslationEvent;
  onSubmit: (data: Omit<TranslationEvent, "id" | "createdAt" | "updatedAt" | "createdBy" | "updatedBy" | "organizationId" | "ownerId">) => void;
  onCancel: () => void;
}

export function EventWizard({ initialData, onSubmit, onCancel }: EventWizardProps) {
  // Local form state
  const [name, setName] = useState(initialData?.name ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [venue, setVenue] = useState(initialData?.venue ?? "");
  const [date, setDate] = useState(initialData?.date ?? "");
  const [time, setTime] = useState(initialData?.time ?? "");
  
  const [sourceLanguage, setSourceLanguage] = useState(initialData?.sourceLanguage ?? "English (US)");
  const [targetLanguages, setTargetLanguages] = useState<string[]>(initialData?.targetLanguages ?? []);
  
  const [translationModel, setTranslationModel] = useState(initialData?.translationModel ?? "Aether-Large-V3");
  const [latencyMode, setLatencyMode] = useState<"low-latency" | "standard" | "high-fidelity">(initialData?.latencyMode ?? "low-latency");
  const [profanityFilter, setProfanityFilter] = useState(initialData?.profanityFilter ?? false);
  const [targetVocabulary, setTargetVocabulary] = useState(initialData?.targetVocabulary ?? "");

  const [inputDevice, setInputDevice] = useState(initialData?.inputDevice ?? "Shure SM7B Broadcast Mic (USB-1)");
  const [outputDevice, setOutputDevice] = useState(initialData?.outputDevice ?? "AetherVOX Live Broadcast Mixer");
  
  const [voiceProfile, setVoiceProfile] = useState(initialData?.voiceProfile ?? "Enterprise Voice Male A (Cloned)");
  const [status, setStatus] = useState<TranslationEventStatus>(initialData?.status ?? "scheduled");

  // Step state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

  // Placeholder lists
  const audioInputs = [
    "Shure SM7B Broadcast Mic (USB-1)",
    "Sennheiser TeamConnect Mic Array",
    "Default System Microphone",
    "OBS Virtual Audio Cable",
  ];

  const audioOutputs = [
    "AetherVOX Live Broadcast Mixer",
    "OBS Virtual Audio Input",
    "Default System Speakers",
    "Dante Virtual Soundcard Line 1",
  ];

  const voiceProfiles = [
    "Enterprise Voice Male A (Cloned)",
    "Enterprise Voice Female B (Cloned)",
    "Standard Neutral Narrator Male",
    "Standard Professional Presenter Female",
  ];

  const stepTitles = [
    "Basic Info",
    "Languages",
    "Translation Options",
    "Audio Devices",
    "Voice Profile",
    "Review",
  ];

  const stepIcons = [
    FileText,
    Languages,
    Settings,
    Volume2,
    Mic2,
    Sparkles,
  ];

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return name.trim() !== "" && venue.trim() !== "" && date !== "" && time !== "";
      case 2:
        return targetLanguages.length > 0;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep) && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = () => {
    onSubmit({
      name,
      description,
      venue,
      date,
      time,
      sourceLanguage,
      targetLanguages,
      translationModel,
      latencyMode,
      profanityFilter,
      targetVocabulary,
      inputDevice,
      outputDevice,
      voiceProfile,
      status,
    });
  };

  const progressPercent = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-zinc-950 p-6 md:p-8 shadow-2xl relative">
      {/* Progress & Stepper */}
      <div className="relative mb-8">
        <div className="absolute top-5 left-8 right-8 h-[2px] bg-zinc-900 -z-10">
          <div
            className="h-full bg-gradient-to-r from-electric-blue to-accent-purple transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        
        <div className="flex justify-between items-center px-4">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => {
            const Icon = stepIcons[step - 1];
            const isCompleted = step < currentStep;
            const isActive = step === currentStep;

            return (
              <div key={step} className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  disabled={step > currentStep && !validateStep(currentStep)}
                  onClick={() => setCurrentStep(step)}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border text-xs transition-all ${
                    isCompleted
                      ? "bg-gradient-to-br from-electric-blue to-accent-purple border-transparent text-white font-bold"
                      : isActive
                      ? "bg-zinc-950 border-electric-blue text-electric-blue font-bold shadow-[0_0_12px_rgba(0,212,255,0.2)]"
                      : "bg-zinc-950 border-white/[0.04] text-zinc-600 hover:border-zinc-800"
                  }`}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </button>
                <span
                  className={`hidden sm:inline text-[9px] uppercase tracking-wider font-bold ${
                    isActive ? "text-electric-blue" : isCompleted ? "text-zinc-400" : "text-zinc-600"
                  }`}
                >
                  {stepTitles[step - 1]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Contents */}
      <div className="min-h-[300px] border border-white/[0.03] bg-zinc-900/10 rounded-xl p-4 sm:p-6 mb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -5 }}
            transition={{ duration: 0.15 }}
          >
            {/* STEP 1: BASIC INFORMATION */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
                  Basic Translation Event Info
                </h3>
                <div className="grid gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-zinc-400 font-semibold">Event Name *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Annual Board Meeting 2026"
                      className="h-10 w-full rounded-lg border border-white/[0.06] bg-zinc-900 px-3 text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-zinc-400 font-semibold">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter details about the stream topics, panels, speakers..."
                      rows={3}
                      className="w-full rounded-lg border border-white/[0.06] bg-zinc-900 p-3 text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-zinc-400 font-semibold">Venue *</label>
                    <input
                      type="text"
                      value={venue}
                      onChange={(e) => setVenue(e.target.value)}
                      placeholder="e.g., Virtual Stream / San Francisco Room D"
                      className="h-10 w-full rounded-lg border border-white/[0.06] bg-zinc-900 px-3 text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs text-zinc-400 font-semibold">Date *</label>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="h-10 w-full rounded-lg border border-white/[0.06] bg-zinc-900 px-3 text-xs text-zinc-300 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-zinc-400 font-semibold">Time *</label>
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="h-10 w-full rounded-lg border border-white/[0.06] bg-zinc-900 px-3 text-xs text-zinc-300 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: LANGUAGES */}
            {currentStep === 2 && (
              <LanguageSelector
                sourceLanguage={sourceLanguage}
                setSourceLanguage={setSourceLanguage}
                targetLanguages={targetLanguages}
                setTargetLanguages={setTargetLanguages}
              />
            )}

            {/* STEP 3: TRANSLATION OPTIONS */}
            {currentStep === 3 && (
              <div className="space-y-5">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Neural Translation Options
                </h3>
                
                <div className="grid gap-4">
                  {/* Model Selection */}
                  <div className="space-y-1">
                    <label className="text-xs text-zinc-400 font-semibold">Translation Model</label>
                    <select
                      value={translationModel}
                      onChange={(e) => setTranslationModel(e.target.value)}
                      className="h-10 w-full rounded-lg border border-white/[0.06] bg-zinc-900 px-3 text-xs text-zinc-300 focus:outline-none"
                    >
                      <option value="Aether-Large-V3">Aether-Large-V3 (Recommended - Highest Precision)</option>
                      <option value="Aether-Medium">Aether-Medium (Balanced speed/fidelity)</option>
                      <option value="Aether-Small">Aether-Small (Ultra Fast - Minimal Latency)</option>
                    </select>
                  </div>

                  {/* Latency Mode */}
                  <div className="space-y-1">
                    <label className="text-xs text-zinc-400 font-semibold">Latency Mode</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["low-latency", "standard", "high-fidelity"] as const).map((mode) => (
                        <button
                          type="button"
                          key={mode}
                          onClick={() => setLatencyMode(mode)}
                          className={`rounded-lg border p-2.5 text-center text-xs transition-colors ${
                            latencyMode === mode
                              ? "bg-electric-blue/15 border-electric-blue text-white font-semibold"
                              : "bg-zinc-900 border-white/[0.04] text-zinc-400 hover:border-white/[0.1]"
                          }`}
                        >
                          <span className="capitalize">{mode === "low-latency" ? "Sub-Second" : mode.replace("-", " ")}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Profanity Filter */}
                  <div className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-zinc-900/40 p-3.5">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-semibold text-zinc-200">Profanity Filtering</span>
                      <span className="text-[10px] text-zinc-500">Automatically filter/censure inappropriate language in output text and synthesized audio.</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={profanityFilter}
                        onChange={(e) => setProfanityFilter(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-electric-blue peer-checked:after:bg-white" />
                    </label>
                  </div>

                  {/* Target Vocabulary */}
                  <div className="space-y-1">
                    <label className="text-xs text-zinc-400 font-semibold">Target Custom Vocabulary</label>
                    <p className="text-[10px] text-zinc-500">Add comma-separated custom terms, acronyms, or names to help the AI translation model recognize specialized terminology.</p>
                    <input
                      type="text"
                      value={targetVocabulary}
                      onChange={(e) => setTargetVocabulary(e.target.value)}
                      placeholder="e.g. AetherVOX, Supabase, LLM, ElevenLabs"
                      className="h-10 w-full rounded-lg border border-white/[0.06] bg-zinc-900 px-3 text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: AUDIO CONFIGURATION */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
                  Audio Interfaces Configuration
                </h3>
                
                <div className="grid gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-zinc-400 font-semibold">Input Stream Device (Microphone)</label>
                    <select
                      value={inputDevice}
                      onChange={(e) => setInputDevice(e.target.value)}
                      className="h-10 w-full rounded-lg border border-white/[0.06] bg-zinc-900 px-3 text-xs text-zinc-300 focus:outline-none"
                    >
                      {audioInputs.map((input) => (
                        <option key={input} value={input} className="bg-zinc-950 text-zinc-300">
                          {input}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-zinc-400 font-semibold">Output Stream Device (Speaker / Monitor Out)</label>
                    <select
                      value={outputDevice}
                      onChange={(e) => setOutputDevice(e.target.value)}
                      className="h-10 w-full rounded-lg border border-white/[0.06] bg-zinc-900 px-3 text-xs text-zinc-300 focus:outline-none"
                    >
                      {audioOutputs.map((output) => (
                        <option key={output} value={output} className="bg-zinc-950 text-zinc-300">
                          {output}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: VOICE PROFILE CONFIGURATION */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
                  Voice Profiles Settings
                </h3>
                
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-semibold">Target Synthesizer Voice Profile</label>
                  <p className="text-[11px] text-zinc-500 mb-3">
                    Assign a target cloned voice. This voice profile will be utilized by the ElevenLabs synthesizer to broadcast translations.
                  </p>
                  <select
                    value={voiceProfile}
                    onChange={(e) => setVoiceProfile(e.target.value)}
                    className="h-10 w-full rounded-lg border border-white/[0.06] bg-zinc-900 px-3 text-xs text-zinc-300 focus:outline-none"
                  >
                    {voiceProfiles.map((v) => (
                      <option key={v} value={v} className="bg-zinc-950 text-zinc-300">
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* STEP 6: FINAL REVIEW */}
            {currentStep === 6 && (
              <div className="space-y-5">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
                  Review Event Configurations
                </h3>
                
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Basic Card */}
                  <div className="rounded-lg border border-white/[0.04] bg-zinc-900/35 p-4 text-xs">
                    <h4 className="font-bold text-electric-blue uppercase tracking-wider mb-2">Basic Info</h4>
                    <div className="space-y-1 text-zinc-300">
                      <p><span className="text-zinc-500 font-semibold">Name:</span> {name}</p>
                      <p><span className="text-zinc-500 font-semibold">Venue:</span> {venue}</p>
                      <p><span className="text-zinc-500 font-semibold">Schedule:</span> {date} at {time}</p>
                      {description && <p className="mt-2 text-zinc-400 leading-normal">{description}</p>}
                    </div>
                  </div>

                  {/* Languages Card */}
                  <div className="rounded-lg border border-white/[0.04] bg-zinc-900/35 p-4 text-xs">
                    <h4 className="font-bold text-electric-blue uppercase tracking-wider mb-2">Language Pipeline</h4>
                    <div className="space-y-1">
                      <p><span className="text-zinc-500 font-semibold">Source Audio:</span> <span className="rounded bg-electric-blue/10 text-electric-blue px-1.5 py-0.5 text-[10px] font-bold">{sourceLanguage}</span></p>
                      <div className="mt-3">
                        <span className="text-zinc-500 font-semibold">Target Translation Buffers:</span>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {targetLanguages.map((lang) => (
                            <span key={lang} className="rounded bg-white/[0.04] px-1.5 py-0.5 text-[9px] text-zinc-300 font-medium border border-white/[0.04]">
                              {lang}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Translation Options Card */}
                  <div className="rounded-lg border border-white/[0.04] bg-zinc-900/35 p-4 text-xs">
                    <h4 className="font-bold text-accent-purple uppercase tracking-wider mb-2">Translation Pipeline</h4>
                    <div className="space-y-1 text-zinc-300">
                      <p><span className="text-zinc-500 font-semibold">AI Model:</span> {translationModel}</p>
                      <p><span className="text-zinc-500 font-semibold">Latency Mode:</span> <span className="capitalize">{latencyMode.replace("-", " ")}</span></p>
                      <p><span className="text-zinc-500 font-semibold">Profanity Filtering:</span> {profanityFilter ? "Enabled" : "Disabled"}</p>
                      {targetVocabulary && <p className="truncate"><span className="text-zinc-500 font-semibold">Custom Vocab:</span> {targetVocabulary}</p>}
                    </div>
                  </div>

                  {/* Hardware & Voice Card */}
                  <div className="rounded-lg border border-white/[0.04] bg-zinc-900/35 p-4 text-xs">
                    <h4 className="font-bold text-accent-purple uppercase tracking-wider mb-2">Audio & Voice</h4>
                    <div className="space-y-1 text-zinc-300">
                      <p className="truncate"><span className="text-zinc-500 font-semibold">Input Dev:</span> {inputDevice}</p>
                      <p className="truncate"><span className="text-zinc-500 font-semibold">Output Dev:</span> {outputDevice}</p>
                      <p className="truncate"><span className="text-zinc-500 font-semibold">Voice Clone:</span> {voiceProfile}</p>
                      <div className="mt-2.5">
                        <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Status</label>
                        <select
                          value={status}
                          onChange={(e) => setStatus(e.target.value as TranslationEventStatus)}
                          className="h-8 rounded border border-white/[0.06] bg-zinc-900 px-2 py-0.5 text-zinc-300 focus:outline-none"
                        >
                          <option value="draft">Draft</option>
                          <option value="scheduled">Scheduled</option>
                          <option value="live">Live Now</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Action Buttons Footer */}
      <div className="flex items-center justify-between border-t border-white/[0.04] pt-5">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-white/[0.06] bg-zinc-900/30 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
        >
          Cancel
        </button>
        
        <div className="flex items-center gap-2">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-zinc-900/30 px-3.5 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Back
            </button>
          )}

          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!validateStep(currentStep)}
              className="flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSave}
              className="rounded-lg bg-gradient-to-r from-electric-blue to-accent-purple px-4.5 py-2 text-xs font-semibold text-white shadow-lg transition-transform hover:scale-102 hover:opacity-95"
            >
              {initialData ? "Save Changes" : "Create Translation Event"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
