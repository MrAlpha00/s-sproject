import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ live: true }, { status: 200 });
}
export const dynamic = "force-dynamic";
