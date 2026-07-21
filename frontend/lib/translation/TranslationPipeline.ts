import { TranslationMessage, TranslationStatus } from "../../types/translation";
import { TranslationService } from "../azure/services/TranslationService";

type UpdateCallback = (message: TranslationMessage) => void;
type QueueChangeCallback = (queue: TranslationMessage[]) => void;
type MetricsCallback = (metrics: {
  averageTranslationTime: number;
  errorsCount: number;
  messagesProcessed: number;
  translationStatus: "Pending" | "Translating" | "Completed" | "Failed";
}) => void;

export class TranslationPipeline {
  private translationService: TranslationService;
  private queue: TranslationMessage[] = [];
  private isProcessing = false;
  private autoRetryCount = 1;

  // Callbacks
  private onMessageUpdateCallbacks: UpdateCallback[] = [];
  private onQueueChangeCallbacks: QueueChangeCallback[] = [];
  private onMetricsCallbacks: MetricsCallback[] = [];
  private onCompleteCallback: ((msg: TranslationMessage) => void) | null = null;

  // Metrics
  private totalTranslationTime = 0;
  private processedCount = 0;
  private errorsCount = 0;
  private currentStatus: "Pending" | "Translating" | "Completed" | "Failed" = "Pending";

  constructor() {
    this.translationService = new TranslationService();
  }

  registerOnComplete(cb: (msg: TranslationMessage) => void) {
    this.onCompleteCallback = cb;
  }

  registerCallbacks(callbacks: {
    onMessageUpdate?: UpdateCallback;
    onQueueChange?: QueueChangeCallback;
    onMetricsUpdate?: MetricsCallback;
  }) {
    if (callbacks.onMessageUpdate) this.onMessageUpdateCallbacks.push(callbacks.onMessageUpdate);
    if (callbacks.onQueueChange) this.onQueueChangeCallbacks.push(callbacks.onQueueChange);
    if (callbacks.onMetricsUpdate) this.onMetricsCallbacks.push(callbacks.onMetricsUpdate);
  }

  getQueue(): TranslationMessage[] {
    return [...this.queue];
  }

  clearQueue() {
    this.queue = [];
    this.notifyQueueChange();
  }

  getMetrics() {
    return {
      averageTranslationTime: this.processedCount > 0 ? Math.round(this.totalTranslationTime / this.processedCount) : 0,
      errorsCount: this.errorsCount,
      messagesProcessed: this.processedCount,
      translationStatus: this.currentStatus,
    };
  }

  /**
   * Enqueues a new message for translation asynchronously.
   * Recognition is never blocked by this operation.
   */
  enqueue(
    originalText: string,
    sourceLang: string,
    targetLangs: string[],
    confidence = 95,
    recognitionLatency = 150
  ): string {
    const id = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newMessage: TranslationMessage = {
      id,
      originalText,
      translatedText: {},
      sourceLanguage: sourceLang,
      targetLanguage: targetLangs,
      provider: "Azure Translator",
      confidence,
      recognitionLatency,
      translationLatency: 0,
      timestamp: new Date().toISOString(),
      status: "Pending",
    };

    this.queue.push(newMessage);
    this.safeNotifyQueueChange();
    this.safeNotifyMessageUpdate(newMessage);

    // Trigger sequential processing asynchronously
    this.processQueue();

    return id;
  }

  /**
   * Triggers a manual retry on all failed translation messages.
   */
  retryFailed() {
    let changed = false;
    this.queue.forEach((msg) => {
      if (msg.status === "Failed") {
        msg.status = "Pending";
        changed = true;
        this.notifyMessageUpdate(msg);
      }
    });

    if (changed) {
      this.notifyQueueChange();
      this.processQueue();
    }
  }

  private async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;
    this.updateStatus("Translating");

    while (this.queue.some((m) => m.status === "Pending")) {
      const msg = this.queue.find((m) => m.status === "Pending");
      if (!msg) break;

      msg.status = "Translating";
      this.safeNotifyMessageUpdate(msg);

      const startTime = performance.now();
      let success = false;
      let attempts = 0;

      while (attempts <= this.autoRetryCount && !success) {
        attempts++;
        try {
          const result = await this.translationService.translateMultiple(
            msg.originalText,
            msg.sourceLanguage,
            msg.targetLanguage
          );

          if (result.success && result.translations && result.translations.length > 0) {
            result.translations.forEach((t) => {
              msg.translatedText[t.to] = t.text;
            });
            msg.translationLatency = Math.round(performance.now() - startTime);
            msg.status = "Completed";
            success = true;

            this.totalTranslationTime += msg.translationLatency;
            this.processedCount++;
            
            // Invoke completed hook if registered
            if (this.onCompleteCallback) {
              try {
                this.onCompleteCallback(msg);
              } catch (err) {
                console.warn("TranslationPipeline: onCompleteCallback error:", err);
              }
            }
          } else if (result.success && (!result.translations || result.translations.length === 0)) {
            console.warn(`Translation returned empty results for msg ${msg.id}, using empty fallback`);
            msg.targetLanguage.forEach((lang) => {
              msg.translatedText[lang] = msg.originalText;
            });
            msg.translationLatency = Math.round(performance.now() - startTime);
            msg.status = "Completed";
            success = true;
            this.totalTranslationTime += msg.translationLatency;
            this.processedCount++;

            if (this.onCompleteCallback) {
              try {
                this.onCompleteCallback(msg);
              } catch (err) {
                console.warn("TranslationPipeline: onCompleteCallback error:", err);
              }
            }
          }
        } catch (err) {
          console.warn(`Translation attempt ${attempts} failed for msg ${msg.id}:`, err);
        }
      }

      if (!success) {
        msg.status = "Failed";
        this.errorsCount++;
      }

      this.safeNotifyMessageUpdate(msg);
      this.safeNotifyQueueChange();
      this.safeNotifyMetrics();
    }

    this.isProcessing = false;
    this.updateStatus(
      this.queue.some((m) => m.status === "Failed")
        ? "Failed"
        : this.queue.length > 0
        ? "Completed"
        : "Pending"
    );
  }

  private updateStatus(status: "Pending" | "Translating" | "Completed" | "Failed") {
    this.currentStatus = status;
    this.notifyMetrics();
  }

  private notifyMessageUpdate(msg: TranslationMessage) {
    this.onMessageUpdateCallbacks.forEach((cb) => cb(msg));
  }

  private notifyQueueChange() {
    this.onQueueChangeCallbacks.forEach((cb) => cb([...this.queue]));
  }

  private notifyMetrics() {
    const metrics = this.getMetrics();
    this.onMetricsCallbacks.forEach((cb) => cb(metrics));
  }

  private safeNotifyMessageUpdate(msg: TranslationMessage) {
    try { this.notifyMessageUpdate(msg); } catch (err) {
      console.warn("TranslationPipeline: onMessageUpdate callback error:", err);
    }
  }

  private safeNotifyQueueChange() {
    try { this.notifyQueueChange(); } catch (err) {
      console.warn("TranslationPipeline: onQueueChange callback error:", err);
    }
  }

  private safeNotifyMetrics() {
    try { this.notifyMetrics(); } catch (err) {
      console.warn("TranslationPipeline: onMetricsUpdate callback error:", err);
    }
  }
}
