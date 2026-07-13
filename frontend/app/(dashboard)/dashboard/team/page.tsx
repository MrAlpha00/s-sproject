"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  UserPlus,
  Shield,
  Trash2,
  UserCheck,
  AlertOctagon,
  History,
  X,
  Mail,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
} from "lucide-react";
import { createClient } from "@/supabase/client";
import { TeamRepository, TeamMember, UserRole, MemberStatus } from "@/lib/database/repositories/TeamRepository";
import { InvitationRepository } from "@/lib/database/repositories/InvitationRepository";
import { ActivityLogRepository } from "@/lib/database/repositories/ActivityLogRepository";
import { PermissionService } from "@/lib/rbac/PermissionService";
import { FeatureGate } from "@/lib/utils/featureGate";

export default function TeamPage() {
  const [supabase] = useState(() => createClient());
  const [teamRepo] = useState(() => new TeamRepository(supabase));
  const [invitationRepo] = useState(() => new InvitationRepository(supabase));
  const [logRepo] = useState(() => new ActivityLogRepository(supabase));
  const [permissionService] = useState(() => new PermissionService());
  const [featureGate] = useState(() => new FeatureGate());

  // User auth details
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>("OWNER");
  const [currentUserId] = useState("usr-owner-01"); // mock user id
  const [orgId] = useState("org-aether-main");

  // States
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");

  // Invitation Modal states
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<UserRole>("OPERATOR");
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState(false);

  // Gating indicators
  const [canManage, setCanManage] = useState(true);

  // Load team data
  useEffect(() => {
    async function loadTeam() {
      try {
        setLoading(true);
        
        // 1. Resolve role of current operator
        const resolvedRole = await permissionService.resolveUserRole(currentUserId, orgId);
        setCurrentUserRole(resolvedRole);

        const permitted = permissionService.canManageOrganization(resolvedRole);
        setCanManage(permitted);

        // 2. Fetch team members
        const list = await teamRepo.findByOrganizationId(orgId);
        setMembers(list);
      } catch (err) {
        console.error("Failed to load team list:", err);
      } finally {
        setLoading(false);
      }
    }

    loadTeam();
  }, [supabase, teamRepo, permissionService, currentUserId, orgId]);

  // Actions
  const handleUpdateRole = async (member: TeamMember, newRole: UserRole) => {
    if (!canManage) {
      alert("Permission Denied: You do not have privileges to change team roles.");
      return;
    }
    if (member.userId === currentUserId && member.role === "OWNER") {
      alert("Ownership safety lock: You cannot demote yourself directly. Please transfer ownership first.");
      return;
    }

    try {
      const updated = await teamRepo.update(member.id, { role: newRole });
      setMembers((prev) => prev.map((m) => (m.id === member.id ? { ...m, role: updated.role } : m)));

      // Audit Log
      await logRepo.log({
        organizationId: orgId,
        userId: currentUserId,
        action: "Role Change",
        entity: "Team",
        metadata: { email: member.email, oldRole: member.role, newRole: newRole },
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleDeactivate = async (member: TeamMember) => {
    if (!canManage) {
      alert("Permission Denied: You do not have privileges to manage team statuses.");
      return;
    }
    if (member.userId === currentUserId) {
      alert("Operation Blocked: You cannot deactivate your own profile.");
      return;
    }

    const nextStatus: MemberStatus = member.status === "active" ? "deactivated" : "active";

    try {
      const updated = await teamRepo.update(member.id, { status: nextStatus });
      setMembers((prev) => prev.map((m) => (m.id === member.id ? { ...m, status: updated.status } : m)));

      // Audit Log
      await logRepo.log({
        organizationId: orgId,
        userId: currentUserId,
        action: nextStatus === "active" ? "Activate Member" : "Deactivate Member",
        entity: "Team",
        metadata: { email: member.email, status: nextStatus },
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveMember = async (member: TeamMember) => {
    if (!canManage) {
      alert("Permission Denied: You do not have privileges to remove members.");
      return;
    }
    if (member.userId === currentUserId) {
      alert("Operation Blocked: You cannot delete yourself.");
      return;
    }

    if (!confirm(`Are you sure you want to remove ${member.fullName || member.email} from the organization?`)) {
      return;
    }

    try {
      const success = await teamRepo.remove(member.id);
      if (success) {
        setMembers((prev) => prev.filter((m) => m.id !== member.id));

        // Audit Log
        await logRepo.log({
          organizationId: orgId,
          userId: currentUserId,
          action: "Remove Member",
          entity: "Team",
          metadata: { email: member.email, role: member.role },
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError("");
    setInviteSuccess(false);

    if (!inviteEmail) {
      setInviteError("Please enter an email address.");
      return;
    }

    // Check plan seat allocations first!
    const gateCheck = await featureGate.canInviteTeamMember(orgId);
    if (!gateCheck.allowed) {
      setInviteError(gateCheck.reason || "Quota limit exceeded.");
      return;
    }

    try {
      const secureToken = `tok_${Math.random().toString(36).substring(2, 12)}`;
      const expire = new Date(Date.now() + 48 * 3600 * 1000).toISOString();

      await invitationRepo.create({
        organizationId: orgId,
        email: inviteEmail,
        role: inviteRole,
        token: secureToken,
        expiresAt: expire,
        invitedBy: currentUserId,
      });

      // Audit Log
      await logRepo.log({
        organizationId: orgId,
        userId: currentUserId,
        action: "Invite Member",
        entity: "Team",
        metadata: { email: inviteEmail, role: inviteRole },
      });

      // Increment seat allocation count in localStorage fallback usage limits
      const usageLimitsRepo = new (await import("@/lib/database/repositories/UsageLimitRepository")).UsageLimitRepository(supabase);
      await usageLimitsRepo.incrementUsage(orgId, "teamMembersUsed", 1);

      setInviteSuccess(true);
      setInviteEmail("");
      
      // Reload member listings
      const list = await teamRepo.findByOrganizationId(orgId);
      setMembers(list);

      setTimeout(() => {
        setIsInviteModalOpen(false);
        setInviteSuccess(false);
      }, 1500);
    } catch (err: any) {
      setInviteError(err.message || "Failed to issue invitation.");
    }
  };

  // Filter members
  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      (m.fullName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.email || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "ALL" || m.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 text-white max-w-7xl mx-auto selection:bg-electric-blue/30 selection:text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/[0.06] pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Users className="h-5.5 w-5.5 text-electric-blue" />
            <span>Team Members</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Manage organization members, assign operational roles, and audit invitations.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-electric-blue text-black font-bold text-xs px-4 hover:bg-electric-blue/90 cursor-pointer shadow-[0_0_10px_rgba(0,212,255,0.1)] transition-all"
          >
            <UserPlus className="h-4 w-4" />
            <span>INVITE MEMBER</span>
          </button>
        )}
      </div>

      {/* Toolbar Filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-550">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full h-9 pl-9 pr-4 rounded-lg bg-zinc-950 border border-white/[0.06] focus:border-electric-blue focus:outline-none text-xs text-zinc-200"
          />
        </div>

        <div className="flex rounded-lg border border-white/[0.06] bg-zinc-950 p-[2px] text-[10px]">
          {["ALL", "OWNER", "ADMIN", "EVENT_MANAGER", "OPERATOR", "VIEWER"].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                roleFilter === role ? "bg-zinc-900 text-white" : "text-zinc-500 hover:text-white"
              }`}
            >
              {role === "ALL" ? "All Roles" : role.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Members Grid/Table */}
      <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-5 space-y-4">
        {loading ? (
          <div className="py-12 text-center text-zinc-500 text-xs">
            <div className="h-5 w-5 border-2 border-electric-blue border-t-transparent animate-spin rounded-full mx-auto mb-2" />
            <span>Loading members pool...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-zinc-400">
              <thead className="text-[10px] text-zinc-500 uppercase border-b border-white/[0.04]">
                <tr>
                  <th className="py-2.5">Name / Email</th>
                  <th>Workspace Role</th>
                  <th>Status</th>
                  <th>Joined Date</th>
                  {canManage && <th className="text-right">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="border-b border-white/[0.02] hover:bg-white/[0.01] transition-colors">
                    <td className="py-3.5 flex flex-col">
                      <span className="font-bold text-white text-sm">{member.fullName || "Invited seat"}</span>
                      <span className="text-[10px] text-zinc-500 font-mono mt-0.5">{member.email}</span>
                    </td>
                    <td>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-300 font-mono">
                        <Shield className="h-3 w-3 text-electric-blue" />
                        {member.role}
                      </span>
                    </td>
                    <td>
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${
                        member.status === "active"
                          ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                          : member.status === "invited"
                          ? "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                          : "bg-red-500/10 border border-red-500/20 text-red-400"
                      }`}>
                        {member.status}
                      </span>
                    </td>
                    <td>
                      <span className="font-mono text-zinc-500">
                        {new Date(member.joinedAt).toLocaleDateString()}
                      </span>
                    </td>
                    {canManage && (
                      <td className="text-right">
                        <div className="inline-flex items-center gap-2">
                          {/* Role Promotor/Demotor dropdown */}
                          <select
                            value={member.role}
                            onChange={(e) => handleUpdateRole(member, e.target.value as UserRole)}
                            className="bg-zinc-950 border border-white/[0.06] rounded text-[10px] px-1.5 py-0.5 text-zinc-300 focus:outline-none focus:border-electric-blue cursor-pointer"
                          >
                            <option value="OWNER">Owner</option>
                            <option value="ADMIN">Admin</option>
                            <option value="EVENT_MANAGER">Event Manager</option>
                            <option value="OPERATOR">Operator</option>
                            <option value="VIEWER">Viewer</option>
                          </select>

                          {/* Deactivate switch */}
                          <button
                            onClick={() => handleToggleDeactivate(member)}
                            className="text-zinc-500 hover:text-white p-1 cursor-pointer transition-colors"
                            title={member.status === "active" ? "Deactivate" : "Activate"}
                          >
                            {member.status === "active" ? (
                              <ToggleRight className="h-4.5 w-4.5 text-emerald-400" />
                            ) : (
                              <ToggleLeft className="h-4.5 w-4.5" />
                            )}
                          </button>

                          {/* Delete Member */}
                          <button
                            onClick={() => handleRemoveMember(member)}
                            className="text-zinc-600 hover:text-red-400 p-1 cursor-pointer transition-colors"
                            title="Remove Member"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {filteredMembers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-zinc-500">
                      No matching organization members found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invite Modal Dialog */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-white/[0.06] bg-zinc-900 p-6 space-y-4 relative shadow-2xl">
            <button
              onClick={() => setIsInviteModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <div className="flex items-center gap-2 border-b border-white/[0.04] pb-2">
              <UserPlus className="h-5 w-5 text-electric-blue" />
              <h3 className="text-sm font-bold text-white">Invite Team Member</h3>
            </div>

            <form onSubmit={handleSendInvite} className="space-y-4 text-xs">
              {inviteError && (
                <div className="rounded border border-red-500/20 bg-red-500/5 p-3 flex gap-2 text-red-400">
                  <AlertOctagon className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{inviteError}</span>
                </div>
              )}

              {inviteSuccess && (
                <div className="rounded border border-emerald-500/20 bg-emerald-500/5 p-3 flex gap-2 text-emerald-400">
                  <UserCheck className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>Invitation sent successfully to email!</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-zinc-500 font-bold uppercase tracking-wider block">EMAIL ADDRESS</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-550 pointer-events-none">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="member@organization.com"
                    className="w-full h-9 pl-9 pr-4 rounded bg-zinc-950 border border-white/[0.06] focus:border-electric-blue focus:outline-none text-zinc-200"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-500 font-bold uppercase tracking-wider block">ORGANIZATION ROLE</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as UserRole)}
                  className="w-full h-9 rounded bg-zinc-950 border border-white/[0.06] focus:border-electric-blue focus:outline-none text-zinc-300 px-3 cursor-pointer"
                >
                  <option value="ADMIN">Admin (Co-manager)</option>
                  <option value="EVENT_MANAGER">Event Manager (Settings only)</option>
                  <option value="OPERATOR">Operator (Translator/Studio)</option>
                  <option value="VIEWER">Viewer (Read-only stats)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="h-9 px-4 rounded bg-zinc-950 border border-white/[0.06] hover:bg-zinc-800 text-zinc-350 cursor-pointer font-bold transition-all"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 rounded bg-electric-blue hover:bg-electric-blue/90 text-black cursor-pointer font-bold transition-all"
                >
                  SEND INVITATION
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
