import { NextRequest, NextResponse } from "next/server";
import redis from "@/lib/kv";
import { getUserEmail } from "@/lib/auth";

export async function GET() {
  const email = await getUserEmail();
  if (!email) return NextResponse.json(null, { status: 401 });

  try {
    const data = await redis.get(`user:${email}:narratives`);
    if (!data || Object.keys(data as object).length === 0) {
      return NextResponse.json(null);
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(null);
  }
}

export async function POST(request: NextRequest) {
  const email = await getUserEmail();
  if (!email) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const data = await request.json();
  await redis.set(`user:${email}:narratives`, data);
  return NextResponse.json({ ok: true });
}
