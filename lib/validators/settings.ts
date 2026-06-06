import { z } from "zod";

export const updateDisplayNameSchema = z.object({
  displayName: z.string().trim().max(50, "昵称最多 50 个字符"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "请输入当前密码"),
    newPassword: z.string().min(8, "新密码至少 8 位"),
    confirmPassword: z.string().min(1, "请确认新密码"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "两次输入的新密码不一致",
    path: ["confirmPassword"],
  });

export type ThemePreference = "dark" | "light";

export const THEME_STORAGE_KEY = "pla-theme";

export const THEME_LABELS: Record<ThemePreference, string> = {
  dark: "深色",
  light: "浅色",
};

export type WallpaperPreference =
  | "none"
  | "gradient-indigo"
  | "gradient-sunset"
  | "gradient-ocean"
  | "gradient-forest"
  | "custom";

export const WALLPAPER_STORAGE_KEY = "pla-wallpaper";
export const WALLPAPER_OVERLAY_KEY = "pla-wallpaper-overlay";
export const WALLPAPER_CUSTOM_URL_KEY = "pla-wallpaper-custom-url";
export const DEFAULT_WALLPAPER_OVERLAY = 85;
export const MIN_WALLPAPER_OVERLAY = 30;
export const MAX_WALLPAPER_OVERLAY = 95;

export const WALLPAPER_BUILTIN_PRESETS: Array<{
  id: Exclude<WallpaperPreference, "custom">;
  label: string;
}> = [
  { id: "none", label: "无" },
  { id: "gradient-indigo", label: "靛紫" },
  { id: "gradient-sunset", label: "暮光" },
  { id: "gradient-ocean", label: "深海" },
  { id: "gradient-forest", label: "森林" },
];

export const WALLPAPER_PRESET_IDS: WallpaperPreference[] = [
  ...WALLPAPER_BUILTIN_PRESETS.map((preset) => preset.id),
  "custom",
];

export function clampWallpaperOverlay(value: number) {
  return Math.min(MAX_WALLPAPER_OVERLAY, Math.max(MIN_WALLPAPER_OVERLAY, value));
}

export function parseWallpaperPreference(
  value: string | null | undefined,
): WallpaperPreference {
  if (value && WALLPAPER_PRESET_IDS.includes(value as WallpaperPreference)) {
    return value as WallpaperPreference;
  }
  return "none";
}
