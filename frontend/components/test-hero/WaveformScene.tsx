"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const BAR_COUNT = 48;
const ARC_RADIUS = 3.6;
const BAR_WIDTH = 0.12;
const BAR_DEPTH = 0.12;
const MAX_HEIGHT = 2.8;
const MIN_HEIGHT = 0.15;
const PARTICLE_COUNT = 800;

const colorA = new THREE.Color("#00d4ff");
const colorB = new THREE.Color("#af40ff");

function detRandom(i: number): number {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

interface BarData {
  angle: number;
  idx: number;
  baseHeight: number;
  phase: number;
  phase2: number;
}

export default function WaveformScene() {
  const groupRef = useRef<THREE.Group>(null);
  const barRefs = useRef<(THREE.Mesh | null)[]>([]);

  const bars: BarData[] = useMemo(() => {
    const result: BarData[] = [];
    for (let i = 0; i < BAR_COUNT; i++) {
      const t = i / (BAR_COUNT - 1);
      const angle = -0.8 + t * 1.6;
      const baseHeight = MIN_HEIGHT + (1 - Math.abs(t - 0.5) * 2) * 0.6;
      result.push({
        angle,
        idx: i,
        baseHeight,
        phase: i * 0.25,
        phase2: i * 0.15 + 1.5,
      });
    }
    return result;
  }, []);

  const colors = useMemo(() => {
    const cols: THREE.Color[] = [];
    for (let i = 0; i < BAR_COUNT; i++) {
      const t = i / (BAR_COUNT - 1);
      const col = colorA.clone().lerp(colorB, t);
      cols.push(col);
    }
    return cols;
  }, []);

  const particles = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const theta = detRandom(i * 3) * Math.PI * 2;
      const phi = detRandom(i * 3 + 1) * Math.PI;
      const r = 2 + detRandom(i * 3 + 2) * 4;
      positions[i * 3] = Math.sin(phi) * Math.cos(theta) * r;
      positions[i * 3 + 1] = detRandom(i * 3 + 4) * 3;
      positions[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * r;
    }
    return positions;
  }, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    for (let i = 0; i < BAR_COUNT; i++) {
      const mesh = barRefs.current[i];
      if (!mesh) continue;
      const bar = bars[i];
      const wave1 = Math.sin(time * 1.2 + bar.phase) * 0.5 + 0.5;
      const wave2 = Math.sin(time * 0.7 + bar.phase2) * 0.3 + 0.3;
      const height = bar.baseHeight + wave1 * 1.2 + wave2 * 0.8;
      const clamped = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, height));
      mesh.scale.y = clamped / 0.5;
      mesh.position.y = clamped / 2;
    }
    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.06;
    }
  });

  return (
    <>
      <ambientLight intensity={0.15} />
      <directionalLight position={[5, 8, 5]} intensity={0.6} />
      <directionalLight position={[-3, 2, -2]} intensity={0.3} color="#af40ff" />
      <pointLight position={[0, 3, -3]} intensity={1.5} color="#00d4ff" />
      <pointLight position={[-2, 1, 3]} intensity={1.2} color="#af40ff" />

      <group ref={groupRef} position={[0, -0.2, 0]}>
        {bars.map((bar) => {
          const x = Math.sin(bar.angle) * ARC_RADIUS;
          const z = Math.cos(bar.angle) * ARC_RADIUS - ARC_RADIUS * 0.5;
          return (
            <mesh
              key={bar.idx}
              ref={(el) => {
                barRefs.current[bar.idx] = el;
              }}
              position={[x, 0.25, z]}
              castShadow
            >
              <boxGeometry args={[BAR_WIDTH, 0.5, BAR_DEPTH]} />
              <meshPhysicalMaterial
                color={colors[bar.idx]}
                emissive={colors[bar.idx]}
                emissiveIntensity={0.6}
                metalness={0.3}
                roughness={0.2}
                transparent
                opacity={0.85}
              />
            </mesh>
          );
        })}

        <points>
          <bufferGeometry>
            <bufferAttribute
              args={[particles, 3]}
              attach="attributes-position"
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.025}
            color="#00d4ff"
            transparent
            opacity={0.4}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>
      </group>
    </>
  );
}
