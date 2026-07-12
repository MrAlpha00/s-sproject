export type TranslationStatus = "Pending" | "Translating" | "Completed" | "Failed";

export interface TranslationMessage {
  id: string;
  originalText: string;
  translatedText: Record<string, string>; // Maps language code (e.g., 'es-ES') to translated text
  sourceLanguage: string;
  targetLanguage: string[]; // List of target language codes
  provider: string;
  confidence?: number;
  recognitionLatency: number; // in milliseconds
  translationLatency: number; // in milliseconds
  timestamp: string;
  status: TranslationStatus;
}
