import { SupabaseClient } from "@supabase/supabase-js";

export interface UsageLimit {
  id: string;
  organizationId: string;
  currentEvents: number;
  translationMinutesUsed: number;
  charactersUsed: number;
  listenersUsed: number;
  storageUsed: number;
  teamMembersUsed: number;
  updatedAt: string;
}

const fallbackUsageLimit: UsageLimit = {
  id: "ul-starter-01",
  organizationId: "org-aether-main",
  currentEvents: 4,
  translationMinutesUsed: 92, // 92 / 120 Starter minutes used (~76%)
  charactersUsed: 198000, // 198,000 / 300,000 Starter characters used (~66%)
  listenersUsed: 42,
  storageUsed: 2147483648, // 2GB / 5GB used
  teamMembersUsed: 2, // 2 / 3 members used
  updatedAt: new Date().toISOString(),
};

export class UsageLimitRepository {
  constructor(private supabase: SupabaseClient) {}

  private isLocalStorageAvailable(): boolean {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
  }

  private getFallback(): UsageLimit {
    if (!this.isLocalStorageAvailable()) return fallbackUsageLimit;
    const cached = localStorage.getItem("aethervox_fallback_usage_limit");
    return cached ? JSON.parse(cached) : fallbackUsageLimit;
  }

  private saveFallback(ul: UsageLimit) {
    if (this.isLocalStorageAvailable()) {
      localStorage.setItem("aethervox_fallback_usage_limit", JSON.stringify(ul));
    }
  }

  async findByOrganizationId(organizationId: string): Promise<UsageLimit | null> {
    try {
      const { data, error } = await this.supabase
        .from("usage_limits")
        .select("*")
        .eq("organization_id", organizationId)
        .maybeSingle();

      if (error) {
        if (error.code === "42P01") {
          const fallback = this.getFallback();
          return fallback.organizationId === organizationId ? fallback : null;
        }
        return null;
      }

      return data ? this.mapToEntity(data) : null;
    } catch (err) {
      console.warn("UsageLimitRepository.findByOrganizationId failed, using fallback:", err);
      const fallback = this.getFallback();
      return fallback.organizationId === organizationId ? fallback : null;
    }
  }

  async create(ul: Omit<UsageLimit, "id" | "updatedAt">): Promise<UsageLimit> {
    const payload = this.mapToDatabase(ul);
    const now = new Date().toISOString();
    payload.updated_at = now;

    try {
      const { data, error } = await this.supabase
        .from("usage_limits")
        .insert(payload)
        .select()
        .single();

      if (error) {
        if (error.code === "42P01") {
          const created: UsageLimit = {
            ...ul,
            id: `ul-${Math.random().toString(36).substring(2, 9)}`,
            updatedAt: now,
          };
          this.saveFallback(created);
          return created;
        }
        throw error;
      }

      return this.mapToEntity(data);
    } catch (err) {
      console.warn("UsageLimitRepository.create failed, using fallback:", err);
      const created: UsageLimit = {
        ...ul,
        id: `ul-${Math.random().toString(36).substring(2, 9)}`,
        updatedAt: now,
      };
      this.saveFallback(created);
      return created;
    }
  }

  async update(id: string, ul: Partial<UsageLimit>): Promise<UsageLimit> {
    const payload = this.mapToDatabasePartial(ul);
    const now = new Date().toISOString();
    payload.updated_at = now;

    try {
      const { data, error } = await this.supabase
        .from("usage_limits")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        if (error.code === "42P01") {
          const current = this.getFallback();
          const updated = {
            ...current,
            ...ul,
            updatedAt: now,
          } as UsageLimit;
          this.saveFallback(updated);
          return updated;
        }
        throw error;
      }

      return this.mapToEntity(data);
    } catch (err) {
      console.warn("UsageLimitRepository.update failed, using fallback:", err);
      const current = this.getFallback();
      const updated = {
        ...current,
        ...ul,
        updatedAt: now,
      } as UsageLimit;
      this.saveFallback(updated);
      return updated;
    }
  }

  async incrementUsage(
    organizationId: string,
    field: "currentEvents" | "translationMinutesUsed" | "charactersUsed" | "listenersUsed" | "storageUsed" | "teamMembersUsed",
    amount: number
  ): Promise<UsageLimit> {
    try {
      // 1. Fetch current limit
      let current = await this.findByOrganizationId(organizationId);
      if (!current) {
        current = await this.create({
          organizationId,
          currentEvents: 0,
          translationMinutesUsed: 0,
          charactersUsed: 0,
          listenersUsed: 0,
          storageUsed: 0,
          teamMembersUsed: 0,
        });
      }

      const updatedVal = (current[field] || 0) + amount;
      return await this.update(current.id, { [field]: updatedVal });
    } catch (err) {
      console.warn("UsageLimitRepository.incrementUsage error, updating fallback:", err);
      const fallback = this.getFallback();
      fallback[field] = (fallback[field] || 0) + amount;
      fallback.updatedAt = new Date().toISOString();
      this.saveFallback(fallback);
      return fallback;
    }
  }

  private mapToEntity(data: any): UsageLimit {
    return {
      id: data.id,
      organizationId: data.organization_id,
      currentEvents: data.current_events,
      translationMinutesUsed: data.translation_minutes_used,
      charactersUsed: data.characters_used,
      listenersUsed: data.listeners_used,
      storageUsed: Number(data.storage_used),
      teamMembersUsed: data.team_members_used,
      updatedAt: data.updated_at,
    };
  }

  private mapToDatabase(ul: Omit<UsageLimit, "id" | "updatedAt">): Record<string, any> {
    return {
      organization_id: ul.organizationId,
      current_events: ul.currentEvents,
      translation_minutes_used: ul.translationMinutesUsed,
      characters_used: ul.charactersUsed,
      listeners_used: ul.listenersUsed,
      storage_used: ul.storageUsed,
      team_members_used: ul.teamMembersUsed,
    };
  }

  private mapToDatabasePartial(ul: Partial<UsageLimit>): Record<string, any> {
    const payload: Record<string, any> = {};
    if (ul.currentEvents !== undefined) payload.current_events = ul.currentEvents;
    if (ul.translationMinutesUsed !== undefined) payload.translation_minutes_used = ul.translationMinutesUsed;
    if (ul.charactersUsed !== undefined) payload.characters_used = ul.charactersUsed;
    if (ul.listenersUsed !== undefined) payload.listeners_used = ul.listenersUsed;
    if (ul.storageUsed !== undefined) payload.storage_used = ul.storageUsed;
    if (ul.teamMembersUsed !== undefined) payload.team_members_used = ul.teamMembersUsed;
    return payload;
  }
}
