export type AudioDeviceType = "input" | "output";
export type AudioDeviceStatus = "active" | "connected" | "disconnected" | "standby";
export type AudioDeviceHealth = "good" | "degraded" | "critical";

export interface AudioDevice {
  id: string;
  manufacturer: string;
  name: string;
  type: AudioDeviceType;
  status: AudioDeviceStatus;
  health: AudioDeviceHealth;
  lastTested: string; // e.g. "10m ago", "Never"
  sampleRate: string; // e.g. "48.0 kHz"
  channels: string; // e.g. "Stereo (2 Ch)", "Mono (1 Ch)"
  latency: string; // e.g. "5ms", "12ms"
  isDefault: boolean;
  isSelected: boolean;
}
