import { createClient } from "@/supabase/client";
import { SubscriptionRepository } from "../database/repositories/SubscriptionRepository";
import { SubscriptionPlanRepository } from "../database/repositories/SubscriptionPlanRepository";
import { UsageLimitRepository } from "../database/repositories/UsageLimitRepository";

export interface GateResult {
  allowed: boolean;
  reason?: string;
  limit?: number;
  current?: number;
}

export class FeatureGate {
  private subscriptionRepo: SubscriptionRepository;
  private planRepo: SubscriptionPlanRepository;
  private usageRepo: UsageLimitRepository;

  constructor() {
    const supabase = createClient();
    this.subscriptionRepo = new SubscriptionRepository(supabase);
    this.planRepo = new SubscriptionPlanRepository(supabase);
    this.usageRepo = new UsageLimitRepository(supabase);
  }

  private async getOrganizationActivePlan(orgId: string) {
    const sub = await this.subscriptionRepo.findByOrganizationId(orgId);
    if (!sub) {
      // Default to free plan if no subscription row exists
      const plans = await this.planRepo.findAll();
      const freePlan = plans.find((p) => p.planName.toLowerCase() === "free") || plans[0];
      return { plan: freePlan, subscription: null };
    }

    const plan = await this.planRepo.findById(sub.planId);
    const plansList = await this.planRepo.findAll();
    const resolvedPlan = plan || plansList.find((p) => p.id === sub.planId) || plansList[0];
    
    return { plan: resolvedPlan, subscription: sub };
  }

  async canCreateEvent(orgId: string): Promise<GateResult> {
    const { plan } = await this.getOrganizationActivePlan(orgId);
    const usage = await this.usageRepo.findByOrganizationId(orgId);
    const current = usage ? usage.currentEvents : 0;
    const limit = plan.maxEvents;

    if (current >= limit) {
      return {
        allowed: false,
        reason: `Upgrade required. You have reached your limit of ${limit} events for the ${plan.planName} Plan.`,
        limit,
        current,
      };
    }

    return { allowed: true, limit, current };
  }

  async canStartLiveSession(orgId: string): Promise<GateResult> {
    const { plan } = await this.getOrganizationActivePlan(orgId);
    const usage = await this.usageRepo.findByOrganizationId(orgId);
    const current = usage ? usage.translationMinutesUsed : 0;
    const limit = plan.maxTranslationMinutes;

    if (current >= limit) {
      return {
        allowed: false,
        reason: `Upgrade required. You have consumed your allocation of ${limit} translation minutes for the ${plan.planName} Plan.`,
        limit,
        current,
      };
    }

    return { allowed: true, limit, current };
  }

  async canInviteTeamMember(orgId: string): Promise<GateResult> {
    const { plan } = await this.getOrganizationActivePlan(orgId);
    const usage = await this.usageRepo.findByOrganizationId(orgId);
    const current = usage ? usage.teamMembersUsed : 0;
    const limit = plan.maxTeamMembers;

    if (current >= limit) {
      return {
        allowed: false,
        reason: `Invite blocked. Your ${plan.planName} Plan allows a maximum of ${limit} team members.`,
        limit,
        current,
      };
    }

    return { allowed: true, limit, current };
  }

  async canCreateVoiceProfile(orgId: string): Promise<GateResult> {
    const { plan } = await this.getOrganizationActivePlan(orgId);
    // Gated by specific feature flag in plans JSON structure
    const allowed = !!plan.features.custom_voices;

    if (!allowed) {
      return {
        allowed: false,
        reason: `Custom voice profiles are locked. Please upgrade to the Professional or Enterprise Plan to clone voices.`,
      };
    }

    return { allowed: true };
  }

  async canAccessAnalytics(orgId: string, role?: string): Promise<GateResult> {
    if (process.env.NODE_ENV === "development" || role === "OWNER" || role === "SUPER_ADMIN" || role === "ADMIN") {
      return { allowed: true };
    }
    const { plan } = await this.getOrganizationActivePlan(orgId);
    const allowed = !!plan.features.analytics;

    if (!allowed) {
      return {
        allowed: false,
        reason: `Enterprise Analytics dashboard is locked. Upgrade to Starter or higher to unlock telemetry tracking.`,
      };
    }

    return { allowed: true };
  }

  async canUseEnterpriseVoices(orgId: string): Promise<GateResult> {
    const { plan } = await this.getOrganizationActivePlan(orgId);
    const allowed = plan.planName.toLowerCase() === "professional" || plan.planName.toLowerCase() === "enterprise";

    if (!allowed) {
      return {
        allowed: false,
        reason: `Enterprise Neural Voices require Professional or Enterprise Subscription tier.`,
      };
    }

    return { allowed: true };
  }
}
