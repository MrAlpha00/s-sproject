"use client";

import { useState } from "react";
import { Sliders, Volume2, Shield, Settings, VolumeX } from "lucide-react";

interface AudioSettingsCardProps {
  inputGain: number;
  setInputGain: (gain: number) => void;
  outputGain: number;
  setOutputGain: (gain: number) => void;
  volume: number;
  setVolume: (vol: number) => void;
  mute: boolean;
  setMute: (mute: boolean) => void;
  monitoring: boolean;
  setMonitoring: (mon: boolean) => void;
  testTone: boolean;
  setTestTone: (tone: boolean) => void;
}

export function AudioSettingsCard({
  inputGain,
  setInputGain,
  outputGain,
  setOutputGain,
  volume,
  setVolume,
  mute,
  setMute,
  monitoring,
  setMonitoring,
  testTone,
  setTestTone,
}: AudioSettingsCardProps) {
  // Filters state (Placeholder)
  const [noiseSuppression, setNoiseSuppression] = useState(true);
  const [echoCancellation, setEchoCancellation] = useState(true);
  const [autoGain, setAutoGain] = useState(false);

  // Formats state (Placeholder)
  const [sampleRate, setSampleRate] = useState("48000");
  const [bitDepth, setBitDepth] = useState("24");
  const [channelMode, setChannelMode] = useState("stereo");
  const [bufferSize, setBufferSize] = useState("256");

  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-5 space-y-6">
      <div className="flex items-center justify-between border-b border-white/[0.04] pb-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
          Audio Settings & DSP
        </h3>
        <Sliders className="h-3.5 w-3.5 text-zinc-500" />
      </div>

      {/* Group 1: Volume & Gain Sliders */}
      <div className="space-y-4">
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
          Volume & Gain Calibration
        </span>

        <div className="space-y-3.5">
          {/* Input Gain */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-zinc-300">
              <span className="font-semibold">Input Channel Gain</span>
              <span className="font-mono text-[10px] text-zinc-500">{inputGain}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={inputGain}
              onChange={(e) => setInputGain(Number(e.target.value))}
              className="w-full h-1 bg-zinc-950 rounded-lg appearance-none cursor-pointer accent-electric-blue"
            />
          </div>

          {/* Output Gain */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-zinc-300">
              <span className="font-semibold">Output Synthesis Gain</span>
              <span className="font-mono text-[10px] text-zinc-500">{outputGain}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={outputGain}
              onChange={(e) => setOutputGain(Number(e.target.value))}
              className="w-full h-1 bg-zinc-950 rounded-lg appearance-none cursor-pointer accent-electric-blue"
            />
          </div>

          {/* Main Monitor Volume */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-zinc-300">
              <span className="font-semibold">Main Monitor Volume</span>
              <span className="font-mono text-[10px] text-zinc-500">{volume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-full h-1 bg-zinc-950 rounded-lg appearance-none cursor-pointer accent-accent-purple"
            />
          </div>
        </div>
      </div>

      {/* Group 2: DSP Audio Filters */}
      <div className="space-y-3 border-t border-white/[0.04] pt-4">
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
          Hardware Filters (DSP)
        </span>

        <div className="grid gap-3.5 text-xs">
          {/* Noise Suppression */}
          <div className="flex items-center justify-between">
            <span className="font-medium text-zinc-300">Noise Suppression</span>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={noiseSuppression}
                onChange={(e) => setNoiseSuppression(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-8 h-4.5 bg-zinc-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-500 after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-electric-blue peer-checked:after:bg-white" />
            </label>
          </div>

          {/* Echo Cancellation */}
          <div className="flex items-center justify-between">
            <span className="font-medium text-zinc-300">Echo Cancellation</span>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={echoCancellation}
                onChange={(e) => setEchoCancellation(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-8 h-4.5 bg-zinc-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-500 after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-electric-blue peer-checked:after:bg-white" />
            </label>
          </div>

          {/* Auto Gain */}
          <div className="flex items-center justify-between">
            <span className="font-medium text-zinc-300">Automatic Gain Control (AGC)</span>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoGain}
                onChange={(e) => setAutoGain(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-8 h-4.5 bg-zinc-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-500 after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-electric-blue peer-checked:after:bg-white" />
            </label>
          </div>

          {/* Monitoring toggle */}
          <div className="flex items-center justify-between">
            <span className="font-medium text-zinc-300">Audio Loopback Monitoring</span>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={monitoring}
                onChange={(e) => setMonitoring(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-8 h-4.5 bg-zinc-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-500 after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-accent-purple peer-checked:after:bg-white" />
            </label>
          </div>

          {/* Mute toggle */}
          <div className="flex items-center justify-between">
            <span className="font-medium text-zinc-300 flex items-center gap-1.5">
              Force Input Mute
              <VolumeX className="h-3.5 w-3.5 text-zinc-600" />
            </span>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={mute}
                onChange={(e) => setMute(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-8 h-4.5 bg-zinc-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-500 after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-red-500 peer-checked:after:bg-white" />
            </label>
          </div>

          {/* Test tone generator */}
          <div className="flex items-center justify-between">
            <span className="font-medium text-zinc-300">Test Tone Generator (1 kHz)</span>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={testTone}
                onChange={(e) => setTestTone(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-8 h-4.5 bg-zinc-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-500 after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-electric-blue peer-checked:after:bg-white" />
            </label>
          </div>
        </div>
      </div>

      {/* Group 3: Hardware Formats */}
      <div className="space-y-3 border-t border-white/[0.04] pt-4">
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
          Stream Format Settings
        </span>

        <div className="grid grid-cols-2 gap-3.5">
          {/* Sample Rate */}
          <div className="space-y-1">
            <label className="text-[9px] font-semibold text-zinc-500 uppercase block">Sample Rate</label>
            <select
              value={sampleRate}
              onChange={(e) => setSampleRate(e.target.value)}
              className="h-8 w-full rounded border border-white/[0.06] bg-zinc-950 px-2 py-0.5 text-xs text-zinc-300 focus:outline-none"
            >
              <option value="44100">44.1 kHz (CD Standard)</option>
              <option value="48000">48.0 kHz (Broadcast Default)</option>
              <option value="96000">96.0 kHz (Studio High-Fi)</option>
            </select>
          </div>

          {/* Bit Depth */}
          <div className="space-y-1">
            <label className="text-[9px] font-semibold text-zinc-500 uppercase block">Bit Depth</label>
            <select
              value={bitDepth}
              onChange={(e) => setBitDepth(e.target.value)}
              className="h-8 w-full rounded border border-white/[0.06] bg-zinc-950 px-2 py-0.5 text-xs text-zinc-300 focus:outline-none"
            >
              <option value="16">16-bit PCM</option>
              <option value="24">24-bit PCM (Recommended)</option>
              <option value="32">32-bit Float</option>
            </select>
          </div>

          {/* Channel Mode */}
          <div className="space-y-1">
            <label className="text-[9px] font-semibold text-zinc-500 uppercase block">Channel Mode</label>
            <select
              value={channelMode}
              onChange={(e) => setChannelMode(e.target.value)}
              className="h-8 w-full rounded border border-white/[0.06] bg-zinc-950 px-2 py-0.5 text-xs text-zinc-300 focus:outline-none"
            >
              <option value="mono">Mono (1 Input Channel)</option>
              <option value="stereo">Stereo (2 Output Channels)</option>
            </select>
          </div>

          {/* Buffer Size */}
          <div className="space-y-1">
            <label className="text-[9px] font-semibold text-zinc-500 uppercase block">Buffer Size</label>
            <select
              value={bufferSize}
              onChange={(e) => setBufferSize(e.target.value)}
              className="h-8 w-full rounded border border-white/[0.06] bg-zinc-950 px-2 py-0.5 text-xs text-zinc-300 focus:outline-none"
            >
              <option value="64">64 samples (Ultra Low Latency)</option>
              <option value="128">128 samples (Low Latency)</option>
              <option value="256">256 samples (Balanced Default)</option>
              <option value="512">512 samples (High Stability)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
