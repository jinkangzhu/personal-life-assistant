import { z } from "zod";

export const reviewCreateSchema = z.object({
  periodDate: z.string().trim().min(1, "日期不能为空"),
  content: z.string().max(50000).default(""),
});

export const reviewUpdateSchema = z.object({
  content: z.string().max(50000).default(""),
});
