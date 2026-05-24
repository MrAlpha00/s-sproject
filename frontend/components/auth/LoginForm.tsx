"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthInput } from "@/components/auth/AuthInput";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState({ email: "", password: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: fields.email,
      password: fields.password,
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <AuthCard>
      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthInput
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={fields.email}
          onChange={(e) => setFields({ ...fields, email: e.target.value })}
          required
          autoComplete="email"
        />

        <div className="space-y-1">
          <AuthInput
            label="Password"
            type="password"
            placeholder="••••••••"
            value={fields.password}
            onChange={(e) => setFields({ ...fields, password: e.target.value })}
            required
            autoComplete="current-password"
          />
          <div className="flex justify-end">
            <Link
              href="/register"
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2">
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-10 bg-gradient-to-r from-electric-blue to-accent-purple text-white font-semibold hover:opacity-90 transition-opacity"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in…
            </span>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>

      <div className="mt-5">
        <OAuthButtons />
      </div>

      <p className="mt-6 text-center text-xs text-zinc-500">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-electric-blue hover:text-electric-blue/80 transition-colors"
        >
          Create one
        </Link>
      </p>
    </AuthCard>
  );
}
