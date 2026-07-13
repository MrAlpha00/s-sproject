"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  Star,
  Users,
  Clock,
  Database,
  Info,
  Mic,
} from "lucide-react";
import { createClient } from "@/supabase/client";
import { SubscriptionPlanRepository, SubscriptionPlan } from "@/lib/database/repositories/SubscriptionPlanRepository";
import { SubscriptionRepository } from "@/lib/database/repositories/SubscriptionRepository";
import { PaymentManager } from "@/lib/payments/PaymentManager";

export default function PlansPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [planRepo] = useState(() => new SubscriptionPlanRepository(supabase));
  const [subscriptionRepo] = useState(() => new SubscriptionRepository(supabase));

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentPlanId, setCurrentPlanId] = useState<string>("plan-free");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState(true);
  const [purchasingPlanId, setPurchasingPlanId] = useState<string | null>(null);

  useEffect(() => {
    async function loadPlans() {
      try {
        setLoading(true);
        const orgId = "org-aether-main";
        const plansList = await planRepo.findAll();
        setPlans(plansList);

        const sub = await subscriptionRepo.findByOrganizationId(orgId);
        if (sub) {
          setCurrentPlanId(sub.planId);
          setBillingCycle(sub.billingCycle);
        }
      } catch (err) {
        console.error("Failed to load plans comparison matrix:", err);
      } finally {
        setLoading(false);
      }
    }

    loadPlans();
  }, [supabase, planRepo, subscriptionRepo]);

  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    if (plan.id === currentPlanId) return;

    try {
      setPurchasingPlanId(plan.id);
      const provider = PaymentManager.getActiveProvider();

      // Set return checkout urls
      const successUrl = `${window.location.origin}/dashboard/billing`;
      const cancelUrl = window.location.href;

      const session = await provider.createCheckout(
        "org-aether-main",
        plan.id,
        billingCycle,
        successUrl,
        cancelUrl
      );

      if (session.url) {
        // Redirect to mock checkout url
        router.push(session.url);
      }
    } catch (err) {
      console.error(err);
      alert("Simulated checkout trigger failed.");
      setPurchasingPlanId(null);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-zinc-500 text-xs">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-electric-blue border-t-transparent mx-auto mb-2" />
        <span>Loading plans matrix...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white max-w-7xl mx-auto selection:bg-electric-blue/30 selection:text-white">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/billing"
          className="h-8 w-8 rounded-lg bg-zinc-900 border border-white/[0.06] hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Sparkles className="h-5.5 w-5.5 text-electric-blue" />
            <span>Choose Subscription Plan</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Pick a tier that fits your scale. Upgrading grants immediate access to increased character limits, and team seats.
          </p>
        </div>
      </div>

      {/* Cycle Selector */}
      <div className="flex justify-center border-b border-white/[0.04] pb-6">
        <div className="flex rounded-lg border border-white/[0.06] bg-zinc-950 p-[2.5px] text-xs">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-4 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
              billingCycle === "monthly" ? "bg-zinc-900 text-white" : "text-zinc-450 hover:text-white"
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingCycle("yearly")}
            className={`px-4 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
              billingCycle === "yearly" ? "bg-zinc-900 text-white" : "text-zinc-450 hover:text-white"
            }`}
          >
            Yearly Billing (Save 20%)
          </button>
        </div>
      </div>

      {/* Plans Pricing Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlanId;
          const price = billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
          const isEnterprise = plan.planName.toLowerCase() === "enterprise";

          return (
            <div
              key={plan.id}
              className={`rounded-xl border p-5 flex flex-col justify-between gap-6 relative overflow-hidden transition-all ${
                isCurrent
                  ? "bg-electric-blue/5 border-electric-blue/30 shadow-[0_0_15px_rgba(0,212,255,0.05)]"
                  : "bg-zinc-900/40 border-white/[0.06] hover:border-white/[0.12] hover:bg-zinc-900/60"
              }`}
            >
              {plan.planName.toLowerCase() === "professional" && (
                <div className="absolute top-3 right-3 rounded bg-electric-blue/10 border border-electric-blue/20 px-1.5 py-0.5 text-[8px] text-electric-blue font-extrabold uppercase">
                  RECOMMENDED
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-extrabold text-white tracking-wide uppercase">{plan.planName}</h3>
                  <p className="text-[10px] text-zinc-550 mt-0.5 truncate">{plan.description}</p>
                </div>

                <div className="flex items-baseline font-mono">
                  <span className="text-3xl font-extrabold text-white">${price}</span>
                  <span className="text-zinc-550 text-xs ml-1">/ {billingCycle === "monthly" ? "mo" : "yr"}</span>
                </div>

                {/* Quotas List */}
                <div className="space-y-2 border-t border-white/[0.04] pt-4 text-xs">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Mic className="h-3.5 w-3.5 text-zinc-500" />
                    <span>{plan.maxEvents === 9999 ? "Unlimited" : `${plan.maxEvents}`} events</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Clock className="h-3.5 w-3.5 text-zinc-500" />
                    <span>{plan.maxTranslationMinutes === 99999 ? "Unlimited" : `${plan.maxTranslationMinutes}`} translation mins</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Users className="h-3.5 w-3.5 text-zinc-500" />
                    <span>{plan.maxListeners === 99999 ? "Unlimited" : `${plan.maxListeners}`} session listeners</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-400">
                    <ShieldCheck className="h-3.5 w-3.5 text-zinc-500" />
                    <span>{plan.maxTeamMembers} team seat{plan.maxTeamMembers > 1 ? "s" : ""}</span>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2 border-t border-white/[0.04] pt-4 text-xs">
                  <div className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-zinc-300">Live Streaming Portal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {plan.features.analytics ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <span className="text-zinc-650 font-bold w-3.5 text-center">•</span>
                    )}
                    <span className={plan.features.analytics ? "text-zinc-300" : "text-zinc-550"}>
                      Enterprise Analytics
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {plan.features.custom_voices ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <span className="text-zinc-650 font-bold w-3.5 text-center">•</span>
                    )}
                    <span className={plan.features.custom_voices ? "text-zinc-300" : "text-zinc-550"}>
                      Custom Voice Profiles
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              {isCurrent ? (
                <button
                  disabled
                  className="w-full h-9.5 rounded-lg border border-electric-blue/20 bg-electric-blue/5 text-electric-blue font-bold text-xs tracking-wider uppercase cursor-default"
                >
                  Current Plan
                </button>
              ) : (
                <button
                  onClick={() => handleSelectPlan(plan)}
                  disabled={purchasingPlanId !== null}
                  className="w-full h-9.5 rounded-lg bg-zinc-950 border border-white/[0.06] hover:bg-zinc-900 hover:text-white text-zinc-300 font-bold text-xs tracking-wider uppercase cursor-pointer transition-all"
                >
                  {purchasingPlanId === plan.id ? (
                    <div className="h-4 w-4 border-2 border-zinc-400 border-t-transparent animate-spin rounded-full mx-auto" />
                  ) : isEnterprise ? (
                    "Contact Sales"
                  ) : (
                    "Upgrade Plan"
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Comparison Grid Banner */}
      <div className="rounded-xl border border-white/[0.04] bg-zinc-950/20 p-5 space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <Info className="h-4.5 w-4.5 text-electric-blue" />
          <span>Billing Policy Notes</span>
        </h3>
        <p className="text-[11px] text-zinc-500 leading-relaxed">
          Payments are managed through pluggable payment service managers. You can toggle auto-renewal from your billing panel or manage invoices via the Customer Portal. Changing plans during a billing cycle will result in pro-rated charge calculations adjusted at checkout.
        </p>
      </div>
    </div>
  );
}
