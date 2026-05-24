"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import WaveformScene from "./WaveformScene";

export default function WaveformInner() {
  return (
    <Canvas
      camera={{ position: [0, 1.8, 5.5], fov: 40 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <Suspense fallback={null}>
        <WaveformScene />
      </Suspense>
    </Canvas>
  );
}
