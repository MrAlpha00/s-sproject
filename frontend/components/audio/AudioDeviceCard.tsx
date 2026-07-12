"use client";

import {
  Laptop,
  Mic,
  Bluetooth,
  Sliders,
  Cable,
  Headphones,
  Speaker,
  Volume2,
  Cpu,
  Star,
  Settings,
  HelpCircle,
} from "lucide-react";
import { AudioDevice } from "@/types/audio";
import { AudioStatusBadge } from "@/components/audio/AudioStatusBadge";
import { motion } from "framer-motion";

interface AudioDeviceCardProps {
  device: AudioDevice;
  onSelect: (id: string) => void;
}

export function AudioDeviceCard({ device, onSelect }: AudioDeviceCardProps) {
  // Device Type Icon Mapper
  const getDeviceIcon = () => {
    const nameLower = device.name.toLowerCase();
    
    if (nameLower.includes("laptop mic") || nameLower.includes("laptop speaker")) {
      return Laptop;
    }
    if (nameLower.includes("usb mic") || nameLower.includes("microphone")) {
      return Mic;
    }
    if (nameLower.includes("bluetooth")) {
      return Bluetooth;
    }
    if (nameLower.includes("interface") || nameLower.includes("mixer")) {
      return Sliders;
    }
    if (nameLower.includes("cable") || nameLower.includes("virtual")) {
      return Cable;
    }
    if (nameLower.includes("obs") || nameLower.includes("zoom")) {
      return Cpu;
    }
    if (nameLower.includes("headphones")) {
      return Headphones;
    }
    if (nameLower.includes("pa system") || nameLower.includes("external speaker")) {
      return Speaker;
    }
    
    return device.type === "input" ? Mic : Volume2;
  };

  const IconComponent = getDeviceIcon();

  const activeBorderClass = device.isSelected
    ? "border-electric-blue bg-gradient-to-br from-zinc-900 via-zinc-900 to-electric-blue/5 shadow-[0_0_15px_rgba(0,212,255,0.1)]"
    : "border-white/[0.06] bg-zinc-900/30 hover:border-white/[0.12] hover:bg-zinc-900/50";

  return (
    <motion.div
      onClick={() => onSelect(device.id)}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-xl border p-4.5 transition-all duration-200 cursor-pointer ${activeBorderClass}`}
    >
      {/* Selection Glow Indicator */}
      {device.isSelected && (
        <div className="absolute right-0 top-0 h-1.5 w-1.5 bg-electric-blue rounded-bl" />
      )}

      {/* Header Info */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Styled Icon */}
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors ${
              device.isSelected
                ? "bg-electric-blue/10 border-electric-blue/20 text-electric-blue"
                : "bg-zinc-950 border-white/[0.06] text-zinc-500 group-hover:text-white"
            }`}>
              <IconComponent className="h-4.5 w-4.5" />
            </div>
            
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-white group-hover:text-electric-blue transition-colors text-xs sm:text-sm truncate">
                  {device.name}
                </span>
                {device.isDefault && (
                  <Star className="h-3 w-3 text-amber-400 fill-current shrink-0" title="Default Device" />
                )}
              </div>
              <p className="text-[10px] text-zinc-500 font-medium truncate">
                Mfr: {device.manufacturer}
              </p>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <AudioStatusBadge value={device.status} type="status" />
            <AudioStatusBadge value={device.health} type="health" />
          </div>
        </div>
      </div>

      {/* Specifications Sub-Details Footer */}
      <div className="border-t border-white/[0.04] pt-3.5 mt-2 flex flex-col gap-1">
        <div className="grid grid-cols-3 gap-2 text-[9px] font-medium text-zinc-400">
          <div>
            <span className="text-zinc-600 block uppercase font-bold">Formats</span>
            <span className="text-zinc-300 block truncate mt-0.5">{device.sampleRate} / {device.channels.split(" ")[0]}</span>
          </div>
          <div>
            <span className="text-zinc-600 block uppercase font-bold">Latency</span>
            <span className="text-zinc-300 block truncate mt-0.5">{device.latency}</span>
          </div>
          <div>
            <span className="text-zinc-600 block uppercase font-bold">Last Test</span>
            <span className="text-zinc-300 block truncate mt-0.5">{device.lastTested}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
