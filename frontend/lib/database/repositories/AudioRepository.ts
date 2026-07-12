import { SupabaseClient } from "@supabase/supabase-js";
import { AudioConfiguration } from "../types";

export class AudioRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: string): Promise<AudioConfiguration | null> {
    const { data, error } = await this.supabase
      .from("audio_configurations")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return null;

    return this.mapToEntity(data);
  }

  async findAll(organizationId?: string): Promise<AudioConfiguration[]> {
    let query = this.supabase.from("audio_configurations").select("*");
    
    if (organizationId) {
      query = query.eq("organization_id", organizationId);
    }

    const { data, error } = await query;

    if (error || !data) return [];

    return data.map((item) => this.mapToEntity(item));
  }

  async create(audio: Omit<AudioConfiguration, "id" | "createdAt" | "updatedAt">): Promise<AudioConfiguration> {
    const dbPayload = this.mapToDatabase(audio);
    dbPayload.created_at = new Date().toISOString();
    dbPayload.updated_at = new Date().toISOString();

    const { data, error } = await this.supabase
      .from("audio_configurations")
      .insert(dbPayload)
      .select()
      .single();

    if (error) throw error;

    return this.mapToEntity(data);
  }

  async update(id: string, audio: Partial<AudioConfiguration>): Promise<AudioConfiguration> {
    const dbPayload = this.mapToDatabasePartial(audio);
    dbPayload.updated_at = new Date().toISOString();

    const { data, error } = await this.supabase
      .from("audio_configurations")
      .update(dbPayload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return this.mapToEntity(data);
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from("audio_configurations")
      .delete()
      .eq("id", id);

    return !error;
  }

  private mapToEntity(data: any): AudioConfiguration {
    return {
      id: data.id,
      organizationId: data.organization_id,
      deviceName: data.device_name,
      deviceType: data.device_type,
      sampleRate: data.sample_rate || "48.0 kHz",
      channels: data.channels || "Stereo (2 Ch)",
      latency: data.latency || "10ms",
      inputGain: data.input_gain || 100,
      outputGain: data.output_gain || 100,
      volume: data.volume || 100,
      mute: !!data.mute,
      monitoring: !!data.monitoring,
      testTone: !!data.test_tone,
      noiseSuppression: !!data.noise_suppression,
      echoCancellation: !!data.echo_cancellation,
      autoGain: !!data.auto_gain,
      bufferSize: data.buffer_size || "256",
      bitDepth: data.bit_depth || "24",
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by || "",
      updatedBy: data.updated_by || "",
    };
  }

  private mapToDatabase(audio: Omit<AudioConfiguration, "id" | "createdAt" | "updatedAt">): Record<string, any> {
    return {
      organization_id: audio.organizationId,
      device_name: audio.deviceName,
      device_type: audio.deviceType,
      sample_rate: audio.sampleRate,
      channels: audio.channels,
      latency: audio.latency,
      input_gain: audio.inputGain,
      output_gain: audio.outputGain,
      volume: audio.volume,
      mute: audio.mute,
      monitoring: audio.monitoring,
      test_tone: audio.testTone,
      noise_suppression: audio.noiseSuppression,
      echo_cancellation: audio.echoCancellation,
      auto_gain: audio.autoGain,
      buffer_size: audio.bufferSize,
      bit_depth: audio.bitDepth,
      created_by: audio.createdBy,
      updated_by: audio.updatedBy,
    };
  }

  private mapToDatabasePartial(audio: Partial<AudioConfiguration>): Record<string, any> {
    const payload: Record<string, any> = {};
    if (audio.organizationId !== undefined) payload.organization_id = audio.organizationId;
    if (audio.deviceName !== undefined) payload.device_name = audio.deviceName;
    if (audio.deviceType !== undefined) payload.device_type = audio.deviceType;
    if (audio.sampleRate !== undefined) payload.sample_rate = audio.sampleRate;
    if (audio.channels !== undefined) payload.channels = audio.channels;
    if (audio.latency !== undefined) payload.latency = audio.latency;
    if (audio.inputGain !== undefined) payload.input_gain = audio.inputGain;
    if (audio.outputGain !== undefined) payload.output_gain = audio.outputGain;
    if (audio.volume !== undefined) payload.volume = audio.volume;
    if (audio.mute !== undefined) payload.mute = audio.mute;
    if (audio.monitoring !== undefined) payload.monitoring = audio.monitoring;
    if (audio.testTone !== undefined) payload.test_tone = audio.testTone;
    if (audio.noiseSuppression !== undefined) payload.noise_suppression = audio.noiseSuppression;
    if (audio.echoCancellation !== undefined) payload.echo_cancellation = audio.echoCancellation;
    if (audio.autoGain !== undefined) payload.auto_gain = audio.autoGain;
    if (audio.bufferSize !== undefined) payload.buffer_size = audio.bufferSize;
    if (audio.bitDepth !== undefined) payload.bit_depth = audio.bitDepth;
    if (audio.updatedBy !== undefined) payload.updated_by = audio.updatedBy;
    return payload;
  }
}
