import { SupabaseClient } from "@supabase/supabase-js";
import { TranslationEvent } from "../types";

export class EventRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: string): Promise<TranslationEvent | null> {
    const { data, error } = await this.supabase
      .from("translation_events")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return null;

    return this.mapToEntity(data);
  }

  async findAll(organizationId?: string): Promise<TranslationEvent[]> {
    let query = this.supabase.from("translation_events").select("*");
    
    if (organizationId) {
      query = query.eq("organization_id", organizationId);
    }

    const { data, error } = await query;

    if (error || !data) return [];

    return data.map((item) => this.mapToEntity(item));
  }

  async create(event: Omit<TranslationEvent, "id" | "createdAt" | "updatedAt">): Promise<TranslationEvent> {
    const dbPayload = this.mapToDatabase(event);
    dbPayload.created_at = new Date().toISOString();
    dbPayload.updated_at = new Date().toISOString();

    const { data, error } = await this.supabase
      .from("translation_events")
      .insert(dbPayload)
      .select()
      .single();

    if (error) throw error;

    return this.mapToEntity(data);
  }

  async update(id: string, event: Partial<TranslationEvent>): Promise<TranslationEvent> {
    const dbPayload = this.mapToDatabasePartial(event);
    dbPayload.updated_at = new Date().toISOString();

    const { data, error } = await this.supabase
      .from("translation_events")
      .update(dbPayload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return this.mapToEntity(data);
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from("translation_events")
      .delete()
      .eq("id", id);

    return !error;
  }

  private mapToEntity(data: any): TranslationEvent {
    return {
      id: data.id,
      organizationId: data.organization_id,
      ownerId: data.owner_id,
      name: data.name,
      description: data.description || "",
      venue: data.venue || "",
      date: data.date || "",
      time: data.time || "",
      sourceLanguage: data.source_language,
      targetLanguages: data.target_languages || [],
      translationModel: data.translation_model,
      latencyMode: data.latency_mode || "low-latency",
      profanityFilter: !!data.profanity_filter,
      targetVocabulary: data.target_vocabulary || "",
      inputDevice: data.input_device || "",
      outputDevice: data.output_device || "",
      voiceProfile: data.voice_profile || "",
      status: data.status || "scheduled",
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by || "",
      updatedBy: data.updated_by || "",
    };
  }

  private mapToDatabase(event: Omit<TranslationEvent, "id" | "createdAt" | "updatedAt">): Record<string, any> {
    return {
      organization_id: event.organizationId,
      owner_id: event.ownerId,
      name: event.name,
      description: event.description,
      venue: event.venue,
      date: event.date,
      time: event.time,
      source_language: event.sourceLanguage,
      target_languages: event.targetLanguages,
      translation_model: event.translationModel,
      latency_mode: event.latencyMode,
      profanity_filter: event.profanityFilter,
      target_vocabulary: event.targetVocabulary,
      input_device: event.inputDevice,
      output_device: event.outputDevice,
      voice_profile: event.voiceProfile,
      status: event.status,
      created_by: event.createdBy,
      updated_by: event.updatedBy,
    };
  }

  private mapToDatabasePartial(event: Partial<TranslationEvent>): Record<string, any> {
    const payload: Record<string, any> = {};
    if (event.organizationId !== undefined) payload.organization_id = event.organizationId;
    if (event.ownerId !== undefined) payload.owner_id = event.ownerId;
    if (event.name !== undefined) payload.name = event.name;
    if (event.description !== undefined) payload.description = event.description;
    if (event.venue !== undefined) payload.venue = event.venue;
    if (event.date !== undefined) payload.date = event.date;
    if (event.time !== undefined) payload.time = event.time;
    if (event.sourceLanguage !== undefined) payload.source_language = event.sourceLanguage;
    if (event.targetLanguages !== undefined) payload.target_languages = event.targetLanguages;
    if (event.translationModel !== undefined) payload.translation_model = event.translationModel;
    if (event.latencyMode !== undefined) payload.latency_mode = event.latencyMode;
    if (event.profanityFilter !== undefined) payload.profanity_filter = event.profanityFilter;
    if (event.targetVocabulary !== undefined) payload.target_vocabulary = event.targetVocabulary;
    if (event.inputDevice !== undefined) payload.input_device = event.inputDevice;
    if (event.outputDevice !== undefined) payload.output_device = event.outputDevice;
    if (event.voiceProfile !== undefined) payload.voice_profile = event.voiceProfile;
    if (event.status !== undefined) payload.status = event.status;
    if (event.updatedBy !== undefined) payload.updated_by = event.updatedBy;
    return payload;
  }
}
