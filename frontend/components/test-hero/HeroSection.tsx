"use client";

import dynamic from "next/dynamic";
import HeroContent from "./HeroContent";

const WaveformVisual = dynamic(() => import("./WaveformVisual"), {
  ssr: false,
});

export default function HeroSection() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-background">
      {/* Background ambient glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-electric-blue/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-accent-purple/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Grid overlay */}
      <div className="absolute inset-0 grid-bg opacity-[0.08] pointer-events-none -z-10" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 min-h-screen flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 w-full py-20 lg:py-0">
          {/* Left: Content */}
          <div className="flex flex-col justify-center">
            <HeroContent />
          </div>

          {/* Right: 3D Visual */}
          <div className="relative flex items-center justify-center lg:justify-end">
            <div className="w-full max-w-[550px] lg:max-w-none lg:w-[550px] xl:w-[600px]">
              <WaveformVisual />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
