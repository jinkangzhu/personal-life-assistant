import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "dev-secret-change-in-production",
);

export const TOKEN_COOKIE = "token";
export const TOKEN_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "30d";

export interface JwtPayload {
  userId: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

function parseExpiry(expiresIn: string): string | number {
  const match = expiresIn.match(/^(\d+)([dhms])$/);
  if (!match) return expiresIn;

  const value = parseInt(match[1], 10);
  const unit = match[2];
  const multipliers: Record<string, number> = {
    s: 1,
    m: 60,
    h: 3600,
    d: 86400,
  };
  return `${value * multipliers[unit]}s`;
}

export async function signToken(payload: JwtPayload): Promise<string> {
  return new SignJWT({ userId: payload.userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(parseExpiry(TOKEN_EXPIRES_IN))
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId;
    if (typeof userId !== "string") return null;
    return { userId };
  } catch {
    return null;
  }
}

export function getTokenMaxAgeSeconds(): number {
  const match = TOKEN_EXPIRES_IN.match(/^(\d+)([dhms])$/);
  if (!match) return 60 * 60 * 24 * 30;

  const value = parseInt(match[1], 10);
  const unit = match[2];
  const multipliers: Record<string, number> = {
    s: 1,
    m: 60,
    h: 3600,
    d: 86400,
  };
  return value * multipliers[unit];
}

export function getAuthCookieOptions(maxAge = getTokenMaxAgeSeconds()) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export function setAuthCookie(
  response: { cookies: { set: (name: string, value: string, options: ReturnType<typeof getAuthCookieOptions>) => void } },
  token: string,
) {
  response.cookies.set(TOKEN_COOKIE, token, getAuthCookieOptions());
}

export function clearAuthCookie(
  response: { cookies: { set: (name: string, value: string, options: ReturnType<typeof getAuthCookieOptions>) => void } },
) {
  response.cookies.set(TOKEN_COOKIE, "", getAuthCookieOptions(0));
}
