import { prisma } from "@/lib/db";
import {
  eachDateInRange,
  formatRecurrenceLabel,
  parseWeeklyDays,
  recurringTodoAppliesOnDate,
  type RecurringSchedule,
} from "@/lib/recurrence";
import { startOfDay } from "@/lib/utils";
import { nextTodoSortOrder } from "@/lib/services/sort-order";
import type { RecurringTodoCreateInput } from "@/lib/validators/recurring-todo";
import {
  OccurrenceStatus,
  Prisma,
  RecurrenceType,
  TodoStatus,
  type Priority,
} from "@prisma/client";

const recurringInclude = {
  plan: { select: { id: true, title: true } },
} satisfies Prisma.RecurringTodoInclude;

export type RecurringTodoWithPlan = Prisma.RecurringTodoGetPayload<{
  include: typeof recurringInclude;
}>;

export type DisplayTodoItem = {
  kind: "one_time" | "recurring";
  id: string;
  recurringId?: string;
  periodDate?: Date;
  title: string;
  description: string | null;
  priority: Priority;
  status: TodoStatus;
  dueDate: Date | null;
  completionNote: string | null;
  plan: { id: string; title: string } | null;
  sortOrder: number;
  createdAt: Date;
  recurrenceLabel?: string;
  recurringDeleted?: boolean;
  recurringPaused?: boolean;
};

function toSchedule(todo: RecurringTodoWithPlan): RecurringSchedule {
  return {
    recurrenceType: todo.recurrenceType,
    weeklyDays: parseWeeklyDays(todo.weeklyDays),
    monthlyDay: todo.monthlyDay,
    startDate: todo.startDate,
    endDate: todo.endDate,
    active: todo.active,
    deletedAt: todo.deletedAt,
  };
}

function occurrenceToStatus(status: OccurrenceStatus): TodoStatus {
  if (status === OccurrenceStatus.COMPLETED) return TodoStatus.COMPLETED;
  if (status === OccurrenceStatus.SKIPPED) return TodoStatus.CANCELLED;
  return TodoStatus.PENDING;
}

export function toDisplayTodoFromRecurring(
  todo: RecurringTodoWithPlan,
  periodDate: Date,
  occurrence?: {
    status: OccurrenceStatus;
    completionNote: string | null;
  } | null,
): DisplayTodoItem {
  return {
    kind: "recurring",
    id: `${todo.id}:${toDateKey(periodDate)}`,
    recurringId: todo.id,
    periodDate: startOfDay(periodDate),
    title: todo.title,
    description: todo.description,
    priority: todo.priority,
    status: occurrence
      ? occurrenceToStatus(occurrence.status)
      : TodoStatus.PENDING,
    dueDate: startOfDay(periodDate),
    completionNote: occurrence?.completionNote ?? null,
    plan: todo.plan,
    sortOrder: todo.sortOrder,
    createdAt: todo.createdAt,
    recurrenceLabel: formatRecurrenceLabel({
      recurrenceType: todo.recurrenceType,
      weeklyDays: parseWeeklyDays(todo.weeklyDays),
      monthlyDay: todo.monthlyDay,
    }),
    recurringDeleted: !!todo.deletedAt,
    recurringPaused: !todo.active,
  };
}

export function toDisplayTodoFromOneTime(
  todo: Prisma.TodoGetPayload<{ include: { plan: { select: { id: true; title: true } } } }>,
): DisplayTodoItem {
  return {
    kind: "one_time",
    id: todo.id,
    title: todo.title,
    description: todo.description,
    priority: todo.priority,
    status: todo.status,
    dueDate: todo.dueDate,
    completionNote: todo.completionNote,
    plan: todo.plan,
    sortOrder: todo.sortOrder,
    createdAt: todo.createdAt,
  };
}

export function toDateKey(date: Date) {
  return startOfDay(date).toISOString().slice(0, 10);
}

export async function listActiveRecurringTodos(userId: string) {
  return prisma.recurringTodo.findMany({
    where: { userId, deletedAt: null },
    include: recurringInclude,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}

export async function listRecurringTodosForPlan(userId: string, planId: string) {
  return prisma.recurringTodo.findMany({
    where: { userId, planId, deletedAt: null },
    include: recurringInclude,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}

export async function getRecurringTodosForDate(userId: string, date: Date) {
  const templates = await prisma.recurringTodo.findMany({
    where: { userId, deletedAt: null, active: true },
    include: recurringInclude,
  });

  const dayStart = startOfDay(date);
  const applicable = templates.filter((todo) =>
    recurringTodoAppliesOnDate(toSchedule(todo), dayStart),
  );

  if (applicable.length === 0) return [];

  const occurrences = await prisma.todoOccurrence.findMany({
    where: {
      recurringTodoId: { in: applicable.map((todo) => todo.id) },
      periodDate: dayStart,
    },
  });

  const occurrenceMap = new Map(
    occurrences.map((item) => [item.recurringTodoId, item]),
  );

  return applicable
    .sort((a, b) => a.sortOrder - b.sortOrder || a.createdAt.getTime() - b.createdAt.getTime())
    .map((todo) =>
    toDisplayTodoFromRecurring(
      todo,
      dayStart,
      occurrenceMap.get(todo.id) ?? null,
    ),
  );
}

export async function getRecurringTodoById(userId: string, id: string) {
  return prisma.recurringTodo.findFirst({
    where: { id, userId },
    include: {
      ...recurringInclude,
      occurrences: {
        orderBy: { periodDate: "desc" },
        take: 30,
      },
    },
  });
}

export async function getOwnedRecurringTodo(userId: string, id: string) {
  const todo = await getRecurringTodoById(userId, id);
  if (!todo) throw new Error("RECURRING_TODO_NOT_FOUND");
  return todo;
}

export async function createRecurringTodo(
  userId: string,
  input: RecurringTodoCreateInput,
) {
  return prisma.recurringTodo.create({
    data: {
      userId,
      planId: input.planId ?? null,
      title: input.title,
      description: input.description || null,
      priority: input.priority,
      sortOrder: await nextTodoSortOrder(userId),
      recurrenceType: input.recurrenceType,
      weeklyDays:
        input.recurrenceType === RecurrenceType.WEEKLY && input.weeklyDays
          ? JSON.stringify([...new Set(input.weeklyDays)].sort((a, b) => a - b))
          : null,
      monthlyDay:
        input.recurrenceType === RecurrenceType.MONTHLY
          ? input.monthlyDay ?? null
          : null,
      startDate: input.startDate ? startOfDay(new Date(`${input.startDate}T00:00:00`)) : startOfDay(new Date()),
      endDate: input.endDate
        ? startOfDay(new Date(`${input.endDate}T00:00:00`))
        : null,
    },
    include: recurringInclude,
  });
}

export async function updateRecurringTodo(
  userId: string,
  id: string,
  input: Omit<RecurringTodoCreateInput, "planId">,
) {
  await getOwnedRecurringTodo(userId, id);
  return prisma.recurringTodo.update({
    where: { id },
    data: {
      title: input.title,
      description: input.description || null,
      priority: input.priority,
      recurrenceType: input.recurrenceType,
      weeklyDays:
        input.recurrenceType === RecurrenceType.WEEKLY && input.weeklyDays
          ? JSON.stringify([...new Set(input.weeklyDays)].sort((a, b) => a - b))
          : null,
      monthlyDay:
        input.recurrenceType === RecurrenceType.MONTHLY
          ? input.monthlyDay ?? null
          : null,
      startDate: input.startDate
        ? startOfDay(new Date(`${input.startDate}T00:00:00`))
        : undefined,
      endDate: input.endDate
        ? startOfDay(new Date(`${input.endDate}T00:00:00`))
        : null,
    },
    include: recurringInclude,
  });
}

export async function setRecurringTodoActive(
  userId: string,
  id: string,
  active: boolean,
) {
  await getOwnedRecurringTodo(userId, id);
  return prisma.recurringTodo.update({
    where: { id },
    data: { active },
  });
}

export async function softDeleteRecurringTodo(userId: string, id: string) {
  await getOwnedRecurringTodo(userId, id);
  return prisma.recurringTodo.update({
    where: { id },
    data: { deletedAt: new Date(), active: false },
  });
}

export async function toggleRecurringOccurrence(
  userId: string,
  recurringTodoId: string,
  periodDateInput: string,
) {
  const todo = await getOwnedRecurringTodo(userId, recurringTodoId);
  const periodDate = startOfDay(new Date(`${periodDateInput}T00:00:00`));

  if (!recurringTodoAppliesOnDate(toSchedule(todo), periodDate)) {
    throw new Error("INVALID_PERIOD");
  }

  const existing = await prisma.todoOccurrence.findUnique({
    where: {
      recurringTodoId_periodDate: { recurringTodoId, periodDate },
    },
  });

  if (!existing || existing.status !== OccurrenceStatus.COMPLETED) {
    return prisma.todoOccurrence.upsert({
      where: {
        recurringTodoId_periodDate: { recurringTodoId, periodDate },
      },
      create: {
        recurringTodoId,
        periodDate,
        status: OccurrenceStatus.COMPLETED,
        completedAt: new Date(),
      },
      update: {
        status: OccurrenceStatus.COMPLETED,
        completedAt: new Date(),
      },
    });
  }

  return prisma.todoOccurrence.update({
    where: { id: existing.id },
    data: {
      status: OccurrenceStatus.PENDING,
      completedAt: null,
    },
  });
}

export async function updateRecurringOccurrenceNote(
  userId: string,
  recurringTodoId: string,
  periodDateInput: string,
  completionNote: string,
) {
  await getOwnedRecurringTodo(userId, recurringTodoId);
  const periodDate = startOfDay(new Date(`${periodDateInput}T00:00:00`));

  return prisma.todoOccurrence.upsert({
    where: {
      recurringTodoId_periodDate: { recurringTodoId, periodDate },
    },
    create: {
      recurringTodoId,
      periodDate,
      completionNote: completionNote || null,
    },
    update: {
      completionNote: completionNote || null,
    },
  });
}

export async function countRecurringProgressForPlan(
  userId: string,
  planId: string,
  rangeStart: Date | null,
  rangeEnd: Date | null,
  refDate: Date = new Date(),
) {
  const templates = await prisma.recurringTodo.findMany({
    where: { userId, planId, deletedAt: null },
  });

  if (templates.length === 0) {
    return { total: 0, completed: 0 };
  }

  const today = startOfDay(refDate);
  const start = startOfDay(
    rangeStart ??
      templates.reduce(
        (min, todo) => {
          const value = todo.startDate ? startOfDay(todo.startDate) : today;
          return value < min ? value : min;
        },
        today,
      ),
  );
  const end = startOfDay(rangeEnd && rangeEnd < today ? rangeEnd : today);

  if (start > end) return { total: 0, completed: 0 };

  const occurrences = await prisma.todoOccurrence.findMany({
    where: {
      recurringTodoId: { in: templates.map((todo) => todo.id) },
      periodDate: { gte: start, lte: end },
      status: OccurrenceStatus.COMPLETED,
    },
    select: { recurringTodoId: true, periodDate: true },
  });

  const completedSet = new Set(
    occurrences.map(
      (item) => `${item.recurringTodoId}:${toDateKey(item.periodDate)}`,
    ),
  );

  let total = 0;
  let completed = 0;

  for (const template of templates) {
    const schedule = {
      recurrenceType: template.recurrenceType,
      weeklyDays: parseWeeklyDays(template.weeklyDays),
      monthlyDay: template.monthlyDay,
      startDate: template.startDate,
      endDate: template.endDate,
      active: template.active,
      deletedAt: template.deletedAt,
    };

    for (const date of eachDateInRange(start, end)) {
      if (!recurringTodoAppliesOnDate(schedule, date)) continue;
      total += 1;
      if (completedSet.has(`${template.id}:${toDateKey(date)}`)) {
        completed += 1;
      }
    }
  }

  return { total, completed };
}

export function recurringTemplatesToDisplayItems(
  templates: RecurringTodoWithPlan[],
): DisplayTodoItem[] {
  return templates.map((todo) => ({
    kind: "recurring" as const,
    id: todo.id,
    recurringId: todo.id,
    title: todo.title,
    description: todo.description,
    priority: todo.priority,
    status: todo.active ? TodoStatus.PENDING : TodoStatus.CANCELLED,
    dueDate: todo.startDate,
    completionNote: null,
    plan: todo.plan,
    sortOrder: todo.sortOrder,
    createdAt: todo.createdAt,
    recurrenceLabel: formatRecurrenceLabel({
      recurrenceType: todo.recurrenceType,
      weeklyDays: parseWeeklyDays(todo.weeklyDays),
      monthlyDay: todo.monthlyDay,
    }),
    recurringDeleted: !!todo.deletedAt,
    recurringPaused: !todo.active,
  }));
}
