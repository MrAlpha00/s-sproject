import { getAzureSecrets } from "../config";
import { AzureResponse } from "../types";
import { retry } from "../utils/retry";

export class SpeechService {
  /**
   * Performs connectivity validation by requesting a temporary token from the Azure Speech issueToken endpoint.
   * This tests the regional routing and key validation server-side without streaming audio.
   */
  static async healthCheck(): Promise<AzureResponse> {
    const { speechKey, speechRegion } = getAzureSecrets();

    if (!speechKey) {
      return {
        success: false,
        message: "Validation Failed: AZURE_SPEECH_KEY environment variable is not configured.",
        code: "ENV_MISSING_KEY",
      };
    }

    const tokenEndpoint = `https://${speechRegion}.api.cognitive.microsoft.com/sts/v1.0/issueToken`;

    try {
      const response = await retry(async () => {
        const res = await fetch(tokenEndpoint, {
          method: "POST",
          headers: {
            "Ocp-Apim-Subscription-Key": speechKey,
            "Content-Length": "0",
          },
          // Set a short timeout for health check
          signal: AbortSignal.timeout(6000),
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Azure HTTP Status ${res.status}: ${text || res.statusText}`);
        }

        return res;
      }, 2); // 2 retries on network fail

      if (response.status === 200) {
        return {
          success: true,
          message: "Speech Service verified. Token generated successfully.",
        };
      }

      return {
        success: false,
        message: `Unexpected token endpoint response code: ${response.status}`,
        code: "UNEXPECTED_RESPONSE",
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Connection Error: ${err.message || "Failed to reach Azure Speech Token service."}`,
        code: "CONNECTION_FAILED",
      };
    }
  }
}
