"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { TranslationEvent } from "@/types/event";
import { createClient } from "@/supabase/client";
import { EventRepository } from "@/lib/database/repositories/EventRepository";

interface EventContextType {
  events: TranslationEvent[];
  createEvent: (eventData: Omit<TranslationEvent, "id" | "createdAt" | "updatedAt" | "createdBy" | "updatedBy" | "organizationId" | "ownerId">) => Promise<void>;
  updateEvent: (id: string, eventData: Partial<TranslationEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  duplicateEvent: (id: string) => Promise<void>;
  deleteEventPlaceholder: (id: string) => Promise<void> | void;
  duplicateEventPlaceholder: (id: string) => Promise<void> | void;
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
  const [eventRepo, setEventRepo] = useState<EventRepository | null>(null);

  useEffect(() => {
    const client = createClient();
    const repo = new EventRepository(client);
    setEventRepo(repo);

    async function loadEvents() {
      try {
        const dbEvents = await repo.findAll();
        if (dbEvents && dbEvents.length > 0) {
          setEvents(dbEvents);
        } else {
          setEvents(INITIAL_EVENTS);
        }
      } catch (error) {
        console.warn("Failed to load events from Supabase, using initial fallback:", error);
        setEvents(INITIAL_EVENTS);
      }
    }

    loadEvents();
  }, []);

  const createEvent = async (
    eventData: Omit<TranslationEvent, "id" | "createdAt" | "updatedAt" | "createdBy" | "updatedBy" | "organizationId" | "ownerId">
  ) => {
    if (eventRepo) {
      try {
        const newEvent = await eventRepo.create({
          ...eventData,
          organizationId: "org-aether-main",
          ownerId: "usr-admin-001",
          createdBy: "admin@aethervox.com",
          updatedBy: "admin@aethervox.com",
        });
        setEvents((prev) => [newEvent, ...prev]);
        return;
      } catch (error) {
        console.warn("Failed to insert event in Supabase, using local fallback state:", error);
      }
    }

    // Fallback to local memory state
    const fallbackEvent: TranslationEvent = {
      ...eventData,
      id: `evt-mock-${Math.random().toString(36).substring(2, 9)}`,
      organizationId: "org-aether-main",
      ownerId: "usr-admin-001",
      createdBy: "admin@aethervox.com",
      updatedBy: "admin@aethervox.com",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEvents((prev) => [fallbackEvent, ...prev]);
  };

  const updateEvent = async (id: string, eventData: Partial<TranslationEvent>) => {
    if (eventRepo && !id.startsWith("evt-mock-")) {
      try {
        const updated = await eventRepo.update(id, {
          ...eventData,
          updatedBy: "admin@aethervox.com",
        });
        setEvents((prev) =>
          prev.map((event) => (event.id === id ? updated : event))
        );
        return;
      } catch (error) {
        console.warn("Failed to update event in Supabase, using local fallback state:", error);
      }
    }

    // Fallback update
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

  const deleteEvent = async (id: string) => {
    if (eventRepo && !id.startsWith("evt-mock-")) {
      try {
        await eventRepo.delete(id);
      } catch (err) {
        console.warn("Failed to delete event from Supabase:", err);
      }
    }
    setEvents((prev) => prev.filter((event) => event.id !== id));
  };

  const duplicateEvent = async (id: string) => {
    const existing = events.find((e) => e.id === id);
    if (!existing) return;
    const { id: _id, createdAt: _c, updatedAt: _u, organizationId: _o, ownerId: _ow, createdBy: _cb, updatedBy: _ub, ...rest } = existing;
    await createEvent({
      ...rest,
      name: `${existing.name} (Copy)`,
    });
  };

  return (
    <EventContext.Provider
      value={{
        events,
        createEvent,
        updateEvent,
        deleteEvent,
        duplicateEvent,
        deleteEventPlaceholder: deleteEvent,
        duplicateEventPlaceholder: duplicateEvent,
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
