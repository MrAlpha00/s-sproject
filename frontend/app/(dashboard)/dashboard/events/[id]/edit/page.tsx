"use client";

import { useParams, useRouter } from "next/navigation";
import { useEvents } from "@/providers/EventProvider";
import { EventWizard } from "@/components/events/EventWizard";
import { ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const { events, updateEvent } = useEvents();

  const eventId = params?.id as string;
  const event = events.find((e) => e.id === eventId);

  const handleSubmit = (data: any) => {
    if (eventId) {
      updateEvent(eventId, data);
      router.push(`/dashboard/events/${eventId}`);
    }
  };

  const handleCancel = () => {
    router.push(eventId ? `/dashboard/events/${eventId}` : "/dashboard/events");
  };

  if (!event) {
    return (
      <div className="max-w-md mx-auto py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20 text-red-400 mx-auto mb-4">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-base font-bold text-white uppercase tracking-wider">
          Event Not Found
        </h2>
        <p className="mt-2 text-xs text-zinc-400">
          The Translation Event you are trying to edit does not exist or has been removed.
        </p>
        <Link
          href="/dashboard/events"
          className="mt-6 inline-flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-zinc-900/30 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Events
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleCancel}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] bg-zinc-900/30 text-zinc-400 hover:border-white/[0.1] hover:text-white transition-colors"
          title="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
            Edit mode
          </span>
          <h1 className="text-lg font-bold text-white tracking-tight -mt-0.5">
            Configure: {event.name}
          </h1>
        </div>
      </div>

      {/* Multi-step form */}
      <EventWizard initialData={event} onSubmit={handleSubmit} onCancel={handleCancel} />
    </div>
  );
}
