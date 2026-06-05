import { timingSafeEqual } from "crypto";

const MIN_PASSWORD_RESET_SECRET_LENGTH = 16;

export function isPasswordResetEnabled(): boolean {
  const secret = process.env.PASSWORD_RESET_SECRET?.trim();
  return Boolean(secret && secret.length >= MIN_PASSWORD_RESET_SECRET_LENGTH);
}

export function verifyPasswordResetSecret(provided: string): boolean {
  const expected = process.env.PASSWORD_RESET_SECRET?.trim();
  if (!expected || !isPasswordResetEnabled()) return false;

  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);
  if (providedBuffer.length !== expectedBuffer.length) return false;

  return timingSafeEqual(providedBuffer, expectedBuffer);
}
