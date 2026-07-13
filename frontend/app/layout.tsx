import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/providers/AuthProvider";

const geistSans = {
  variable: "font-sans",
};

const geistMono = {
  variable: "font-mono",
};

export const metadata: Metadata = {
  title: "AetherVOX | Real-Time AI Speech Translation & Enterprise Voice Synthesis",
  description:
    "Instantly translate live speeches, conferences, and broadcasts into 50+ languages with sub-second latency, neural voice cloning, and scalable event infrastructure.",
  keywords: [
    "AI translation",
    "real-time translation",
    "speech-to-speech",
    "voice cloning",
    "live events",
    "enterprise SaaS",
    "multilingual broadcast",
  ],
  authors: [{ name: "AetherVOX Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-electric-blue/30 selection:text-white">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
