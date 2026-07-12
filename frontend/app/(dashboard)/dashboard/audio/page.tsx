"use client";

import { useState } from "react";
import { AudioDevice } from "@/types/audio";
import { AudioSourcesList } from "@/components/audio/AudioSourcesList";
import { AudioDestinationsList } from "@/components/audio/AudioDestinationsList";
import { AudioLevelMeter } from "@/components/audio/AudioLevelMeter";
import { AudioSettingsCard } from "@/components/audio/AudioSettingsCard";
import { AudioRoutingPanel } from "@/components/audio/AudioRoutingPanel";
import { AudioHealthCard } from "@/components/audio/AudioHealthCard";
import { AudioControls } from "@/components/audio/AudioControls";
import { Volume2, Info } from "lucide-react";

const INITIAL_DEVICES: AudioDevice[] = [
  // Inputs (Sources)
  {
    id: "in-laptop-mic",
    manufacturer: "Intel Smart Sound",
    name: "Laptop Built-in Microphone Array",
    type: "input",
    status: "standby",
    health: "good",
    lastTested: "1h ago",
    sampleRate: "48.0 kHz",
    channels: "Mono (1 Ch)",
    latency: "15ms",
    isDefault: false,
    isSelected: false,
  },
  {
    id: "in-usb-mic",
    manufacturer: "Blue Microphones",
    name: "Yeti USB Microphone",
    type: "input",
    status: "active",
    health: "good",
    lastTested: "10m ago",
    sampleRate: "48.0 kHz",
    channels: "Stereo (2 Ch)",
    latency: "8ms",
    isDefault: true,
    isSelected: true,
  },
  {
    id: "in-bt-mic",
    manufacturer: "Sony Electronics",
    name: "Sony WH-1000XM4 Mic Channel",
    type: "input",
    status: "connected",
    health: "degraded",
    lastTested: "Never",
    sampleRate: "16.0 kHz",
    channels: "Mono (1 Ch)",
    latency: "120ms",
    isDefault: false,
    isSelected: false,
  },
  {
    id: "in-interface",
    manufacturer: "Focusrite",
    name: "Focusrite Scarlett 2i2 USB Channel",
    type: "input",
    status: "connected",
    health: "good",
    lastTested: "30m ago",
    sampleRate: "96.0 kHz",
    channels: "Stereo (2 Ch)",
    latency: "4ms",
    isDefault: false,
    isSelected: false,
  },
  {
    id: "in-mixer",
    manufacturer: "Behringer",
    name: "X32 Digital Mixer Main Out",
    type: "input",
    status: "connected",
    health: "good",
    lastTested: "Never",
    sampleRate: "48.0 kHz",
    channels: "Stereo (2 Ch)",
    latency: "6ms",
    isDefault: false,
    isSelected: false,
  },
  {
    id: "in-vac",
    manufacturer: "VB-Audio Software",
    name: "Virtual Audio Cable Line 1",
    type: "input",
    status: "connected",
    health: "good",
    lastTested: "1d ago",
    sampleRate: "44.1 kHz",
    channels: "Stereo (2 Ch)",
    latency: "10ms",
    isDefault: false,
    isSelected: false,
  },
  {
    id: "in-obs",
    manufacturer: "OBS Project",
    name: "OBS Virtual Audio Monitor Channel",
    type: "input",
    status: "connected",
    health: "good",
    lastTested: "2h ago",
    sampleRate: "48.0 kHz",
    channels: "Stereo (2 Ch)",
    latency: "12ms",
    isDefault: false,
    isSelected: false,
  },
  {
    id: "in-zoom",
    manufacturer: "Zoom Communications",
    name: "ZoomAudioDevice Input Channel",
    type: "input",
    status: "standby",
    health: "good",
    lastTested: "3d ago",
    sampleRate: "44.1 kHz",
    channels: "Mono (1 Ch)",
    latency: "25ms",
    isDefault: false,
    isSelected: false,
  },

  // Outputs (Destinations)
  {
    id: "out-laptop-spk",
    manufacturer: "Intel Smart Sound",
    name: "Laptop Realtek HD Audio Speakers",
    type: "output",
    status: "standby",
    health: "good",
    lastTested: "1h ago",
    sampleRate: "48.0 kHz",
    channels: "Stereo (2 Ch)",
    latency: "18ms",
    isDefault: false,
    isSelected: false,
  },
  {
    id: "out-ext-spk",
    manufacturer: "Bose Corporation",
    name: "Bose Companion 2 Speakers",
    type: "output",
    status: "connected",
    health: "good",
    lastTested: "Never",
    sampleRate: "48.0 kHz",
    channels: "Stereo (2 Ch)",
    latency: "12ms",
    isDefault: false,
    isSelected: false,
  },
  {
    id: "out-bt-spk",
    manufacturer: "JBL",
    name: "JBL Flip 6 Bluetooth Speaker",
    type: "output",
    status: "disconnected",
    health: "good",
    lastTested: "3d ago",
    sampleRate: "44.1 kHz",
    channels: "Mono (1 Ch)",
    latency: "160ms",
    isDefault: false,
    isSelected: false,
  },
  {
    id: "out-headphones",
    manufacturer: "Audio-Technica",
    name: "ATH-M50x Professional Headphones",
    type: "output",
    status: "active",
    health: "good",
    lastTested: "10m ago",
    sampleRate: "96.0 kHz",
    channels: "Stereo (2 Ch)",
    latency: "5ms",
    isDefault: true,
    isSelected: true,
  },
  {
    id: "out-pa-system",
    manufacturer: "Yamaha Pro Audio",
    name: "Yamaha StagePas 600i PA System",
    type: "output",
    status: "connected",
    health: "degraded",
    lastTested: "2d ago",
    sampleRate: "48.0 kHz",
    channels: "Stereo (2 Ch)",
    latency: "8ms",
    isDefault: false,
    isSelected: false,
  },
  {
    id: "out-virtual",
    manufacturer: "VB-Audio Software",
    name: "VB-Audio Virtual Cable Output B",
    type: "output",
    status: "connected",
    health: "good",
    lastTested: "12h ago",
    sampleRate: "48.0 kHz",
    channels: "Stereo (2 Ch)",
    latency: "10ms",
    isDefault: false,
    isSelected: false,
  },
];

export default function AudioDeviceManagerPage() {
  const [devices, setDevices] = useState<AudioDevice[]>(INITIAL_DEVICES);

  // Calibration gain states
  const [inputGain, setInputGain] = useState(80);
  const [outputGain, setOutputGain] = useState(75);
  const [volume, setVolume] = useState(70);
  const [mute, setMute] = useState(false);
  const [monitoring, setMonitoring] = useState(false);
  const [testTone, setTestTone] = useState(false);

  // Testing triggers
  const [isTestingInput, setIsTestingInput] = useState(false);
  const [isTestingOutput, setIsTestingOutput] = useState(false);

  const handleSelectDevice = (id: string) => {
    setDevices((prev) => {
      const target = prev.find((d) => d.id === id);
      if (!target) return prev;

      return prev.map((device) => {
        if (device.type === target.type) {
          return {
            ...device,
            isSelected: device.id === id,
            status: device.id === id ? "active" : device.status === "active" ? "connected" : device.status,
          };
        }
        return device;
      });
    });
  };

  const handleRefresh = () => {
    alert("Refreshing audio interfaces... Scanning hardware channels.");
  };

  const handleSave = () => {
    alert("Audio channel routing configuration saved successfully!");
  };

  // Find active devices
  const activeSource = devices.find((d) => d.type === "input" && d.isSelected) || devices[1];
  const activeDestination = devices.find((d) => d.type === "output" && d.isSelected) || devices[11];

  // Calculate accumulated pipeline latency
  const getMsNum = (latStr: string) => parseInt(latStr.replace("ms", ""), 10) || 0;
  const sourceLatVal = getMsNum(activeSource.latency);
  const destLatVal = getMsNum(activeDestination.latency);
  const totalLatencyVal = sourceLatVal + destLatVal + 3; // +3ms processing buffer
  const accumulatedLatency = `${totalLatencyVal}ms`;

  // Pipeline diagnostics warnings
  const warnings: string[] = [];
  if (sourceLatVal > 100) {
    warnings.push(`Input channel "${activeSource.name}" latency exceeds 100ms. Audio loopback may exhibit echo drift.`);
  }
  if (destLatVal > 100) {
    warnings.push(`Output channel "${activeDestination.name}" latency exceeds 100ms. Subtitle sync could trigger alerts.`);
  }
  if (activeSource.sampleRate !== activeDestination.sampleRate) {
    warnings.push(`Sample rate mismatch detected (${activeSource.sampleRate} vs ${activeDestination.sampleRate}). Local software resampler engaged.`);
  }
  if (activeSource.health === "degraded" || activeDestination.health === "degraded") {
    warnings.push("Hardware warnings reported in active channel routing. Check connections.");
  }
  if (mute) {
    warnings.push("Input Capture Mute is active. No sound signal will feed into AI Speech engines.");
  }

  const pipelineStatus = warnings.length > 2 ? "Critical" : warnings.length > 0 ? "Warning" : "Healthy";

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/[0.06] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
              System Settings
            </span>
            <div className="inline-flex items-center gap-1 rounded bg-zinc-900 border border-white/[0.06] px-1.5 py-0.5 text-[9px] text-zinc-400 font-semibold uppercase">
              Routing Active
            </div>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight -mt-0.5">
            Audio Device Manager
          </h1>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-white/[0.04] bg-zinc-900/10 px-3.5 py-1.5 text-xs text-zinc-400 shadow-inner">
          <Volume2 className="h-3.5 w-3.5 text-zinc-500" />
          <span>Active Pipeline: {accumulatedLatency}</span>
        </div>
      </div>

      {/* Audio Routing Flowchart Banner */}
      <AudioRoutingPanel
        activeSourceName={activeSource.name}
        activeDestinationName={activeDestination.name}
        translationModel="Aether-Large-V3"
        targetLanguages={["Spanish (ES)", "Mandarin (ZH)"]}
      />

      {/* Main Grid Workspace */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Columns: Devices Lists (Sources & Destinations) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Inputs */}
          <AudioSourcesList devices={devices} onSelect={handleSelectDevice} />
          
          {/* Outputs */}
          <AudioDestinationsList devices={devices} onSelect={handleSelectDevice} />
        </div>

        {/* Right Column: Settings, Levels, & Controls */}
        <div className="lg:col-span-1 space-y-6">
          {/* Diagnostic status card */}
          <AudioHealthCard
            pipelineStatus={pipelineStatus}
            activeSourceName={activeSource.name}
            activeDestinationName={activeDestination.name}
            latency={accumulatedLatency}
            warnings={warnings}
          />

          {/* Level Meters */}
          <AudioLevelMeter
            isTestingInput={isTestingInput}
            isTestingOutput={isTestingOutput || testTone}
          />

          {/* Configuration Forms */}
          <AudioSettingsCard
            inputGain={inputGain}
            setInputGain={setInputGain}
            outputGain={outputGain}
            setOutputGain={setOutputGain}
            volume={volume}
            setVolume={setVolume}
            mute={mute}
            setMute={setMute}
            monitoring={monitoring}
            setMonitoring={setMonitoring}
            testTone={testTone}
            setTestTone={setTestTone}
          />
        </div>
      </div>

      {/* Controls Footer */}
      <AudioControls
        isTestingInput={isTestingInput}
        setIsTestingInput={setIsTestingInput}
        isTestingOutput={isTestingOutput}
        setIsTestingOutput={setIsTestingOutput}
        onRefresh={handleRefresh}
        onSave={handleSave}
      />
    </div>
  );
}
