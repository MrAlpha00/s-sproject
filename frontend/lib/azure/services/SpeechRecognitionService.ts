import * as sdk from "microsoft-cognitiveservices-speech-sdk";

export type SpeechState = "Idle" | "Connecting" | "Listening" | "Processing" | "Error";

export interface SpeechResult {
  text: string;
  isFinal: boolean;
  confidence?: number;
}

export interface RecoveryEvent {
  type: "tab-focus" | "network-recovery" | "audio-context-resume" | "mic-restart" | "recognizer-restart";
  timestamp: number;
  success: boolean;
}

export class SpeechRecognitionService {
  private recognizer: sdk.SpeechRecognizer | null = null;
  private fallbackRecognizer: any = null;
  private token: string;
  private region: string;
  private language: string;
  private deviceId: string | null = null;

  // Callbacks
  private onStateChange: (state: SpeechState) => void = () => {};
  private onResult: (result: SpeechResult) => void = () => {};
  private onError: (error: string) => void = () => {};
  private onRecovery: (event: RecoveryEvent) => void = () => {};

  // Reconnection options
  private isIntentionalStop = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10; // Increased for long events

  // Tab/focus recovery
  private visibilityHandler: (() => void) | null = null;
  private focusHandler: (() => void) | null = null;
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private mediaStreamMonitorInterval: ReturnType<typeof setInterval> | null = null;

  constructor(token: string, region: string, language = "en-US", deviceId: string | null = null) {
    this.token = token;
    this.region = region;
    this.language = language;
    this.deviceId = deviceId;
  }

  registerCallbacks(callbacks: {
    onStateChange?: (state: SpeechState) => void;
    onResult?: (result: SpeechResult) => void;
    onError?: (error: string) => void;
    onRecovery?: (event: RecoveryEvent) => void;
  }) {
    if (callbacks.onStateChange) this.onStateChange = callbacks.onStateChange;
    if (callbacks.onResult) this.onResult = callbacks.onResult;
    if (callbacks.onError) this.onError = callbacks.onError;
    if (callbacks.onRecovery) this.onRecovery = callbacks.onRecovery;
  }

  async start(): Promise<void> {
    this.isIntentionalStop = false;
    this.onStateChange("Connecting");

    // Check for mock token or fallback requirement
    if (this.token === "mock-dev-token" && typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      this.startWebSpeechFallback();
      this.setupTabRecovery();
      return;
    }

    try {
      const speechConfig = sdk.SpeechConfig.fromAuthorizationToken(this.token, this.region);
      speechConfig.speechRecognitionLanguage = this.language;

      // Select audio input source
      let audioConfig: sdk.AudioConfig;
      if (this.deviceId && this.deviceId !== "default" && !this.deviceId.startsWith("mock-")) {
        audioConfig = sdk.AudioConfig.fromMicrophoneInput(this.deviceId);
      } else {
        audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();
      }

      this.recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

      // Connect Event Handlers
      this.recognizer.recognizing = (s, e) => {
        if (e.result.text) {
          this.onStateChange("Listening");
          this.onResult({
            text: e.result.text,
            isFinal: false,
          });
        }
      };

      this.recognizer.recognized = (s, e) => {
        if (e.result.reason === sdk.ResultReason.RecognizedSpeech && e.result.text) {
          this.onStateChange("Processing");
          
          // Try to extract confidence score
          let confidence = 0.95; // fallback
          try {
            const jsonStr = e.result.properties.getProperty(sdk.PropertyId.SpeechServiceResponse_JsonResult);
            if (jsonStr) {
              const parsed = JSON.parse(jsonStr);
              if (parsed.NBest && parsed.NBest[0]) {
                confidence = parsed.NBest[0].Confidence;
              }
            }
          } catch (err) {
            console.warn("Failed to parse confidence score:", err);
          }

          this.onResult({
            text: e.result.text,
            isFinal: true,
            confidence: Math.round(confidence * 100),
          });
          
          this.onStateChange("Listening");
        }
      };

      this.recognizer.canceled = (s, e) => {
        console.warn("Speech Recognition Canceled:", e.errorDetails);
        if (e.reason === sdk.CancellationReason.Error) {
          this.onError(e.errorDetails || "Azure Speech Recognition cancellation error.");
          this.onStateChange("Error");
          this.handleReconnection();
        }
      };

      this.recognizer.sessionStopped = (s, e) => {
        console.log("Azure Speech Session Stopped.");
        if (!this.isIntentionalStop) {
          this.handleReconnection();
        } else {
          this.onStateChange("Idle");
        }
      };

      // Start continuous recognition
      await new Promise<void>((resolve, reject) => {
        this.recognizer!.startContinuousRecognitionAsync(
          () => {
            this.onStateChange("Listening");
            this.setupTabRecovery();
            this.startMediaStreamMonitor();
            resolve();
          },
          (err) => {
            this.onStateChange("Error");
            this.onError(err.toString());
            reject(err);
          }
        );
      });
      } catch (err: any) {
        if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
          this.startWebSpeechFallback();
          this.setupTabRecovery();
          return;
        }
        this.onStateChange("Error");
        this.onError(err.message || "Failed to initialize Azure Speech SDK.");
        throw err;
      }
    }

  private startWebSpeechFallback() {
    try {
      const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SpeechRec();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = this.language;

      rec.onstart = () => {
        this.onStateChange("Listening");
      };

      rec.onresult = (event: any) => {
        let interim = "";
        let final = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        if (interim) {
          this.onResult({ text: interim, isFinal: false });
        }
        if (final) {
          this.onResult({ text: final, isFinal: true, confidence: 95 });
        }
      };

      rec.onerror = (err: any) => {
        console.warn("Web Speech API Fallback error:", err);
        if (err.error !== "no-speech") {
          this.onError(err.error || "Web Speech error");
        }
      };

      rec.onend = () => {
        if (!this.isIntentionalStop) {
          try { rec.start(); } catch (e) {}
        } else {
          this.onStateChange("Idle");
        }
      };

      rec.start();
      this.fallbackRecognizer = rec;
    } catch (e: any) {
      this.onStateChange("Error");
      this.onError(e.message || "Failed to start speech recognition.");
    }
  }

  async stop(): Promise<void> {
    this.isIntentionalStop = true;
    this.cleanupTabRecovery();
    this.stopMediaStreamMonitor();

    if (this.fallbackRecognizer) {
      try {
        this.fallbackRecognizer.stop();
      } catch (e) {}
      this.fallbackRecognizer = null;
      this.onStateChange("Idle");
    }
    if (!this.recognizer) {
      this.onStateChange("Idle");
      return;
    }

    return new Promise<void>((resolve) => {
      this.recognizer!.stopContinuousRecognitionAsync(
        () => {
          this.recognizer!.close();
          this.recognizer = null;
          this.onStateChange("Idle");
          resolve();
        },
        (err) => {
          console.error("Failed to stop recognition cleanly:", err);
          this.recognizer = null;
          this.onStateChange("Idle");
          resolve();
        }
      );
    });
  }

  // ===== TAB/FOCUS RECOVERY =====

  private setupTabRecovery() {
    if (typeof window === "undefined") return;

    // Visibility change handler - when user switches tabs
    this.visibilityHandler = () => {
      if (document.visibilityState === "visible" && !this.isIntentionalStop) {
        this.handleTabFocus();
      }
    };
    document.addEventListener("visibilitychange", this.visibilityHandler);

    // Window focus handler - when user returns to window
    this.focusHandler = () => {
      if (!this.isIntentionalStop) {
        this.handleTabFocus();
      }
    };
    window.addEventListener("focus", this.focusHandler);
  }

  private cleanupTabRecovery() {
    if (this.visibilityHandler) {
      document.removeEventListener("visibilitychange", this.visibilityHandler);
      this.visibilityHandler = null;
    }
    if (this.focusHandler) {
      window.removeEventListener("focus", this.focusHandler);
      this.focusHandler = null;
    }
  }

  private async handleTabFocus() {
    console.log("Tab focus detected - checking recovery state...");

    // 1. Resume AudioContext if suspended
    await this.resumeAudioContext();

    // 2. Check if recognizer is still alive
    const needsRestart = await this.checkRecognizerHealth();
    if (needsRestart) {
      console.log("Recognizer unhealthy after tab focus - restarting...");
      this.onRecovery({ type: "tab-focus", timestamp: Date.now(), success: false });
      await this.restartRecognizer();
    } else {
      this.onRecovery({ type: "tab-focus", timestamp: Date.now(), success: true });
    }
  }

  private async resumeAudioContext() {
    if (typeof window === "undefined") return;

    try {
      // Try to get existing AudioContext or create a temporary one to test
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;

      // Check if there's a suspended context anywhere in the page
      // AudioContext state is managed by the browser - we need to resume any suspended context
      const ctx = new AudioCtxClass();
      if (ctx.state === "suspended") {
        await ctx.resume();
        this.onRecovery({ type: "audio-context-resume", timestamp: Date.now(), success: true });
        console.log("AudioContext resumed successfully");
      }
      // Close the test context - the actual one is managed by components
      if (ctx.state !== "closed") {
        await ctx.close();
      }
    } catch (err) {
      console.warn("Failed to resume AudioContext:", err);
      this.onRecovery({ type: "audio-context-resume", timestamp: Date.now(), success: false });
    }
  }

  private async checkRecognizerHealth(): Promise<boolean> {
    // Returns true if recognizer needs restart

    // Azure SDK recognizer
    if (this.recognizer) {
      try {
        // Try to get properties - if this throws, recognizer is dead
        this.recognizer.properties;
        return false; // healthy
      } catch {
        return true; // unhealthy
      }
    }

    // Web Speech fallback
    if (this.fallbackRecognizer) {
      try {
        // Check if the recognition is still running
        if (this.fallbackRecognizer.recognition) {
          return this.fallbackRecognizer.recognition.state !== "running";
        }
        return false;
      } catch {
        return true;
      }
    }

    // No recognizer at all - needs restart
    return true;
  }

  private async restartRecognizer() {
    console.log("Restarting speech recognizer...");
    this.reconnectAttempts = 0; // Reset for fresh start

    try {
      // Clean up old recognizer
      if (this.recognizer) {
        try {
          this.recognizer.close();
        } catch {}
        this.recognizer = null;
      }
      if (this.fallbackRecognizer) {
        try {
          this.fallbackRecognizer.stop();
        } catch {}
        this.fallbackRecognizer = null;
      }

      // Re-acquire microphone
      await this.reacquireMicrophone();

      // Start fresh
      await this.start();
      this.onRecovery({ type: "recognizer-restart", timestamp: Date.now(), success: true });
      console.log("Speech recognizer restarted successfully");
    } catch (err) {
      console.error("Failed to restart recognizer:", err);
      this.onRecovery({ type: "recognizer-restart", timestamp: Date.now(), success: false });
      this.onStateChange("Error");
      this.onError("Failed to restart recognition after tab switch");
    }
  }

  private async reacquireMicrophone() {
    if (typeof window === "undefined" || !navigator.mediaDevices) return;

    try {
      // Stop old stream tracks
      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach((track) => track.stop());
        this.mediaStream = null;
      }

      // Acquire fresh mic
      const constraints: MediaStreamConstraints = {
        audio: this.deviceId && this.deviceId !== "default"
          ? { deviceId: { exact: this.deviceId } }
          : true,
      };
      this.mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      this.onRecovery({ type: "mic-restart", timestamp: Date.now(), success: true });
      console.log("Microphone reacquired successfully");
    } catch (err) {
      console.warn("Failed to reacquire microphone:", err);
      this.onRecovery({ type: "mic-restart", timestamp: Date.now(), success: false });
    }
  }

  // ===== MEDIA STREAM MONITORING =====

  private startMediaStreamMonitor() {
    if (typeof window === "undefined") return;

    // Monitor media stream tracks for ended state
    this.mediaStreamMonitorInterval = setInterval(() => {
      if (this.isIntentionalStop) return;

      // Check if media stream tracks have ended
      if (this.mediaStream) {
        const tracks = this.mediaStream.getTracks();
        const hasEndedTrack = tracks.some((track) => track.readyState === "ended");
        if (hasEndedTrack) {
          console.warn("Media stream track ended - triggering recovery");
          this.handleReconnection();
        }
      }
    }, 2000); // Check every 2 seconds
  }

  private stopMediaStreamMonitor() {
    if (this.mediaStreamMonitorInterval) {
      clearInterval(this.mediaStreamMonitorInterval);
      this.mediaStreamMonitorInterval = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
  }

  // ===== RECONNECTION =====

  private handleReconnection() {
    if (this.isIntentionalStop || this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.onStateChange("Idle");
      return;
    }

    this.reconnectAttempts++;
    this.onStateChange("Connecting");
    console.log(`Attempting Speech SDK Reconnection (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

    setTimeout(async () => {
      try {
        await this.start();
        this.reconnectAttempts = 0; // reset
      } catch (err) {
        console.error("Reconnection attempt failed:", err);
      }
    }, 2000 * this.reconnectAttempts); // backoff delay
  }

  // ===== PUBLIC RECOVERY METHODS =====

  async recoverAfterTabSwitch(): Promise<boolean> {
    if (this.isIntentionalStop) return false;

    console.log("Manual tab switch recovery triggered");
    
    // 1. Resume AudioContext
    await this.resumeAudioContext();

    // 2. Check recognizer health
    const needsRestart = await this.checkRecognizerHealth();
    if (needsRestart) {
      await this.restartRecognizer();
      return true;
    }

    // 3. Try to restart recognition if it was paused
    try {
      if (this.recognizer) {
        await new Promise<void>((resolve, reject) => {
          this.recognizer!.startContinuousRecognitionAsync(
            () => {
              this.onStateChange("Listening");
              resolve();
            },
            (err) => reject(err)
          );
        });
      }
    } catch {
      await this.restartRecognizer();
      return true;
    }

    return true;
  }

  getState(): SpeechState {
    if (this.isIntentionalStop) return "Idle";
    if (this.recognizer || this.fallbackRecognizer) return "Listening";
    return "Idle";
  }

  isRunning(): boolean {
    return !this.isIntentionalStop && (this.recognizer !== null || this.fallbackRecognizer !== null);
  }
}
