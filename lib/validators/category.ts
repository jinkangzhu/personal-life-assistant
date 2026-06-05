import { z } from "zod";

export const categoryNameSchema = z
  .string()
  .trim()
  .min(1, "分类名不能为空")
  .max(50, "分类名最多 50 个字符");

export const categoryCreateSchema = z.object({
  name: categoryNameSchema,
});

export const categoryUpdateSchema = z.object({
  name: categoryNameSchema,
});
