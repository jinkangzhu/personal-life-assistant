import { z } from "zod";
import { Priority, RecurrenceType } from "@prisma/client";
import {
  optionalActivityTypeIdSchema,
  optionalMinutesSchema,
} from "@/lib/validators/todo";

export const recurrenceTypeSchema = z.nativeEnum(RecurrenceType);

const recurringTodoFieldsSchema = z.object({
  title: z.string().trim().min(1, "标题不能为空").max(200),
  description: z.string().trim().max(5000).optional(),
  priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
  recurrenceType: recurrenceTypeSchema,
  weeklyDays: z.array(z.number().int().min(0).max(6)).optional(),
  monthlyDay: z.number().int().min(1).max(31).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  planId: z.string().uuid().optional(),
  estimatedMinutes: optionalMinutesSchema,
  activityTypeId: optionalActivityTypeIdSchema,
  actualMinutes: optionalMinutesSchema,
});

function addRecurrenceRules(
  data: z.infer<typeof recurringTodoFieldsSchema>,
  ctx: z.RefinementCtx,
) {
  if (data.recurrenceType === RecurrenceType.WEEKLY) {
    if (!data.weeklyDays?.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "请至少选择一天",
        path: ["weeklyDays"],
      });
    }
  }
  if (data.recurrenceType === RecurrenceType.MONTHLY) {
    if (!data.monthlyDay) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "请选择每月日期",
        path: ["monthlyDay"],
      });
    }
  }
}

export const recurringTodoCreateSchema = recurringTodoFieldsSchema.superRefine(
  addRecurrenceRules,
);

export const recurringTodoUpdateSchema = recurringTodoFieldsSchema
  .omit({ planId: true })
  .superRefine(addRecurrenceRules);

export const RECURRENCE_TYPE_LABELS: Record<RecurrenceType, string> = {
  DAILY: "每天",
  WEEKLY: "每周",
  MONTHLY: "每月",
};

export const WEEKDAY_LABELS = ["日", "一", "二", "三", "四", "五", "六"] as const;

export type RecurringTodoCreateInput = z.infer<typeof recurringTodoCreateSchema>;
