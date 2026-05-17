import { NextRequest, NextResponse } from "next/server";
import redis from "@/lib/kv";

export async function GET() {
  try {
    const data = await redis.get("progress");
    if (!data || Object.keys(data as object).length === 0) {
      return NextResponse.json(null);
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(null);
  }
}

export async function POST(request: NextRequest) {
  const data = await request.json();
  await redis.set("progress", data);
  return NextResponse.json({ ok: true });
}
