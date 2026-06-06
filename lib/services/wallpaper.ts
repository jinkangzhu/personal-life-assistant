import fs from "fs/promises";
import { prisma } from "@/lib/db";
import {
  getWallpaperExtension,
  MAX_WALLPAPER_SIZE,
} from "@/lib/wallpaper-image";
import {
  deleteWallpaperFilesForUser,
  ensureWallpapersDir,
  getWallpaperFilePath,
} from "@/lib/wallpaper-storage";
import {
  clampWallpaperOverlay,
  parseWallpaperPreference,
  type WallpaperPreference,
} from "@/lib/validators/settings";

export async function updateUserWallpaperPreference(
  userId: string,
  preference: WallpaperPreference,
  overlay: number,
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { wallpaperKey: true },
  });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  if (preference === "custom" && !user.wallpaperKey) {
    throw new Error("WALLPAPER_FILE_MISSING");
  }

  return prisma.user.update({
    where: { id: userId },
    data: {
      wallpaperPreference: preference,
      wallpaperOverlay: clampWallpaperOverlay(overlay),
    },
  });
}

export async function uploadUserWallpaper(userId: string, file: File) {
  if (file.size > MAX_WALLPAPER_SIZE) {
    throw new Error("WALLPAPER_TOO_LARGE");
  }

  const extension = getWallpaperExtension(file.type);
  if (!extension) {
    throw new Error("WALLPAPER_INVALID_TYPE");
  }

  await ensureWallpapersDir();
  await deleteWallpaperFilesForUser(userId);

  const wallpaperKey = `${userId}${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(getWallpaperFilePath(wallpaperKey), buffer);

  return prisma.user.update({
    where: { id: userId },
    data: {
      wallpaperKey,
      wallpaperPreference: "custom",
    },
  });
}

export async function removeUserWallpaper(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { wallpaperPreference: true },
  });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  await deleteWallpaperFilesForUser(userId);

  return prisma.user.update({
    where: { id: userId },
    data: {
      wallpaperKey: null,
      wallpaperPreference:
        user.wallpaperPreference === "custom" ? "none" : user.wallpaperPreference,
    },
  });
}

export function resolveUserWallpaperPreference(
  preference: string,
  wallpaperKey: string | null,
): WallpaperPreference {
  const parsed = parseWallpaperPreference(preference);
  if (parsed === "custom" && !wallpaperKey) {
    return "none";
  }
  return parsed;
}
