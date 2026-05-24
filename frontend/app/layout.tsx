import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/providers/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
