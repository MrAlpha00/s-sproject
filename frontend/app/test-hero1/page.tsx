import type { Metadata } from "next";
import PremiumHero from "@/components/PremiumHero";

export const metadata: Metadata = {
  title: "AetherVOX Hero Sandbox | Enterprise AI Speech Translation",
  description: "High-end modular SaaS hero playground for AetherVOX. Multilingual live translation systems with sub-second synchronization.",
};

export default function TestHeroPage() {
  return (
    <main className="min-h-screen bg-[#060609]">
      <PremiumHero />
    </main>
  );
}
