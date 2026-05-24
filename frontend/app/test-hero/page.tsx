import type { Metadata } from "next";
import HeroSection from "@/components/test-hero/HeroSection";

export const metadata: Metadata = {
  title: "AetherVOX — Test Hero",
  description:
    "Preview of the new AetherVOX hero section with 3D waveform visual.",
};

export default function TestHeroPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <HeroSection />
    </main>
  );
}
