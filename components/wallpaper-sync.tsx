"use client";

import { useEffect } from "react";
import { buildWallpaperUrl } from "@/lib/wallpaper-image";
import { syncWallpaperFromServer } from "@/lib/wallpaper";
import { parseWallpaperPreference } from "@/lib/validators/settings";

export function WallpaperSync({
  user,
}: {
  user: {
    id: string;
    wallpaperPreference: string;
    wallpaperOverlay: number;
    wallpaperKey: string | null;
    updatedAt: Date;
  };
}) {
  useEffect(() => {
    const parsed = parseWallpaperPreference(user.wallpaperPreference);
    const preference =
      parsed === "custom" && !user.wallpaperKey ? "none" : parsed;
    const customUrl =
      preference === "custom" && user.wallpaperKey
        ? buildWallpaperUrl(user.id, user.updatedAt)
        : null;

    syncWallpaperFromServer(preference, user.wallpaperOverlay, customUrl);
  }, [
    user.id,
    user.updatedAt,
    user.wallpaperKey,
    user.wallpaperOverlay,
    user.wallpaperPreference,
  ]);

  return null;
}
