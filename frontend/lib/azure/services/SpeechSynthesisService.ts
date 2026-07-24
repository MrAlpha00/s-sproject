import * as sdk from "microsoft-cognitiveservices-speech-sdk";

export class SpeechSynthesisService {
  private token: string;
  private region: string;
  private synthesizer: sdk.SpeechSynthesizer | null = null;
  private player: sdk.SpeakerAudioDestination | null = null;
  private tokenFetcher: (() => Promise<{ token: string; region: string } | null>) | null = null;
  private lastTokenTime = 0;
  private readonly TOKEN_TTL_MS = 8 * 60 * 1000;

  constructor(token: string, region: string) {
    this.token = token;
    this.region = region;
    this.lastTokenTime = Date.now();
    console.log(`[TTS] Service created: token=${token === "mock-dev-token" ? "mock-dev-token" : `valid(${token.substring(0, 8)}...)`} region=${region}`);
  }

  setTokenFetcher(fetcher: () => Promise<{ token: string; region: string } | null>) {
    this.tokenFetcher = fetcher;
  }

  private async refreshIfNeeded(): Promise<boolean> {
    if (!this.tokenFetcher) return false;
    const elapsed = Date.now() - this.lastTokenTime;
    if (elapsed < this.TOKEN_TTL_MS) return false;
    console.log(`[TTS] Token TTL exceeded (${Math.round(elapsed / 1000)}s), refreshing...`);
    try {
      const result = await this.tokenFetcher();
      if (result && result.token) {
        this.token = result.token;
        this.region = result.region;
        this.lastTokenTime = Date.now();
        console.log(`[TTS] Token refreshed successfully: ${result.token.substring(0, 8)}...`);
        return true;
      }
    } catch (err) {
      console.warn("[TTS] Token refresh failed:", err);
    }
    return false;
  }

  async preloadVoices(): Promise<sdk.VoiceInfo[]> {
    try {
      const speechConfig = sdk.SpeechConfig.fromAuthorizationToken(this.token, this.region);
      const synth = new sdk.SpeechSynthesizer(speechConfig, null as any);
      const result = await synth.getVoicesAsync();
      synth.close();
      return result.voices || [];
    } catch (err) {
      console.warn("Failed to preload Azure TTS voices dynamically:", err);
      return [];
    }
  }

  async speak(
    text: string,
    voiceName: string,
    language: string,
    deviceId: string | null = null,
    onStart?: () => void,
    onEnd?: () => void
  ): Promise<{ latency: number; duration: number; audioData?: string }> {
    const startTime = performance.now();
    console.log(`[TTS-STAGE-1] speak() called: text="${text.substring(0, 60)}" voice=${voiceName} lang=${language} deviceId=${deviceId} tokenValid=${this.token !== "mock-dev-token"}`);

    await this.refreshIfNeeded();

    if (this.token === "mock-dev-token") {
      console.log("[TTS-STAGE-1] Using Web Speech fallback (mock-dev-token) — no audioData for broadcast");
      return this.speakWebSpeechFallback(text, language, onStart, onEnd, startTime);
    }

    this.cleanupSynthesizer();

    try {
      console.log("[TTS-STAGE-2] Creating Azure SpeechConfig + SpeakerAudioDestination");
      const speechConfig = sdk.SpeechConfig.fromAuthorizationToken(this.token, this.region);
      speechConfig.speechSynthesisVoiceName = voiceName;
      speechConfig.speechSynthesisLanguage = language;

      this.player = new sdk.SpeakerAudioDestination();
      if (deviceId && deviceId !== "default" && !deviceId.startsWith("mock-")) {
        try {
          console.log(`[TTS-STAGE-2] Routing to device: ${deviceId}`);
          (this.player as any).setSinkId(deviceId);
        } catch (err) {
          console.warn("[TTS-STAGE-2] setSinkId failed, using default output:", err);
        }
      }

      if (onStart) {
        this.player.onAudioStart = () => {
          console.log("[TTS-STAGE-3] onAudioStart fired — speaker output beginning");
          onStart();
        };
      }

      if (onEnd) {
        this.player.onAudioEnd = () => {
          console.log("[TTS-STAGE-5] onAudioEnd fired — speaker output finished");
          onEnd();
        };
      }

      const audioConfig = sdk.AudioConfig.fromSpeakerOutput(this.player);
      this.synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);
      console.log("[TTS-STAGE-2] SpeechSynthesizer created, calling speakTextAsync");

      const result = await new Promise<{ latency: number; duration: number; audioData?: string }>((resolve, reject) => {
        this.synthesizer!.speakTextAsync(
          text,
          (result) => {
            const latency = Math.round(performance.now() - startTime);
            const duration = result.audioDuration ? Math.round(result.audioDuration / 10000) : 0;

            if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
              let audioData: string | undefined = undefined;
              if (result.audioData) {
                const uint8 = new Uint8Array(result.audioData);
                console.log(`[TTS-STAGE-4] Synthesis completed: rawBytes=${uint8.byteLength} reason=${result.reason}`);
                let binary = "";
                const len = uint8.byteLength;
                for (let i = 0; i < len; i++) {
                  binary += String.fromCharCode(uint8[i]);
                }
                audioData = btoa(binary);
                console.log(`[TTS-STAGE-4] Audio base64 encoded: base64Length=${audioData.length}`);
              } else {
                console.warn("[TTS-STAGE-4] Synthesis completed but result.audioData is null/undefined");
              }
              resolve({ latency, duration, audioData });
            } else {
              console.warn(`[TTS-STAGE-4] Synthesis non-success reason=${result.reason}, falling back to Web Speech`);
              this.speakWebSpeechFallback(text, language, onStart, onEnd, startTime).then(resolve).catch(reject);
            }

            this.cleanupSynthesizer();
          },
          (err) => {
            console.error("[TTS-STAGE-4] speakTextAsync error:", err);
            this.cleanupSynthesizer();
            this.speakWebSpeechFallback(text, language, onStart, onEnd, startTime).then(resolve).catch(reject);
          }
        );
      });

      console.log(`[TTS-STAGE-6] speak() returning: latency=${result.latency}ms audioBytes=${result.audioData?.length || 0}`);
      return result;
    } catch (err) {
      console.error("[TTS] Azure TTS setup error:", err);
      return this.speakWebSpeechFallback(text, language, onStart, onEnd, startTime);
    }
  }

  private speakWebSpeechFallback(
    text: string,
    language: string,
    onStart?: () => void,
    onEnd?: () => void,
    startTime = performance.now()
  ): Promise<{ latency: number; duration: number; audioData?: string }> {
    console.log(`[TTS-FALLBACK] Web Speech: text="${text.substring(0, 40)}" lang=${language} — NOTE: no audioData available for broadcast`);
    return new Promise((resolve) => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language;
        if (onStart) utterance.onstart = () => {
          console.log("[TTS-FALLBACK] Web Speech onstart");
          onStart();
        };

        utterance.onend = () => {
          console.log("[TTS-FALLBACK] Web Speech onend");
          if (onEnd) onEnd();
          const latency = Math.round(performance.now() - startTime);
          resolve({ latency, duration: Math.max(1000, text.length * 60) });
        };

        utterance.onerror = (e) => {
          console.error("[TTS-FALLBACK] Web Speech onerror:", e);
          if (onEnd) onEnd();
          const latency = Math.round(performance.now() - startTime);
          resolve({ latency, duration: Math.max(1000, text.length * 60) });
        };

        console.log("[TTS-FALLBACK] Web Speech speak() called");
        window.speechSynthesis.speak(utterance);
      } else {
        console.warn("[TTS-FALLBACK] No window.speechSynthesis available, simulating");
        if (onStart) onStart();
        setTimeout(() => {
          if (onEnd) onEnd();
          const latency = Math.round(performance.now() - startTime);
          resolve({ latency, duration: Math.max(1000, text.length * 60) });
        }, 800);
      }
    });
  }

  pause() {
    if (this.player) {
      this.player.pause();
    }
  }

  resume() {
    if (this.player) {
      this.player.resume();
    }
  }

  stop() {
    if (this.player) {
      try {
        this.player.close();
      } catch (err) {
        console.warn("Error closing speaker destination:", err);
      }
      this.player = null;
    }
    this.cleanupSynthesizer();
  }

  private cleanupSynthesizer() {
    if (this.synthesizer) {
      try {
        console.log("[TTS] cleanupSynthesizer: closing synthesizer");
        this.synthesizer.close();
      } catch (err) {
        console.warn("[TTS] Error closing synthesizer:", err);
      }
      this.synthesizer = null;
    }
  }

  async healthCheck(): Promise<{ success: boolean; message: string }> {
    try {
      const speechConfig = sdk.SpeechConfig.fromAuthorizationToken(this.token, this.region);
      const synth = new sdk.SpeechSynthesizer(speechConfig, null as any);
      const result = await synth.speakTextAsync("ping", () => {}, () => {});
      synth.close();
      return {
        success: true,
        message: "Azure Speech Synthesis verified successfully.",
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || "Failed to contact Azure TTS service.",
      };
    }
  }
}
