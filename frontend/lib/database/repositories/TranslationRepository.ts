import { SupabaseClient } from "@supabase/supabase-js";
import { TranslationMessage } from "../../../types/translation";

export class TranslationRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: string): Promise<TranslationMessage | null> {
    const { data, error } = await this.supabase
      .from("translation_messages")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return null;

    return this.mapToEntity(data);
  }

  async findBySession(sessionId: string): Promise<TranslationMessage[]> {
    const { data, error } = await this.supabase
      .from("translation_messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (error || !data) return [];

    return data.map((item) => this.mapToEntity(item));
  }

  async create(
    sessionId: string,
    organizationId: string,
    message: Omit<TranslationMessage, "id" | "timestamp">
  ): Promise<TranslationMessage> {
    const { data, error } = await this.supabase
      .from("translation_messages")
      .insert({
        session_id: sessionId,
        organization_id: organizationId,
        original_text: message.originalText,
        translated_text: message.translatedText,
        source_language: message.sourceLanguage,
        target_languages: message.targetLanguage,
        provider: message.provider,
        confidence: message.confidence,
        recognition_latency: message.recognitionLatency,
        translation_latency: message.translationLatency,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return this.mapToEntity(data);
  }

  async update(id: string, message: Partial<TranslationMessage>): Promise<TranslationMessage> {
    const updatePayload: Record<string, any> = {};
    if (message.originalText !== undefined) updatePayload.original_text = message.originalText;
    if (message.translatedText !== undefined) updatePayload.translated_text = message.translatedText;
    if (message.sourceLanguage !== undefined) updatePayload.source_language = message.sourceLanguage;
    if (message.targetLanguage !== undefined) updatePayload.target_languages = message.targetLanguage;
    if (message.provider !== undefined) updatePayload.provider = message.provider;
    if (message.confidence !== undefined) updatePayload.confidence = message.confidence;
    if (message.recognitionLatency !== undefined) updatePayload.recognition_latency = message.recognitionLatency;
    if (message.translationLatency !== undefined) updatePayload.translation_latency = message.translationLatency;
    updatePayload.updated_at = new Date().toISOString();

    const { data, error } = await this.supabase
      .from("translation_messages")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return this.mapToEntity(data);
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from("translation_messages")
      .delete()
      .eq("id", id);

    return !error;
  }

  private mapToEntity(data: any): TranslationMessage {
    return {
      id: data.id,
      originalText: data.original_text,
      translatedText: data.translated_text || {},
      sourceLanguage: data.source_language,
      targetLanguage: data.target_languages || [],
      provider: data.provider,
      confidence: data.confidence || 0,
      recognitionLatency: data.recognition_latency || 0,
      translationLatency: data.translation_latency || 0,
      timestamp: data.created_at,
      status: "Completed", // Database items are always completed
    };
  }
}
