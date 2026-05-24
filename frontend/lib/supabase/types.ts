export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan: "free" | "pro" | "enterprise";
          status: "active" | "canceled" | "past_due" | "trialing";
          current_period_start: string;
          current_period_end: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan?: "free" | "pro" | "enterprise";
          status?: "active" | "canceled" | "past_due" | "trialing";
          current_period_start?: string;
          current_period_end?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan?: "free" | "pro" | "enterprise";
          status?: "active" | "canceled" | "past_due" | "trialing";
          current_period_start?: string;
          current_period_end?: string;
          created_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          description: string | null;
          source_language: string;
          target_languages: string[];
          status: "draft" | "live" | "completed" | "cancelled";
          scheduled_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          title: string;
          description?: string | null;
          source_language: string;
          target_languages?: string[];
          status?: "draft" | "live" | "completed" | "cancelled";
          scheduled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          title?: string;
          description?: string | null;
          source_language?: string;
          target_languages?: string[];
          status?: "draft" | "live" | "completed" | "cancelled";
          scheduled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      usage_tracking: {
        Row: {
          id: string;
          user_id: string;
          event_id: string | null;
          minutes_processed: number;
          characters_translated: number;
          date: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          event_id?: string | null;
          minutes_processed?: number;
          characters_translated?: number;
          date?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          event_id?: string | null;
          minutes_processed?: number;
          characters_translated?: number;
          date?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
