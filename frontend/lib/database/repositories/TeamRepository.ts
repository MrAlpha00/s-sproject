import { SupabaseClient } from "@supabase/supabase-js";

export type UserRole = "OWNER" | "ADMIN" | "EVENT_MANAGER" | "OPERATOR" | "VIEWER";
export type MemberStatus = "active" | "deactivated" | "invited";

export interface TeamMember {
  id: string;
  organizationId: string;
  userId: string;
  role: UserRole;
  status: MemberStatus;
  invitedBy: string | null;
  joinedAt: string;
  createdAt: string;
  // profile hydration properties
  email?: string;
  fullName?: string;
}

const fallbackMembers: TeamMember[] = [
  {
    id: "mem-01",
    organizationId: "org-aether-main",
    userId: "usr-owner-01",
    role: "OWNER",
    status: "active",
    invitedBy: null,
    joinedAt: "2026-07-01T00:00:00Z",
    createdAt: "2026-07-01T00:00:00Z",
    email: "owner@aethervox.io",
    fullName: "Alex Rivera"
  },
  {
    id: "mem-02",
    organizationId: "org-aether-main",
    userId: "usr-admin-01",
    role: "ADMIN",
    status: "active",
    invitedBy: "usr-owner-01",
    joinedAt: "2026-07-03T10:00:00Z",
    createdAt: "2026-07-03T10:00:00Z",
    email: "sarah.admin@aethervox.io",
    fullName: "Sarah Chen"
  },
  {
    id: "mem-03",
    organizationId: "org-aether-main",
    userId: "usr-operator-01",
    role: "OPERATOR",
    status: "active",
    invitedBy: "usr-admin-01",
    joinedAt: "2026-07-05T14:30:00Z",
    createdAt: "2026-07-05T14:30:00Z",
    email: "operator.dave@aethervox.io",
    fullName: "David Kross"
  }
];

export class TeamRepository {
  constructor(private supabase: SupabaseClient) {}

  private isLocalStorageAvailable(): boolean {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
  }

  private getFallback(): TeamMember[] {
    if (!this.isLocalStorageAvailable()) return fallbackMembers;
    const cached = localStorage.getItem("aethervox_fallback_team_members");
    return cached ? JSON.parse(cached) : fallbackMembers;
  }

  private saveFallback(list: TeamMember[]) {
    if (this.isLocalStorageAvailable()) {
      localStorage.setItem("aethervox_fallback_team_members", JSON.stringify(list));
    }
  }

  async findByOrganizationId(organizationId: string): Promise<TeamMember[]> {
    try {
      const { data, error } = await this.supabase
        .from("team_members")
        .select("*")
        .eq("organization_id", organizationId);

      if (error) {
        if (error.code === "42P01") {
          return this.getFallback().filter((m) => m.organizationId === organizationId);
        }
        return [];
      }

      // Hydrate profiles if possible
      const hydrated = await Promise.all(
        data.map(async (m) => {
          const entity = this.mapToEntity(m);
          try {
            const { data: profile } = await this.supabase
              .from("profiles")
              .select("email, full_name")
              .eq("id", m.user_id)
              .maybeSingle();

            if (profile) {
              entity.email = profile.email;
              entity.fullName = profile.full_name;
            }
          } catch (e) {}
          return entity;
        })
      );

      return hydrated;
    } catch (err) {
      console.warn("TeamRepository.findByOrganizationId failed, using fallback:", err);
      return this.getFallback().filter((m) => m.organizationId === organizationId);
    }
  }

  async findByUserIdAndOrg(userId: string, organizationId: string): Promise<TeamMember | null> {
    try {
      const { data, error } = await this.supabase
        .from("team_members")
        .select("*")
        .eq("user_id", userId)
        .eq("organization_id", organizationId)
        .maybeSingle();

      if (error) {
        if (error.code === "42P01") {
          return this.getFallback().find((m) => m.userId === userId && m.organizationId === organizationId) || null;
        }
        return null;
      }

      return data ? this.mapToEntity(data) : null;
    } catch (err) {
      console.warn("TeamRepository.findByUserIdAndOrg failed, using fallback:", err);
      return this.getFallback().find((m) => m.userId === userId && m.organizationId === organizationId) || null;
    }
  }

  async create(member: Omit<TeamMember, "id" | "joinedAt" | "createdAt">): Promise<TeamMember> {
    const payload = this.mapToDatabase(member);
    const now = new Date().toISOString();
    payload.joined_at = now;
    payload.created_at = now;

    try {
      const { data, error } = await this.supabase
        .from("team_members")
        .insert(payload)
        .select()
        .single();

      if (error) {
        if (error.code === "42P01") {
          const created: TeamMember = {
            ...member,
            id: `mem-${Math.random().toString(36).substring(2, 9)}`,
            joinedAt: now,
            createdAt: now,
            fullName: "New Team Member",
            email: "invited-member@aethervox.io"
          };
          const list = this.getFallback();
          list.push(created);
          this.saveFallback(list);
          return created;
        }
        throw error;
      }

      return this.mapToEntity(data);
    } catch (err) {
      console.warn("TeamRepository.create failed, using fallback:", err);
      const created: TeamMember = {
        ...member,
        id: `mem-${Math.random().toString(36).substring(2, 9)}`,
        joinedAt: now,
        createdAt: now,
        fullName: "New Team Member",
        email: "invited-member@aethervox.io"
      };
      const list = this.getFallback();
      list.push(created);
      this.saveFallback(list);
      return created;
    }
  }

  async update(id: string, member: Partial<TeamMember>): Promise<TeamMember> {
    const payload = this.mapToDatabasePartial(member);

    try {
      const { data, error } = await this.supabase
        .from("team_members")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        if (error.code === "42P01") {
          const list = this.getFallback();
          const index = list.findIndex((m) => m.id === id);
          if (index !== -1) {
            list[index] = { ...list[index], ...member } as TeamMember;
            this.saveFallback(list);
            return list[index];
          }
        }
        throw error;
      }

      return this.mapToEntity(data);
    } catch (err) {
      console.warn("TeamRepository.update failed, using fallback:", err);
      const list = this.getFallback();
      const index = list.findIndex((m) => m.id === id);
      if (index !== -1) {
        list[index] = { ...list[index], ...member } as TeamMember;
        this.saveFallback(list);
        return list[index];
      }
      throw err;
    }
  }

  async remove(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("team_members")
        .delete()
        .eq("id", id);

      if (error) {
        if (error.code === "42P01") {
          const list = this.getFallback();
          const filtered = list.filter((m) => m.id !== id);
          this.saveFallback(filtered);
          return true;
        }
        return false;
      }
      return true;
    } catch (err) {
      console.warn("TeamRepository.remove failed, updating fallback:", err);
      const list = this.getFallback();
      const filtered = list.filter((m) => m.id !== id);
      this.saveFallback(filtered);
      return true;
    }
  }

  private mapToEntity(data: any): TeamMember {
    return {
      id: data.id,
      organizationId: data.organization_id,
      userId: data.user_id,
      role: data.role as UserRole,
      status: data.status as MemberStatus,
      invitedBy: data.invited_by,
      joinedAt: data.joined_at,
      createdAt: data.created_at,
    };
  }

  private mapToDatabase(m: Omit<TeamMember, "id" | "joinedAt" | "createdAt">): Record<string, any> {
    return {
      organization_id: m.organizationId,
      user_id: m.userId,
      role: m.role,
      status: m.status,
      invited_by: m.invitedBy,
    };
  }

  private mapToDatabasePartial(m: Partial<TeamMember>): Record<string, any> {
    const payload: Record<string, any> = {};
    if (m.role !== undefined) payload.role = m.role;
    if (m.status !== undefined) payload.status = m.status;
    if (m.invitedBy !== undefined) payload.invited_by = m.invitedBy;
    return payload;
  }
}
