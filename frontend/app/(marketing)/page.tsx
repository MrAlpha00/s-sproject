import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TrustedBy from "@/components/TrustedBy";
import FeaturesGrid from "@/components/FeaturesGrid";
import UseCases from "@/components/UseCases";
import Pricing from "@/components/Pricing";
import CTABanner from "@/components/CTABanner";
import Footer from "@/components/Footer";
import TranslationShowcase from "@/components/TranslationShowcase";
import VoiceCloning from "@/components/VoiceCloning";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <Hero />
      <TrustedBy />
      <FeaturesGrid />
      <TranslationShowcase />
      <VoiceCloning />
      <UseCases />
      <Pricing />
      <CTABanner />
      <Footer />
    </main>
  );
}