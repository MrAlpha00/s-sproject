import { UsageSummary } from "../database/repositories/UsageRepository";
import { MessageMetrics } from "../database/repositories/AnalyticsRepository";

// Pricing models (Azure & ElevenLabs)
export const PRICING_SPEECH_PER_MINUTE = 0.016; // $0.016 / min
export const PRICING_TRANSLATION_PER_MILLION_CHARACTERS = 10.0; // $10.00 / M chars
export const PRICING_SYNTHESIS_PER_MILLION_CHARACTERS = 16.0; // $16.00 / M chars (Azure Neural)
export const PRICING_ELEVENLABS_PER_THOUSAND_CHARACTERS = 0.30; // $0.30 / K chars ($300 / M chars)

export class AnalyticsService {
  constructor() {}

  calculateSpeechCost(minutes: number): number {
    return minutes * PRICING_SPEECH_PER_MINUTE;
  }

  calculateTranslationCost(characters: number): number {
    return (characters / 1000000) * PRICING_TRANSLATION_PER_MILLION_CHARACTERS;
  }

  calculateSynthesisCost(characters: number, provider: "azure" | "elevenlabs" = "azure"): number {
    if (provider === "elevenlabs") {
      return (characters / 1000) * PRICING_ELEVENLABS_PER_THOUSAND_CHARACTERS;
    }
    return (characters / 1000000) * PRICING_SYNTHESIS_PER_MILLION_CHARACTERS;
  }

  calculateTotalCost(usage: UsageSummary): number {
    const speechCost = this.calculateSpeechCost(usage.speechMinutes);
    const transCost = this.calculateTranslationCost(usage.translationCharacters);
    const synthCost = this.calculateSynthesisCost(usage.synthesisCharacters, "azure");
    
    return Math.round((speechCost + transCost + synthCost) * 100) / 100;
  }

  calculateOverallPipelineLatency(recognition: number, translation: number, synthesis: number, streaming = 45): number {
    return recognition + translation + synthesis + streaming;
  }

  // Recognition accuracy estimation based on speech confidence aggregates
  estimateRecognitionAccuracy(metrics: MessageMetrics): number {
    if (metrics.totalMessages === 0) return 98.2; // default standard accuracy
    const avg = metrics.confidenceSum / metrics.totalMessages;
    return Math.round(avg * 10) / 10;
  }

  compileCSVReport(
    metrics: MessageMetrics,
    usage: UsageSummary,
    history: any[]
  ): string {
    let csv = "AetherVOX Enterprise Analytics Report\n";
    csv += `Generated At,${new Date().toISOString()}\n\n`;

    csv += "--- SUMMARY METRICS ---\n";
    csv += `Total Messages,${metrics.totalMessages}\n`;
    csv += `Speech Recognition Avg Latency (ms),${metrics.avgRecognitionLatency}\n`;
    csv += `Translation Avg Latency (ms),${metrics.avgTranslationLatency}\n`;
    csv += `Speech Synthesis Avg Latency (ms),${metrics.avgSynthesisLatency}\n`;
    csv += `Speech Minutes,${usage.speechMinutes}\n`;
    csv += `Translation Characters,${usage.translationCharacters}\n`;
    csv += `Synthesis Characters,${usage.synthesisCharacters}\n`;
    csv += `Estimated Cost (USD),${usage.estimatedCost}\n\n`;

    csv += "--- LANGUAGE DISTRIBUTION ---\n";
    csv += "Language Code,Characters Translated\n";
    Object.keys(metrics.languageUsage).forEach((lang) => {
      csv += `${lang},${metrics.languageUsage[lang]}\n`;
    });
    csv += "\n";

    csv += "--- BROADCAST EVENT HISTORY ---\n";
    csv += "Event Name,Duration (min),Peak Audience,Total Messages,Avg Delay (ms),Started At\n";
    history.forEach((h) => {
      csv += `"${h.name}",${h.durationMinutes},${h.peakAudience},${h.totalMessages},${h.avgDelayMs},"${h.startedAt}"\n`;
    });

    return csv;
  }

  compileJSONReport(
    metrics: MessageMetrics,
    usage: UsageSummary,
    history: any[],
    health: any
  ): string {
    return JSON.stringify(
      {
        reportMeta: {
          platform: "AetherVOX Enterprise SaaS",
          generatedAt: new Date().toISOString(),
        },
        summaryMetrics: {
          totalMessages: metrics.totalMessages,
          avgLatencyMs: {
            recognition: metrics.avgRecognitionLatency,
            translation: metrics.avgTranslationLatency,
            synthesis: metrics.avgSynthesisLatency,
          },
          accuracyEstimate: this.estimateRecognitionAccuracy(metrics),
        },
        billingAndUsage: {
          speechMinutes: usage.speechMinutes,
          translationCharacters: usage.translationCharacters,
          synthesisCharacters: usage.synthesisCharacters,
          apiCallsCount: usage.apiRequestsCount,
          costEstimatesUsd: {
            speech: Math.round(this.calculateSpeechCost(usage.speechMinutes) * 100) / 100,
            translation: Math.round(this.calculateTranslationCost(usage.translationCharacters) * 100) / 100,
            synthesis: Math.round(this.calculateSynthesisCost(usage.synthesisCharacters) * 100) / 100,
            totalEst: usage.estimatedCost,
          },
        },
        languageUsage: metrics.languageUsage,
        eventHistory: history,
        systemHealthState: health,
      },
      null,
      2
    );
  }
}
