import { getAzureSecrets } from "../config";
import { AzureResponse } from "../types";
import { retry } from "../utils/retry";

export class TranslatorService {
  /**
   * Performs connectivity validation by requesting a tiny translation of a 'ping' word.
   * This tests endpoints and authentication keys server-side.
   */
  static async healthCheck(): Promise<AzureResponse> {
    const { translatorKey, translatorRegion, translatorEndpoint } = getAzureSecrets();

    if (!translatorKey) {
      return {
        success: false,
        message: "Validation Failed: AZURE_TRANSLATOR_KEY environment variable is not configured.",
        code: "ENV_MISSING_KEY",
      };
    }

    // Standard translation endpoint
    const url = `${translatorEndpoint}/translate?api-version=3.0&to=es`;

    try {
      const response = await retry(async () => {
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Ocp-Apim-Subscription-Key": translatorKey,
            "Ocp-Apim-Subscription-Region": translatorRegion,
            "Content-Type": "application/json",
          },
          body: JSON.stringify([{ Text: "ping" }]),
          signal: AbortSignal.timeout(6000),
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Azure HTTP Status ${res.status}: ${text || res.statusText}`);
        }

        return res;
      }, 2); // 2 retries

      if (response.status === 200) {
        return {
          success: true,
          message: "Translation Service verified. Translation response code 200.",
        };
      }

      return {
        success: false,
        message: `Unexpected translator endpoint response code: ${response.status}`,
        code: "UNEXPECTED_RESPONSE",
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Connection Error: ${err.message || "Failed to reach Azure Translation service."}`,
        code: "CONNECTION_FAILED",
      };
    }
  }
}
