import { z } from "zod";
import { Priority, RecurrenceType } from "@prisma/client";

export const todoFilterSchema = z.enum(["today", "all", "completed", "pending"]);

export type TodoFilter = z.infer<typeof todoFilterSchema>;

export const recurrenceFormSchema = z.enum(["none", "daily", "weekly", "monthly"]);

const todoCreateBaseSchema = z.object({
  title: z.string().trim().min(1, "标题不能为空").max(200),
  description: z.string().trim().max(5000).optional(),
  dueDate: z.string().optional(),
  priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
  recurrence: recurrenceFormSchema.default("none"),
  weeklyDays: z.string().optional(),
  monthlyDay: z.coerce.number().int().min(1).max(31).optional(),
  recurrenceStartDate: z.string().optional(),
  recurrenceEndDate: z.string().optional(),
});

export const todoCreateSchema = todoCreateBaseSchema.superRefine((data, ctx) => {
  if (data.recurrence === "weekly") {
    const days = parseWeeklyDaysInput(data.weeklyDays);
    if (days.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "请至少选择一天",
        path: ["weeklyDays"],
      });
    }
  }
  if (data.recurrence === "monthly" && !data.monthlyDay) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "请选择每月日期",
      path: ["monthlyDay"],
    });
  }
});

export function parseWeeklyDaysInput(value: string | undefined) {
  if (!value?.trim()) return [];
  return value
    .split(",")
    .map((part) => Number(part.trim()))
    .filter((day) => Number.isInteger(day) && day >= 0 && day <= 6);
}

export function mapRecurrenceFormToType(value: z.infer<typeof recurrenceFormSchema>) {
  switch (value) {
    case "daily":
      return RecurrenceType.DAILY;
    case "weekly":
      return RecurrenceType.WEEKLY;
    case "monthly":
      return RecurrenceType.MONTHLY;
    default:
      return null;
  }
}

export const todoUpdateSchema = todoCreateBaseSchema.extend({
  completionNote: z.string().trim().max(2000).optional(),
});

export function parseTodoFilter(value: string | undefined): TodoFilter {
  const parsed = todoFilterSchema.safeParse(value);
  return parsed.success ? parsed.data : "today";
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: "低",
  MEDIUM: "中",
  HIGH: "高",
};
