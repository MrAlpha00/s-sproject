import { SupabaseClient } from "@supabase/supabase-js";
import { SavedVoiceProfile } from "../types";

const serverMemoryStore = new Map<string, any>();

export class VoiceProfileRepository {
  constructor(private supabase: SupabaseClient) {}

  private isLocalStorageAvailable(): boolean {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
  }

  private getLocalStorageFallback(): SavedVoiceProfile[] {
    if (!this.isLocalStorageAvailable()) {
      return Array.from(serverMemoryStore.values());
    }
    const data = localStorage.getItem("aethervox_fallback_saved_voice_profiles");
    return data ? JSON.parse(data) : [];
  }

  private saveLocalStorageFallback(profiles: SavedVoiceProfile[]) {
    if (this.isLocalStorageAvailable()) {
      localStorage.setItem("aethervox_fallback_saved_voice_profiles", JSON.stringify(profiles));
    } else {
      serverMemoryStore.clear();
      profiles.forEach((p) => serverMemoryStore.set(p.id, p));
    }
  }

  async findById(id: string): Promise<SavedVoiceProfile | null> {
    try {
      const { data, error } = await this.supabase
        .from("voice_profiles")
        .select("*")
        .eq("id", id)
        .not("profile_name", "is", null)
        .single();

      if (error) {
        if (error.code === "42P01" || error.code === "PGRST116") {
          const local = this.getLocalStorageFallback().find((p) => p.id === id);
          return local || null;
        }
        return null;
      }

      return this.mapToEntity(data);
    } catch (err) {
      console.warn("VoiceProfileRepository.findById error, using fallback:", err);
      const local = this.getLocalStorageFallback().find((p) => p.id === id);
      return local || null;
    }
  }

  async findAll(organizationId?: string): Promise<SavedVoiceProfile[]> {
    try {
      let query = this.supabase
        .from("voice_profiles")
        .select("*")
        .not("profile_name", "is", null);

      if (organizationId) {
        query = query.eq("organization_id", organizationId);
      }

      const { data, error } = await query;

      if (error) {
        if (error.code === "42P01") {
          let list = this.getLocalStorageFallback();
          if (organizationId) {
            list = list.filter((p) => p.organizationId === organizationId);
          }
          return list;
        }
        return [];
      }

      return data.map((item) => this.mapToEntity(item));
    } catch (err) {
      console.warn("VoiceProfileRepository.findAll error, using fallback:", err);
      let list = this.getLocalStorageFallback();
      if (organizationId) {
        list = list.filter((p) => p.organizationId === organizationId);
      }
      return list;
    }
  }

  async findDefault(organizationId: string): Promise<SavedVoiceProfile | null> {
    try {
      const { data, error } = await this.supabase
        .from("voice_profiles")
        .select("*")
        .eq("organization_id", organizationId)
        .eq("is_default", true)
        .not("profile_name", "is", null)
        .maybeSingle();

      if (error) {
        if (error.code === "42P01") {
          const local = this.getLocalStorageFallback().find(
            (p) => p.organizationId === organizationId && p.isDefault
          );
          return local || null;
        }
        return null;
      }

      return data ? this.mapToEntity(data) : null;
    } catch (err) {
      console.warn("VoiceProfileRepository.findDefault error, using fallback:", err);
      const local = this.getLocalStorageFallback().find(
        (p) => p.organizationId === organizationId && p.isDefault
      );
      return local || null;
    }
  }

  async create(profile: Omit<SavedVoiceProfile, "id" | "createdAt" | "updatedAt">): Promise<SavedVoiceProfile> {
    const payload = this.mapToDatabase(profile);
    const now = new Date().toISOString();
    payload.created_at = now;
    payload.updated_at = now;

    try {
      const { data, error } = await this.supabase
        .from("voice_profiles")
        .insert(payload)
        .select()
        .single();

      if (error) {
        if (error.code === "42P01") {
          const newLocal: SavedVoiceProfile = {
            ...profile,
            id: `vprofile-${Math.random().toString(36).substring(2, 9)}`,
            createdAt: now,
            updatedAt: now,
          };
          const current = this.getLocalStorageFallback();
          if (profile.isDefault) {
            current.forEach((p) => {
              if (p.organizationId === profile.organizationId) p.isDefault = false;
            });
          }
          current.push(newLocal);
          this.saveLocalStorageFallback(current);
          return newLocal;
        }
        throw error;
      }

      return this.mapToEntity(data);
    } catch (err) {
      console.warn("VoiceProfileRepository.create error, using fallback:", err);
      const newLocal: SavedVoiceProfile = {
        ...profile,
        id: `vprofile-${Math.random().toString(36).substring(2, 9)}`,
        createdAt: now,
        updatedAt: now,
      };
      const current = this.getLocalStorageFallback();
      if (profile.isDefault) {
        current.forEach((p) => {
          if (p.organizationId === profile.organizationId) p.isDefault = false;
        });
      }
      current.push(newLocal);
      this.saveLocalStorageFallback(current);
      return newLocal;
    }
  }

  async update(id: string, profile: Partial<SavedVoiceProfile>): Promise<SavedVoiceProfile> {
    const payload = this.mapToDatabasePartial(profile);
    const now = new Date().toISOString();
    payload.updated_at = now;

    try {
      const { data, error } = await this.supabase
        .from("voice_profiles")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        if (error.code === "42P01") {
          const current = this.getLocalStorageFallback();
          const idx = current.findIndex((p) => p.id === id);
          if (idx === -1) throw new Error("Profile not found in fallback cache");
          
          const updated = {
            ...current[idx],
            ...profile,
            updatedAt: now,
          } as SavedVoiceProfile;

          if (profile.isDefault && updated.organizationId) {
            current.forEach((p) => {
              if (p.organizationId === updated.organizationId) p.isDefault = false;
            });
          }
          current[idx] = updated;
          this.saveLocalStorageFallback(current);
          return updated;
        }
        throw error;
      }

      return this.mapToEntity(data);
    } catch (err) {
      console.warn("VoiceProfileRepository.update error, using fallback:", err);
      const current = this.getLocalStorageFallback();
      const idx = current.findIndex((p) => p.id === id);
      if (idx === -1) throw new Error("Profile not found in fallback cache");
      
      const updated = {
        ...current[idx],
        ...profile,
        updatedAt: now,
      } as SavedVoiceProfile;

      if (profile.isDefault && updated.organizationId) {
        current.forEach((p) => {
          if (p.organizationId === updated.organizationId) p.isDefault = false;
        });
      }
      current[idx] = updated;
      this.saveLocalStorageFallback(current);
      return updated;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("voice_profiles")
        .delete()
        .eq("id", id);

      if (error) {
        if (error.code === "42P01") {
          const current = this.getLocalStorageFallback();
          const filtered = current.filter((p) => p.id !== id);
          this.saveLocalStorageFallback(filtered);
          return true;
        }
        return false;
      }

      return true;
    } catch (err) {
      console.warn("VoiceProfileRepository.delete error, using fallback:", err);
      const current = this.getLocalStorageFallback();
      const filtered = current.filter((p) => p.id !== id);
      this.saveLocalStorageFallback(filtered);
      return true;
    }
  }

  async setDefault(id: string, organizationId: string): Promise<boolean> {
    try {
      await this.supabase
        .from("voice_profiles")
        .update({ is_default: false })
        .eq("organization_id", organizationId);

      const { error } = await this.supabase
        .from("voice_profiles")
        .update({ is_default: true })
        .eq("id", id);

      if (error) {
        if (error.code === "42P01") {
          const current = this.getLocalStorageFallback();
          current.forEach((p) => {
            if (p.organizationId === organizationId) {
              p.isDefault = p.id === id;
            }
          });
          this.saveLocalStorageFallback(current);
          return true;
        }
        return false;
      }

      return true;
    } catch (err) {
      console.warn("VoiceProfileRepository.setDefault error, using fallback:", err);
      const current = this.getLocalStorageFallback();
      current.forEach((p) => {
        if (p.organizationId === organizationId) {
          p.isDefault = p.id === id;
        }
      });
      this.saveLocalStorageFallback(current);
      return true;
    }
  }

  private mapToEntity(data: any): SavedVoiceProfile {
    return {
      id: data.id,
      organizationId: data.organization_id,
      profileName: data.profile_name || data.name,
      provider: data.provider || "azure",
      language: data.language || "en-US",
      voiceName: data.voice_name || "",
      gender: data.gender || "neutral",
      style: data.style || "conversational",
      isDefault: data.is_default || false,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by,
      updatedBy: data.updated_by,
    };
  }

  private mapToDatabase(profile: Omit<SavedVoiceProfile, "id" | "createdAt" | "updatedAt">): Record<string, any> {
    return {
      organization_id: profile.organizationId,
      profile_name: profile.profileName,
      name: profile.profileName,
      provider: profile.provider,
      language: profile.language,
      voice_name: profile.voiceName,
      gender: profile.gender,
      style: profile.style,
      is_default: profile.isDefault,
      created_by: profile.createdBy,
    };
  }

  private mapToDatabasePartial(profile: Partial<SavedVoiceProfile>): Record<string, any> {
    const payload: Record<string, any> = {};
    if (profile.organizationId !== undefined) payload.organization_id = profile.organizationId;
    if (profile.profileName !== undefined) {
      payload.profile_name = profile.profileName;
      payload.name = profile.profileName;
    }
    if (profile.provider !== undefined) payload.provider = profile.provider;
    if (profile.language !== undefined) payload.language = profile.language;
    if (profile.voiceName !== undefined) payload.voice_name = profile.voiceName;
    if (profile.gender !== undefined) payload.gender = profile.gender;
    if (profile.style !== undefined) payload.style = profile.style;
    if (profile.isDefault !== undefined) payload.is_default = profile.isDefault;
    if (profile.updatedBy !== undefined) payload.updated_by = profile.updatedBy;
    return payload;
  }
}
