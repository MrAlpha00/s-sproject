import { UserRole } from "../database/repositories/TeamRepository";
import { createClient } from "@/supabase/client";
import { TeamRepository } from "../database/repositories/TeamRepository";

export class PermissionService {
  private teamRepo: TeamRepository;

  constructor() {
    const supabase = createClient();
    this.teamRepo = new TeamRepository(supabase);
  }

  // Resolves role of the current user for an organization
  async resolveUserRole(userId: string, organizationId: string): Promise<UserRole> {
    try {
      const member = await this.teamRepo.findByUserIdAndOrg(userId, organizationId);
      if (member) return member.role;

      // Local storage check or default
      if (typeof window !== "undefined") {
        const mockRole = localStorage.getItem(`aethervox_mock_user_role_${userId}`);
        if (mockRole) return mockRole as UserRole;
      }
      
      // Default fallback: Owner for simulation
      return "OWNER";
    } catch (e) {
      return "OWNER";
    }
  }

  canManageOrganization(role: UserRole): boolean {
    return role === "OWNER" || role === "ADMIN";
  }

  canInviteMembers(role: UserRole): boolean {
    return role === "OWNER" || role === "ADMIN";
  }

  canDeleteEvents(role: UserRole): boolean {
    return role === "OWNER" || role === "ADMIN";
  }

  canManageBilling(role: UserRole): boolean {
    return role === "OWNER" || role === "ADMIN";
  }

  canViewAnalytics(role: UserRole): boolean {
    return role === "OWNER" || role === "ADMIN" || role === "EVENT_MANAGER";
  }

  canManageVoices(role: UserRole): boolean {
    return role === "OWNER" || role === "ADMIN" || role === "EVENT_MANAGER";
  }

  canStartEvents(role: UserRole): boolean {
    return role === "OWNER" || role === "ADMIN" || role === "EVENT_MANAGER" || role === "OPERATOR";
  }

  canEditEvents(role: UserRole): boolean {
    return role === "OWNER" || role === "ADMIN" || role === "EVENT_MANAGER";
  }

  canAccessSetupWizard(role: UserRole): boolean {
    return role === "OWNER" || role === "ADMIN" || role === "EVENT_MANAGER" || role === "OPERATOR";
  }
}
