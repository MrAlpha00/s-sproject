export const AZURE_SDK_VERSION = "1.37.0"; // Target Azure Cognitive Services SDK Version
export const AUTHENTICATION_METHOD = "API Key Credentials (Server Isolated)";
export const QUOTA_TIER_SPEECH = "Standard S0 (Default Quota)";
export const QUOTA_TIER_TRANSLATOR = "Standard S1 (Default Quota)";

export const DEFAULT_SPEECH_REGION = "eastus";
export const DEFAULT_TRANSLATOR_REGION = "global";
export const DEFAULT_TRANSLATOR_ENDPOINT = "https://api.cognitive.microsofttranslator.com";

export const SUPPORTED_REGIONS = [
  { value: "eastus", label: "US East (Virginia)" },
  { value: "westus2", label: "US West 2 (Washington)" },
  { value: "northeurope", label: "Europe North (Ireland)" },
  { value: "westeurope", label: "Europe West (Netherlands)" },
  { value: "southeastasia", label: "Asia Southeast (Singapore)" },
  { value: "global", label: "Global (Multi-service)" }
];
