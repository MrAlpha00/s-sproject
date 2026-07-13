import { SupabaseClient } from "@supabase/supabase-js";

export interface SubscriptionPlan {
  id: string;
  planName: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  currency: string;
  maxEvents: number;
  maxTranslationMinutes: number;
  maxCharacters: number;
  maxListeners: number;
  maxTeamMembers: number;
  storageLimit: number;
  features: Record<string, boolean>;
  isActive: boolean;
}

const fallbackPlans: SubscriptionPlan[] = [
  {
    id: "plan-free",
    planName: "Free",
    description: "Basic translation trial",
    monthlyPrice: 0.00,
    yearlyPrice: 0.00,
    currency: "USD",
    maxEvents: 3,
    maxTranslationMinutes: 30,
    maxCharacters: 50000,
    maxListeners: 5,
    maxTeamMembers: 1,
    storageLimit: 1073741824,
    features: { analytics: false, custom_voices: false, streaming: true },
    isActive: true,
  },
  {
    id: "plan-starter",
    planName: "Starter",
    description: "For small events and meetups",
    monthlyPrice: 29.00,
    yearlyPrice: 290.00,
    currency: "USD",
    maxEvents: 10,
    maxTranslationMinutes: 120,
    maxCharacters: 300000,
    maxListeners: 50,
    maxTeamMembers: 3,
    storageLimit: 5368709120,
    features: { analytics: true, custom_voices: false, streaming: true },
    isActive: true,
  },
  {
    id: "plan-professional",
    planName: "Professional",
    description: "For conferences and enterprise events",
    monthlyPrice: 99.00,
    yearlyPrice: 990.00,
    currency: "USD",
    maxEvents: 50,
    maxTranslationMinutes: 1000,
    maxCharacters: 3000000,
    maxListeners: 500,
    maxTeamMembers: 10,
    storageLimit: 26843545600,
    features: { analytics: true, custom_voices: true, streaming: true },
    isActive: true,
  },
  {
    id: "plan-enterprise",
    planName: "Enterprise",
    description: "Unlimited access for large organizations",
    monthlyPrice: 299.00,
    yearlyPrice: 2990.00,
    currency: "USD",
    maxEvents: 9999,
    maxTranslationMinutes: 99999,
    maxCharacters: 99999999,
    maxListeners: 99999,
    maxTeamMembers: 100,
    storageLimit: 536870912000,
    features: { analytics: true, custom_voices: true, streaming: true },
    isActive: true,
  }
];

export class SubscriptionPlanRepository {
  constructor(private supabase: SupabaseClient) {}

  private isLocalStorageAvailable(): boolean {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
  }

  private getFallback(): SubscriptionPlan[] {
    if (!this.isLocalStorageAvailable()) return fallbackPlans;
    const cached = localStorage.getItem("aethervox_fallback_subscription_plans");
    return cached ? JSON.parse(cached) : fallbackPlans;
  }

  async findAll(): Promise<SubscriptionPlan[]> {
    try {
      const { data, error } = await this.supabase
        .from("subscription_plans")
        .select("*")
        .eq("is_active", true);

      if (error) {
        if (error.code === "42P01") return this.getFallback();
        throw error;
      }

      return data.map(this.mapToEntity);
    } catch (err) {
      console.warn("SubscriptionPlanRepository.findAll failed, using fallback:", err);
      return this.getFallback();
    }
  }

  async findById(id: string): Promise<SubscriptionPlan | null> {
    try {
      const { data, error } = await this.supabase
        .from("subscription_plans")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "42P01") {
          return this.getFallback().find((p) => p.id === id) || null;
        }
        return null;
      }

      return this.mapToEntity(data);
    } catch (err) {
      console.warn("SubscriptionPlanRepository.findById failed, using fallback:", err);
      return this.getFallback().find((p) => p.id === id) || null;
    }
  }

  private mapToEntity(data: any): SubscriptionPlan {
    return {
      id: data.id,
      planName: data.plan_name,
      description: data.description || "",
      monthlyPrice: Number(data.monthly_price),
      yearlyPrice: Number(data.yearly_price),
      currency: data.currency || "USD",
      maxEvents: data.max_events,
      maxTranslationMinutes: data.max_translation_minutes,
      maxCharacters: data.max_characters,
      maxListeners: data.max_listeners,
      maxTeamMembers: data.max_team_members,
      storageLimit: Number(data.storage_limit),
      features: data.features || {},
      isActive: data.is_active,
    };
  }
}
