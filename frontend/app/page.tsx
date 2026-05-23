import React from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TrustedBy from "@/components/TrustedBy";
import FeaturesGrid from "@/components/FeaturesGrid";
import TranslationShowcase from "@/components/TranslationShowcase";
import VoiceCloning from "@/components/VoiceCloning";
import UseCases from "@/components/UseCases";
import Pricing from "@/components/Pricing";
import CTABanner from "@/components/CTABanner";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-black text-foreground flex flex-col overflow-x-hidden antialiased">
      {/* Dynamic Background Noise/Overlay texture */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#000000_90%)] pointer-events-none -z-10" />
      
      {/* Fixed Sticky Header */}
      <Navbar />

      {/* Main Page Layout */}
      <main className="flex-grow flex flex-col">
        {/* 1. Hero Section */}
        <Hero />

        {/* 2. Partners & Scalability Ticker */}
        <TrustedBy />

        {/* 3. Bento Features Grid */}
        <FeaturesGrid />

        {/* 4. Interactive Live Speech Translator Showcase */}
        <TranslationShowcase />

        {/* 5. Interactive Voice Synthesis Cloner */}
        <VoiceCloning />

        {/* 6. Event Scale & Use Cases Tabs */}
        <UseCases />

        {/* 7. Pricing Tiers Preview */}
        <Pricing />

        {/* 8. Call to Action Banner */}
        <CTABanner />
      </main>

      {/* Footer Section */}
      <Footer />
    </div>
  );
}

