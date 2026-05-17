import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { Redis } from "@upstash/redis";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "civilpomo-dev-secret"
);

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

const PUBLIC_PATHS = ["/login", "/api/auth", "/manifest.json", "/sw.js", "/icon-192.png", "/icon-512.png"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/sounds") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("civilpomo-token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    const isRSC = request.headers.get("RSC") === "1";
    if (isRSC) {
      return NextResponse.next();
    }

    const email = payload.email as string;
    const activeToken = await redis.get(`session:${email}`);
    if (!activeToken || activeToken !== token) {
      const res = NextResponse.redirect(new URL("/login", request.url));
      res.cookies.set("civilpomo-token", "", { maxAge: 0, path: "/" });
      return res;
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}
