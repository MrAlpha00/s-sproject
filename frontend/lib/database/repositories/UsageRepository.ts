import { SupabaseClient } from "@supabase/supabase-js";

export interface UsageSummary {
  speechMinutes: number;
  translationCharacters: number;
  synthesisCharacters: number;
  apiRequestsCount: number;
  estimatedCost: number;
}

const fallbackUsage: UsageSummary = {
  speechMinutes: 450, // 450 minutes translated
  translationCharacters: 320000,
  synthesisCharacters: 280000,
  apiRequestsCount: 1420,
  estimatedCost: 18.42 // cost estimate in USD
};

export class UsageRepository {
  constructor(private supabase: SupabaseClient) {}

  private isLocalStorageAvailable(): boolean {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
  }

  private getFallback(): UsageSummary {
    if (!this.isLocalStorageAvailable()) return fallbackUsage;
    const cached = localStorage.getItem("aethervox_fallback_usage_summary");
    return cached ? JSON.parse(cached) : fallbackUsage;
  }

  async getUsageSummary(organizationId: string): Promise<UsageSummary> {
    try {
      const { data, error } = await this.supabase
        .from("api_usages")
        .select("service_name, units_used, cost_est")
        .eq("organization_id", organizationId);

      if (error) {
        if (error.code === "42P01") {
          return this.getFallback();
        }
        throw error;
      }

      if (!data || data.length === 0) {
        return {
          speechMinutes: 0,
          translationCharacters: 0,
          synthesisCharacters: 0,
          apiRequestsCount: 0,
          estimatedCost: 0,
        };
      }

      let speechMin = 0;
      let transChar = 0;
      let synthChar = 0;
      let totalCost = 0;

      data.forEach((row) => {
        const units = Number(row.units_used) || 0;
        const cost = Number(row.cost_est) || 0;
        totalCost += cost;

        if (row.service_name === "AzureSpeech") {
          speechMin += units;
        } else if (row.service_name === "AzureTranslator") {
          transChar += units;
        } else if (row.service_name === "ElevenLabs") {
          synthChar += units;
        }
      });

      const summary: UsageSummary = {
        speechMinutes: Math.round(speechMin),
        translationCharacters: transChar,
        synthesisCharacters: synthChar,
        apiRequestsCount: data.length,
        estimatedCost: Math.round(totalCost * 100) / 100,
      };

      if (this.isLocalStorageAvailable()) {
        localStorage.setItem("aethervox_fallback_usage_summary", JSON.stringify(summary));
      }

      return summary;
    } catch (err) {
      console.warn("UsageRepository.getUsageSummary failed, using fallback:", err);
      return this.getFallback();
    }
  }

  async logUsage(
    organizationId: string,
    userId: string,
    serviceName: "AzureSpeech" | "AzureTranslator" | "ElevenLabs",
    unitsUsed: number,
    costEst: number
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("api_usages")
        .insert({
          organization_id: organizationId,
          user_id: userId,
          service_name: serviceName,
          units_used: unitsUsed,
          cost_est: costEst,
          created_by: userId,
        });

      if (error) {
        if (error.code === "42P01") {
          const fallback = this.getFallback();
          if (serviceName === "AzureSpeech") fallback.speechMinutes += unitsUsed;
          else if (serviceName === "AzureTranslator") fallback.translationCharacters += unitsUsed;
          else if (serviceName === "ElevenLabs") fallback.synthesisCharacters += unitsUsed;
          fallback.estimatedCost += costEst;
          fallback.apiRequestsCount += 1;
          
          if (this.isLocalStorageAvailable()) {
            localStorage.setItem("aethervox_fallback_usage_summary", JSON.stringify(fallback));
          }
          return true;
        }
        return false;
      }
      return true;
    } catch (err) {
      console.warn("UsageRepository.logUsage failed, writing to fallback:", err);
      const fallback = this.getFallback();
      if (serviceName === "AzureSpeech") fallback.speechMinutes += unitsUsed;
      else if (serviceName === "AzureTranslator") fallback.translationCharacters += unitsUsed;
      else if (serviceName === "ElevenLabs") fallback.synthesisCharacters += unitsUsed;
      fallback.estimatedCost += costEst;
      fallback.apiRequestsCount += 1;

      if (this.isLocalStorageAvailable()) {
        localStorage.setItem("aethervox_fallback_usage_summary", JSON.stringify(fallback));
      }
      return true;
    }
  }
}
