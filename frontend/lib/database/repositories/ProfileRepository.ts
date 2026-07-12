import { SupabaseClient } from "@supabase/supabase-js";
import { Profile } from "../types";

export class ProfileRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: string): Promise<Profile | null> {
    const { data, error } = await this.supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      email: data.email || "",
      fullName: data.full_name || "",
      avatarUrl: data.avatar_url || "",
      organizationId: data.organization_id || "",
      role: data.role || "VIEWER",
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by || "",
      updatedBy: data.updated_by || "",
    };
  }

  async update(id: string, profile: Partial<Profile>): Promise<Profile> {
    const updatePayload: Record<string, any> = {};
    if (profile.fullName !== undefined) updatePayload.full_name = profile.fullName;
    if (profile.avatarUrl !== undefined) updatePayload.avatar_url = profile.avatarUrl;
    if (profile.organizationId !== undefined) updatePayload.organization_id = profile.organizationId;
    if (profile.role !== undefined) updatePayload.role = profile.role;
    if (profile.updatedBy !== undefined) updatePayload.updated_by = profile.updatedBy;
    updatePayload.updated_at = new Date().toISOString();

    const { data, error } = await this.supabase
      .from("profiles")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      email: data.email || "",
      fullName: data.full_name || "",
      avatarUrl: data.avatar_url || "",
      organizationId: data.organization_id || "",
      role: data.role || "VIEWER",
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by || "",
      updatedBy: data.updated_by || "",
    };
  }

  async create(profile: Omit<Profile, "createdAt" | "updatedAt">): Promise<Profile> {
    const { data, error } = await this.supabase
      .from("profiles")
      .insert({
        id: profile.id,
        email: profile.email,
        full_name: profile.fullName,
        avatar_url: profile.avatarUrl,
        organization_id: profile.organizationId,
        role: profile.role,
        created_by: profile.createdBy,
        updated_by: profile.updatedBy,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      email: data.email || "",
      fullName: data.full_name || "",
      avatarUrl: data.avatar_url || "",
      organizationId: data.organization_id || "",
      role: data.role || "VIEWER",
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by || "",
      updatedBy: data.updated_by || "",
    };
  }
}
