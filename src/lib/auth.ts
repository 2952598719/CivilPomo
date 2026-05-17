import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import redis from "@/lib/kv";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "civilpomo-dev-secret"
);

const COOKIE_NAME = "civilpomo-token";
const TOKEN_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

export async function signToken(email: string): Promise<string> {
  return new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(`${TOKEN_MAX_AGE}s`)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.email as string;
  } catch {
    return null;
  }
}

export async function getUserEmail(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const email = await verifyToken(token);
  if (!email) return null;

  // Check that this token is the current active session
  const activeToken = await redis.get(`session:${email}`);
  if (!activeToken || activeToken !== token) return null;

  return email;
}

export async function setUserCookie(email: string): Promise<string> {
  const token = await signToken(email);

  // Store as the only valid session for this user (single-device)
  await redis.set(`session:${email}`, token, { ex: TOKEN_MAX_AGE });

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: TOKEN_MAX_AGE,
    path: "/",
  });
  return token;
}

export async function validateTokenFromRequest(token: string): Promise<string | null> {
  const email = await verifyToken(token);
  if (!email) return null;

  const activeToken = await redis.get(`session:${email}`);
  if (!activeToken || activeToken !== token) return null;

  return email;
}
