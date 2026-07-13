import { SupabaseClient } from "@supabase/supabase-js";
import { UserRole } from "./TeamRepository";

export interface Invitation {
  id: string;
  organizationId: string;
  email: string;
  role: UserRole;
  token: string;
  expiresAt: string;
  acceptedAt: string | null;
  invitedBy: string;
  createdAt: string;
}

const fallbackInvitations: Invitation[] = [
  {
    id: "inv-001",
    organizationId: "org-aether-main",
    email: "designer.jane@aethervox.io",
    role: "EVENT_MANAGER",
    token: "mock_token_jane_123",
    expiresAt: new Date(Date.now() + 48 * 3600 * 1000).toISOString(), // expires in 48 hours
    acceptedAt: null,
    invitedBy: "usr-admin-01",
    createdAt: new Date().toISOString(),
  }
];

export class InvitationRepository {
  constructor(private supabase: SupabaseClient) {}

  private isLocalStorageAvailable(): boolean {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
  }

  private getFallback(): Invitation[] {
    if (!this.isLocalStorageAvailable()) return fallbackInvitations;
    const cached = localStorage.getItem("aethervox_fallback_invitations");
    return cached ? JSON.parse(cached) : fallbackInvitations;
  }

  private saveFallback(list: Invitation[]) {
    if (this.isLocalStorageAvailable()) {
      localStorage.setItem("aethervox_fallback_invitations", JSON.stringify(list));
    }
  }

  async findByOrganizationId(organizationId: string): Promise<Invitation[]> {
    try {
      const { data, error } = await this.supabase
        .from("invitations")
        .select("*")
        .eq("organization_id", organizationId)
        .is("accepted_at", null);

      if (error) {
        if (error.code === "42P01") {
          return this.getFallback().filter((i) => i.organizationId === organizationId && !i.acceptedAt);
        }
        return [];
      }

      return data.map(this.mapToEntity);
    } catch (err) {
      console.warn("InvitationRepository.findByOrganizationId failed, using fallback:", err);
      return this.getFallback().filter((i) => i.organizationId === organizationId && !i.acceptedAt);
    }
  }

  async findByToken(token: string): Promise<Invitation | null> {
    try {
      const { data, error } = await this.supabase
        .from("invitations")
        .select("*")
        .eq("token", token)
        .maybeSingle();

      if (error) {
        if (error.code === "42P01") {
          return this.getFallback().find((i) => i.token === token) || null;
        }
        return null;
      }

      return data ? this.mapToEntity(data) : null;
    } catch (err) {
      console.warn("InvitationRepository.findByToken failed, using fallback:", err);
      return this.getFallback().find((i) => i.token === token) || null;
    }
  }

  async create(inv: Omit<Invitation, "id" | "createdAt" | "acceptedAt">): Promise<Invitation> {
    const payload = this.mapToDatabase(inv);
    const now = new Date().toISOString();
    payload.created_at = now;

    try {
      const { data, error } = await this.supabase
        .from("invitations")
        .insert(payload)
        .select()
        .single();

      if (error) {
        if (error.code === "42P01") {
          const created: Invitation = {
            ...inv,
            id: `inv-${Math.random().toString(36).substring(2, 9)}`,
            acceptedAt: null,
            createdAt: now,
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
      console.warn("InvitationRepository.create failed, using fallback:", err);
      const created: Invitation = {
        ...inv,
        id: `inv-${Math.random().toString(36).substring(2, 9)}`,
        acceptedAt: null,
        createdAt: now,
      };
      const list = this.getFallback();
      list.push(created);
      this.saveFallback(list);
      return created;
    }
  }

  async accept(token: string): Promise<boolean> {
    const now = new Date().toISOString();
    try {
      const { error } = await this.supabase
        .from("invitations")
        .update({ accepted_at: now })
        .eq("token", token);

      if (error) {
        if (error.code === "42P01") {
          const list = this.getFallback();
          const index = list.findIndex((i) => i.token === token);
          if (index !== -1) {
            list[index].acceptedAt = now;
            this.saveFallback(list);
            return true;
          }
        }
        return false;
      }
      return true;
    } catch (err) {
      console.warn("InvitationRepository.accept failed, using fallback:", err);
      const list = this.getFallback();
      const index = list.findIndex((i) => i.token === token);
      if (index !== -1) {
        list[index].acceptedAt = now;
        this.saveFallback(list);
        return true;
      }
      return false;
    }
  }

  async remove(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("invitations")
        .delete()
        .eq("id", id);

      if (error) {
        if (error.code === "42P01") {
          const list = this.getFallback();
          const filtered = list.filter((i) => i.id !== id);
          this.saveFallback(filtered);
          return true;
        }
        return false;
      }
      return true;
    } catch (err) {
      console.warn("InvitationRepository.remove failed, updating fallback:", err);
      const list = this.getFallback();
      const filtered = list.filter((i) => i.id !== id);
      this.saveFallback(filtered);
      return true;
    }
  }

  private mapToEntity(data: any): Invitation {
    return {
      id: data.id,
      organizationId: data.organization_id,
      email: data.email,
      role: data.role as UserRole,
      token: data.token,
      expiresAt: data.expires_at,
      acceptedAt: data.accepted_at,
      invitedBy: data.invited_by,
      createdAt: data.created_at,
    };
  }

  private mapToDatabase(inv: Omit<Invitation, "id" | "createdAt" | "acceptedAt">): Record<string, any> {
    return {
      organization_id: inv.organizationId,
      email: inv.email,
      role: inv.role,
      token: inv.token,
      expires_at: inv.expiresAt,
      invited_by: inv.invitedBy,
    };
  }
}
