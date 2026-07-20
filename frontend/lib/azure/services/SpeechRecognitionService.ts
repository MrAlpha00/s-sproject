import * as sdk from "microsoft-cognitiveservices-speech-sdk";

export type SpeechState = "Idle" | "Connecting" | "Listening" | "Processing" | "Error";

export interface SpeechResult {
  text: string;
  isFinal: boolean;
  confidence?: number;
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

  // Reconnection options
  private isIntentionalStop = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;

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
  }) {
    if (callbacks.onStateChange) this.onStateChange = callbacks.onStateChange;
    if (callbacks.onResult) this.onResult = callbacks.onResult;
    if (callbacks.onError) this.onError = callbacks.onError;
  }

  async start(): Promise<void> {
    this.isIntentionalStop = false;
    this.onStateChange("Connecting");

    // Check for mock token or fallback requirement
    if (this.token === "mock-dev-token" && typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      this.startWebSpeechFallback();
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
}
