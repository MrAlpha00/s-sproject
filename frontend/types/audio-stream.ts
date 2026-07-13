export type PlaybackState = "idle" | "playing" | "buffering" | "paused" | "stopped";

export interface AudioPacket {
  sessionId: string;
  eventId: string;
  messageId: string;
  audioData?: string; // base64 WAV payload
  language: string;
  voice: string;
  duration: number; // duration in ms
  sequenceNumber: number;
  timestamp: string;
}

export interface BufferState {
  queueLength: number;
  maxQueueLength: number;
  bufferedDuration: number; // total duration in ms
  droppedPacketsCount: number;
  completedPacketsCount: number;
}

export interface ListenerState {
  playbackState: PlaybackState;
  volume: number;
  mute: boolean;
  networkLatency: number; // in ms
  playbackLatency: number; // in ms
  totalEndToEndLatency: number; // in ms
  connectionQuality: "excellent" | "good" | "poor" | "disconnected";
  currentVoice: string;
  currentLanguage: string;
  sampleRate: number; // e.g. 16000
  bitrate: number; // e.g. 256
}

export interface QueueItem {
  packet: AudioPacket;
  audioBuffer: AudioBuffer | null;
  scheduledTime: number;
}
