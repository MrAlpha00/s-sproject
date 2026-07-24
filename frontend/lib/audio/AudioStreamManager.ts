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
    console.log(`[AudioStream] Created: contextState=${audioContext.state} sampleRate=${audioContext.sampleRate}`);
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

  private async ensureContextRunning(): Promise<boolean> {
    if (this.audioContext.state !== "suspended") return true;
    console.log(`[AudioStream] AudioContext state=${this.audioContext.state}, attempting resume...`);
    try {
      await this.audioContext.resume();
      console.log(`[AudioStream] AudioContext resumed: state=${this.audioContext.state}`);
      return this.audioContext.state !== "suspended";
    } catch (err) {
      console.error("[AudioStream] Failed to resume AudioContext:", err);
      return false;
    }
  }

  async enqueue(packet: AudioPacket) {
    if (this.isStopped) {
      console.warn("[AudioStream] enqueue called on stopped manager — rejecting packet");
      return;
    }

    const ctxRunning = await this.ensureContextRunning();
    if (!ctxRunning) {
      console.error("[AudioStream] Cannot enqueue: AudioContext not running");
      this.droppedCount++;
      return;
    }

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

      console.log(`[AudioStream-STAGE-1] Decoding audio: seq=${packet.sequenceNumber} base64Len=${packet.audioData.length}`);
      const binaryString = atob(packet.audioData);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const buffer = await this.audioContext.decodeAudioData(bytes.buffer);
      item.audioBuffer = buffer;
      
      console.log(`[AudioStream-STAGE-2] Decoded OK: seq=${packet.sequenceNumber} duration=${buffer.duration.toFixed(2)}s sampleRate=${buffer.sampleRate} channels=${buffer.numberOfChannels}`);
      this.processQueue();
    } catch (err) {
      console.error(`[AudioStream-STAGE-1] Decode FAILED for seq=${packet.sequenceNumber}:`, err);
      this.droppedCount++;
      this.queue = this.queue.filter(q => q.packet.sequenceNumber !== packet.sequenceNumber);
      this.onStateChange();
    }
  }

  private processQueue() {
    if (this.isPaused || this.isStopped) {
      console.log(`[AudioStream] processQueue skipped: paused=${this.isPaused} stopped=${this.isStopped}`);
      return;
    }

    if (this.audioContext.state === "suspended") {
      console.warn(`[AudioStream] processQueue skipped: AudioContext state=${this.audioContext.state}`);
      this.ensureContextRunning().then(ok => {
        if (ok) this.processQueue();
      });
      return;
    }

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
        
        console.log(`[AudioStream-STAGE-3] Scheduled playback: seq=${item.packet.sequenceNumber} at=${playTime.toFixed(3)}s duration=${item.audioBuffer.duration.toFixed(2)}s`);

        source.onended = () => {
          this.activeSources.delete(source);
          this.completedCount++;
          console.log(`[AudioStream-STAGE-4] Playback ended: seq=${item.packet.sequenceNumber} completed=${this.completedCount}`);
          this.onStateChange();
          this.processQueue();
        };

        this.onStateChange();
      } else {
        console.warn(`[AudioStream] processQueue: first item has null buffer (seq=${item.packet.sequenceNumber}), waiting for decode`);
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
    console.log("[AudioStream] Paused");
    this.onStateChange();
  }

  resume() {
    if (!this.isPaused) return;
    this.isPaused = false;
    this.nextPlayTime = this.audioContext.currentTime;
    console.log("[AudioStream] Resumed");
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
    console.log("[AudioStream] Stopped");
  }

  restart() {
    this.isStopped = false;
    this.isPaused = false;
    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = this.mute ? 0 : this.volume / 100;
    this.gainNode.connect(this.audioContext.destination);
    this.nextPlayTime = 0;
    console.log("[AudioStream] Restarted");
    this.onStateChange();
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
