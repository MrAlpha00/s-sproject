import { SupabaseClient } from "@supabase/supabase-js";
import { StreamingSession } from "@/types/streaming";

const serverMemoryStore = new Map<string, any>();

export class StreamingSessionRepository {
  constructor(private supabase: SupabaseClient) {}

  private isLocalStorageAvailable(): boolean {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
  }

  private getLocalStorageFallback(): StreamingSession[] {
    if (!this.isLocalStorageAvailable()) {
      return Array.from(serverMemoryStore.values());
    }
    const data = localStorage.getItem("aethervox_fallback_streaming_sessions");
    return data ? JSON.parse(data) : [];
  }

  private saveLocalStorageFallback(sessions: StreamingSession[]) {
    if (this.isLocalStorageAvailable()) {
      localStorage.setItem("aethervox_fallback_streaming_sessions", JSON.stringify(sessions));
    } else {
      serverMemoryStore.clear();
      sessions.forEach((s) => serverMemoryStore.set(s.id, s));
    }
  }

  async findById(id: string): Promise<StreamingSession | null> {
    try {
      const { data, error } = await this.supabase
        .from("streaming_sessions")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "42P01") {
          console.warn("streaming_sessions table not found in Supabase, using local fallback.");
          const local = this.getLocalStorageFallback().find((s) => s.id === id);
          return local || null;
        }
        return null;
      }

      return this.mapToEntity(data);
    } catch (err) {
      console.warn("StreamingSessionRepository.findById error, using local fallback:", err);
      const local = this.getLocalStorageFallback().find((s) => s.id === id);
      return local || null;
    }
  }

  async findActiveByEvent(eventId: string): Promise<StreamingSession | null> {
    try {
      const { data, error } = await this.supabase
        .from("streaming_sessions")
        .select("*")
        .eq("event_id", eventId)
        .eq("status", "active")
        .maybeSingle();

      if (error) {
        if (error.code === "42P01") {
          const local = this.getLocalStorageFallback().find((s) => s.eventId === eventId && s.status === "active");
          return local || null;
        }
        return null;
      }

      return data ? this.mapToEntity(data) : null;
    } catch (err) {
      console.warn("StreamingSessionRepository.findActiveByEvent error, using local fallback:", err);
      const local = this.getLocalStorageFallback().find((s) => s.eventId === eventId && s.status === "active");
      return local || null;
    }
  }

  async findAll(organizationId?: string): Promise<StreamingSession[]> {
    try {
      let query = this.supabase.from("streaming_sessions").select("*");
      if (organizationId) {
        query = query.eq("organization_id", organizationId);
      }

      const { data, error } = await query;

      if (error) {
        if (error.code === "42P01") {
          return this.getLocalStorageFallback();
        }
        return [];
      }

      return data.map((item) => this.mapToEntity(item));
    } catch (err) {
      console.warn("StreamingSessionRepository.findAll error, using local fallback:", err);
      return this.getLocalStorageFallback();
    }
  }

  async create(session: Omit<StreamingSession, "id" | "createdAt" | "updatedAt">): Promise<StreamingSession> {
    const payload = this.mapToDatabase(session);
    const now = new Date().toISOString();
    payload.created_at = now;
    payload.updated_at = now;

    try {
      const { data, error } = await this.supabase
        .from("streaming_sessions")
        .insert(payload)
        .select()
        .single();

      if (error) {
        if (error.code === "42P01") {
          console.warn("streaming_sessions table not found, fallback to local storage.");
          const newLocalSession: StreamingSession = {
            ...session,
            id: `session-${Math.random().toString(36).substring(2, 9)}`,
            createdAt: now,
            updatedAt: now,
          };
          const current = this.getLocalStorageFallback();
          current.push(newLocalSession);
          this.saveLocalStorageFallback(current);
          return newLocalSession;
        }
        throw error;
      }

      return this.mapToEntity(data);
    } catch (err) {
      console.warn("StreamingSessionRepository.create error, using local fallback:", err);
      const newLocalSession: StreamingSession = {
        ...session,
        id: `session-${Math.random().toString(36).substring(2, 9)}`,
        createdAt: now,
        updatedAt: now,
      };
      const current = this.getLocalStorageFallback();
      current.push(newLocalSession);
      this.saveLocalStorageFallback(current);
      return newLocalSession;
    }
  }

  async update(id: string, session: Partial<StreamingSession>): Promise<StreamingSession> {
    const payload = this.mapToDatabasePartial(session);
    const now = new Date().toISOString();
    payload.updated_at = now;

    try {
      const { data, error } = await this.supabase
        .from("streaming_sessions")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        if (error.code === "42P01") {
          console.warn("streaming_sessions table not found, updating in local storage fallback.");
          const current = this.getLocalStorageFallback();
          const index = current.findIndex((s) => s.id === id);
          if (index === -1) throw new Error("Streaming session not found in local storage");
          const updated = {
            ...current[index],
            ...session,
            updatedAt: now,
          } as StreamingSession;
          current[index] = updated;
          this.saveLocalStorageFallback(current);
          return updated;
        }
        throw error;
      }

      return this.mapToEntity(data);
    } catch (err) {
      console.warn("StreamingSessionRepository.update error, using local fallback:", err);
      const current = this.getLocalStorageFallback();
      const index = current.findIndex((s) => s.id === id);
      if (index === -1) throw new Error("Streaming session not found in local storage fallback");
      const updated = {
        ...current[index],
        ...session,
        updatedAt: now,
      } as StreamingSession;
      current[index] = updated;
      this.saveLocalStorageFallback(current);
      return updated;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("streaming_sessions")
        .delete()
        .eq("id", id);

      if (error) {
        if (error.code === "42P01") {
          const current = this.getLocalStorageFallback();
          const filtered = current.filter((s) => s.id !== id);
          this.saveLocalStorageFallback(filtered);
          return true;
        }
        return false;
      }

      return true;
    } catch (err) {
      console.warn("StreamingSessionRepository.delete error, using local fallback:", err);
      const current = this.getLocalStorageFallback();
      const filtered = current.filter((s) => s.id !== id);
      this.saveLocalStorageFallback(filtered);
      return true;
    }
  }

  private mapToEntity(data: any): StreamingSession {
    return {
      id: data.id,
      organizationId: data.organization_id,
      operatorId: data.operator_id,
      eventId: data.event_id,
      status: data.status,
      startedAt: data.started_at,
      endedAt: data.ended_at,
      audienceCount: data.audience_count || 0,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapToDatabase(session: Omit<StreamingSession, "id" | "createdAt" | "updatedAt">): Record<string, any> {
    return {
      organization_id: session.organizationId,
      operator_id: session.operatorId,
      event_id: session.eventId,
      status: session.status,
      started_at: session.startedAt,
      ended_at: session.endedAt,
      audience_count: session.audienceCount,
    };
  }

  private mapToDatabasePartial(session: Partial<StreamingSession>): Record<string, any> {
    const payload: Record<string, any> = {};
    if (session.organizationId !== undefined) payload.organization_id = session.organizationId;
    if (session.operatorId !== undefined) payload.operator_id = session.operatorId;
    if (session.eventId !== undefined) payload.event_id = session.eventId;
    if (session.status !== undefined) payload.status = session.status;
    if (session.startedAt !== undefined) payload.started_at = session.startedAt;
    if (session.endedAt !== undefined) payload.ended_at = session.endedAt;
    if (session.audienceCount !== undefined) payload.audience_count = session.audienceCount;
    return payload;
  }
}
