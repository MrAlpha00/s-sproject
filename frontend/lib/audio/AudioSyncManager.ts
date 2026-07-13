import { AudioPacket } from "../../types/audio-stream";

export class AudioSyncManager {
  private expectedSeqNum = -1;
  private outOfOrderPackets: Map<number, AudioPacket> = new Map();
  private processedSeqNums: Set<number> = new Set();
  private maxOutOfOrderBuffer = 5;
  private lastNetworkLatency = 0;
  private networkLatencies: number[] = [];

  constructor() {}

  reset() {
    this.expectedSeqNum = -1;
    this.outOfOrderPackets.clear();
    this.processedSeqNums.clear();
    this.networkLatencies = [];
    this.lastNetworkLatency = 0;
  }

  processIncomingPacket(packet: AudioPacket): AudioPacket[] {
    const seq = packet.sequenceNumber;

    // 1. Duplicate filtering
    if (this.processedSeqNums.has(seq)) {
      console.warn(`AudioSyncManager: Duplicate packet detected for sequence ${seq}. Dropping.`);
      return [];
    }

    // 2. Track network transport latency
    const now = Date.now();
    const packetTime = new Date(packet.timestamp).getTime();
    const networkLatency = Math.max(0, now - packetTime);
    this.lastNetworkLatency = networkLatency;
    this.networkLatencies.push(networkLatency);
    if (this.networkLatencies.length > 50) {
      this.networkLatencies.shift();
    }

    // 3. Initialize expected sequence number
    if (this.expectedSeqNum === -1) {
      this.expectedSeqNum = seq;
    }

    // 4. In-order packet processing
    if (seq === this.expectedSeqNum) {
      this.processedSeqNums.add(seq);
      const packetsToReturn: AudioPacket[] = [packet];
      this.expectedSeqNum++;

      // Check if we have consecutive buffered out-of-order packets
      while (this.outOfOrderPackets.has(this.expectedSeqNum)) {
        const nextPacket = this.outOfOrderPackets.get(this.expectedSeqNum)!;
        this.outOfOrderPackets.delete(this.expectedSeqNum);
        this.processedSeqNums.add(this.expectedSeqNum);
        packetsToReturn.push(nextPacket);
        this.expectedSeqNum++;
      }

      // Keep processed list capped to prevent memory leaks
      if (this.processedSeqNums.size > 200) {
        const iterator = this.processedSeqNums.values();
        const first = iterator.next().value;
        if (first !== undefined) this.processedSeqNums.delete(first);
      }

      return packetsToReturn;
    }

    // 5. Out-of-order packet buffering
    if (seq > this.expectedSeqNum) {
      this.outOfOrderPackets.set(seq, packet);

      // If buffer is too large, force return of oldest packets and advance expected sequence number
      if (this.outOfOrderPackets.size > this.maxOutOfOrderBuffer) {
        console.warn(`AudioSyncManager: Out-of-order buffer size exceeded limit. Advancing expected sequence.`);
        
        const sortedSeqs = Array.from(this.outOfOrderPackets.keys()).sort((a, b) => a - b);
        const nextAvailableSeq = sortedSeqs[0];
        
        this.expectedSeqNum = nextAvailableSeq;
        
        const forcedPackets: AudioPacket[] = [];
        while (this.outOfOrderPackets.has(this.expectedSeqNum)) {
          const p = this.outOfOrderPackets.get(this.expectedSeqNum)!;
          this.outOfOrderPackets.delete(this.expectedSeqNum);
          this.processedSeqNums.add(this.expectedSeqNum);
          forcedPackets.push(p);
          this.expectedSeqNum++;
        }
        return forcedPackets;
      }

      return [];
    }

    // 6. Late/Stale packet drop
    console.warn(`AudioSyncManager: Late packet received for sequence ${seq}. Expected ${this.expectedSeqNum}. Dropping.`);
    return [];
  }

  getAverageNetworkLatency(): number {
    if (this.networkLatencies.length === 0) return 0;
    const sum = this.networkLatencies.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.networkLatencies.length);
  }

  getLastNetworkLatency(): number {
    return this.lastNetworkLatency;
  }
}
