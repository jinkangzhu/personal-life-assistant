import { prisma } from "@/lib/db";
import { effectiveMinutes } from "@/lib/duration";
import { listUserActivityTypes } from "@/lib/services/activity-type";
import { getRecurringTodosForDate } from "@/lib/services/recurring-todo";
import { endOfDay, startOfDay } from "@/lib/utils";
import { TodoStatus } from "@prisma/client";

export type DayActivityTimeStat = {
  activityTypeId: string | null;
  name: string;
  minutes: number;
  taskCount: number;
};

export type DayTimeStats = {
  totalMinutes: number;
  byActivity: DayActivityTimeStat[];
  estimatedRemainingMinutes: number;
};

function addToBucket(
  buckets: Map<string | null, { minutes: number; count: number }>,
  activityTypeId: string | null,
  estimatedMinutes: number | null,
  actualMinutes: number | null,
) {
  const minutes = effectiveMinutes(estimatedMinutes, actualMinutes);
  if (minutes <= 0) return;

  const existing = buckets.get(activityTypeId) ?? { minutes: 0, count: 0 };
  existing.minutes += minutes;
  existing.count += 1;
  buckets.set(activityTypeId, existing);
}

export async function getDayTimeStats(
  userId: string,
  date: Date = new Date(),
): Promise<DayTimeStats> {
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  const [activityTypes, completedTodos, recurringToday, pendingTodos] =
    await Promise.all([
      listUserActivityTypes(userId),
      prisma.todo.findMany({
        where: {
          userId,
          status: TodoStatus.COMPLETED,
          completedAt: { gte: dayStart, lte: dayEnd },
        },
        select: {
          estimatedMinutes: true,
          actualMinutes: true,
          activityTypeId: true,
        },
      }),
      getRecurringTodosForDate(userId, date),
      prisma.todo.findMany({
        where: {
          userId,
          status: TodoStatus.PENDING,
          OR: [
            { dueDate: { gte: dayStart, lte: dayEnd } },
            { dueDate: { lt: dayStart } },
          ],
        },
        select: {
          estimatedMinutes: true,
          actualMinutes: true,
        },
      }),
    ]);

  const typeNameMap = new Map(activityTypes.map((item) => [item.id, item.name]));
  const buckets = new Map<string | null, { minutes: number; count: number }>();

  for (const todo of completedTodos) {
    addToBucket(
      buckets,
      todo.activityTypeId,
      todo.estimatedMinutes,
      todo.actualMinutes,
    );
  }

  for (const item of recurringToday) {
    if (item.status !== TodoStatus.COMPLETED) continue;
    addToBucket(
      buckets,
      item.activityType?.id ?? null,
      item.estimatedMinutes,
      item.actualMinutes,
    );
  }

  const byActivity = [...buckets.entries()]
    .map(([activityTypeId, data]) => ({
      activityTypeId,
      name: activityTypeId
        ? (typeNameMap.get(activityTypeId) ?? "未知")
        : "未分类",
      minutes: data.minutes,
      taskCount: data.count,
    }))
    .sort((a, b) => b.minutes - a.minutes);

  let estimatedRemainingMinutes = 0;
  for (const todo of pendingTodos) {
    if (todo.estimatedMinutes && todo.estimatedMinutes > 0) {
      estimatedRemainingMinutes += todo.estimatedMinutes;
    }
  }
  for (const item of recurringToday) {
    if (item.status !== TodoStatus.PENDING) continue;
    if (item.estimatedMinutes && item.estimatedMinutes > 0) {
      estimatedRemainingMinutes += item.estimatedMinutes;
    }
  }

  return {
    totalMinutes: byActivity.reduce((sum, item) => sum + item.minutes, 0),
    byActivity,
    estimatedRemainingMinutes,
  };
}
