"use client";

import { useState } from "react";
import { Chrome } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function OAuthButtons() {
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  async function signInWithGoogle() {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err) {
      console.error("Google OAuth error:", err);
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-white/[0.06]" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-zinc-900/60 px-2 text-zinc-500">
            or continue with
          </span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={signInWithGoogle}
        disabled={isLoading}
        className="w-full h-10 gap-2 bg-zinc-800/40 border-white/[0.08] hover:bg-zinc-700/50 text-zinc-300 hover:text-white"
      >
        {isLoading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-500 border-t-white" />
        ) : (
          <Chrome className="h-4 w-4" />
        )}
        Google
      </Button>
    </div>
  );
}
