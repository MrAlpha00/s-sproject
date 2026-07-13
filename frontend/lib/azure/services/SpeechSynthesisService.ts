import * as sdk from "microsoft-cognitiveservices-speech-sdk";

export class SpeechSynthesisService {
  private token: string;
  private region: string;
  private synthesizer: sdk.SpeechSynthesizer | null = null;
  private player: sdk.SpeakerAudioDestination | null = null;

  constructor(token: string, region: string) {
    this.token = token;
    this.region = region;
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

    const speechConfig = sdk.SpeechConfig.fromAuthorizationToken(this.token, this.region);
    speechConfig.speechSynthesisVoiceName = voiceName;
    speechConfig.speechSynthesisLanguage = language;

    // Initialize the speaker audio player destination
    this.player = new sdk.SpeakerAudioDestination();
    if (deviceId && deviceId !== "default" && !deviceId.startsWith("mock-")) {
      try {
        (this.player as any).setSinkId(deviceId);
      } catch (err) {
        console.warn("Routing audio destination device sink ID failed, using default output:", err);
      }
    }

    if (onStart) {
      this.player.onAudioStart = onStart;
    }

    if (onEnd) {
      this.player.onAudioEnd = onEnd;
    }

    const audioConfig = sdk.AudioConfig.fromSpeakerOutput(this.player);
    this.synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

    return new Promise((resolve, reject) => {
      this.synthesizer!.speakTextAsync(
        text,
        (result) => {
          const latency = Math.round(performance.now() - startTime);
          // Convert audio duration ticks (100ns) to milliseconds
          const duration = result.audioDuration ? Math.round(result.audioDuration / 10000) : 0;

          if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
            let audioData: string | undefined = undefined;
            if (result.audioData) {
              const uint8 = new Uint8Array(result.audioData);
              let binary = "";
              const len = uint8.byteLength;
              for (let i = 0; i < len; i++) {
                binary += String.fromCharCode(uint8[i]);
              }
              audioData = btoa(binary);
            }
            resolve({ latency, duration, audioData });
          } else {
            reject(new Error(`Azure speech synthesis cancelled or failed: ${result.errorDetails}`));
          }

          this.cleanup();
        },
        (err) => {
          this.cleanup();
          reject(err);
        }
      );
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
        this.synthesizer.close();
      } catch (err) {
        console.warn("Error closing synthesizer client:", err);
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
