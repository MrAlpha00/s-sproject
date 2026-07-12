import { DEFAULT_SPEECH_REGION, DEFAULT_TRANSLATOR_REGION, DEFAULT_TRANSLATOR_ENDPOINT } from "../constants";

export const getAzureConfig = () => {
  // Return configuration status indicators and variables (without exposing secret keys to caller directly)
  return {
    speechKeyConfigured: !!process.env.AZURE_SPEECH_KEY,
    speechRegion: process.env.AZURE_SPEECH_REGION || DEFAULT_SPEECH_REGION,
    translatorKeyConfigured: !!process.env.AZURE_TRANSLATOR_KEY,
    translatorRegion: process.env.AZURE_TRANSLATOR_REGION || DEFAULT_TRANSLATOR_REGION,
    translatorEndpoint: process.env.AZURE_TRANSLATOR_ENDPOINT || DEFAULT_TRANSLATOR_ENDPOINT,
  };
};

export const getAzureSecrets = () => {
  // ONLY call this inside server-side processes (API Routes, Server Actions)
  return {
    speechKey: process.env.AZURE_SPEECH_KEY || "",
    speechRegion: process.env.AZURE_SPEECH_REGION || DEFAULT_SPEECH_REGION,
    translatorKey: process.env.AZURE_TRANSLATOR_KEY || "",
    translatorRegion: process.env.AZURE_TRANSLATOR_REGION || DEFAULT_TRANSLATOR_REGION,
    translatorEndpoint: process.env.AZURE_TRANSLATOR_ENDPOINT || DEFAULT_TRANSLATOR_ENDPOINT,
  };
};
