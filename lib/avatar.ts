export const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

export const ALLOWED_AVATAR_TYPES = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
} as const;

export type AllowedAvatarMime = keyof typeof ALLOWED_AVATAR_TYPES;

export function buildAvatarUrl(userId: string, updatedAt: Date | number) {
  const version =
    typeof updatedAt === "number" ? updatedAt : updatedAt.getTime();
  return `/api/avatars/${userId}?v=${version}`;
}

export function getAvatarExtension(mimeType: string) {
  return ALLOWED_AVATAR_TYPES[mimeType as AllowedAvatarMime] ?? null;
}
