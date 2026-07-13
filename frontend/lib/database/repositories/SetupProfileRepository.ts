import { SupabaseClient } from "@supabase/supabase-js";
import { AudioSetupProfile } from "../types";

// In-memory fallback for server-side environments when DB table is not ready
const serverMemoryStore = new Map<string, any>();

export class SetupProfileRepository {
  constructor(private supabase: SupabaseClient) {}

  private isLocalStorageAvailable(): boolean {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
  }

  private getLocalStorageFallback(): AudioSetupProfile[] {
    if (!this.isLocalStorageAvailable()) {
      return Array.from(serverMemoryStore.values());
    }
    const data = localStorage.getItem("aethervox_fallback_audio_setup_profiles");
    return data ? JSON.parse(data) : [];
  }

  private saveLocalStorageFallback(profiles: AudioSetupProfile[]) {
    if (this.isLocalStorageAvailable()) {
      localStorage.setItem("aethervox_fallback_audio_setup_profiles", JSON.stringify(profiles));
    } else {
      serverMemoryStore.clear();
      profiles.forEach((p) => serverMemoryStore.set(p.id, p));
    }
  }

  async findById(id: string): Promise<AudioSetupProfile | null> {
    try {
      const { data, error } = await this.supabase
        .from("audio_setup_profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        // Fall back if table doesn't exist (42P01) or other database errors
        if (error.code === "42P01") {
          console.warn("audio_setup_profiles table not found in Supabase. Falling back to local storage.");
          const local = this.getLocalStorageFallback().find((p) => p.id === id);
          return local || null;
        }
        return null;
      }

      return this.mapToEntity(data);
    } catch (err) {
      console.warn("SetupProfileRepository.findById query error, using local fallback:", err);
      const local = this.getLocalStorageFallback().find((p) => p.id === id);
      return local || null;
    }
  }

  async findAll(organizationId?: string): Promise<AudioSetupProfile[]> {
    try {
      let query = this.supabase.from("audio_setup_profiles").select("*");
      if (organizationId) {
        query = query.eq("organization_id", organizationId);
      }

      const { data, error } = await query;

      if (error) {
        if (error.code === "42P01") {
          console.warn("audio_setup_profiles table not found in Supabase. Falling back to local storage.");
          return this.getLocalStorageFallback();
        }
        return [];
      }

      return data.map((item) => this.mapToEntity(item));
    } catch (err) {
      console.warn("SetupProfileRepository.findAll query error, using local fallback:", err);
      return this.getLocalStorageFallback();
    }
  }

  async create(profile: Omit<AudioSetupProfile, "id" | "createdAt" | "updatedAt">): Promise<AudioSetupProfile> {
    const payload = this.mapToDatabase(profile);
    const now = new Date().toISOString();
    payload.created_at = now;
    payload.updated_at = now;

    try {
      const { data, error } = await this.supabase
        .from("audio_setup_profiles")
        .insert(payload)
        .select()
        .single();

      if (error) {
        if (error.code === "42P01") {
          console.warn("audio_setup_profiles table not found in Supabase. Creating in local storage.");
          const newLocalProfile: AudioSetupProfile = {
            ...profile,
            id: `profile-${Math.random().toString(36).substring(2, 9)}`,
            createdAt: now,
            updatedAt: now,
          };
          const current = this.getLocalStorageFallback();
          current.push(newLocalProfile);
          this.saveLocalStorageFallback(current);
          return newLocalProfile;
        }
        throw error;
      }

      return this.mapToEntity(data);
    } catch (err) {
      console.warn("SetupProfileRepository.create query error, fallback to local storage:", err);
      const newLocalProfile: AudioSetupProfile = {
        ...profile,
        id: `profile-${Math.random().toString(36).substring(2, 9)}`,
        createdAt: now,
        updatedAt: now,
      };
      const current = this.getLocalStorageFallback();
      current.push(newLocalProfile);
      this.saveLocalStorageFallback(current);
      return newLocalProfile;
    }
  }

  async update(id: string, profile: Partial<AudioSetupProfile>): Promise<AudioSetupProfile> {
    const payload = this.mapToDatabasePartial(profile);
    const now = new Date().toISOString();
    payload.updated_at = now;

    try {
      const { data, error } = await this.supabase
        .from("audio_setup_profiles")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        if (error.code === "42P01") {
          console.warn("audio_setup_profiles table not found in Supabase. Updating in local storage.");
          const current = this.getLocalStorageFallback();
          const index = current.findIndex((p) => p.id === id);
          if (index === -1) throw new Error("Profile not found in local storage");
          const updated = {
            ...current[index],
            ...profile,
            updatedAt: now,
          } as AudioSetupProfile;
          current[index] = updated;
          this.saveLocalStorageFallback(current);
          return updated;
        }
        throw error;
      }

      return this.mapToEntity(data);
    } catch (err) {
      console.warn("SetupProfileRepository.update query error, fallback to local storage:", err);
      const current = this.getLocalStorageFallback();
      const index = current.findIndex((p) => p.id === id);
      if (index === -1) throw new Error("Profile not found in local storage fallback");
      const updated = {
        ...current[index],
        ...profile,
        updatedAt: now,
      } as AudioSetupProfile;
      current[index] = updated;
      this.saveLocalStorageFallback(current);
      return updated;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("audio_setup_profiles")
        .delete()
        .eq("id", id);

      if (error) {
        if (error.code === "42P01") {
          console.warn("audio_setup_profiles table not found in Supabase. Deleting from local storage.");
          const current = this.getLocalStorageFallback();
          const filtered = current.filter((p) => p.id !== id);
          this.saveLocalStorageFallback(filtered);
          return true;
        }
        return false;
      }

      return true;
    } catch (err) {
      console.warn("SetupProfileRepository.delete query error, fallback to local storage:", err);
      const current = this.getLocalStorageFallback();
      const filtered = current.filter((p) => p.id !== id);
      this.saveLocalStorageFallback(filtered);
      return true;
    }
  }

  private mapToEntity(data: any): AudioSetupProfile {
    return {
      id: data.id,
      organizationId: data.organization_id,
      profileName: data.profile_name,
      inputDevice: data.input_device,
      outputDevice: data.output_device,
      sourceLanguage: data.source_language,
      targetLanguages: data.target_languages || [],
      voiceSelection: data.voice_selection || {},
      azureRegion: data.azure_region,
      audioSettings: data.audio_settings || {},
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by,
      updatedBy: data.updated_by,
    };
  }

  private mapToDatabase(profile: Omit<AudioSetupProfile, "id" | "createdAt" | "updatedAt">): Record<string, any> {
    return {
      organization_id: profile.organizationId,
      profile_name: profile.profileName,
      input_device: profile.inputDevice,
      output_device: profile.outputDevice,
      source_language: profile.sourceLanguage,
      target_languages: profile.targetLanguages,
      voice_selection: profile.voiceSelection,
      azure_region: profile.azureRegion,
      audio_settings: profile.audioSettings,
      created_by: profile.createdBy,
      updated_by: profile.updatedBy,
    };
  }

  private mapToDatabasePartial(profile: Partial<AudioSetupProfile>): Record<string, any> {
    const payload: Record<string, any> = {};
    if (profile.organizationId !== undefined) payload.organization_id = profile.organizationId;
    if (profile.profileName !== undefined) payload.profile_name = profile.profileName;
    if (profile.inputDevice !== undefined) payload.input_device = profile.inputDevice;
    if (profile.outputDevice !== undefined) payload.output_device = profile.outputDevice;
    if (profile.sourceLanguage !== undefined) payload.source_language = profile.sourceLanguage;
    if (profile.targetLanguages !== undefined) payload.target_languages = profile.targetLanguages;
    if (profile.voiceSelection !== undefined) payload.voice_selection = profile.voiceSelection;
    if (profile.azureRegion !== undefined) payload.azure_region = profile.azureRegion;
    if (profile.audioSettings !== undefined) payload.audio_settings = profile.audioSettings;
    if (profile.updatedBy !== undefined) payload.updated_by = profile.updatedBy;
    return payload;
  }
}
