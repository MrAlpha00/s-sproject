import { AudioPacket, QueueItem, PlaybackState, BufferState } from "../../types/audio-stream";

export class AudioStreamManager {
  private queue: QueueItem[] = [];
  private activeSources: Set<AudioBufferSourceNode> = new Set();
  private nextPlayTime = 0;
  private isPaused = false;
  private isStopped = false;
  
  private gainNode: GainNode;
  
  private volume = 80;
  private mute = false;
  private completedCount = 0;
  private droppedCount = 0;
  
  private onStateChange: () => void = () => {};

  constructor(private audioContext: AudioContext) {
    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = this.volume / 100;
    this.gainNode.connect(this.audioContext.destination);
  }

  registerStateCallback(callback: () => void) {
    this.onStateChange = callback;
  }

  setVolume(vol: number) {
    this.volume = vol;
    this.updateGain();
  }

  setMute(isMuted: boolean) {
    this.mute = isMuted;
    this.updateGain();
  }

  private updateGain() {
    if (this.mute) {
      this.gainNode.gain.value = 0;
    } else {
      this.gainNode.gain.value = this.volume / 100;
    }
    this.onStateChange();
  }

  async enqueue(packet: AudioPacket) {
    if (this.isStopped) return;

    const item: QueueItem = {
      packet,
      audioBuffer: null,
      scheduledTime: 0
    };

    this.queue.push(item);
    this.onStateChange();

    try {
      if (!packet.audioData) {
        throw new Error("Empty audio packet data");
      }

      const binaryString = atob(packet.audioData);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const buffer = await this.audioContext.decodeAudioData(bytes.buffer);
      item.audioBuffer = buffer;
      
      this.processQueue();
    } catch (err) {
      console.error("AudioStreamManager: Audio packet decoding failed:", err);
      this.droppedCount++;
      this.queue = this.queue.filter(q => q.packet.sequenceNumber !== packet.sequenceNumber);
      this.onStateChange();
    }
  }

  private processQueue() {
    if (this.isPaused || this.isStopped) return;

    if (this.nextPlayTime < this.audioContext.currentTime) {
      this.nextPlayTime = this.audioContext.currentTime;
    }

    while (this.queue.length > 0) {
      const item = this.queue[0];

      if (item.audioBuffer) {
        const playTime = Math.max(this.audioContext.currentTime, this.nextPlayTime);
        const source = this.audioContext.createBufferSource();
        source.buffer = item.audioBuffer;
        source.connect(this.gainNode);
        source.start(playTime);

        item.scheduledTime = playTime;
        this.activeSources.add(source);

        this.nextPlayTime = playTime + item.audioBuffer.duration;

        this.queue.shift();
        
        source.onended = () => {
          this.activeSources.delete(source);
          this.completedCount++;
          this.onStateChange();
          this.processQueue();
        };

        this.onStateChange();
      } else {
        break;
      }
    }
  }

  pause() {
    this.isPaused = true;
    this.activeSources.forEach((src) => {
      try {
        src.stop();
      } catch (e) {}
    });
    this.activeSources.clear();
    this.nextPlayTime = 0;
    this.onStateChange();
  }

  resume() {
    if (!this.isPaused) return;
    this.isPaused = false;
    this.nextPlayTime = this.audioContext.currentTime;
    this.processQueue();
    this.onStateChange();
  }

  clear() {
    this.queue = [];
    this.activeSources.forEach((src) => {
      try {
        src.stop();
      } catch (e) {}
    });
    this.activeSources.clear();
    this.nextPlayTime = 0;
    this.onStateChange();
  }

  stop() {
    this.isStopped = true;
    this.clear();
    try {
      this.gainNode.disconnect();
    } catch (e) {}
  }

  getPlaybackState(): PlaybackState {
    if (this.isStopped) return "stopped";
    if (this.isPaused) return "paused";
    if (this.activeSources.size > 0) return "playing";
    if (this.queue.some(item => !item.audioBuffer)) return "buffering";
    return "idle";
  }

  getBufferState(): BufferState {
    const bufferedDuration = this.queue.reduce(
      (sum, item) => sum + (item.audioBuffer ? item.audioBuffer.duration * 1000 : 0),
      0
    );

    return {
      queueLength: this.queue.length,
      maxQueueLength: 20,
      bufferedDuration,
      droppedPacketsCount: this.droppedCount,
      completedPacketsCount: this.completedCount,
    };
  }

  getVolume(): number {
    return this.volume;
  }

  getMute(): boolean {
    return this.mute;
  }
}
