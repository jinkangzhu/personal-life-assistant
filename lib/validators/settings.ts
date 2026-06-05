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
