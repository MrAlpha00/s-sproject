import { SpeechMessage } from "../../types/speech";
import { SpeechSynthesisService } from "../azure/services/SpeechSynthesisService";

type MessageUpdateCallback = (msg: SpeechMessage) => void;
type QueueChangeCallback = (queue: SpeechMessage[]) => void;
type MetricsCallback = (metrics: {
  spokenCount: number;
  averageSynthesisLatency: number;
  queueSize: number;
  activeVoice: string;
}) => void;

export class SynthesisQueue {
  private service: SpeechSynthesisService;
  private queue: SpeechMessage[] = [];
  private isPlaying = false;
  private currentMessage: SpeechMessage | null = null;
  private deviceId: string | null = null;

  // Metrics
  private totalLatency = 0;
  private spokenCount = 0;

  // Callbacks
  private onMessageUpdate: MessageUpdateCallback = () => {};
  private onQueueChange: QueueChangeCallback = () => {};
  private onMetricsUpdate: MetricsCallback = () => {};

  constructor(service: SpeechSynthesisService) {
    this.service = service;
  }

  setDeviceId(id: string | null) {
    this.deviceId = id;
  }

  registerCallbacks(callbacks: {
    onMessageUpdate?: MessageUpdateCallback;
    onQueueChange?: QueueChangeCallback;
    onMetricsUpdate?: MetricsCallback;
  }) {
    if (callbacks.onMessageUpdate) this.onMessageUpdate = callbacks.onMessageUpdate;
    if (callbacks.onQueueChange) this.onQueueChange = callbacks.onQueueChange;
    if (callbacks.onMetricsUpdate) this.onMetricsUpdate = callbacks.onMetricsUpdate;
  }

  getQueue(): SpeechMessage[] {
    return [...this.queue];
  }

  enqueue(text: string, lang: string, voice: string) {
    const id = `sp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const message: SpeechMessage = {
      id,
      text,
      language: lang,
      voice,
      provider: "Azure Speech Synthesis",
      latency: 0,
      duration: 0,
      status: "Pending",
      timestamp: new Date().toISOString(),
    };

    this.queue.push(message);
    this.notifyQueueChange();
    this.notifyMessageUpdate(message);

    this.processQueue();
  }

  pause() {
    this.service.pause();
    if (this.currentMessage) {
      this.currentMessage.status = "Paused";
      this.notifyMessageUpdate(this.currentMessage);
    }
  }

  resume() {
    this.service.resume();
    if (this.currentMessage) {
      this.currentMessage.status = "Playing";
      this.notifyMessageUpdate(this.currentMessage);
    }
  }

  stopAll() {
    this.service.stop();
    this.queue = [];
    this.isPlaying = false;
    if (this.currentMessage) {
      this.currentMessage.status = "Completed";
      this.notifyMessageUpdate(this.currentMessage);
      this.currentMessage = null;
    }
    this.notifyQueueChange();
    this.notifyMetrics();
  }

  clearQueue() {
    this.queue = this.queue.filter((m) => m.status === "Playing" || m.status === "Synthesizing");
    this.notifyQueueChange();
    this.notifyMetrics();
  }

  cancelItem(id: string) {
    this.queue = this.queue.filter((m) => m.id !== id);
    this.notifyQueueChange();
    this.notifyMetrics();
  }

  private async processQueue() {
    if (this.isPlaying) return;
    this.isPlaying = true;

    while (this.queue.some((m) => m.status === "Pending")) {
      const msg = this.queue.find((m) => m.status === "Pending");
      if (!msg) break;

      this.currentMessage = msg;
      msg.status = "Synthesizing";
      this.safeNotifyMessageUpdate(msg);

      try {
        const result = await this.service.speak(
          msg.text,
          msg.voice,
          msg.language,
          this.deviceId,
          () => {
            msg.status = "Playing";
            this.safeNotifyMessageUpdate(msg);
          },
          () => {
            // Player finished — do NOT set Completed here, audioData may not be set yet.
            // Final status is set after the speak() promise resolves.
            this.safeNotifyMessageUpdate(msg);
          }
        );

        msg.latency = result.latency;
        msg.duration = result.duration;
        msg.audioData = result.audioData;
        msg.status = "Completed";

        this.totalLatency += result.latency;
        this.spokenCount++;
      } catch (err) {
        console.error("Speech Synthesis failed for item:", msg.id, err);
        msg.status = "Failed";
      }

      this.safeNotifyMessageUpdate(msg);
      this.queue = this.queue.filter((m) => m.id !== msg.id);
      this.safeNotifyQueueChange();
      this.safeNotifyMetrics();
    }

    this.isPlaying = false;
    this.currentMessage = null;
    this.safeNotifyMetrics();
  }

  private notifyMessageUpdate(msg: SpeechMessage) {
    this.onMessageUpdate(msg);
  }

  private notifyQueueChange() {
    this.onQueueChange([...this.queue]);
  }

  private notifyMetrics() {
    this.onMetricsUpdate({
      spokenCount: this.spokenCount,
      averageSynthesisLatency: this.spokenCount > 0 ? Math.round(this.totalLatency / this.spokenCount) : 0,
      queueSize: this.queue.filter((m) => m.status === "Pending").length,
      activeVoice: this.currentMessage ? this.currentMessage.voice : "--",
    });
  }

  private safeNotifyMessageUpdate(msg: SpeechMessage) {
    try { this.notifyMessageUpdate(msg); } catch (err) {
      console.warn("SynthesisQueue: onMessageUpdate callback error:", err);
    }
  }

  private safeNotifyQueueChange() {
    try { this.notifyQueueChange(); } catch (err) {
      console.warn("SynthesisQueue: onQueueChange callback error:", err);
    }
  }

  private safeNotifyMetrics() {
    try { this.notifyMetrics(); } catch (err) {
      console.warn("SynthesisQueue: onMetricsUpdate callback error:", err);
    }
  }
}
