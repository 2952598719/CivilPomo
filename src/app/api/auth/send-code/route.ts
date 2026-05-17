import { NextRequest, NextResponse } from "next/server";
import redis from "@/lib/kv";
import { sendVerificationCode } from "@/lib/email";

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "请输入有效邮箱" }, { status: 400 });
  }

  const normalized = email.toLowerCase().trim();

  // Rate limit: 1 code per 60 seconds
  const rateKey = `ratelimit:${normalized}`;
  const exists = await redis.get(rateKey);
  if (exists) {
    return NextResponse.json({ error: "请 60 秒后再试" }, { status: 429 });
  }

  const code = Math.random().toString().slice(2, 8).padStart(6, "0");

  // Store code with 5-minute TTL
  await redis.set(`verify:${normalized}`, code, { ex: 300 });
  // Rate limit key with 60-second TTL
  await redis.set(rateKey, "1", { ex: 60 });

  const sent = await sendVerificationCode(normalized, code);
  if (!sent) {
    return NextResponse.json({ error: "邮件发送失败" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
