"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { TranslationEvent } from "@/types/event";

interface EventContextType {
  events: TranslationEvent[];
  createEvent: (eventData: Omit<TranslationEvent, "id" | "createdAt" | "updatedAt" | "createdBy" | "updatedBy" | "organizationId" | "ownerId">) => void;
  updateEvent: (id: string, eventData: Partial<TranslationEvent>) => void;
  deleteEventPlaceholder: (id: string) => void;
  duplicateEventPlaceholder: (id: string) => void;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

const INITIAL_EVENTS: TranslationEvent[] = [
  {
    id: "evt-global-summit-2026",
    organizationId: "org-aether-main",
    ownerId: "usr-admin-001",
    name: "Global AI Leadership Summit",
    description: "Keynote speeches and panel discussions covering the future of agentic coding and real-time multilingual broadcasting.",
    venue: "San Francisco Conference Hall A / Hybrid",
    date: "2026-07-20",
    time: "09:00",
    sourceLanguage: "English (US)",
    targetLanguages: ["Spanish (ES)", "Mandarin (ZH)", "French (FR)", "German (DE)"],
    translationModel: "Aether-Large-V3",
    latencyMode: "low-latency",
    profanityFilter: true,
    targetVocabulary: "AetherVOX, Supabase, Next.js, agentic-systems",
    inputDevice: "Shure SM7B Broadcast Mic (USB-1)",
    outputDevice: "AetherVOX Live Broadcast Mixer",
    voiceProfile: "Enterprise Voice Male A (Cloned)",
    status: "scheduled",
    createdBy: "admin@aethervox.com",
    updatedBy: "admin@aethervox.com",
    createdAt: "2026-07-12T10:00:00Z",
    updatedAt: "2026-07-12T10:00:00Z",
  }
];

export function EventProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<TranslationEvent[]>(INITIAL_EVENTS);

  const createEvent = (
    eventData: Omit<TranslationEvent, "id" | "createdAt" | "updatedAt" | "createdBy" | "updatedBy" | "organizationId" | "ownerId">
  ) => {
    const newEvent: TranslationEvent = {
      ...eventData,
      id: `evt-${Math.random().toString(36).substring(2, 9)}`,
      organizationId: "org-aether-main",
      ownerId: "usr-admin-001",
      createdBy: "admin@aethervox.com",
      updatedBy: "admin@aethervox.com",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEvents((prev) => [newEvent, ...prev]);
  };

  const updateEvent = (id: string, eventData: Partial<TranslationEvent>) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === id
          ? {
              ...event,
              ...eventData,
              updatedBy: "admin@aethervox.com",
              updatedAt: new Date().toISOString(),
            }
          : event
      )
    );
  };

  const deleteEventPlaceholder = (id: string) => {
    alert(`Delete action is currently a placeholder. Event ID: ${id}`);
  };

  const duplicateEventPlaceholder = (id: string) => {
    alert(`Duplicate action is currently a placeholder. Event ID: ${id}`);
  };

  return (
    <EventContext.Provider
      value={{
        events,
        createEvent,
        updateEvent,
        deleteEventPlaceholder,
        duplicateEventPlaceholder,
      }}
    >
      {children}
    </EventContext.Provider>
  );
}

export function useEvents() {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error("useEvents must be used within an EventProvider");
  }
  return context;
}
