"use client";

import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, error, type, className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword && showPassword ? "text" : type;

    return (
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-zinc-300">
          {label}
        </label>
        <div className="relative">
          <input
            ref={ref}
            type={inputType}
            className={cn(
              "w-full rounded-lg border bg-zinc-800/50 px-3 py-2.5 text-sm text-white placeholder-zinc-500 transition-colors",
              "focus:border-electric-blue/50 focus:outline-none focus:ring-2 focus:ring-electric-blue/20",
              "autofill:bg-zinc-800 autofill:text-white",
              error
                ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                : "border-white/[0.08] hover:border-white/[0.12]",
              isPassword && "pr-10",
              className
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
        {error && (
          <p className="text-xs text-red-400 mt-1">{error}</p>
        )}
      </div>
    );
  }
);

AuthInput.displayName = "AuthInput";
