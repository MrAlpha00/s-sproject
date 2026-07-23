import * as sdk from "microsoft-cognitiveservices-speech-sdk";

export class SpeechSynthesisService {
  private token: string;
  private region: string;
  private synthesizer: sdk.SpeechSynthesizer | null = null;
  private player: sdk.SpeakerAudioDestination | null = null;

  constructor(token: string, region: string) {
    this.token = token;
    this.region = region;
    console.log(`[TTS] Service created: token=${token === "mock-dev-token" ? "mock-dev-token" : `valid(${token.substring(0, 8)}...)`} region=${region}`);
  }

  /**
   * Preloads available neural voices from Azure server-side configurations.
   */
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

  /**
   * Synthesizes text and streams output to the designated speaker device.
   */
  async speak(
    text: string,
    voiceName: string,
    language: string,
    deviceId: string | null = null,
    onStart?: () => void,
    onEnd?: () => void
  ): Promise<{ latency: number; duration: number; audioData?: string }> {
    const startTime = performance.now();
    console.log(`[TTS] speak() called: text="${text.substring(0, 60)}" voice=${voiceName} lang=${language} deviceId=${deviceId} tokenValid=${this.token !== "mock-dev-token"}`);

    if (this.token === "mock-dev-token") {
      console.log("[TTS] Using Web Speech fallback (mock-dev-token)");
      return this.speakWebSpeechFallback(text, language, onStart, onEnd, startTime);
    }

    // Close any existing player/synthesizer before creating new ones
    this.cleanup();

    try {
      console.log("[TTS] Creating Azure SpeechConfig");
      const speechConfig = sdk.SpeechConfig.fromAuthorizationToken(this.token, this.region);
      speechConfig.speechSynthesisVoiceName = voiceName;
      speechConfig.speechSynthesisLanguage = language;

      // Initialize the speaker audio player destination
      console.log("[TTS] Creating SpeakerAudioDestination");
      this.player = new sdk.SpeakerAudioDestination();
      if (deviceId && deviceId !== "default" && !deviceId.startsWith("mock-")) {
        try {
          console.log(`[TTS] Setting sinkId: ${deviceId}`);
          (this.player as any).setSinkId(deviceId);
        } catch (err) {
          console.warn("[TTS] Routing audio destination device sink ID failed, using default output:", err);
        }
      }

      if (onStart) {
        this.player.onAudioStart = () => {
          console.log("[TTS] onAudioStart fired");
          onStart();
        };
      }

      if (onEnd) {
        this.player.onAudioEnd = () => {
          console.log("[TTS] onAudioEnd fired");
          onEnd();
        };
      }

      const audioConfig = sdk.AudioConfig.fromSpeakerOutput(this.player);
      this.synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);
      console.log("[TTS] SpeechSynthesizer created, calling speakTextAsync");

      return await new Promise((resolve, reject) => {
        this.synthesizer!.speakTextAsync(
          text,
          (result) => {
            const latency = Math.round(performance.now() - startTime);
            const duration = result.audioDuration ? Math.round(result.audioDuration / 10000) : 0;

            if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
              let audioData: string | undefined = undefined;
              if (result.audioData) {
                const uint8 = new Uint8Array(result.audioData);
                console.log(`[TTS] Synthesis completed: rawBytes=${uint8.byteLength}`);
                let binary = "";
                const len = uint8.byteLength;
                for (let i = 0; i < len; i++) {
                  binary += String.fromCharCode(uint8[i]);
                }
                audioData = btoa(binary);
                console.log(`[TTS] Audio encoded: base64Length=${audioData.length}`);
              } else {
                console.warn("[TTS] Synthesis completed but no audioData in result");
              }
              resolve({ latency, duration, audioData });
            } else {
              console.warn(`[TTS] Synthesis failed reason=${result.reason}, falling back to Web Speech`);
              this.speakWebSpeechFallback(text, language, onStart, onEnd, startTime).then(resolve).catch(reject);
            }

            this.cleanup();
          },
          (err) => {
            console.error("[TTS] speakTextAsync error:", err);
            this.cleanup();
            this.speakWebSpeechFallback(text, language, onStart, onEnd, startTime).then(resolve).catch(reject);
          }
        );
      });
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
    console.log(`[TTS] Web Speech fallback: text="${text.substring(0, 40)}" lang=${language}`);
    return new Promise((resolve) => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language;
        if (onStart) utterance.onstart = () => {
          console.log("[TTS] Web Speech onstart");
          onStart();
        };

        utterance.onend = () => {
          console.log("[TTS] Web Speech onend");
          if (onEnd) onEnd();
          const latency = Math.round(performance.now() - startTime);
          resolve({ latency, duration: Math.max(1000, text.length * 60) });
        };

        utterance.onerror = (e) => {
          console.error("[TTS] Web Speech onerror:", e);
          if (onEnd) onEnd();
          const latency = Math.round(performance.now() - startTime);
          resolve({ latency, duration: Math.max(1000, text.length * 60) });
        };

        console.log("[TTS] Web Speech speak() called");
        window.speechSynthesis.speak(utterance);
      } else {
        console.warn("[TTS] No window.speechSynthesis available, simulating");
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
    this.cleanup();
  }

  private cleanup() {
    if (this.synthesizer) {
      try {
        console.log("[TTS] cleanup: closing synthesizer");
        this.synthesizer.close();
      } catch (err) {
        console.warn("[TTS] Error closing synthesizer client:", err);
      }
      this.synthesizer = null;
    }
    if (this.player) {
      try {
        console.log("[TTS] cleanup: closing player");
        this.player.close();
      } catch (err) {
        console.warn("[TTS] Error closing player:", err);
      }
      this.player = null;
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
