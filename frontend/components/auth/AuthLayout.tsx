import type { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-electric-blue/[0.03] via-transparent to-transparent" />
      <div className="grid-bg absolute inset-0 opacity-30" />

      <div className="relative z-10 w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex items-center justify-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-electric-blue to-accent-purple p-[1px] shadow-[0_0_15px_rgba(0,212,255,0.2)]">
              <div className="flex h-full w-full items-center justify-center rounded-lg bg-black">
                <svg
                  className="h-5 w-5 text-electric-blue"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m5 8 6 6" />
                  <path d="m4 14 6-6 2-3" />
                  <path d="M2 5h12" />
                  <path d="M7 2h1" />
                  <path d="m22 8-7 9" />
                  <path d="m21 17-1-2" />
                  <path d="M16.5 11a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9Z" />
                </svg>
              </div>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Aether
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-electric-blue to-accent-purple font-extrabold">
                VOX
              </span>
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-sm text-zinc-400">{subtitle}</p>
          )}
        </div>
        {children}
      </div>

      <p className="relative z-10 mt-8 text-xs text-zinc-600">
        &copy; {new Date().getFullYear()} AetherVOX. All rights reserved.
      </p>
    </div>
  );
}
