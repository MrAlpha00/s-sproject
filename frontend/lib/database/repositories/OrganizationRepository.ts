import { SupabaseClient } from "@supabase/supabase-js";
import { Organization } from "../types";

export class OrganizationRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: string): Promise<Organization | null> {
    const { data, error } = await this.supabase
      .from("organizations")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      settings: data.settings || {},
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by,
      updatedBy: data.updated_by,
    };
  }

  async findAll(): Promise<Organization[]> {
    const { data, error } = await this.supabase
      .from("organizations")
      .select("*");

    if (error || !data) return [];

    return data.map((item) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      settings: item.settings || {},
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      createdBy: item.created_by,
      updatedBy: item.updated_by,
    }));
  }

  async create(org: Omit<Organization, "id" | "createdAt" | "updatedAt">): Promise<Organization> {
    const { data, error } = await this.supabase
      .from("organizations")
      .insert({
        name: org.name,
        slug: org.slug,
        settings: org.settings,
        created_by: org.createdBy,
        updated_by: org.updatedBy,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      settings: data.settings || {},
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by,
      updatedBy: data.updated_by,
    };
  }

  async update(id: string, org: Partial<Organization>): Promise<Organization> {
    const updatePayload: Record<string, any> = {};
    if (org.name !== undefined) updatePayload.name = org.name;
    if (org.slug !== undefined) updatePayload.slug = org.slug;
    if (org.settings !== undefined) updatePayload.settings = org.settings;
    if (org.updatedBy !== undefined) updatePayload.updated_by = org.updatedBy;
    updatePayload.updated_at = new Date().toISOString();

    const { data, error } = await this.supabase
      .from("organizations")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      settings: data.settings || {},
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by,
      updatedBy: data.updated_by,
    };
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from("organizations")
      .delete()
      .eq("id", id);

    return !error;
  }
}
