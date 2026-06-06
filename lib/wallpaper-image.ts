export const MAX_WALLPAPER_SIZE = 5 * 1024 * 1024;

export const ALLOWED_WALLPAPER_TYPES = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
} as const;

export type AllowedWallpaperMime = keyof typeof ALLOWED_WALLPAPER_TYPES;

export function buildWallpaperUrl(userId: string, updatedAt: Date | number) {
  const version =
    typeof updatedAt === "number" ? updatedAt : updatedAt.getTime();
  return `/api/wallpapers/${userId}?v=${version}`;
}

export function getWallpaperExtension(mimeType: string) {
  return ALLOWED_WALLPAPER_TYPES[mimeType as AllowedWallpaperMime] ?? null;
}
