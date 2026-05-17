import { NextRequest, NextResponse } from "next/server";
import redis from "@/lib/kv";
import { setUserCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { email, code } = await request.json();

  if (!email || !code) {
    return NextResponse.json({ error: "缺少参数" }, { status: 400 });
  }

  const normalized = email.toLowerCase().trim();
  const stored = await redis.get(`verify:${normalized}`);

  if (!stored || String(stored) !== String(code)) {
    return NextResponse.json({ error: "验证码错误或已过期" }, { status: 400 });
  }

  // Delete used code
  await redis.del(`verify:${normalized}`);

  // Set JWT cookie
  await setUserCookie(normalized);

  return NextResponse.json({ ok: true });
}
