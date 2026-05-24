"use client";

import React, { useState } from "react";
import { Check, Sparkles, HelpCircle } from "lucide-react";
import { Button } from "./ui/button";

export default function Pricing() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annually">("annually");

  const plans = [
    {
      name: "Starter",
      description: "Ideal for individual content creators and small webinars.",
      price: {
        monthly: "$49",
        annually: "$39",
      },
      features: [
        "Up to 2 concurrent speech streams",
        "Standard low-latency ingestion (1.8s - 2.5s)",
        "10 core translation languages",
        "High-definition synthetic voice nodes",
        "5 hours of total audio processing/mo",
        "Standard OBS/zoom integrations",
      ],
      cta: "Start Free Trial",
      popular: false,
    },
    {
      name: "Pro Events",
      description: "Designed for corporate summits, gaming casts, and professional event organizers.",
      price: {
        monthly: "$249",
        annually: "$199",
      },
      features: [
        "Up to 8 concurrent speech channels",
        "Ultra-low latency ingestion (1.1s - 1.5s)",
        "50+ total translation languages supported",
        "High-fidelity custom voice cloning profile sync",
        "50 hours of total audio processing/mo",
        "Compliant live SRT/WebVTT closed caption output",
        "Priority US & EU processing node replicas",
        "24/7 dedicated event support setup channels",
      ],
      cta: "Start Pro Trial",
      popular: true,
    },
    {
      name: "Enterprise Broadcast",
      description: "Custom solutions for large broadcast networks, agencies, and global organizations.",
      price: {
        monthly: "Custom",
        annually: "Custom",
      },
      features: [
        "Unlimited concurrent speech channels",
        "Sub-second maximum latency tuning",
        "Access to customized accent leveling tools",
        "Dedicated cloud clusters (AWS/GCP edge nodes)",
        "Custom billing cycles with volume allowances",
        "Full Dante/SRT/analog audio ingestion support",
        "Custom contracts & SLAs (99.99% uptime guarantee)",
        "On-site dedicated broadcast engineering team",
      ],
      cta: "Contact Enterprise",
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="relative py-28 px-6 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[25%] left-[10%] w-[300px] h-[300px] bg-electric-blue/5 rounded-full blur-[80px] pointer-events-none -z-10" />
      <div className="absolute bottom-[20%] right-[10%] w-[300px] h-[300px] bg-accent-purple/5 rounded-full blur-[80px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Transparent Enterprise Pricing Plans
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base">
            Select the processing scale that best fits your events framework. Scale on-demand as your global audience expands.
          </p>
        </div>

        {/* Billing period switcher */}
        <div className="flex justify-center mb-16">
          <div className="relative glass-panel border-white/[0.05] p-1 rounded-xl flex items-center">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-5 py-2.5 rounded-lg text-xs font-bold transition-all duration-300 ${
                billingPeriod === "monthly"
                  ? "bg-white text-zinc-950 shadow-lg"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingPeriod("annually")}
              className={`px-5 py-2.5 rounded-lg text-xs font-bold transition-all duration-300 flex items-center gap-1.5 ${
                billingPeriod === "annually"
                  ? "bg-white text-zinc-950 shadow-lg"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Annually (Save 20%)
              <span className="text-[9px] uppercase font-extrabold bg-electric-blue/15 border border-electric-blue/30 text-electric-blue px-2 py-0.5 rounded-full">
                Popular
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`glass-panel rounded-2xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] border-white/[0.04] ${
                plan.popular ? "border-electric-blue/30 ring-1 ring-electric-blue/20" : ""
              }`}
            >
              {/* Highlight background elements for popular plan */}
              {plan.popular && (
                <>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-electric-blue/5 rounded-full blur-[40px] pointer-events-none" />
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-[2px] bg-gradient-to-r from-transparent via-electric-blue to-transparent" />
                </>
              )}

              {/* Card Header */}
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                    <p className="text-zinc-500 text-xs min-h-[32px] leading-normal">{plan.description}</p>
                  </div>
                  {plan.popular && (
                    <span className="inline-flex items-center gap-1 text-[9px] uppercase font-black text-electric-blue bg-electric-blue/15 border border-electric-blue/30 px-2.5 py-1 rounded-full shadow-[0_0_15px_rgba(0,212,255,0.15)]">
                      <Sparkles className="w-3 h-3 text-electric-blue" />
                      RECOMMENDED
                    </span>
                  )}
                </div>

                {/* Pricing Value */}
                <div className="flex items-baseline gap-1.5 border-b border-white/[0.06] pb-6 mb-6">
                  <span className="text-4xl font-extrabold text-white tracking-tight">
                    {billingPeriod === "monthly" ? plan.price.monthly : plan.price.annually}
                  </span>
                  {plan.price.monthly !== "Custom" && (
                    <span className="text-xs font-semibold text-zinc-500">
                      /mo {billingPeriod === "annually" && "billed annually"}
                    </span>
                  )}
                </div>

                {/* Features List */}
                <ul className="flex flex-col gap-3.5 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 group/item">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        plan.popular ? "bg-electric-blue/10 border border-electric-blue/35 text-electric-blue" : "bg-zinc-950 border border-white/[0.06] text-zinc-500"
                      }`}>
                        <Check className="w-3 h-3" />
                      </div>
                      <span className="text-xs font-semibold text-zinc-300 leading-normal group-hover/item:text-white transition-colors duration-200">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Call to action button */}
              <Button
                asChild
                className={`w-full py-6 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                  plan.popular
                    ? "bg-gradient-to-r from-electric-blue to-accent-purple text-white shadow-[0_0_20px_rgba(0,212,255,0.2)] hover:shadow-[0_0_30px_rgba(0,212,255,0.4)]"
                    : "glass-panel border-white/[0.06] text-white hover:bg-white/[0.02]"
                }`}
              >
                <a href="#cta">{plan.cta}</a>
              </Button>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
