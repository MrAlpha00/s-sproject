import {
  StreamingSession,
  BroadcastMessage,
  AudioPacketMetadata,
  StreamingStatus,
  SessionState,
} from "../../types/streaming";

export abstract class StreamingService {
  abstract status: StreamingStatus;
  
  abstract createSession(
    eventId: string, 
    organizationId: string, 
    operatorId: string
  ): Promise<StreamingSession>;
  
  abstract joinSession(
    sessionId: string,
    language: string,
    onMessage: (msg: BroadcastMessage) => void,
    onAudio: (audio: AudioPacketMetadata) => void,
    onSessionEnd?: () => void
  ): Promise<void>;
  
  abstract leaveSession(): Promise<void>;
  
  abstract broadcastTranslation(msg: Omit<BroadcastMessage, "timestamp">): Promise<void>;
  abstract broadcastAudio(audio: Omit<AudioPacketMetadata, "timestamp">): Promise<void>;
  
  abstract updateSessionState(state: SessionState): Promise<void>;
  abstract cleanupSession(): Promise<void>;
  
  abstract registerStatusCallback(callback: (status: StreamingStatus) => void): void;
  abstract registerPresenceCallback(callback: (audienceCount: number) => void): void;
}
