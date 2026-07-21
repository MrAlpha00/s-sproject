/**
 * RecognitionRecoveryManager
 * 
 * Coordinates recovery of speech recognition, AudioContext, and MediaStream
 * across tab switches, network interruptions, sleep, and browser focus events.
 * 
 * Monitors:
 * - document.visibilityState (tab switching)
 * - window focus/blur events
 * - navigator.onLine (network status)
 * - AudioContext state
 * - MediaStream track state
 * - Recognition session state
 */

export type RecoveryReason = "tab-focus" | "network-recovery" | "audio-context-resume" | "mic-restart" | "periodic-check";

export interface RecoveryAttempt {
  reason: RecoveryReason;
  timestamp: number;
  success: boolean;
  duration: number;
}

export interface RecoveryCallbacks {
  onVisibilityChange?: (visible: boolean) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onNetworkChange?: (online: boolean) => void;
  onRecoveryStart?: (reason: RecoveryReason) => void;
  onRecoveryComplete?: (attempt: RecoveryAttempt) => void;
  onAudioContextResumed?: () => void;
  onMicReacquired?: () => void;
  onRecognizerRestarted?: () => void;
}

export class RecognitionRecoveryManager {
  private isRunning = false;
  private isPaused = false;
  private callbacks: RecoveryCallbacks = {};
  
  // State tracking
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private lastActivityTimestamp = 0;
  private recoveryAttempts: RecoveryAttempt[] = [];
  private maxRecoveryAttempts = 5;
  private periodicCheckInterval: ReturnType<typeof setInterval> | null = null;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  
  // Recovery function references (set by the caller)
  private recoverFn: (() => Promise<boolean>) | null = null;
  private reacquireMicFn: (() => Promise<MediaStream | null>) | null = null;
  private resumeAudioFn: (() => Promise<void>) | null = null;
  
  // Event handler references for cleanup
  private visibilityHandler: (() => void) | null = null;
  private focusHandler: (() => void) | null = null;
  private blurHandler: (() => void) | null = null;
  private onlineHandler: (() => void) | null = null;
  private offlineHandler: (() => void) | null = null;
  private beforeUnloadHandler: ((e: BeforeUnloadEvent) => void) | null = null;

  constructor() {
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleOnline = this.handleOnline.bind(this);
    this.handleOffline = this.handleOffline.bind(this);
    this.handleBeforeUnload = this.handleBeforeUnload.bind(this);
  }

  // ===== LIFECYCLE =====

  /**
   * Start monitoring and set up recovery functions.
   */
  start(config: {
    recoverFn: () => Promise<boolean>;
    reacquireMicFn?: () => Promise<MediaStream | null>;
    resumeAudioFn?: () => Promise<void>;
    audioContext?: AudioContext;
    mediaStream?: MediaStream;
  }) {
    if (this.isRunning) return;
    this.isRunning = true;
    this.isPaused = false;

    this.recoverFn = config.recoverFn;
    this.reacquireMicFn = config.reacquireMicFn || null;
    this.resumeAudioFn = config.resumeAudioFn || null;
    this.audioContext = config.audioContext || null;
    this.mediaStream = config.mediaStream || null;
    this.lastActivityTimestamp = Date.now();

    this.attachEventListeners();
    this.startPeriodicMonitoring();
    this.startHeartbeat();

    console.log("RecognitionRecoveryManager started");
  }

  /**
   * Stop all monitoring and clean up.
   */
  stop() {
    this.isRunning = false;
    this.detachEventListeners();
    this.stopPeriodicMonitoring();
    this.stopHeartbeat();
    console.log("RecognitionRecoveryManager stopped");
  }

  /**
   * Pause recovery (e.g., during intentional stop).
   */
  pause() {
    this.isPaused = true;
  }

  /**
   * Resume recovery after pause.
   */
  resume() {
    this.isPaused = false;
    this.lastActivityTimestamp = Date.now();
  }

  /**
   * Update the AudioContext reference.
   */
  setAudioContext(ctx: AudioContext | null) {
    this.audioContext = ctx;
  }

  /**
   * Update the MediaStream reference.
   */
  setMediaStream(stream: MediaStream | null) {
    this.mediaStream = stream;
  }

  /**
   * Register callbacks for recovery events.
   */
  registerCallbacks(callbacks: RecoveryCallbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * Get recovery history.
   */
  getRecoveryHistory(): RecoveryAttempt[] {
    return [...this.recoveryAttempts];
  }

  /**
   * Check if recovery is currently in progress.
   */
  isRecovering(): boolean {
    return this.recoveryAttempts.some(
      (a) => !a.success && Date.now() - a.timestamp < 5000
    );
  }

  // ===== EVENT HANDLERS =====

  private attachEventListeners() {
    if (typeof window === "undefined") return;

    this.visibilityHandler = this.handleVisibilityChange;
    this.focusHandler = this.handleFocus;
    this.blurHandler = this.handleBlur;
    this.onlineHandler = this.handleOnline;
    this.offlineHandler = this.handleOffline;
    this.beforeUnloadHandler = this.handleBeforeUnload;

    document.addEventListener("visibilitychange", this.visibilityHandler);
    window.addEventListener("focus", this.focusHandler);
    window.addEventListener("blur", this.blurHandler);
    window.addEventListener("online", this.onlineHandler);
    window.addEventListener("offline", this.offlineHandler);
    window.addEventListener("beforeunload", this.beforeUnloadHandler);
  }

  private detachEventListeners() {
    if (typeof window === "undefined") return;

    if (this.visibilityHandler) {
      document.removeEventListener("visibilitychange", this.visibilityHandler);
    }
    if (this.focusHandler) {
      window.removeEventListener("focus", this.focusHandler);
    }
    if (this.blurHandler) {
      window.removeEventListener("blur", this.blurHandler);
    }
    if (this.onlineHandler) {
      window.removeEventListener("online", this.onlineHandler);
    }
    if (this.offlineHandler) {
      window.removeEventListener("offline", this.offlineHandler);
    }
    if (this.beforeUnloadHandler) {
      window.removeEventListener("beforeunload", this.beforeUnloadHandler);
    }
  }

  private handleVisibilityChange() {
    if (!this.isRunning || this.isPaused) return;

    const visible = document.visibilityState === "visible";
    this.callbacks.onVisibilityChange?.(visible);

    if (visible) {
      this.lastActivityTimestamp = Date.now();
      this.performRecovery("tab-focus");
    }
  }

  private handleFocus() {
    if (!this.isRunning || this.isPaused) return;

    this.callbacks.onFocus?.();
    this.lastActivityTimestamp = Date.now();
    this.performRecovery("tab-focus");
  }

  private handleBlur() {
    if (!this.isRunning || this.isPaused) return;

    this.callbacks.onBlur?.();
    // Don't recover on blur - wait for focus
  }

  private handleOnline() {
    if (!this.isRunning || this.isPaused) return;

    this.callbacks.onNetworkChange?.(true);
    this.lastActivityTimestamp = Date.now();
    this.performRecovery("network-recovery");
  }

  private handleOffline() {
    if (!this.isRunning || this.isPaused) return;

    this.callbacks.onNetworkChange?.(false);
    // Don't recover on offline - wait for online
  }

  private handleBeforeUnload(_e: BeforeUnloadEvent) {
    // Don't prevent unload, but mark as intentional pause
    this.isPaused = true;
  }

  // ===== RECOVERY LOGIC =====

  private async performRecovery(reason: RecoveryReason) {
    if (!this.recoverFn) return;

    const startTime = Date.now();
    this.callbacks.onRecoveryStart?.(reason);

    try {
      // Step 1: Resume AudioContext if suspended
      if (this.audioContext && this.audioContext.state === "suspended") {
        try {
          if (this.resumeAudioFn) {
            await this.resumeAudioFn();
          } else {
            await this.audioContext.resume();
          }
          this.callbacks.onAudioContextResumed?.();
          console.log("AudioContext resumed during recovery");
        } catch (err) {
          console.warn("Failed to resume AudioContext:", err);
        }
      }

      // Step 2: Check if mic tracks are ended
      if (this.mediaStream) {
        const tracks = this.mediaStream.getTracks();
        const hasEndedTrack = tracks.some((t) => t.readyState === "ended");
        if (hasEndedTrack && this.reacquireMicFn) {
          try {
            const newStream = await this.reacquireMicFn();
            if (newStream) {
              this.mediaStream = newStream;
              this.callbacks.onMicReacquired?.();
              console.log("Microphone reacquired during recovery");
            }
          } catch (err) {
            console.warn("Failed to reacquire microphone:", err);
          }
        }
      }

      // Step 3: Recover recognition
      const success = await this.recoverFn();
      if (success) {
        this.callbacks.onRecognizerRestarted?.();
      }

      const attempt: RecoveryAttempt = {
        reason,
        timestamp: Date.now(),
        success,
        duration: Date.now() - startTime,
      };

      this.recoveryAttempts.push(attempt);
      // Keep only last 50 attempts
      if (this.recoveryAttempts.length > 50) {
        this.recoveryAttempts = this.recoveryAttempts.slice(-50);
      }

      this.callbacks.onRecoveryComplete?.(attempt);
    } catch (err) {
      console.error("Recovery failed:", err);

      const attempt: RecoveryAttempt = {
        reason,
        timestamp: Date.now(),
        success: false,
        duration: Date.now() - startTime,
      };

      this.recoveryAttempts.push(attempt);
      this.callbacks.onRecoveryComplete?.(attempt);
    }
  }

  // ===== MONITORING =====

  private startPeriodicMonitoring() {
    // Check every 5 seconds if something went wrong
    this.periodicCheckInterval = setInterval(() => {
      if (!this.isRunning || this.isPaused) return;

      // Check AudioContext state
      if (this.audioContext && this.audioContext.state === "suspended") {
        console.log("Periodic check: AudioContext suspended, attempting recovery");
        this.performRecovery("audio-context-resume");
        return;
      }

      // Check MediaStream tracks
      if (this.mediaStream) {
        const tracks = this.mediaStream.getTracks();
        const hasEndedTrack = tracks.some((t) => t.readyState === "ended");
        if (hasEndedTrack) {
          console.log("Periodic check: MediaStream track ended, attempting recovery");
          this.performRecovery("mic-restart");
          return;
        }
      }

      // Check if too much time has passed without activity (stale session)
      const timeSinceLastActivity = Date.now() - this.lastActivityTimestamp;
      if (timeSinceLastActivity > 60000 && this.recoverFn) {
        // More than 60 seconds since last activity during active session
        console.log("Periodic check: Stale session detected, attempting recovery");
        this.performRecovery("periodic-check");
      }
    }, 5000);
  }

  private stopPeriodicMonitoring() {
    if (this.periodicCheckInterval) {
      clearInterval(this.periodicCheckInterval);
      this.periodicCheckInterval = null;
    }
  }

  private startHeartbeat() {
    // Update last activity timestamp periodically to keep session alive
    this.heartbeatInterval = setInterval(() => {
      if (this.isRunning && !this.isPaused) {
        this.lastActivityTimestamp = Date.now();
      }
    }, 10000);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
}
