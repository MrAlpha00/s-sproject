export type StreamingStatus = "idle" | "connecting" | "connected" | "error" | "disconnected";
export type SessionState = "idle" | "testing" | "active" | "paused" | "stopped";

export interface StreamingSession {
  id: string;
  organizationId: string;
  operatorId: string;
  eventId: string;
  status: SessionState;
  startedAt: string | null;
  endedAt: string | null;
  audienceCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Listener {
  id: string;
  joinedAt: string;
  language: string;
  userAgent: string;
}

export interface BroadcastMessage {
  id: string;
  sessionId: string;
  eventId: string;
  originalText: string;
  translatedText: Record<string, string>; // mapping languageCode -> translatedText
  sourceLanguage: string;
  targetLanguages: string[];
  timestamp: string;
  voice?: string;
  latency?: number;
}

export interface AudioPacketMetadata {
  sessionId: string;
  eventId: string;
  messageId: string;
  audioData?: string; // base64 encoded audio bytes (WAV/MP3 format)
  language: string;
  voice: string;
  duration: number;
  sequenceNumber: number;
  timestamp: string;
}
