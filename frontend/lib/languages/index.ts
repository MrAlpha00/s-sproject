import { AZURE_LANGUAGES } from "@/lib/azure/constants";

export { AZURE_LANGUAGES } from "@/lib/azure/constants";

export type LanguageOption = { value: string; label: string };

/**
 * Maps legacy human-readable language names (from old DB records)
 * to their canonical BCP-47 codes.
 */
const LEGACY_NAME_TO_CODE: Record<string, string> = {
  "English (US)": "en-US",
  "English (UK)": "en-GB",
  "Hindi (HI)": "hi-IN",
  "Hindi (हिंदी)": "hi-IN",
  "Telugu (TE)": "te-IN",
  "Telugu (తెలుగు)": "te-IN",
  "Kannada (KN)": "kn-IN",
  "Kannada (ಕನ್ನಡ)": "kn-IN",
  "Tamil (TA)": "ta-IN",
  "Tamil (தமிழ்)": "ta-IN",
  "Malayalam (ML)": "ml-IN",
  "Malayalam (മലയാളം)": "ml-IN",
  "Marathi (MR)": "mr-IN",
  "Marathi (मराठी)": "mr-IN",
  "Bengali (BN)": "bn-IN",
  "Bengali (বাংলা)": "bn-IN",
  "Gujarati (GU)": "gu-IN",
  "Gujarati (ગુજરાતી)": "gu-IN",
  "Punjabi (PA)": "pa-IN",
  "Punjabi (ਪੰਜਾਬੀ)": "pa-IN",
  "Urdu (UR)": "ur-IN",
  "Urdu (اردو)": "ur-IN",
  "Spanish (ES)": "es-ES",
  "Spanish (Español)": "es-ES",
  "French (FR)": "fr-FR",
  "French (Français)": "fr-FR",
  "German (DE)": "de-DE",
  "German (Deutsch)": "de-DE",
  "Mandarin (ZH)": "zh-CN",
  "Chinese (中文)": "zh-CN",
  "Japanese (JA)": "ja-JP",
  "Japanese (日本語)": "ja-JP",
  "Korean (KO)": "ko-KR",
  "Korean (한국어)": "ko-KR",
  "Portuguese (PT)": "pt-BR",
  "Italian (IT)": "it-IT",
  "Russian (RU)": "ru-RU",
  "Arabic (AR)": "ar-SA",
};

/**
 * Returns true if the given value is a valid BCP-47 language code
 * present in AZURE_LANGUAGES.
 */
export function isBCP47Code(value: string): boolean {
  return AZURE_LANGUAGES.some((l) => l.value === value);
}

/**
 * Normalizes a language value to a BCP-47 code.
 * If already a valid code, returns it as-is.
 * If a legacy human-readable name, maps it to the correct code.
 * Returns the original value unchanged if no mapping found.
 */
export function normalizeLanguageCode(value: string): string {
  if (!value) return value;
  if (isBCP47Code(value)) return value;
  return LEGACY_NAME_TO_CODE[value] || value;
}

/**
 * Normalizes an array of language values to BCP-47 codes.
 */
export function normalizeLanguageCodes(values: string[]): string[] {
  return values.map(normalizeLanguageCode);
}

/**
 * Looks up the display label for a BCP-47 code from AZURE_LANGUAGES.
 * Returns the code itself if no match found.
 */
export function getLanguageLabel(code: string): string {
  const normalized = normalizeLanguageCode(code);
  const match = AZURE_LANGUAGES.find((l) => l.value === normalized);
  return match ? match.label : normalized;
}

/**
 * The canonical list of all supported Indian languages (BCP-47 codes).
 */
export const INDIAN_LANGUAGE_CODES = [
  "en-US",
  "hi-IN",
  "te-IN",
  "kn-IN",
  "ta-IN",
  "ml-IN",
  "mr-IN",
  "bn-IN",
  "gu-IN",
  "pa-IN",
  "ur-IN",
] as const;
