import { SupabaseClient } from "@supabase/supabase-js";

export interface Subscription {
  id: string;
  organizationId: string;
  planId: string;
  billingCycle: "monthly" | "yearly";
  status: "active" | "trialing" | "past_due" | "canceled" | "unpaid";
  startsAt: string;
  expiresAt: string | null;
  nextBillingDate: string | null;
  autoRenew: boolean;
  createdAt: string;
  updatedAt: string;
}

const fallbackSubscription: Subscription = {
  id: "sub-starter-01",
  organizationId: "org-aether-main",
  planId: "plan-starter",
  billingCycle: "monthly",
  status: "active",
  startsAt: "2026-07-01T00:00:00Z",
  expiresAt: null,
  nextBillingDate: "2026-08-01T00:00:00Z",
  autoRenew: true,
  createdAt: "2026-07-01T00:00:00Z",
  updatedAt: "2026-07-01T00:00:00Z",
};

export class SubscriptionRepository {
  constructor(private supabase: SupabaseClient) {}

  private isLocalStorageAvailable(): boolean {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
  }

  private getFallback(): Subscription {
    if (!this.isLocalStorageAvailable()) return fallbackSubscription;
    const cached = localStorage.getItem("aethervox_fallback_subscription");
    return cached ? JSON.parse(cached) : fallbackSubscription;
  }

  private saveFallback(sub: Subscription) {
    if (this.isLocalStorageAvailable()) {
      localStorage.setItem("aethervox_fallback_subscription", JSON.stringify(sub));
    }
  }

  async findByOrganizationId(organizationId: string): Promise<Subscription | null> {
    try {
      const { data, error } = await this.supabase
        .from("subscriptions")
        .select("*")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false })
        .limit(1)
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
      console.warn("SubscriptionRepository.findByOrganizationId failed, using fallback:", err);
      const fallback = this.getFallback();
      return fallback.organizationId === organizationId ? fallback : null;
    }
  }

  async create(sub: Omit<Subscription, "id" | "createdAt" | "updatedAt">): Promise<Subscription> {
    const payload = this.mapToDatabase(sub);
    const now = new Date().toISOString();
    payload.created_at = now;
    payload.updated_at = now;

    try {
      const { data, error } = await this.supabase
        .from("subscriptions")
        .insert(payload)
        .select()
        .single();

      if (error) {
        if (error.code === "42P01") {
          const created: Subscription = {
            ...sub,
            id: `sub-${Math.random().toString(36).substring(2, 9)}`,
            createdAt: now,
            updatedAt: now,
          };
          this.saveFallback(created);
          return created;
        }
        throw error;
      }

      return this.mapToEntity(data);
    } catch (err) {
      console.warn("SubscriptionRepository.create failed, using fallback:", err);
      const created: Subscription = {
        ...sub,
        id: `sub-${Math.random().toString(36).substring(2, 9)}`,
        createdAt: now,
        updatedAt: now,
      };
      this.saveFallback(created);
      return created;
    }
  }

  async update(id: string, sub: Partial<Subscription>): Promise<Subscription> {
    const payload = this.mapToDatabasePartial(sub);
    const now = new Date().toISOString();
    payload.updated_at = now;

    try {
      const { data, error } = await this.supabase
        .from("subscriptions")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        if (error.code === "42P01") {
          const current = this.getFallback();
          const updated = {
            ...current,
            ...sub,
            updatedAt: now,
          } as Subscription;
          this.saveFallback(updated);
          return updated;
        }
        throw error;
      }

      return this.mapToEntity(data);
    } catch (err) {
      console.warn("SubscriptionRepository.update failed, using fallback:", err);
      const current = this.getFallback();
      const updated = {
        ...current,
        ...sub,
        updatedAt: now,
      } as Subscription;
      this.saveFallback(updated);
      return updated;
    }
  }

  private mapToEntity(data: any): Subscription {
    return {
      id: data.id,
      organizationId: data.organization_id,
      planId: data.plan_id,
      billingCycle: data.billing_cycle,
      status: data.status,
      startsAt: data.starts_at,
      expiresAt: data.expires_at,
      nextBillingDate: data.next_billing_date,
      autoRenew: data.auto_renew,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapToDatabase(sub: Omit<Subscription, "id" | "createdAt" | "updatedAt">): Record<string, any> {
    return {
      organization_id: sub.organizationId,
      plan_id: sub.planId,
      billing_cycle: sub.billingCycle,
      status: sub.status,
      starts_at: sub.startsAt,
      expires_at: sub.expiresAt,
      next_billing_date: sub.nextBillingDate,
      auto_renew: sub.autoRenew,
    };
  }

  private mapToDatabasePartial(sub: Partial<Subscription>): Record<string, any> {
    const payload: Record<string, any> = {};
    if (sub.planId !== undefined) payload.plan_id = sub.planId;
    if (sub.billingCycle !== undefined) payload.billing_cycle = sub.billingCycle;
    if (sub.status !== undefined) payload.status = sub.status;
    if (sub.startsAt !== undefined) payload.starts_at = sub.startsAt;
    if (sub.expiresAt !== undefined) payload.expires_at = sub.expiresAt;
    if (sub.nextBillingDate !== undefined) payload.next_billing_date = sub.nextBillingDate;
    if (sub.autoRenew !== undefined) payload.auto_renew = sub.autoRenew;
    return payload;
  }
}
