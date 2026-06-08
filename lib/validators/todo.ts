import { MAX_DURATION_MINUTES } from "@/lib/duration";
import { parseDateInput, toDateInputValue } from "@/lib/utils";
import { z } from "zod";
import { Priority, RecurrenceType } from "@prisma/client";

export const todoFilterSchema = z.enum(["today", "all", "completed", "pending"]);

export type TodoFilter = z.infer<typeof todoFilterSchema>;

export const recurrenceFormSchema = z.enum(["none", "daily", "weekly", "monthly"]);

export const optionalMinutesSchema = z.preprocess(
  (value) => {
    if (value === undefined || value === null || value === "") return undefined;
    return value;
  },
  z.coerce
    .number()
    .int("时长须为整数")
    .min(1, "时长至少 1 分钟")
    .max(MAX_DURATION_MINUTES, "时长最多 7 天")
    .optional(),
);

export const optionalActivityTypeIdSchema = z.preprocess(
  (value) => {
    if (value === undefined || value === null || value === "") return undefined;
    return value;
  },
  z.string().uuid("活动类型无效").optional(),
);

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
  estimatedMinutes: optionalMinutesSchema,
  activityTypeId: optionalActivityTypeIdSchema,
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
  actualMinutes: optionalMinutesSchema,
});

export function parseTodoFilter(value: string | undefined): TodoFilter {
  const parsed = todoFilterSchema.safeParse(value);
  return parsed.success ? parsed.data : "today";
}

export const completedTodoSortFieldSchema = z.enum([
  "createdAt",
  "completedAt",
  "duration",
]);

export type CompletedTodoSortField = z.infer<typeof completedTodoSortFieldSchema>;

export const sortOrderSchema = z.enum(["asc", "desc"]);

export type SortOrder = z.infer<typeof sortOrderSchema>;

export type CompletedTodoSort = {
  sortBy: CompletedTodoSortField;
  sortOrder: SortOrder;
};

export const COMPLETED_TODO_SORT_LABELS: Record<CompletedTodoSortField, string> =
  {
    createdAt: "开始时间",
    completedAt: "完成时间",
    duration: "时长",
  };

export const SORT_ORDER_LABELS: Record<SortOrder, string> = {
  asc: "正序",
  desc: "倒序",
};

export const DEFAULT_COMPLETED_TODO_SORT: CompletedTodoSort = {
  sortBy: "completedAt",
  sortOrder: "desc",
};

export function parseCompletedTodoSort(params: {
  sortBy?: string;
  sortOrder?: string;
}): CompletedTodoSort | null {
  const sortBy = completedTodoSortFieldSchema.safeParse(params.sortBy);
  const sortOrder = sortOrderSchema.safeParse(params.sortOrder);
  if (!sortBy.success || !sortOrder.success) return null;
  return { sortBy: sortBy.data, sortOrder: sortOrder.data };
}

export type TodoDateRangeFilter = {
  dateFrom?: Date;
  dateTo?: Date;
};

export function parseTodoDateRangeFilter(params: {
  from?: string;
  to?: string;
}): TodoDateRangeFilter {
  return {
    dateFrom: parseDateInput(params.from) ?? undefined,
    dateTo: parseDateInput(params.to) ?? undefined,
  };
}

export function hasTodoDateRangeFilter(
  range: TodoDateRangeFilter | undefined,
): boolean {
  return Boolean(range?.dateFrom || range?.dateTo);
}

export function todosPageHref(options: {
  filter?: TodoFilter;
  dateRange?: TodoDateRangeFilter;
  completedSort?: CompletedTodoSort | null;
}): string {
  const filter = options.filter ?? "today";
  const params = new URLSearchParams();
  if (filter !== "today") {
    params.set("filter", filter);
  }
  if (options.dateRange?.dateFrom) {
    params.set("from", toDateInputValue(options.dateRange.dateFrom));
  }
  if (options.dateRange?.dateTo) {
    params.set("to", toDateInputValue(options.dateRange.dateTo));
  }
  if (filter === "completed" && options.completedSort) {
    params.set("sortBy", options.completedSort.sortBy);
    params.set("sortOrder", options.completedSort.sortOrder);
  }
  const query = params.toString();
  return query ? `/todos?${query}` : "/todos";
}

export function todoFilterHref(
  filter: TodoFilter,
  dateRange?: TodoDateRangeFilter,
  completedSort?: CompletedTodoSort | null,
): string {
  return todosPageHref({ filter, dateRange, completedSort });
}

export function formatTodoDateRangeLabel(range: TodoDateRangeFilter): string {
  const fromLabel = range.dateFrom
    ? range.dateFrom.toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;
  const toLabel = range.dateTo
    ? range.dateTo.toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  if (fromLabel && toLabel) return `${fromLabel} 至 ${toLabel}`;
  if (fromLabel) return `${fromLabel} 起`;
  if (toLabel) return `至 ${toLabel}`;
  return "";
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: "低",
  MEDIUM: "中",
  HIGH: "高",
};
