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

export function RegisterForm() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (fields.password !== fields.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (fields.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: fields.email,
      password: fields.password,
      options: {
        data: {
          full_name: fields.fullName,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setIsLoading(false);
      return;
    }

    if (data.user?.identities?.length === 0) {
      setError("An account with this email already exists");
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
          label="Full Name"
          type="text"
          placeholder="John Doe"
          value={fields.fullName}
          onChange={(e) => setFields({ ...fields, fullName: e.target.value })}
          required
          autoComplete="name"
        />

        <AuthInput
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={fields.email}
          onChange={(e) => setFields({ ...fields, email: e.target.value })}
          required
          autoComplete="email"
        />

        <AuthInput
          label="Password"
          type="password"
          placeholder="••••••••"
          value={fields.password}
          onChange={(e) => setFields({ ...fields, password: e.target.value })}
          required
          autoComplete="new-password"
        />

        <AuthInput
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          value={fields.confirmPassword}
          onChange={(e) =>
            setFields({ ...fields, confirmPassword: e.target.value })
          }
          required
          autoComplete="new-password"
        />

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
              Creating account…
            </span>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>

      <div className="mt-5">
        <OAuthButtons />
      </div>

      <p className="mt-6 text-center text-xs text-zinc-500">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-electric-blue hover:text-electric-blue/80 transition-colors"
        >
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
