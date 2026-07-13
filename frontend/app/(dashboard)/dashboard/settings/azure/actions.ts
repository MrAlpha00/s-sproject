"use server";

import { getAzureConfig, getAzureSecrets } from "@/lib/azure/config";
import { SpeechService } from "@/lib/azure/services/SpeechService";
import { TranslatorService } from "@/lib/azure/services/TranslatorService";
import { AzureDiagnosticResult } from "@/lib/azure/types";
import {
  AZURE_SDK_VERSION,
  AUTHENTICATION_METHOD,
  QUOTA_TIER_SPEECH,
  QUOTA_TIER_TRANSLATOR,
} from "@/lib/azure/constants";
import { createClient } from "@/supabase/server";
import { AzureSettingsRepository } from "@/lib/database/repositories/AzureSettingsRepository";

export async function getAzureEnvStatus() {
  return getAzureConfig();
}

export async function testAzureConnection(): Promise<AzureDiagnosticResult> {
  // Execute health checks server-side
  const speechResult = await SpeechService.healthCheck();
  const translatorResult = await TranslatorService.healthCheck();

  const timestamp = new Date().toLocaleString();

  // Try updating the metadata table in Supabase
  try {
    const supabase = await createClient();
    const repo = new AzureSettingsRepository(supabase);
    
    // Find organization's existing row or create a new one
    // Using hardcoded org tag for mock tenant scope
    const existing = await repo.findByOrganization("org-aether-main");

    const statusString = speechResult.success && translatorResult.success ? "Healthy" : "Failed";

    if (existing) {
      await repo.update(existing.id, {
        connectionStatus: statusString,
        lastChecked: new Date().toISOString(),
      });
    } else {
      await repo.create({
        organizationId: "org-aether-main",
        speechRegion: getAzureConfig().speechRegion,
        translatorRegion: getAzureConfig().translatorRegion,
        enabled: true,
        lastChecked: new Date().toISOString(),
        connectionStatus: statusString,
        createdBy: "admin@aethervox.com",
        updatedBy: "admin@aethervox.com",
      });
    }
  } catch (err) {
    console.warn("Failed to update azure_settings metadata row in Supabase database:", err);
  }

  return {
    speechResult,
    translatorResult,
    lastChecked: timestamp,
    sdkVersion: AZURE_SDK_VERSION,
    authType: AUTHENTICATION_METHOD,
    quotaTier: `Speech: ${QUOTA_TIER_SPEECH} / Translator: ${QUOTA_TIER_TRANSLATOR}`,
  };
}

export async function saveAzureSettings(data: { speechRegion: string; translatorRegion: string }) {
  try {
    const supabase = await createClient();
    const repo = new AzureSettingsRepository(supabase);
    const existing = await repo.findByOrganization("org-aether-main");

    if (existing) {
      await repo.update(existing.id, {
        speechRegion: data.speechRegion,
        translatorRegion: data.translatorRegion,
      });
    } else {
      await repo.create({
        organizationId: "org-aether-main",
        speechRegion: data.speechRegion,
        translatorRegion: data.translatorRegion,
        enabled: true,
        lastChecked: new Date().toISOString(),
        connectionStatus: "Pending",
        createdBy: "admin@aethervox.com",
        updatedBy: "admin@aethervox.com",
      });
    }
    return { success: true, message: "Settings saved successfully." };
  } catch (err: any) {
    return { success: false, message: err.message || "Failed to persist settings." };
  }
}

export async function getSpeechToken() {
  const { speechKey, speechRegion } = getAzureSecrets();

  if (!speechKey) {
    return {
      success: false,
      message: "Speech key is not configured on the server environment.",
    };
  }

  const tokenEndpoint = `https://${speechRegion}.api.cognitive.microsoft.com/sts/v1.0/issueToken`;

  try {
    const res = await fetch(tokenEndpoint, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": speechKey,
        "Content-Length": "0",
      },
    });

    if (!res.ok) {
      throw new Error(`STS token request failed with status: ${res.status}`);
    }

    const token = await res.text();
    return {
      success: true,
      token,
      region: speechRegion,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || "Failed to generate authorization token.",
    };
  }
}

export async function translateTextAction(
  text: string,
  from: string,
  to: string[]
) {
  const { translatorKey, translatorRegion, translatorEndpoint } = getAzureSecrets();

  if (!translatorKey) {
    return {
      success: false,
      message: "Azure Translator API key is not configured on the server environment.",
    };
  }

  // Construct target languages string query
  const targetParams = to.map((lang) => `to=${lang}`).join("&");
  const url = `${translatorEndpoint}/translate?api-version=3.0&from=${from.split("-")[0]}&${targetParams}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": translatorKey,
        "Ocp-Apim-Subscription-Region": translatorRegion,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([{ Text: text }]),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Azure Translator API returned status ${res.status}: ${errText}`);
    }

    const data = await res.json();
    const translations = data[0]?.translations || [];
    return {
      success: true,
      translations: translations.map((t: any) => ({
        text: t.text,
        to: t.to,
      })),
    };
  } catch (err: any) {
    console.error("Server-side translation error:", err);
    return {
      success: false,
      message: err.message || "Failed to execute server-side translation.",
    };
  }
}

export async function getAzureLanguages() {
  try {
    const res = await fetch("https://api.cognitive.microsofttranslator.com/languages?api-version=3.0&scope=translation", {
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch languages from Azure: status ${res.status}`);
    }
    const data = await res.json();
    return {
      success: true,
      languages: data.translation || {},
    };
  } catch (err: any) {
    console.error("Failed to fetch languages dynamically:", err);
    return {
      success: false,
      message: err.message || "Failed to fetch languages dynamically.",
    };
  }
}



