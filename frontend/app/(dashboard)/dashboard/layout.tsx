import type { Metadata } from "next";
import DashboardLayoutComponent from "@/components/dashboard/DashboardLayout";
import { EventProvider } from "@/providers/EventProvider";

export const metadata: Metadata = {
  title: "Dashboard | AetherVOX",
  description: "Your AetherVOX dashboard",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <EventProvider>
      <DashboardLayoutComponent>{children}</DashboardLayoutComponent>
    </EventProvider>
  );
}

