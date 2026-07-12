import { translateTextAction } from "@/app/(dashboard)/dashboard/settings/azure/actions";
import { retry } from "../utils/retry";

export interface TranslationResult {
  success: boolean;
  translations?: { text: string; to: string }[];
  message?: string;
  latency?: number;
}

export class TranslationService {
  /**
   * Translates a text string from one language to a single target language.
   */
  async translate(text: string, from: string, to: string): Promise<TranslationResult> {
    return this.translateMultiple(text, from, [to]);
  }

  /**
   * Translates a text string from one language to multiple target languages in a single request.
   */
  async translateMultiple(text: string, from: string, to: string[]): Promise<TranslationResult> {
    const startTime = performance.now();
    try {
      const result = await retry(async () => {
        const res = await translateTextAction(text, from, to);
        if (!res.success) {
          throw new Error(res.message || "Failed to translate text.");
        }
        return res;
      }, 2); // 2 retries

      const latency = Math.round(performance.now() - startTime);
      return {
        success: true,
        translations: result.translations,
        latency,
      };
    } catch (err: any) {
      const latency = Math.round(performance.now() - startTime);
      return {
        success: false,
        message: err.message || "Failed to translate text.",
        latency,
      };
    }
  }

  /**
   * Connectivity check for the Translator service.
   */
  async healthCheck(): Promise<{ success: boolean; message: string }> {
    const startTime = performance.now();
    try {
      const result = await translateTextAction("ping", "en", ["es"]);
      if (result.success) {
        return {
          success: true,
          message: `Translator service health check succeeded in ${Math.round(performance.now() - startTime)}ms.`,
        };
      }
      return {
        success: false,
        message: result.message || "Translator service health check failed.",
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || "Failed to communicate with Translator service.",
      };
    }
  }
}
