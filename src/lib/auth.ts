import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

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
  return verifyToken(token);
}

export async function setUserCookie(email: string): Promise<string> {
  const token = await signToken(email);
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

export function clearUserCookie() {
  // In API routes we set the cookie header directly
  return {
    name: COOKIE_NAME,
    value: "",
    options: { httpOnly: true, secure: true, sameSite: "lax" as const, maxAge: 0, path: "/" },
  };
}
