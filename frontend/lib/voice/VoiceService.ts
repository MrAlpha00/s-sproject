import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import { getSpeechToken } from "@/app/(dashboard)/dashboard/settings/azure/actions";

export interface AzureVoiceInfo {
  name: string;
  displayName: string;
  locale: string;
  gender: "Male" | "Female" | "Neutral";
  status: string;
  voiceType: string;
  sampleRateHertz: string;
  provider: string;
}

const STATIC_AZURE_VOICES: AzureVoiceInfo[] = [
  { name: "en-US-AvaMultilingualNeural", displayName: "Ava (Multilingual)", locale: "en-US", gender: "Female", status: "GA", voiceType: "Neural", sampleRateHertz: "24000", provider: "azure" },
  { name: "en-US-AndrewMultilingualNeural", displayName: "Andrew (Multilingual)", locale: "en-US", gender: "Male", status: "GA", voiceType: "Neural", sampleRateHertz: "24000", provider: "azure" },
  { name: "en-US-EmmaMultilingualNeural", displayName: "Emma (Multilingual)", locale: "en-US", gender: "Female", status: "GA", voiceType: "Neural", sampleRateHertz: "24000", provider: "azure" },
  { name: "en-US-BrianMultilingualNeural", displayName: "Brian (Multilingual)", locale: "en-US", gender: "Male", status: "GA", voiceType: "Neural", sampleRateHertz: "24000", provider: "azure" },
  { name: "hi-IN-SwaraNeural", displayName: "Swara", locale: "hi-IN", gender: "Female", status: "GA", voiceType: "Neural", sampleRateHertz: "24000", provider: "azure" },
  { name: "hi-IN-MadhurNeural", displayName: "Madhur", locale: "hi-IN", gender: "Male", status: "GA", voiceType: "Neural", sampleRateHertz: "24000", provider: "azure" },
  { name: "te-IN-ShrutiNeural", displayName: "Shruti", locale: "te-IN", gender: "Female", status: "GA", voiceType: "Neural", sampleRateHertz: "24000", provider: "azure" },
  { name: "te-IN-MohanNeural", displayName: "Mohan", locale: "te-IN", gender: "Male", status: "GA", voiceType: "Neural", sampleRateHertz: "24000", provider: "azure" },
  { name: "es-ES-ElviraNeural", displayName: "Elvira", locale: "es-ES", gender: "Female", status: "GA", voiceType: "Neural", sampleRateHertz: "24000", provider: "azure" },
  { name: "es-ES-AlvaroNeural", displayName: "Alvaro", locale: "es-ES", gender: "Male", status: "GA", voiceType: "Neural", sampleRateHertz: "24000", provider: "azure" },
  { name: "zh-CN-XiaoxiaoNeural", displayName: "Xiaoxiao", locale: "zh-CN", gender: "Female", status: "GA", voiceType: "Neural", sampleRateHertz: "24000", provider: "azure" },
  { name: "zh-CN-YunxiNeural", displayName: "Yunxi", locale: "zh-CN", gender: "Male", status: "GA", voiceType: "Neural", sampleRateHertz: "24000", provider: "azure" },
  { name: "ta-IN-PallaviNeural", displayName: "Pallavi", locale: "ta-IN", gender: "Female", status: "GA", voiceType: "Neural", sampleRateHertz: "24000", provider: "azure" },
  { name: "ta-IN-ValluvarNeural", displayName: "Valluvar", locale: "ta-IN", gender: "Male", status: "GA", voiceType: "Neural", sampleRateHertz: "24000", provider: "azure" },
  { name: "kn-IN-SapnaNeural", displayName: "Sapna", locale: "kn-IN", gender: "Female", status: "GA", voiceType: "Neural", sampleRateHertz: "24000", provider: "azure" },
  { name: "kn-IN-GaganNeural", displayName: "Gagan", locale: "kn-IN", gender: "Male", status: "GA", voiceType: "Neural", sampleRateHertz: "24000", provider: "azure" },
  { name: "ml-IN-SobhanaNeural", displayName: "Sobhana", locale: "ml-IN", gender: "Female", status: "GA", voiceType: "Neural", sampleRateHertz: "24000", provider: "azure" },
  { name: "ml-IN-MidhunNeural", displayName: "Midhun", locale: "ml-IN", gender: "Male", status: "GA", voiceType: "Neural", sampleRateHertz: "24000", provider: "azure" },
];

export class VoiceService {
  private cache: AzureVoiceInfo[] = [];

  constructor() {}

  async loadVoices(forceRefresh = false): Promise<AzureVoiceInfo[]> {
    if (this.cache.length > 0 && !forceRefresh) {
      return this.cache;
    }

    try {
      const res = await getSpeechToken();
      if (!res.success || !res.token || !res.region) {
        console.warn("VoiceService: Credentials invalid. Using static voice fallback cache.");
        this.cache = STATIC_AZURE_VOICES;
        return this.cache;
      }

      const speechConfig = sdk.SpeechConfig.fromAuthorizationToken(res.token, res.region);
      const synthesizer = new sdk.SpeechSynthesizer(speechConfig, null as any);

      const voicesResult = await new Promise<sdk.SynthesisVoicesResult>((resolve, reject) => {
        synthesizer.getVoicesAsync(
          (result) => resolve(result),
          (error) => reject(new Error(error))
        );
      });

      if (voicesResult && voicesResult.voices) {
        this.cache = voicesResult.voices.map((v) => ({
          name: v.shortName,
          displayName: v.localName,
          locale: v.locale,
          gender: (v.gender === 1 ? "Female" : v.gender === 2 ? "Male" : "Neutral") as any,
          status: "GA",
          voiceType: "Neural",
          sampleRateHertz: "24000",
          provider: "azure",
        }));
      } else {
        this.cache = STATIC_AZURE_VOICES;
      }

      synthesizer.close();
    } catch (err) {
      console.warn("VoiceService.loadVoices failed, falling back to static cache:", err);
      this.cache = STATIC_AZURE_VOICES;
    }

    return this.cache;
  }

  async filterVoices(params: {
    search?: string;
    language?: string;
    gender?: string;
    provider?: string;
  }): Promise<AzureVoiceInfo[]> {
    const list = await this.loadVoices();
    return list.filter((v) => {
      if (params.provider && params.provider !== "all" && v.provider !== params.provider) {
        return false;
      }
      if (params.gender && params.gender !== "all" && v.gender.toLowerCase() !== params.gender.toLowerCase()) {
        return false;
      }
      if (params.language && params.language !== "all" && v.locale !== params.language && !v.locale.startsWith(params.language)) {
        return false;
      }
      if (params.search) {
        const query = params.search.toLowerCase();
        const nameMatch = v.name.toLowerCase().includes(query);
        const dispMatch = v.displayName.toLowerCase().includes(query);
        const localeMatch = v.locale.toLowerCase().includes(query);
        if (!nameMatch && !dispMatch && !localeMatch) return false;
      }
      return true;
    });
  }

  groupVoicesByLanguage(voices: AzureVoiceInfo[]): Record<string, AzureVoiceInfo[]> {
    const groups: Record<string, AzureVoiceInfo[]> = {};
    voices.forEach((v) => {
      if (!groups[v.locale]) {
        groups[v.locale] = [];
      }
      groups[v.locale].push(v);
    });
    return groups;
  }
}
