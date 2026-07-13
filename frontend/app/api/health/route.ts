import { NextResponse } from "next/server";
import { HealthService } from "@/lib/health/HealthService";

export async function GET() {
  const report = await HealthService.check();
  const status = report.status === "unhealthy" ? 503 : 200;
  return NextResponse.json(report, { status });
}
export const dynamic = "force-dynamic";
