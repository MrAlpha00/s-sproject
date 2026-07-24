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
type AudioCompleteCallback = (msg: SpeechMessage) => void;

export class SynthesisQueue {
  private service: SpeechSynthesisService;
  private queue: SpeechMessage[] = [];
  private isPlaying = false;
  private currentMessage: SpeechMessage | null = null;
  private deviceId: string | null = null;

  private totalLatency = 0;
  private spokenCount = 0;

  private onMessageUpdate: MessageUpdateCallback = () => {};
  private onQueueChange: QueueChangeCallback = () => {};
  private onMetricsUpdate: MetricsCallback = () => {};
  private onAudioComplete: AudioCompleteCallback = () => {};

  constructor(service: SpeechSynthesisService) {
    this.service = service;
    console.log("[SynthesisQueue] Constructed");
  }

  setDeviceId(id: string | null) {
    this.deviceId = id;
    console.log(`[SynthesisQueue] Device set: ${id || "default"}`);
  }

  registerCallbacks(callbacks: {
    onMessageUpdate?: MessageUpdateCallback;
    onQueueChange?: QueueChangeCallback;
    onMetricsUpdate?: MetricsCallback;
    onAudioComplete?: AudioCompleteCallback;
  }) {
    if (callbacks.onMessageUpdate) this.onMessageUpdate = callbacks.onMessageUpdate;
    if (callbacks.onQueueChange) this.onQueueChange = callbacks.onQueueChange;
    if (callbacks.onMetricsUpdate) this.onMetricsUpdate = callbacks.onMetricsUpdate;
    if (callbacks.onAudioComplete) this.onAudioComplete = callbacks.onAudioComplete;
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

    console.log(`[SynthesisQueue] Enqueue: id=${id} lang=${lang} voice=${voice} text="${text.substring(0, 60)}" queueSize=${this.queue.length}`);
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
    if (this.isPlaying) {
      console.log("[SynthesisQueue] processQueue: already playing, deferring");
      return;
    }

    if (!this.service) {
      console.error("[SynthesisQueue] processQueue: service is null, aborting");
      return;
    }

    this.isPlaying = true;
    const pendingCount = this.queue.filter((m) => m.status === "Pending").length;
    console.log(`[SynthesisQueue] processQueue started: pendingItems=${pendingCount}`);

    while (this.queue.some((m) => m.status === "Pending")) {
      const msg = this.queue.find((m) => m.status === "Pending");
      if (!msg) break;

      this.currentMessage = msg;
      msg.status = "Synthesizing";
      this.safeNotifyMessageUpdate(msg);

      console.log(`[SynthesisQueue] Processing: id=${msg.id} text="${msg.text.substring(0, 40)}" lang=${msg.language} voice=${msg.voice}`);

      try {
        const result = await this.service.speak(
          msg.text,
          msg.voice,
          msg.language,
          this.deviceId,
          () => {
            msg.status = "Playing";
            console.log(`[SynthesisQueue] onStart fired: id=${msg.id} → status=Playing`);
            this.safeNotifyMessageUpdate(msg);
          },
          () => {
            console.log(`[SynthesisQueue] onEnd fired: id=${msg.id}`);
            this.safeNotifyMessageUpdate(msg);
          }
        );

        msg.latency = result.latency;
        msg.duration = result.duration;
        msg.audioData = result.audioData;
        msg.status = "Completed";

        this.totalLatency += result.latency;
        this.spokenCount++;

        console.log(`[SynthesisQueue] Completed: id=${msg.id} latency=${result.latency}ms duration=${result.duration}ms hasAudioData=${!!result.audioData} audioBytes=${result.audioData?.length || 0}`);

        if (result.audioData) {
          this.safeNotifyAudioComplete(msg);
        } else {
          console.warn(`[SynthesisQueue] No audioData for msg ${msg.id} — broadcast will be skipped (likely Web Speech fallback)`);
        }
      } catch (err) {
        console.error(`[SynthesisQueue] Synthesis FAILED for item ${msg.id}:`, err);
        msg.status = "Failed";
      }

      this.safeNotifyMessageUpdate(msg);
      this.queue = this.queue.filter((m) => m.id !== msg.id);
      this.safeNotifyQueueChange();
      this.safeNotifyMetrics();
    }

    this.isPlaying = false;
    this.currentMessage = null;
    console.log("[SynthesisQueue] processQueue finished");
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

  private safeNotifyAudioComplete(msg: SpeechMessage) {
    try { this.onAudioComplete(msg); } catch (err) {
      console.warn("SynthesisQueue: onAudioComplete callback error:", err);
    }
  }
}
