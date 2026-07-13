import { NextResponse } from "next/server";
import { HealthService } from "@/lib/health/HealthService";

export async function GET() {
  const report = await HealthService.check();
  const ready = report.services.database === "Connected" && report.services.supabase === "Connected";
  return NextResponse.json({ ready }, { status: ready ? 200 : 503 });
}
export const dynamic = "force-dynamic";
