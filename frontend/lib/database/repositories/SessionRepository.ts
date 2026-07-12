import { SupabaseClient } from "@supabase/supabase-js";
import { TranslationSession } from "../types";

export class SessionRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: string): Promise<TranslationSession | null> {
    const { data, error } = await this.supabase
      .from("translation_sessions")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return null;

    return this.mapToEntity(data);
  }

  async findAll(organizationId?: string): Promise<TranslationSession[]> {
    let query = this.supabase.from("translation_sessions").select("*");
    
    if (organizationId) {
      query = query.eq("organization_id", organizationId);
    }

    const { data, error } = await query;

    if (error || !data) return [];

    return data.map((item) => this.mapToEntity(item));
  }

  async create(session: Omit<TranslationSession, "id" | "createdAt" | "updatedAt">): Promise<TranslationSession> {
    const { data, error } = await this.supabase
      .from("translation_sessions")
      .insert({
        organization_id: session.organizationId,
        event_id: session.eventId,
        status: session.status,
        started_at: session.startedAt,
        ended_at: session.endedAt,
        duration_seconds: session.durationSeconds,
        listeners_count: session.listenersCount,
        expected_latency: session.expectedLatency,
        created_by: session.createdBy,
        updated_by: session.updatedBy,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return this.mapToEntity(data);
  }

  async update(id: string, session: Partial<TranslationSession>): Promise<TranslationSession> {
    const updatePayload: Record<string, any> = {};
    if (session.organizationId !== undefined) updatePayload.organization_id = session.organizationId;
    if (session.eventId !== undefined) updatePayload.event_id = session.eventId;
    if (session.status !== undefined) updatePayload.status = session.status;
    if (session.startedAt !== undefined) updatePayload.started_at = session.startedAt;
    if (session.endedAt !== undefined) updatePayload.ended_at = session.endedAt;
    if (session.durationSeconds !== undefined) updatePayload.duration_seconds = session.durationSeconds;
    if (session.listenersCount !== undefined) updatePayload.listeners_count = session.listenersCount;
    if (session.expectedLatency !== undefined) updatePayload.expected_latency = session.expectedLatency;
    if (session.updatedBy !== undefined) updatePayload.updated_by = session.updatedBy;
    updatePayload.updated_at = new Date().toISOString();

    const { data, error } = await this.supabase
      .from("translation_sessions")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return this.mapToEntity(data);
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from("translation_sessions")
      .delete()
      .eq("id", id);

    return !error;
  }

  private mapToEntity(data: any): TranslationSession {
    return {
      id: data.id,
      organizationId: data.organization_id,
      eventId: data.event_id,
      status: data.status || "idle",
      startedAt: data.started_at,
      endedAt: data.ended_at,
      durationSeconds: data.duration_seconds || 0,
      listenersCount: data.listeners_count || 0,
      expectedLatency: data.expected_latency || "-- ms",
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by || "",
      updatedBy: data.updated_by || "",
    };
  }
}
