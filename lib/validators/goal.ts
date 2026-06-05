import { z } from "zod";
import { GoalStatus } from "@prisma/client";

export const goalCreateSchema = z.object({
  title: z.string().trim().min(1, "标题不能为空").max(200),
  description: z.string().trim().max(5000).optional(),
  status: z.nativeEnum(GoalStatus).default(GoalStatus.ACTIVE),
});

export const goalUpdateSchema = goalCreateSchema;

export const GOAL_STATUS_LABELS: Record<GoalStatus, string> = {
  ACTIVE: "进行中",
  COMPLETED: "已完成",
  PAUSED: "已暂停",
};

export function parsePlanIds(value: string | undefined): string[] {
  if (!value?.trim()) return [];
  return [
    ...new Set(
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];
}
