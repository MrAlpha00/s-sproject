import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | AetherVOX",
  description: "Your AetherVOX dashboard",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
