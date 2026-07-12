import { SupabaseClient } from "@supabase/supabase-js";
import { AzureSettingsMetadata } from "../types";

export class AzureSettingsRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: string): Promise<AzureSettingsMetadata | null> {
    const { data, error } = await this.supabase
      .from("azure_settings")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return null;

    return this.mapToEntity(data);
  }

  async findByOrganization(organizationId: string): Promise<AzureSettingsMetadata | null> {
    const { data, error } = await this.supabase
      .from("azure_settings")
      .select("*")
      .eq("organization_id", organizationId)
      .maybeSingle();

    if (error || !data) return null;

    return this.mapToEntity(data);
  }

  async create(settings: Omit<AzureSettingsMetadata, "id" | "createdAt" | "updatedAt">): Promise<AzureSettingsMetadata> {
    const { data, error } = await this.supabase
      .from("azure_settings")
      .insert({
        organization_id: settings.organizationId,
        speech_region: settings.speechRegion,
        translator_region: settings.translatorRegion,
        enabled: settings.enabled,
        last_checked: settings.lastChecked,
        connection_status: settings.connectionStatus,
        created_by: settings.createdBy,
        updated_by: settings.updatedBy,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return this.mapToEntity(data);
  }

  async update(id: string, settings: Partial<AzureSettingsMetadata>): Promise<AzureSettingsMetadata> {
    const updatePayload: Record<string, any> = {};
    if (settings.organizationId !== undefined) updatePayload.organization_id = settings.organizationId;
    if (settings.speechRegion !== undefined) updatePayload.speech_region = settings.speechRegion;
    if (settings.translatorRegion !== undefined) updatePayload.translator_region = settings.translatorRegion;
    if (settings.enabled !== undefined) updatePayload.enabled = settings.enabled;
    if (settings.lastChecked !== undefined) updatePayload.last_checked = settings.lastChecked;
    if (settings.connectionStatus !== undefined) updatePayload.connection_status = settings.connectionStatus;
    if (settings.updatedBy !== undefined) updatePayload.updated_by = settings.updatedBy;
    updatePayload.updated_at = new Date().toISOString();

    const { data, error } = await this.supabase
      .from("azure_settings")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return this.mapToEntity(data);
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from("azure_settings")
      .delete()
      .eq("id", id);

    return !error;
  }

  private mapToEntity(data: any): AzureSettingsMetadata {
    return {
      id: data.id,
      organizationId: data.organization_id,
      speechRegion: data.speech_region,
      translatorRegion: data.translator_region,
      enabled: data.enabled,
      lastChecked: data.last_checked,
      connectionStatus: data.connection_status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by || "",
      updatedBy: data.updated_by || "",
    };
  }
}
