"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CreditCard,
  TrendingUp,
  AlertTriangle,
  History,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  ToggleLeft,
  ToggleRight,
  ArrowUpRight,
  Database,
  Users,
  Mic,
  Clock,
} from "lucide-react";
import { createClient } from "@/supabase/client";
import { SubscriptionRepository, Subscription } from "@/lib/database/repositories/SubscriptionRepository";
import { SubscriptionPlanRepository, SubscriptionPlan } from "@/lib/database/repositories/SubscriptionPlanRepository";
import { UsageLimitRepository, UsageLimit } from "@/lib/database/repositories/UsageLimitRepository";
import { PaymentManager } from "@/lib/payments/PaymentManager";

export default function BillingDashboard() {
  const [supabase] = useState(() => createClient());
  const [subscriptionRepo] = useState(() => new SubscriptionRepository(supabase));
  const [planRepo] = useState(() => new SubscriptionPlanRepository(supabase));
  const [usageRepo] = useState(() => new UsageLimitRepository(supabase));

  // Loading & states
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [activePlan, setActivePlan] = useState<SubscriptionPlan | null>(null);
  const [usageLimit, setUsageLimit] = useState<UsageLimit | null>(null);
  const [autoRenew, setAutoRenew] = useState(true);
  
  // Checkout simulator notice
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  useEffect(() => {
    // 1. Check if returning from a mock checkout
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("session_id") && params.get("plan_id")) {
        setCheckoutSuccess(true);
        // Clean URL parameter
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }

    async function loadBillingDetails() {
      try {
        setLoading(true);
        const orgId = "org-aether-main";

        // Query active subscription
        let sub = await subscriptionRepo.findByOrganizationId(orgId);
        
        // If returning from checkout, update active sub in DB
        if (typeof window !== "undefined" && checkoutSuccess) {
          const params = new URLSearchParams(window.location.search);
          const newPlanId = params.get("plan_id");
          const cycle = (params.get("cycle") as any) || "monthly";
          
          if (newPlanId) {
            if (sub) {
              sub = await subscriptionRepo.update(sub.id, {
                planId: newPlanId,
                billingCycle: cycle,
                status: "active",
                nextBillingDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
              });
            } else {
              sub = await subscriptionRepo.create({
                organizationId: orgId,
                planId: newPlanId,
                billingCycle: cycle,
                status: "active",
                startsAt: new Date().toISOString(),
                expiresAt: null,
                nextBillingDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
                autoRenew: true,
              });
            }
          }
        }

        setSubscription(sub);
        setAutoRenew(sub ? sub.autoRenew : true);

        // Fetch corresponding plan details
        if (sub) {
          const plan = await planRepo.findById(sub.planId);
          setActivePlan(plan);
        } else {
          const plans = await planRepo.findAll();
          const freePlan = plans.find((p) => p.planName === "Free") || plans[0];
          setActivePlan(freePlan);
        }

        // Fetch usage details
        const limits = await usageRepo.findByOrganizationId(orgId);
        setUsageLimit(limits);
      } catch (err) {
        console.error("Failed to load billing parameters:", err);
      } finally {
        setLoading(false);
      }
    }

    loadBillingDetails();
  }, [supabase, subscriptionRepo, planRepo, usageRepo, checkoutSuccess]);

  const handleToggleAutoRenew = async () => {
    if (!subscription) return;
    try {
      const updated = await subscriptionRepo.update(subscription.id, {
        autoRenew: !autoRenew,
      });
      setAutoRenew(updated.autoRenew);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCustomerPortal = async () => {
    try {
      const provider = PaymentManager.getActiveProvider();
      const session = await provider.getCustomerPortal("org-aether-main", window.location.href);
      if (session.url) {
        window.location.href = session.url;
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-zinc-500">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-electric-blue border-t-transparent mx-auto mb-2" />
        <span>Loading subscription console...</span>
      </div>
    );
  }

  // Calculate usage percentages
  const getPercent = (used: number, limit: number) => {
    if (!limit || limit === 0) return 0;
    return Math.min(100, Math.round((used / limit) * 100));
  };

  const getUsageColor = (percent: number) => {
    if (percent >= 95) return "bg-red-500 shadow-[0_0_8px_#ef4444]";
    if (percent >= 80) return "bg-amber-400 shadow-[0_0_8px_#f59e0b]";
    return "bg-electric-blue shadow-[0_0_8px_#00d4ff]";
  };

  return (
    <div className="space-y-6 text-white max-w-7xl mx-auto selection:bg-electric-blue/30 selection:text-white">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <CreditCard className="h-5.5 w-5.5 text-electric-blue" />
          <span>Billing & Subscriptions</span>
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Review subscription quotas, monitor organization usage rates, and access invoice records.
        </p>
      </div>

      {checkoutSuccess && (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 flex items-center gap-3 text-xs text-emerald-400">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <div>
            <span className="font-bold block">Checkout Successful!</span>
            <span>Your subscription plan upgrade has been applied. Thank you for choosing AetherVOX.</span>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Plan Info & Actions */}
        <div className="lg:col-span-1 space-y-6">
          {/* Active Plan Detail Card */}
          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-5 space-y-5 relative overflow-hidden shadow-inner">
            <div className="absolute top-0 right-0 h-32 w-32 bg-electric-blue/5 rounded-full blur-3xl pointer-events-none" />

            <div>
              <span className="text-[9px] font-extrabold text-zinc-500 uppercase tracking-widest block">Active Contract</span>
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-electric-blue to-accent-purple tracking-tight mt-0.5">
                {activePlan?.planName} Plan
              </h2>
              <p className="text-xs text-zinc-400 mt-1">{activePlan?.description}</p>
            </div>

            <div className="space-y-3.5 border-t border-white/[0.04] pt-4 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500">Monthly Price</span>
                <span className="text-zinc-200 font-bold">${activePlan?.monthlyPrice} / mo</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Contract status</span>
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[9px] text-emerald-400 font-extrabold uppercase">
                  {subscription?.status || "Active (Free)"}
                </span>
              </div>
              {subscription?.nextBillingDate && (
                <div className="flex justify-between">
                  <span className="text-zinc-500">Next billing date</span>
                  <span className="text-zinc-300 font-semibold font-mono">
                    {new Date(subscription.nextBillingDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            {/* Auto Renew Toggle */}
            {subscription && (
              <div className="flex items-center justify-between border-t border-white/[0.04] pt-4 text-xs">
                <span className="text-zinc-450">Auto Renewal</span>
                <button
                  onClick={handleToggleAutoRenew}
                  className="text-zinc-400 hover:text-white cursor-pointer transition-all"
                >
                  {autoRenew ? (
                    <div className="flex items-center gap-1.5 text-electric-blue">
                      <ToggleRight className="h-5 w-5" />
                      <span className="font-semibold">Enabled</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-zinc-500">
                      <ToggleLeft className="h-5 w-5" />
                      <span>Disabled</span>
                    </div>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Quick Actions Panel */}
          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-5 space-y-3.5">
            <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block border-b border-white/[0.04] pb-1.5">
              Billing Quick Actions
            </span>

            <div className="space-y-2 text-xs">
              <Link
                href="/dashboard/billing/plans"
                className="w-full h-9 rounded bg-electric-blue hover:bg-electric-blue/90 text-black font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_10px_rgba(0,212,255,0.1)] transition-all"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>UPGRADE / CHANGE PLAN</span>
              </Link>
              <button
                onClick={handleCustomerPortal}
                className="w-full h-9 rounded bg-zinc-950 border border-white/[0.06] hover:bg-zinc-900 text-zinc-300 hover:text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <ArrowUpRight className="h-3.5 w-3.5 text-zinc-450" />
                <span>MANAGE INVOICES PORTAL</span>
              </button>
              <Link
                href="/dashboard/billing/invoices"
                className="w-full h-9 rounded bg-zinc-950 border border-white/[0.06] hover:bg-zinc-900 text-zinc-300 hover:text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <History className="h-3.5 w-3.5 text-zinc-450" />
                <span>BILLING & INVOICES LOGS</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Quotas Allocation (2/3 width) */}
        <div className="lg:col-span-2 rounded-xl border border-white/[0.06] bg-zinc-900/40 p-5 space-y-6">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Usage Allocations & Limits</h3>
            <p className="text-[10px] text-zinc-500">Live summary of active billing quotas for the current billing cycle.</p>
          </div>

          {activePlan && usageLimit ? (
            <div className="grid gap-5 md:grid-cols-2 text-xs">
              {[
                {
                  name: "Translation Minutes",
                  used: usageLimit.translationMinutesUsed,
                  limit: activePlan.maxTranslationMinutes,
                  icon: Clock,
                  unit: "mins",
                },
                {
                  name: "Characters Processed",
                  used: usageLimit.charactersUsed,
                  limit: activePlan.maxCharacters,
                  icon: TrendingUp,
                  unit: "chars",
                },
                {
                  name: "Events Created",
                  used: usageLimit.currentEvents,
                  limit: activePlan.maxEvents,
                  icon: Mic,
                  unit: "events",
                },
                {
                  name: "Listeners Session Peak",
                  used: usageLimit.listenersUsed,
                  limit: activePlan.maxListeners,
                  icon: Users,
                  unit: "listeners",
                },
                {
                  name: "Team Invitations",
                  used: usageLimit.teamMembersUsed,
                  limit: activePlan.maxTeamMembers,
                  icon: ShieldCheck,
                  unit: "members",
                },
                {
                  name: "Storage Cloud Limit",
                  used: Math.round(usageLimit.storageUsed / (1024 * 1024 * 1024)),
                  limit: Math.round(activePlan.storageLimit / (1024 * 1024 * 1024)),
                  icon: Database,
                  unit: "GB",
                },
              ].map((item) => {
                const percent = getPercent(item.used, item.limit);
                const isOver80 = percent >= 80;

                return (
                  <div
                    key={item.name}
                    className="rounded-lg border border-white/[0.03] bg-zinc-950/20 p-4 space-y-3 relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-zinc-400">
                        <item.icon className="h-4 w-4 text-electric-blue" />
                        <span className="font-semibold">{item.name}</span>
                      </div>
                      
                      {isOver80 && (
                        <div className="inline-flex items-center gap-1 text-[8px] font-bold text-amber-400 uppercase tracking-wide">
                          <AlertTriangle className="h-3 w-3" />
                          <span>&gt;80% Limit</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-baseline justify-between font-mono text-[10px] text-zinc-500">
                      <span className="text-zinc-200 font-bold text-sm">
                        {item.used.toLocaleString()} {item.unit}
                      </span>
                      <span>
                        / {item.limit.toLocaleString()} {item.unit}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${getUsageColor(percent)}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-20 text-center text-zinc-500 text-xs">Summing quota parameters...</div>
          )}
        </div>
      </div>
    </div>
  );
}
