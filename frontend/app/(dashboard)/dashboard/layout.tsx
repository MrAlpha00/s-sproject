import type { Metadata } from "next";
import DashboardLayoutComponent from "@/components/dashboard/DashboardLayout";

export const metadata: Metadata = {
  title: "Dashboard | AetherVOX",
  description: "Your AetherVOX dashboard",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayoutComponent>{children}</DashboardLayoutComponent>;
}

