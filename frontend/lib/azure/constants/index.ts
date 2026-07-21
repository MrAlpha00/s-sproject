export const AZURE_SDK_VERSION = "1.37.0"; // Target Azure Cognitive Services SDK Version
export const AUTHENTICATION_METHOD = "API Key Credentials (Server Isolated)";
export const QUOTA_TIER_SPEECH = "Standard S0 (Default Quota)";
export const QUOTA_TIER_TRANSLATOR = "Standard S1 (Default Quota)";

export const DEFAULT_SPEECH_REGION = "eastus";
export const DEFAULT_TRANSLATOR_REGION = "global";
export const DEFAULT_TRANSLATOR_ENDPOINT = "https://api.cognitive.microsofttranslator.com";

export const SUPPORTED_REGIONS = [
  { value: "centralindia", label: "Central India (Pune)" },
  { value: "jioindiacentral", label: "Jio India Central (Nagpur)" },
  { value: "jioindiawest", label: "Jio India West (Jamnagar)" },
  { value: "eastus", label: "US East (Virginia)" },
  { value: "westeurope", label: "Europe West (Netherlands)" },
  { value: "southeastasia", label: "Asia Southeast (Singapore)" },
  { value: "westus2", label: "US West 2 (Washington)" },
  { value: "northeurope", label: "Europe North (Ireland)" },
  { value: "global", label: "Global (Multi-service)" }
];

export const AZURE_LANGUAGES = [
  { value: "en-US", label: "English (US)" },
  { value: "hi-IN", label: "Hindi (हिंदी)" },
  { value: "te-IN", label: "Telugu (తెలుగు)" },
  { value: "kn-IN", label: "Kannada (ಕನ್ನಡ)" },
  { value: "ta-IN", label: "Tamil (தமிழ்)" },
  { value: "ml-IN", label: "Malayalam (മലയാളം)" },
  { value: "mr-IN", label: "Marathi (मराठी)" },
  { value: "bn-IN", label: "Bengali (বাংলা)" },
  { value: "gu-IN", label: "Gujarati (ગુજરાતી)" },
  { value: "pa-IN", label: "Punjabi (ਪੰਜਾਬੀ)" },
  { value: "ur-IN", label: "Urdu (اردو)" },
  { value: "es-ES", label: "Spanish (Español)" },
  { value: "fr-FR", label: "French (Français)" },
  { value: "de-DE", label: "German (Deutsch)" },
  { value: "zh-CN", label: "Chinese (中文)" },
  { value: "ja-JP", label: "Japanese (日本語)" },
  { value: "ko-KR", label: "Korean (한국어)" }
];
