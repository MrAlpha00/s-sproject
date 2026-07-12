export type TranslationEventStatus = "draft" | "scheduled" | "live" | "completed" | "cancelled";

export interface TranslationEvent {
  id: string;
  organizationId: string;
  ownerId: string;
  name: string;
  description: string;
  venue: string;
  date: string; // YYYY-MM-DD format
  time: string; // HH:MM format
  sourceLanguage: string;
  targetLanguages: string[];
  
  // Translation Options (Step 3)
  translationModel: string; // e.g., "Aether-Large-V3", "Aether-Medium"
  latencyMode: "low-latency" | "standard" | "high-fidelity";
  profanityFilter: boolean;
  targetVocabulary: string; // custom terms list
  
  // Audio Config (Step 4)
  inputDevice: string;
  outputDevice: string;
  
  // Voice Profile Config (Step 5)
  voiceProfile: string;
  
  // Audit details
  status: TranslationEventStatus;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}
