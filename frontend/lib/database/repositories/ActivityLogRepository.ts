import { SupabaseClient } from "@supabase/supabase-js";

export interface ActivityLog {
  id: string;
  organizationId: string;
  userId: string;
  action: string;
  entity: string;
  metadata: Record<string, any>;
  createdAt: string;
  // profile hydration property
  fullName?: string;
}

const fallbackLogs: ActivityLog[] = [
  {
    id: "log-001",
    organizationId: "org-aether-main",
    userId: "usr-owner-01",
    action: "Login",
    entity: "Session",
    metadata: { ip: "192.168.1.1", browser: "Chrome" },
    createdAt: new Date(Date.now() - 3600 * 1000).toISOString(), // 1 hour ago
    fullName: "Alex Rivera"
  },
  {
    id: "log-002",
    organizationId: "org-aether-main",
    userId: "usr-admin-01",
    action: "Invite Member",
    entity: "Team",
    metadata: { email: "designer.jane@aethervox.io", role: "EVENT_MANAGER" },
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), // 2 hours ago
    fullName: "Sarah Chen"
  },
  {
    id: "log-003",
    organizationId: "org-aether-main",
    userId: "usr-owner-01",
    action: "Billing Change",
    entity: "Subscription",
    metadata: { newPlan: "Starter", monthlyPrice: 29.00 },
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), // 1 day ago
    fullName: "Alex Rivera"
  }
];

export class ActivityLogRepository {
  constructor(private supabase: SupabaseClient) {}

  private isLocalStorageAvailable(): boolean {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
  }

  private getFallback(): ActivityLog[] {
    if (!this.isLocalStorageAvailable()) return fallbackLogs;
    const cached = localStorage.getItem("aethervox_fallback_activity_logs");
    return cached ? JSON.parse(cached) : fallbackLogs;
  }

  private saveFallback(list: ActivityLog[]) {
    if (this.isLocalStorageAvailable()) {
      localStorage.setItem("aethervox_fallback_activity_logs", JSON.stringify(list));
    }
  }

  async findAll(organizationId: string): Promise<ActivityLog[]> {
    try {
      const { data, error } = await this.supabase
        .from("activity_logs")
        .select("*")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false });

      if (error) {
        if (error.code === "42P01") {
          return this.getFallback().filter((l) => l.organizationId === organizationId);
        }
        return [];
      }

      // Hydrate profile names
      const hydrated = await Promise.all(
        data.map(async (l) => {
          const entity = this.mapToEntity(l);
          try {
            const { data: profile } = await this.supabase
              .from("profiles")
              .select("full_name")
              .eq("id", l.user_id)
              .maybeSingle();

            if (profile) {
              entity.fullName = profile.full_name;
            }
          } catch (e) {}
          return entity;
        })
      );

      return hydrated;
    } catch (err) {
      console.warn("ActivityLogRepository.findAll failed, using fallback:", err);
      return this.getFallback().filter((l) => l.organizationId === organizationId);
    }
  }

  async log(logItem: Omit<ActivityLog, "id" | "createdAt">): Promise<ActivityLog> {
    const payload = this.mapToDatabase(logItem);
    const now = new Date().toISOString();
    payload.created_at = now;

    try {
      const { data, error } = await this.supabase
        .from("activity_logs")
        .insert(payload)
        .select()
        .single();

      if (error) {
        if (error.code === "42P01") {
          const created: ActivityLog = {
            ...logItem,
            id: `log-${Math.random().toString(36).substring(2, 9)}`,
            createdAt: now,
            fullName: logItem.userId === "usr-owner-01" ? "Alex Rivera" : "Sarah Chen"
          };
          const list = this.getFallback();
          list.unshift(created);
          this.saveFallback(list);
          return created;
        }
        throw error;
      }

      return this.mapToEntity(data);
    } catch (err) {
      console.warn("ActivityLogRepository.log failed, writing to fallback:", err);
      const created: ActivityLog = {
        ...logItem,
        id: `log-${Math.random().toString(36).substring(2, 9)}`,
        createdAt: now,
        fullName: logItem.userId === "usr-owner-01" ? "Alex Rivera" : "Sarah Chen"
      };
      const list = this.getFallback();
      list.unshift(created);
      this.saveFallback(list);
      return created;
    }
  }

  private mapToEntity(data: any): ActivityLog {
    return {
      id: data.id,
      organizationId: data.organization_id,
      userId: data.user_id,
      action: data.action,
      entity: data.entity,
      metadata: data.metadata || {},
      createdAt: data.created_at,
    };
  }

  private mapToDatabase(l: Omit<ActivityLog, "id" | "createdAt">): Record<string, any> {
    return {
      organization_id: l.organizationId,
      user_id: l.userId,
      action: l.action,
      entity: l.entity,
      metadata: l.metadata,
    };
  }
}
