import { z } from "zod";
import { PlanStatus, PlanType } from "@prisma/client";
import { todoCreateSchema } from "@/lib/validators/todo";

export const planCreateSchema = z.object({
  title: z.string().trim().min(1, "标题不能为空").max(200),
  description: z.string().trim().max(5000).optional(),
  type: z.nativeEnum(PlanType).default(PlanType.SHORT_TERM),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.nativeEnum(PlanStatus).default(PlanStatus.ACTIVE),
});

export const planUpdateSchema = planCreateSchema;

export const planTodoCreateSchema = todoCreateSchema;

export const PLAN_TYPE_LABELS: Record<PlanType, string> = {
  SHORT_TERM: "短期",
  LONG_TERM: "长期",
};

export const PLAN_STATUS_LABELS: Record<PlanStatus, string> = {
  ACTIVE: "进行中",
  COMPLETED: "已完成",
  ARCHIVED: "已归档",
};

export type PlanCreateInput = z.infer<typeof planCreateSchema>;
export type PlanUpdateInput = z.infer<typeof planUpdateSchema>;
