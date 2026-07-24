import { SupabaseClient, RealtimeChannel } from "@supabase/supabase-js";
import { StreamingService } from "./StreamingService";
import {
  StreamingSession,
  BroadcastMessage,
  AudioPacketMetadata,
  StreamingStatus,
  SessionState,
} from "../../types/streaming";
import { StreamingSessionRepository } from "../database/repositories/StreamingSessionRepository";

export class SupabaseStreamingProvider implements StreamingService {
  status: StreamingStatus = "idle";
  private channel: RealtimeChannel | null = null;
  private channelName: string | null = null;
  private activeSession: StreamingSession | null = null;
  private repo: StreamingSessionRepository;
  
  // Callbacks
  private onStatusChange: (status: StreamingStatus) => void = () => {};
  private onPresenceUpdate: (count: number) => void = () => {};
  
  // Reconnection and heartbeats
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private isReconnecting = false;
  private isOperator = false;
  private joinParams: {
    sessionId: string;
    language: string;
    onMessage: (msg: BroadcastMessage) => void;
    onAudio: (audio: AudioPacketMetadata) => void;
    onSessionEnd?: () => void;
  } | null = null;

  constructor(private supabase: SupabaseClient) {
    this.repo = new StreamingSessionRepository(supabase);
  }

  registerStatusCallback(callback: (status: StreamingStatus) => void) {
    this.onStatusChange = callback;
  }

  registerPresenceCallback(callback: (audienceCount: number) => void) {
    this.onPresenceUpdate = callback;
  }

  private notifyStatus(newStatus: StreamingStatus) {
    this.status = newStatus;
    this.onStatusChange(newStatus);
  }

  async createSession(eventId: string, organizationId: string, operatorId: string): Promise<StreamingSession> {
    this.isOperator = true;
    this.notifyStatus("connecting");
    
    let newSession: StreamingSession;
    try {
      newSession = await this.repo.create({
        organizationId,
        operatorId,
        eventId,
        status: "active",
        startedAt: new Date().toISOString(),
        endedAt: null,
        audienceCount: 0,
      });
    } catch (err) {
      console.warn("Using local streaming session object fallback for event:", eventId);
      newSession = {
        id: `session-${eventId}`,
        organizationId,
        operatorId,
        eventId,
        status: "active",
        startedAt: new Date().toISOString(),
        endedAt: null,
        audienceCount: 0,
      };
    }

    this.activeSession = newSession;
    this.channelName = `streaming:${eventId}`;
    
    try {
      // Setup Realtime Channel for active event
      await this.setupChannelForOperator();
      this.notifyStatus("connected");
      this.startHeartbeat();
      return newSession;
    } catch (err) {
      this.notifyStatus("error");
      console.error("Failed to setup streaming channel:", err);
      throw err;
    }
  }

  async joinSession(
    targetId: string,
    language: string,
    onMessage: (msg: BroadcastMessage) => void,
    onAudio: (audio: AudioPacketMetadata) => void,
    onSessionEnd?: () => void
  ): Promise<void> {
    this.isOperator = false;
    this.notifyStatus("connecting");
    this.channelName = targetId.startsWith("streaming:") ? targetId : `streaming:${targetId}`;
    this.joinParams = { sessionId: targetId, language, onMessage, onAudio, onSessionEnd };

    try {
      await this.setupChannelForAudience(targetId, language, onMessage, onAudio, onSessionEnd);
      this.notifyStatus("connected");
    } catch (err) {
      this.notifyStatus("error");
      console.error("Failed to join streaming channel:", err);
      this.handleDisconnect();
    }
  }

  async leaveSession(): Promise<void> {
    this.stopHeartbeat();
    if (this.channel) {
      await this.channel.unsubscribe();
      this.channel = null;
    }
    this.activeSession = null;
    this.channelName = null;
    this.joinParams = null;
    this.isOperator = false;
    this.notifyStatus("idle");
  }

  async broadcastTranslation(msg: Omit<BroadcastMessage, "timestamp">): Promise<void> {
    if (!this.channel || this.status !== "connected") {
      console.warn("[Streaming] Cannot broadcast translation: stream disconnected.");
      return;
    }

    const payload: BroadcastMessage = {
      ...msg,
      timestamp: new Date().toISOString(),
    };

    console.log(`[Streaming] Broadcasting translation: id=${msg.id} eventId=${msg.eventId} translatedKeys=${Object.keys(msg.translatedText)}`);
    try {
      await this.channel.send({
        type: "broadcast",
        event: "translation",
        payload,
      });
    } catch (err) {
      console.error(`[Streaming] Translation broadcast FAILED: id=${msg.id}`, err);
      throw err;
    }
  }

  async broadcastAudio(audio: Omit<AudioPacketMetadata, "timestamp">): Promise<void> {
    if (!this.channel || this.status !== "connected") {
      console.warn("[Streaming-STAGE-BROADCAST] Cannot broadcast audio: stream disconnected or channel null.");
      return;
    }

    const payload: AudioPacketMetadata = {
      ...audio,
      timestamp: new Date().toISOString(),
    };

    console.log(`[Streaming-STAGE-BROADCAST] Sending audio broadcast: msgId=${audio.messageId} lang=${audio.language} audioBytes=${audio.audioData?.length || 0} seq=${audio.sequenceNumber} channelStatus=${this.status}`);
    try {
      await this.channel.send({
        type: "broadcast",
        event: "audio",
        payload,
      });
      console.log(`[Streaming-STAGE-BROADCAST] Audio broadcast sent successfully: msgId=${audio.messageId}`);
    } catch (err) {
      console.error(`[Streaming-STAGE-BROADCAST] Audio broadcast SEND FAILED: msgId=${audio.messageId}`, err);
      throw err;
    }
  }

  async updateSessionState(state: SessionState): Promise<void> {
    if (!this.activeSession) return;

    try {
      const updateData: Partial<StreamingSession> = { status: state };
      if (state === "stopped") {
        updateData.endedAt = new Date().toISOString();
      }

      const updated = await this.repo.update(this.activeSession.id, updateData);
      this.activeSession = updated;

      if (this.channel) {
        await this.channel.send({
          type: "broadcast",
          event: "state",
          payload: { state },
        });
      }
    } catch (err) {
      console.error("Failed to update streaming session state in DB:", err);
    }
  }

  async cleanupSession(): Promise<void> {
    this.stopHeartbeat();
    await this.updateSessionState("stopped");
    await this.leaveSession();
  }

  // Channel Subscriptions Setup
  private async setupChannelForOperator() {
    if (this.channel) {
      await this.channel.unsubscribe();
    }

    const channel = this.supabase.channel(this.channelName!, {
      config: {
        presence: { key: "operator" },
      },
    });

    this.channel = channel;

    // Listen to Presence for active listener count sync
    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState();
      let count = 0;
      Object.keys(state).forEach((key) => {
        // Exclude operator if present
        if (key !== "operator") {
          count += state[key]?.length || 0;
        }
      });

      // Update audience count in DB periodically or locally
      if (this.activeSession && count !== this.activeSession.audienceCount) {
        this.activeSession.audienceCount = count;
        this.repo.update(this.activeSession.id, { audienceCount: count }).catch(() => {});
      }

      this.onPresenceUpdate(count);
    });

    return new Promise<void>((resolve, reject) => {
      channel.subscribe((status, err) => {
        if (status === "SUBSCRIBED") {
          resolve();
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          reject(err || new Error(`Operator Realtime Channel subscription failed: ${status}`));
        }
      });
    });
  }

  private async setupChannelForAudience(
    sessionId: string,
    language: string,
    onMessage: (msg: BroadcastMessage) => void,
    onAudio: (audio: AudioPacketMetadata) => void,
    onSessionEnd?: () => void
  ) {
    if (this.channel) {
      await this.channel.unsubscribe();
    }

    const clientId = `listener-${Math.random().toString(36).substring(2, 7)}`;
    const channel = this.supabase.channel(this.channelName!, {
      config: {
        presence: { key: clientId },
      },
    });

    this.channel = channel;

    // Listen to Broadcasts
    channel
      .on("broadcast", { event: "translation" }, ({ payload }) => {
        onMessage(payload);
      })
      .on("broadcast", { event: "audio" }, ({ payload }) => {
        onAudio(payload);
      })
      .on("broadcast", { event: "state" }, ({ payload }) => {
        if (payload.state === "stopped" && onSessionEnd) {
          onSessionEnd();
        }
      });

    // Listen to Presence
    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState();
      let count = 0;
      Object.keys(state).forEach((key) => {
        if (key !== "operator") {
          count += state[key]?.length || 0;
        }
      });
      this.onPresenceUpdate(count);
    });

    return new Promise<void>((resolve, reject) => {
      channel.subscribe(async (status, err) => {
        if (status === "SUBSCRIBED") {
          // Track listener presence details
          try {
            await channel.track({
              joinedAt: new Date().toISOString(),
              language,
              userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "Unknown",
            });
            resolve();
          } catch (e) {
            console.warn("Failed tracking listener presence:", e);
            resolve(); // proceed anyway
          }
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          reject(err || new Error(`Audience channel subscribe failed: ${status}`));
        }
      });
    });
  }

  // Heartbeat loops
  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.channel && this.status === "connected") {
        this.channel.send({
          type: "broadcast",
          event: "heartbeat",
          payload: { ping: Date.now() },
        }).catch(() => {});
      }
    }, 30000);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Auto Reconnections
  private handleDisconnect() {
    if (this.isReconnecting || this.status === "idle") return;
    this.isReconnecting = true;
    this.notifyStatus("disconnected");
    this.stopHeartbeat();

    let attempt = 0;
    const maxAttempts = 6;

    const reconnect = async () => {
      if (this.status === "connected" || this.status === "idle" || attempt >= maxAttempts) {
        this.isReconnecting = false;
        if (attempt >= maxAttempts) {
          this.notifyStatus("error");
        }
        return;
      }

      attempt++;
      console.warn(`Supabase Streaming channel disconnected. Reconnect attempt ${attempt}/${maxAttempts}...`);
      this.notifyStatus("connecting");

      try {
        if (this.isOperator) {
          await this.setupChannelForOperator();
          this.startHeartbeat();
        } else if (this.joinParams) {
          const { sessionId, language, onMessage, onAudio, onSessionEnd } = this.joinParams;
          await this.setupChannelForAudience(sessionId, language, onMessage, onAudio, onSessionEnd);
        }

        this.notifyStatus("connected");
        this.isReconnecting = false;
        console.log("Supabase Streaming channel reconnected successfully.");
      } catch (err) {
        console.error("Streaming reconnect attempt failed:", err);
        // Exponential backoff
        setTimeout(reconnect, 2000 * attempt);
      }
    };

    setTimeout(reconnect, 1500);
  }
}
