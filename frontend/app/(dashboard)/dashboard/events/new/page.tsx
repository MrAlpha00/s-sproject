"use client";

import { useRouter } from "next/navigation";
import { useEvents } from "@/providers/EventProvider";
import { EventWizard } from "@/components/events/EventWizard";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewEventPage() {
  const router = useRouter();
  const { createEvent } = useEvents();

  const handleSubmit = (data: any) => {
    createEvent(data);
    router.push("/dashboard/events");
  };

  const handleCancel = () => {
    router.push("/dashboard/events");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back to Events Nav */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/events"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] bg-zinc-900/30 text-zinc-400 hover:border-white/[0.1] hover:text-white transition-colors"
          title="Back to Events"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
            Wizard setup
          </span>
          <h1 className="text-lg font-bold text-white tracking-tight -mt-0.5">
            Create Translation Event
          </h1>
        </div>
      </div>

      {/* Multi-step form */}
      <EventWizard onSubmit={handleSubmit} onCancel={handleCancel} />
    </div>
  );
}
