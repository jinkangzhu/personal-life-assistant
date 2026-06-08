import { z } from "zod";

export const activityTypeNameSchema = z
  .string()
  .trim()
  .min(1, "类型名不能为空")
  .max(50, "类型名最多 50 个字符");

export const activityTypeCreateSchema = z.object({
  name: activityTypeNameSchema,
});

export const activityTypeUpdateSchema = z.object({
  name: activityTypeNameSchema,
});

export const DEFAULT_ACTIVITY_TYPES = [
  { name: "工作", sortOrder: 0 },
  { name: "学习", sortOrder: 1 },
  { name: "生活", sortOrder: 2 },
] as const;
