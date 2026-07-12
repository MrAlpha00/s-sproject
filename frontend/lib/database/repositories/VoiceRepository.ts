import { SupabaseClient } from "@supabase/supabase-js";
import { VoiceProfile } from "../types";

export class VoiceRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: string): Promise<VoiceProfile | null> {
    const { data, error } = await this.supabase
      .from("voice_profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return null;

    return this.mapToEntity(data);
  }

  async findAll(organizationId?: string): Promise<VoiceProfile[]> {
    let query = this.supabase.from("voice_profiles").select("*");
    
    if (organizationId) {
      query = query.eq("organization_id", organizationId);
    }

    const { data, error } = await query;

    if (error || !data) return [];

    return data.map((item) => this.mapToEntity(item));
  }

  async create(voice: Omit<VoiceProfile, "id" | "createdAt" | "updatedAt">): Promise<VoiceProfile> {
    const { data, error } = await this.supabase
      .from("voice_profiles")
      .insert({
        organization_id: voice.organizationId,
        name: voice.name,
        description: voice.description,
        elevenlabs_voice_id: voice.elevenLabsVoiceId,
        status: voice.status,
        created_by: voice.createdBy,
        updated_by: voice.updatedBy,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return this.mapToEntity(data);
  }

  async update(id: string, voice: Partial<VoiceProfile>): Promise<VoiceProfile> {
    const updatePayload: Record<string, any> = {};
    if (voice.organizationId !== undefined) updatePayload.organization_id = voice.organizationId;
    if (voice.name !== undefined) updatePayload.name = voice.name;
    if (voice.description !== undefined) updatePayload.description = voice.description;
    if (voice.elevenLabsVoiceId !== undefined) updatePayload.elevenlabs_voice_id = voice.elevenLabsVoiceId;
    if (voice.status !== undefined) updatePayload.status = voice.status;
    if (voice.updatedBy !== undefined) updatePayload.updated_by = voice.updatedBy;
    updatePayload.updated_at = new Date().toISOString();

    const { data, error } = await this.supabase
      .from("voice_profiles")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return this.mapToEntity(data);
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from("voice_profiles")
      .delete()
      .eq("id", id);

    return !error;
  }

  private mapToEntity(data: any): VoiceProfile {
    return {
      id: data.id,
      organizationId: data.organization_id,
      name: data.name,
      description: data.description || "",
      elevenLabsVoiceId: data.elevenlabs_voice_id || "",
      status: data.status || "inactive",
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by || "",
      updatedBy: data.updated_by || "",
    };
  }
}
