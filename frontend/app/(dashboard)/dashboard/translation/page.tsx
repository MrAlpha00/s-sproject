"use client";

import { useState } from "react";
import { useEvents } from "@/providers/EventProvider";
import { TranslationHeader } from "@/components/translation/TranslationHeader";
import { TranslationConfigPanel } from "@/components/translation/TranslationConfigPanel";
import { SessionInfoCard } from "@/components/translation/SessionInfoCard";
import { TranslationPreview } from "@/components/translation/TranslationPreview";
import { SessionControls } from "@/components/translation/SessionControls";
import { AIStatusPanel } from "@/components/translation/AIStatusPanel";

export default function TranslationStudioPage() {
  const { events } = useEvents();

  // Lifted configuration states
  const [selectedEventId, setSelectedEventId] = useState("manual");
  const [sourceLanguage, setSourceLanguage] = useState("English (US)");
  const [targetLanguages, setTargetLanguages] = useState<string[]>(["Spanish (ES)", "Mandarin (ZH)"]);
  const [voiceProfile, setVoiceProfile] = useState("Enterprise Voice Male A (Cloned)");
  const [translationModel, setTranslationModel] = useState("Aether-Large-V3");
  const [latencyMode, setLatencyMode] = useState<"low-latency" | "standard" | "high-fidelity">("low-latency");
  const [profanityFilter, setProfanityFilter] = useState(true);
  const [targetVocabulary, setTargetVocabulary] = useState("");
  const [inputDevice, setInputDevice] = useState("Audio Channel 1 (Shure SM7B Mic)");
  const [outputDevice, setOutputDevice] = useState("Audio Channel Out 1 (AetherVOX Mixer)");

  // Placeholder Provider states
  const [speechProvider, setSpeechProvider] = useState("azure");
  const [translationProvider, setTranslationProvider] = useState("azure-translator");
  const [outputVoiceEngine, setOutputVoiceEngine] = useState("elevenlabs");

  // Toggle States
  const [captionsEnabled, setCaptionsEnabled] = useState(true);
  const [recordingEnabled, setRecordingEnabled] = useState(false);

  // Status
  const [sessionStatus] = useState("IDLE");

  // Determine active session title
  const activeEvent = events.find((e) => e.id === selectedEventId);
  const sessionName = activeEvent ? `${activeEvent.name} Stream` : "Manual Override Session";

  return (
    <div className="space-y-6">
      {/* Top Workspace Header */}
      <TranslationHeader sessionName={sessionName} status={sessionStatus} />

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
          />
          <SessionInfoCard
            selectedEventId={selectedEventId}
            status={sessionStatus}
            latencyMode={latencyMode}
          />
        </div>

        {/* Center Columns: Preview & Controls */}
        <div className="lg:col-span-2 space-y-6 flex flex-col justify-between">
          <div className="flex-1">
            <TranslationPreview />
          </div>
          <SessionControls />
        </div>

        {/* Right Column: AI Status Panel */}
        <div className="lg:col-span-1">
          <AIStatusPanel />
        </div>
      </div>
    </div>
  );
}
