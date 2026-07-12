"use client";

import { AudioDevice } from "@/types/audio";
import { AudioDeviceCard } from "@/components/audio/AudioDeviceCard";

interface AudioSourcesListProps {
  devices: AudioDevice[];
  onSelect: (id: string) => void;
}

export function AudioSourcesList({ devices, onSelect }: AudioSourcesListProps) {
  const inputs = devices.filter((d) => d.type === "input");

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Audio Sources (Inputs)
        </h3>
        <p className="text-[11px] text-zinc-500 mt-0.5">
          Select the active capture channel for speaker stream analysis.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {inputs.map((device) => (
          <AudioDeviceCard
            key={device.id}
            device={device}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}
