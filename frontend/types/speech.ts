export type SpeechStatus = "Pending" | "Synthesizing" | "Playing" | "Paused" | "Completed" | "Failed";

export interface SpeechMessage {
  id: string;
  text: string;
  language: string;
  voice: string;
  provider: string;
  latency: number; // in milliseconds
  duration: number; // in milliseconds
  status: SpeechStatus;
  timestamp: string;
}
