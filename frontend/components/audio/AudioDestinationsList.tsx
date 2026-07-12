"use client";

import { AudioDevice } from "@/types/audio";
import { AudioDeviceCard } from "@/components/audio/AudioDeviceCard";

interface AudioDestinationsListProps {
  devices: AudioDevice[];
  onSelect: (id: string) => void;
}

export function AudioDestinationsList({ devices, onSelect }: AudioDestinationsListProps) {
  const outputs = devices.filter((d) => d.type === "output");

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Audio Destinations (Outputs)
        </h3>
        <p className="text-[11px] text-zinc-500 mt-0.5">
          Select the active output interface for translation synthesized audio monitoring.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {outputs.map((device) => (
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
