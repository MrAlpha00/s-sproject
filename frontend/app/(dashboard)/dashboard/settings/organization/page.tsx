"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building,
  Globe,
  Clock,
  Shield,
  Save,
  AlertOctagon,
  Languages,
  CheckCircle2,
  Mail,
} from "lucide-react";
import { createClient } from "@/supabase/client";
import { OrganizationRepository, Organization } from "@/lib/database/repositories/OrganizationRepository";
import { ActivityLogRepository } from "@/lib/database/repositories/ActivityLogRepository";
import { PermissionService } from "@/lib/rbac/PermissionService";
import { UserRole } from "@/lib/database/repositories/TeamRepository";

export default function OrganizationSettings() {
  const [supabase] = useState(() => createClient());
  const [orgRepo] = useState(() => new OrganizationRepository(supabase));
  const [logRepo] = useState(() => new ActivityLogRepository(supabase));
  const [permissionService] = useState(() => new PermissionService());

  // Gating & states
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>("OWNER");
  const [currentUserId] = useState("usr-owner-01"); // mock user id
  const [orgId] = useState("org-aether-main");

  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [canManage, setCanManage] = useState(true);

  // Form Fields
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [defaultLanguage, setDefaultLanguage] = useState("en-US");
  const [brandColor, setBrandColor] = useState("#00d4ff");
  const [supportEmail, setSupportEmail] = useState("support@aethervox.io");

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);

        const resolvedRole = await permissionService.resolveUserRole(currentUserId, orgId);
        setCurrentUserRole(resolvedRole);

        const permitted = permissionService.canManageOrganization(resolvedRole);
        setCanManage(permitted);

        const data = await orgRepo.findById(orgId);
        if (data) {
          setOrg(data);
          setName(data.name);
          setLogoUrl(data.logoUrl || "");
          setTimezone(data.timezone);
          setDefaultLanguage(data.defaultLanguage);
        }
      } catch (err) {
        console.error("Failed loading settings details:", err);
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, [supabase, orgRepo, permissionService, currentUserId, orgId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage) {
      alert("Permission Denied: You do not have permissions to modify organization settings.");
      return;
    }

    try {
      setSaving(true);
      setSaveSuccess(false);

      const updated = await orgRepo.update(orgId, {
        name,
        logoUrl,
        timezone,
        defaultLanguage,
      });

      // Audit Log
      await logRepo.log({
        organizationId: orgId,
        userId: currentUserId,
        action: "Settings Change",
        entity: "Organization",
        metadata: {
          name,
          logoUrl,
          timezone,
          defaultLanguage,
          brandColor,
          supportEmail,
        },
      });

      setOrg(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-zinc-500 text-xs">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-electric-blue border-t-transparent mx-auto mb-2" />
        <span>Loading organization profile...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white max-w-7xl mx-auto selection:bg-electric-blue/30 selection:text-white">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Building className="h-5.5 w-5.5 text-electric-blue" />
          <span>Organization Settings</span>
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Customize organization settings, default transcription parameters, and brand logos.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Settings Form (2/3 width) */}
        <div className="lg:col-span-2 rounded-xl border border-white/[0.06] bg-zinc-900/40 p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            {saveSuccess && (
              <div className="rounded border border-emerald-500/20 bg-emerald-500/5 p-4 flex gap-3 text-emerald-400">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <span>Organization settings updated and audited successfully.</span>
              </div>
            )}

            {!canManage && (
              <div className="rounded border border-red-500/20 bg-red-500/5 p-4 flex gap-3 text-red-400">
                <AlertOctagon className="h-5 w-5 shrink-0" />
                <span>
                  Read-Only Mode: Your user profile role ({currentUserRole}) restricts settings modifications. Only Owners and Admins are authorized.
                </span>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-zinc-500 font-bold uppercase tracking-wider block">Organization Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!canManage}
                  className="w-full h-9 rounded bg-zinc-950 border border-white/[0.06] focus:border-electric-blue focus:outline-none text-zinc-200 px-3 disabled:text-zinc-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-500 font-bold uppercase tracking-wider block">Logo URL</label>
                <input
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  disabled={!canManage}
                  className="w-full h-9 rounded bg-zinc-950 border border-white/[0.06] focus:border-electric-blue focus:outline-none text-zinc-200 px-3 disabled:text-zinc-500"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-zinc-500 font-bold uppercase tracking-wider block flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-zinc-500" />
                  <span>Timezone</span>
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  disabled={!canManage}
                  className="w-full h-9 rounded bg-zinc-950 border border-white/[0.06] focus:border-electric-blue focus:outline-none text-zinc-350 px-3 disabled:text-zinc-500 cursor-pointer"
                >
                  <option value="UTC">Coordinated Universal Time (UTC)</option>
                  <option value="EST">Eastern Standard Time (EST)</option>
                  <option value="PST">Pacific Standard Time (PST)</option>
                  <option value="IST">Indian Standard Time (IST)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-500 font-bold uppercase tracking-wider block flex items-center gap-1">
                  <Languages className="h-3.5 w-3.5 text-zinc-500" />
                  <span>Default Language</span>
                </label>
                <select
                  value={defaultLanguage}
                  onChange={(e) => setDefaultLanguage(e.target.value)}
                  disabled={!canManage}
                  className="w-full h-9 rounded bg-zinc-950 border border-white/[0.06] focus:border-electric-blue focus:outline-none text-zinc-350 px-3 disabled:text-zinc-500 cursor-pointer"
                >
                  <option value="en-US">English (en-US)</option>
                  <option value="es-ES">Spanish (es-ES)</option>
                  <option value="zh-CN">Chinese Mandarin (zh-CN)</option>
                  <option value="hi-IN">Hindi (hi-IN)</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-zinc-500 font-bold uppercase tracking-wider block">Support Contact Email</label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  disabled={!canManage}
                  className="w-full h-9 rounded bg-zinc-950 border border-white/[0.06] focus:border-electric-blue focus:outline-none text-zinc-200 px-3 disabled:text-zinc-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-500 font-bold uppercase tracking-wider block">Brand Highlight Color</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    disabled={!canManage}
                    className="h-9 w-12 rounded border border-white/[0.06] bg-zinc-950 p-[2px] disabled:opacity-50"
                  />
                  <span className="font-mono text-zinc-400">{brandColor}</span>
                </div>
              </div>
            </div>

            {canManage && (
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded bg-electric-blue text-black font-bold text-xs px-5 hover:bg-electric-blue/90 cursor-pointer disabled:opacity-50 transition-all"
                >
                  {saving ? (
                    <div className="h-4 w-4 border-2 border-black border-t-transparent animate-spin rounded-full" />
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>SAVE SETTINGS</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Right Info Details */}
        <div className="lg:col-span-1 space-y-6">
          {/* Org Info details card */}
          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-5 space-y-4">
            <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block border-b border-white/[0.04] pb-1.5">
              Active Organization Metadata
            </span>

            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500">Slug Identifier</span>
                <span className="text-zinc-300 font-bold font-mono">{org?.slug}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Creation date</span>
                <span className="text-zinc-300 font-semibold">
                  {org ? new Date(org.createdAt).toLocaleDateString() : ""}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Tenant isolation RLS</span>
                <span className="inline-flex items-center gap-1 rounded bg-zinc-950 border border-white/[0.06] px-2 py-0.5 text-[9px] text-zinc-450 uppercase font-semibold">
                  <Shield className="h-3 w-3 text-emerald-400" />
                  <span>Enforced</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
