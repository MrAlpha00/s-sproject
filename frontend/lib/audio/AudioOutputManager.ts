export class AudioOutputManager {
  /**
   * Queries the browser for all active audio destination hardware devices.
   */
  static async getOutputDevices(): Promise<MediaDeviceInfo[]> {
    if (typeof navigator === "undefined" || !navigator.mediaDevices) {
      return [];
    }
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter((d) => d.kind === "audiooutput");
    } catch (err) {
      console.warn("Failed to enumerate audio output devices:", err);
      return [];
    }
  }

  /**
   * Checks if HTMLAudioElement supports setSinkId routing (absent in Safari/iOS).
   */
  static isSinkIdSupported(): boolean {
    if (typeof HTMLAudioElement === "undefined") return false;
    return "setSinkId" in HTMLAudioElement.prototype;
  }
}
