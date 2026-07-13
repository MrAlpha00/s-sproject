import { SupabaseClient } from "@supabase/supabase-js";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  ownerId: string | null;
  subscriptionId: string | null;
  timezone: string;
  defaultLanguage: string;
  createdAt: string;
  updatedAt: string;
}

const fallbackOrg: Organization = {
  id: "org-aether-main",
  name: "AetherVOX Global",
  slug: "aethervox-global",
  logoUrl: "https://aethervox.io/assets/logo.png",
  ownerId: "usr-owner-01",
  subscriptionId: "sub-starter-01",
  timezone: "UTC",
  defaultLanguage: "en-US",
  createdAt: "2026-07-01T00:00:00Z",
  updatedAt: "2026-07-01T00:00:00Z",
};

export class OrganizationRepository {
  constructor(private supabase: SupabaseClient) {}

  private isLocalStorageAvailable(): boolean {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
  }

  private getFallback(): Organization {
    if (!this.isLocalStorageAvailable()) return fallbackOrg;
    const cached = localStorage.getItem("aethervox_fallback_organization");
    return cached ? JSON.parse(cached) : fallbackOrg;
  }

  private saveFallback(org: Organization) {
    if (this.isLocalStorageAvailable()) {
      localStorage.setItem("aethervox_fallback_organization", JSON.stringify(org));
    }
  }

  async findById(id: string): Promise<Organization | null> {
    try {
      const { data, error } = await this.supabase
        .from("organizations")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        if (error.code === "42P01") {
          const fallback = this.getFallback();
          return fallback.id === id ? fallback : null;
        }
        return null;
      }

      return data ? this.mapToEntity(data) : null;
    } catch (err) {
      console.warn("OrganizationRepository.findById failed, using fallback:", err);
      const fallback = this.getFallback();
      return fallback.id === id ? fallback : null;
    }
  }

  async update(id: string, org: Partial<Organization>): Promise<Organization> {
    const payload = this.mapToDatabasePartial(org);
    const now = new Date().toISOString();
    payload.updated_at = now;

    try {
      const { data, error } = await this.supabase
        .from("organizations")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        if (error.code === "42P01") {
          const current = this.getFallback();
          const updated = {
            ...current,
            ...org,
            updatedAt: now,
          } as Organization;
          this.saveFallback(updated);
          return updated;
        }
        throw error;
      }

      return this.mapToEntity(data);
    } catch (err) {
      console.warn("OrganizationRepository.update failed, using fallback:", err);
      const current = this.getFallback();
      const updated = {
        ...current,
        ...org,
        updatedAt: now,
      } as Organization;
      this.saveFallback(updated);
      return updated;
    }
  }

  private mapToEntity(data: any): Organization {
    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      logoUrl: data.logo_url,
      ownerId: data.owner_id,
      subscriptionId: data.subscription_id,
      timezone: data.timezone || "UTC",
      defaultLanguage: data.default_language || "en-US",
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapToDatabasePartial(org: Partial<Organization>): Record<string, any> {
    const payload: Record<string, any> = {};
    if (org.name !== undefined) payload.name = org.name;
    if (org.slug !== undefined) payload.slug = org.slug;
    if (org.logoUrl !== undefined) payload.logo_url = org.logoUrl;
    if (org.ownerId !== undefined) payload.owner_id = org.ownerId;
    if (org.subscriptionId !== undefined) payload.subscription_id = org.subscriptionId;
    if (org.timezone !== undefined) payload.timezone = org.timezone;
    if (org.defaultLanguage !== undefined) payload.default_language = org.defaultLanguage;
    return payload;
  }
}
