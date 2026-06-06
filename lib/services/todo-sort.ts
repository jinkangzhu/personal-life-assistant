import type { DisplayTodoItem } from "@/lib/services/recurring-todo";
import { Priority, TodoStatus } from "@prisma/client";

export const TODAY_MANUAL_SORT_BASE = 1_000_000;

const PRIORITY_RANK: Record<Priority, number> = {
  [Priority.HIGH]: 0,
  [Priority.MEDIUM]: 1,
  [Priority.LOW]: 2,
};

function statusRank(status: TodoStatus) {
  if (status === TodoStatus.PENDING) return 0;
  if (status === TodoStatus.COMPLETED) return 1;
  return 2;
}

export function compareTodayDefault(a: DisplayTodoItem, b: DisplayTodoItem) {
  const statusDiff = statusRank(a.status) - statusRank(b.status);
  if (statusDiff !== 0) return statusDiff;

  const priorityDiff = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
  if (priorityDiff !== 0) return priorityDiff;

  const dueA = a.dueDate?.getTime() ?? Number.POSITIVE_INFINITY;
  const dueB = b.dueDate?.getTime() ?? Number.POSITIVE_INFINITY;
  if (dueA !== dueB) return dueA - dueB;

  return a.createdAt.getTime() - b.createdAt.getTime();
}

export function hasTodayManualSortOrder(items: DisplayTodoItem[]) {
  return items.some((item) => item.sortOrder >= TODAY_MANUAL_SORT_BASE);
}

export function sortTodayDisplayTodos(items: DisplayTodoItem[]) {
  if (hasTodayManualSortOrder(items)) {
    return [...items].sort((a, b) => {
      const orderDiff = a.sortOrder - b.sortOrder;
      if (orderDiff !== 0) return orderDiff;
      return a.createdAt.getTime() - b.createdAt.getTime();
    });
  }

  return [...items].sort(compareTodayDefault);
}
