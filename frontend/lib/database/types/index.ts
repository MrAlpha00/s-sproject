export type UserRole = "SUPER_ADMIN" | "ORGANIZATION_ADMIN" | "EVENT_MANAGER" | "OPERATOR" | "VIEWER";

export interface Profile {
  id: string; // matches auth.uid()
  email: string;
  fullName: string;
  avatarUrl: string;
  organizationId: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  settings: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface TranslationEvent {
  id: string;
  organizationId: string;
  ownerId: string;
  name: string;
  description: string;
  venue: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  sourceLanguage: string;
  targetLanguages: string[];
  translationModel: string;
  latencyMode: "low-latency" | "standard" | "high-fidelity";
  profanityFilter: boolean;
  targetVocabulary: string;
  inputDevice: string;
  outputDevice: string;
  voiceProfile: string;
  status: "draft" | "scheduled" | "live" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface TranslationSession {
  id: string;
  organizationId: string;
  eventId: string;
  status: "idle" | "testing" | "active" | "paused" | "stopped";
  startedAt: string | null;
  endedAt: string | null;
  durationSeconds: number;
  listenersCount: number;
  expectedLatency: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface VoiceProfile {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  elevenLabsVoiceId: string;
  status: "active" | "training" | "inactive";
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface AudioConfiguration {
  id: string;
  organizationId: string;
  deviceName: string;
  deviceType: "input" | "output";
  sampleRate: string;
  channels: string;
  latency: string;
  inputGain: number;
  outputGain: number;
  volume: number;
  mute: boolean;
  monitoring: boolean;
  testTone: boolean;
  noiseSuppression: boolean;
  echoCancellation: boolean;
  autoGain: boolean;
  bufferSize: string;
  bitDepth: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface ApiUsage {
  id: string;
  organizationId: string;
  userId: string;
  serviceName: "AzureSpeech" | "AzureTranslator" | "ElevenLabs";
  unitsUsed: number;
  costEst: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface Subscription {
  id: string;
  organizationId: string;
  plan: "free" | "pro" | "enterprise";
  status: "active" | "cancelled" | "past_due" | "trialing";
  periodStart: string;
  periodEnd: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}
