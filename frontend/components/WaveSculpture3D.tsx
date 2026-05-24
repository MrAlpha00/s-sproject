"use client";

import React, { useEffect, useRef, useState } from "react";

export default function WaveSculpture3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Track cursor position for interactive tilting
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    // Track container size for responsive scaling
    const resizeCanvas = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        canvas.width = rect.width * window.devicePixelRatio;
        canvas.height = rect.height * window.devicePixelRatio;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Mouse movement listener on the container
    const handleMouseMove = (e: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        // Normalize mouse coordinates to [-1, 1] range
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
        mouseRef.current.targetX = x;
        mouseRef.current.targetY = y;
      }
    };

    const handleMouseLeave = () => {
      mouseRef.current.targetX = 0;
      mouseRef.current.targetY = 0;
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
      container.addEventListener("mouseleave", handleMouseLeave);
    }

    // 3D Point Interface
    interface Point3D {
      x: number;
      y: number;
      z: number;
      color: string;
      size: number;
    }

    // Generate 3D grid points forming a sphere / double-helix waveform sculpture
    const points: Point3D[] = [];
    const layers = 16;
    const pointsPerLayer = 40;

    for (let l = 0; l < layers; l++) {
      const phi = (l / layers) * Math.PI; // latitude
      for (let p = 0; p < pointsPerLayer; p++) {
        const theta = (p / pointsPerLayer) * 2 * Math.PI; // longitude
        
        // Base sphere geometry coordinates
        const radius = 100 + Math.sin(phi * 3) * 15;
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const z = radius * Math.sin(phi) * Math.sin(theta);
        const y = radius * Math.cos(phi);

        // Assign colors dynamically based on layer height and angle
        const hue = 220 + (l / layers) * 60; // range from electric blue (220) to purple (280)
        const size = Math.random() * 1.2 + 0.8;

        points.push({
          x,
          y,
          z,
          color: `hsla(${hue}, 85%, 65%, `,
          size,
        });
      }
    }

    // Render loop
    const render = () => {
      time += 0.015;

      // Smooth mouse easing
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;

      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;
      const centerX = width / 2;
      const centerY = height / 2;

      // Clear with very slight alpha for a futuristic motion blur effect
      ctx.fillStyle = "rgba(6, 6, 9, 0.25)";
      ctx.fillRect(0, 0, width, height);

      // Draw subtle background ambient glowing circles
      const bgGlow = ctx.createRadialGradient(centerX, centerY, 50, centerX, centerY, 240);
      bgGlow.addColorStop(0, "rgba(0, 212, 255, 0.03)");
      bgGlow.addColorStop(0.5, "rgba(175, 64, 255, 0.02)");
      bgGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, width, height);

      // Define 3D rotation angles based on time + cursor influence
      const angleY = time * 0.2 + mouseRef.current.x * 0.4;
      const angleX = Math.sin(time * 0.1) * 0.15 + mouseRef.current.y * 0.4;
      const angleZ = time * 0.05;

      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);
      const cosZ = Math.cos(angleZ);
      const sinZ = Math.sin(angleZ);

      // Project and draw 3D points
      const projectedPoints: { x: number; y: number; size: number; alpha: number; color: string; zIndex: number }[] = [];

      points.forEach((pt) => {
        // Dynamic waveform modulation - ripples waves across the Y-axis using sine/cosine fields
        // Replicates live speech audio spectrum pulses
        const waveOffset = Math.sin(pt.x * 0.03 + time * 3) * Math.cos(pt.z * 0.03 + time * 2) * 18;
        
        // Scale coordinate outwards to simulate speech amplitude impulses
        const amp = 1.0 + Math.sin(time * 1.5) * 0.08;
        let x1 = pt.x * amp;
        let y1 = pt.y + waveOffset;
        let z1 = pt.z * amp;

        // Apply 3D Rotation Matrix
        // Rotate Y
        let x2 = x1 * cosY - z1 * sinY;
        let z2 = x1 * sinY + z1 * cosY;

        // Rotate X
        let y3 = y1 * cosX - z2 * sinX;
        let z3 = y1 * sinX + z2 * cosX;

        // Rotate Z
        let x4 = x2 * cosZ - y3 * sinZ;
        let y4 = x2 * sinZ + y3 * cosZ;

        // 3D Perspective Projection
        const fov = 400;
        const cameraDistance = 320;
        const scale = fov / (fov + z3 + cameraDistance);
        
        // Final 2D Screen coordinates
        const projX = centerX + x4 * scale * 1.1;
        const projY = centerY + y4 * scale * 1.1;

        // Z-Index buffering for correct rendering layers
        const zIndex = z3;

        // Alpha based on depth (fog effect for spatial premium feel)
        const alpha = Math.max(0.1, Math.min(1.0, (fov - z3) / (fov * 1.2)));

        projectedPoints.push({
          x: projX,
          y: projY,
          size: pt.size * scale * 1.8,
          alpha,
          color: pt.color,
          zIndex,
        });
      });

      // Sort points back-to-front (depth sorting) to prevent visual overlap glitch
      projectedPoints.sort((a, b) => b.zIndex - a.zIndex);

      // Draw projected points as glowing micro-particles
      ctx.shadowBlur = 0; // standard draw fast
      projectedPoints.forEach((p) => {
        if (p.x < 0 || p.x > width || p.y < 0 || p.y > height) return;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color + `${p.alpha})`;
        ctx.fill();

        // Add extra halo rings for peak energy nodes in center layers
        if (p.size > 2.2 && p.alpha > 0.6) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2.8, 0, Math.PI * 2);
          ctx.strokeStyle = p.color + `${p.alpha * 0.12})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      });

      // Draw cinematic glowing audio orbital rings
      const ringCount = 3;
      ctx.lineWidth = 1.2;
      
      for (let r = 0; r < ringCount; r++) {
        ctx.beginPath();
        const rRadius = 110 + r * 28;
        const ringTime = time * 0.5 * (r % 2 === 0 ? 1 : -1);
        const rHue = 220 + r * 20;

        for (let a = 0; a <= 64; a++) {
          const theta = (a / 64) * 2 * Math.PI;
          
          // Orbital sine amplitude modulation representing audio peaks
          const ampMod = 1.0 + Math.sin(theta * 6 + time * 4) * 0.12 * Math.cos(time * 2);
          const rx = rRadius * Math.cos(theta) * ampMod;
          const rz = rRadius * Math.sin(theta) * ampMod;
          const ry = Math.sin(theta * 3 + time * 3) * 12;

          // Rotate coordinate
          let rx1 = rx * cosY - rz * sinY;
          let rz1 = rx * sinY + rz * cosY;
          let ry2 = ry * cosX - rz1 * sinX;
          let rz2 = ry * sinX + rz1 * cosX;

          const scale = 400 / (400 + rz2 + 320);
          const px = centerX + rx1 * scale * 1.1;
          const py = centerY + ry2 * scale * 1.1;

          if (a === 0) {
            ctx.moveTo(px, py);
          } else {
            ctx.lineTo(px, py);
          }
        }
        
        // Draw neon glow shadow for the ring paths
        ctx.shadowColor = `hsl(${rHue}, 90%, 60%)`;
        ctx.shadowBlur = 10;
        ctx.strokeStyle = `hsla(${rHue}, 90%, 65%, ${0.25 - r * 0.05})`;
        ctx.stroke();
      }
      
      // Reset shadow for next tick
      ctx.shadowBlur = 0;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove);
        container.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, [isMounted]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[320px] sm:h-[450px] md:h-[550px] flex items-center justify-center overflow-hidden cursor-crosshair"
    >
      {!isMounted ? (
        // High fidelity skeleton loader with matching gradient glow to avoid shift during hydration
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <div className="w-48 h-48 rounded-full bg-gradient-to-br from-electric-blue/10 to-accent-purple/10 blur-xl animate-pulse" />
        </div>
      ) : (
        <canvas ref={canvasRef} className="absolute inset-0 block pointer-events-none" />
      )}

      {/* Decorative sci-fi holographic elements overlay */}
      <div className="absolute inset-x-0 bottom-4 flex justify-between px-6 text-[9px] font-mono text-zinc-500 tracking-wider pointer-events-none select-none">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-electric-blue animate-pulse" />
          SYSTEM: ACTIVE
        </div>
        <div>
          FREQ: <span className="text-zinc-400">48.0 KHZ</span> | MORPH_DAMP: <span className="text-zinc-400">0.82</span>
        </div>
        <div className="hidden sm:block">
          PROJ: 3D_MATRIX_VECTOR
        </div>
      </div>
    </div>
  );
}
