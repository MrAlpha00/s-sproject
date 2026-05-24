import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AuthCardProps {
  children: ReactNode;
  className?: string;
}

export function AuthCard({ children, className }: AuthCardProps) {
  return (
    <div
      className={cn(
        "relative w-full max-w-md rounded-2xl border border-white/[0.06] bg-zinc-900/60 p-8 shadow-2xl backdrop-blur-xl",
        "before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-b before:from-white/[0.04] before:to-transparent",
        className
      )}
    >
      <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-electric-blue/[0.03] via-transparent to-transparent pointer-events-none" />
      {children}
    </div>
  );
}
