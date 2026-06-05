import { prisma } from "@/lib/db";
import {
  getRecurringTodosForDate,
  toDisplayTodoFromOneTime,
  type DisplayTodoItem,
} from "@/lib/services/recurring-todo";
import { isTodoOverdue } from "@/lib/services/todo";
import { endOfDay, startOfDay } from "@/lib/utils";
import { TodoStatus } from "@prisma/client";

function isDueToday(todo: { dueDate: Date | null }, dayStart: Date, dayEnd: Date) {
  if (!todo.dueDate) return false;
  return todo.dueDate >= dayStart && todo.dueDate <= dayEnd;
}

export function splitTodayDisplayTodos(
  todos: DisplayTodoItem[],
  refDate: Date = new Date(),
) {
  const dayStart = startOfDay(refDate);
  const dayEnd = endOfDay(refDate);

  const todayDueTodos = todos.filter((t) => {
    if (t.kind === "recurring") return true;
    return isDueToday(t, dayStart, dayEnd);
  });
  const overdueTodos = todos.filter((t) => isTodoOverdue(t, refDate));

  return { todayDueTodos, overdueTodos };
}

export async function getTodayBundle(userId: string, date: Date = new Date()) {
  const dayStart = startOfDay(date);

  const [diaryEntries, todayOneTimeTodos, recurringToday, overdueTodos] =
    await Promise.all([
      prisma.diaryEntry.findMany({
        where: {
          userId,
          date: { gte: dayStart, lte: endOfDay(date) },
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.todo.findMany({
        where: {
          userId,
          status: { not: TodoStatus.CANCELLED },
          OR: [
            { dueDate: { gte: dayStart, lte: endOfDay(date) } },
            {
              dueDate: { lt: dayStart },
              status: TodoStatus.PENDING,
            },
          ],
        },
        orderBy: [{ sortOrder: "asc" }, { priority: "desc" }, { dueDate: "asc" }],
        include: { plan: { select: { id: true, title: true } } },
      }),
      getRecurringTodosForDate(userId, date),
      prisma.todo.count({
        where: {
          userId,
          status: TodoStatus.PENDING,
          dueDate: { lt: dayStart },
        },
      }),
    ]);

  const oneTimeDisplay = todayOneTimeTodos.map(toDisplayTodoFromOneTime);
  const todos: DisplayTodoItem[] = [...oneTimeDisplay, ...recurringToday];
  const pendingTodos = todos.filter((t) => t.status === TodoStatus.PENDING);
  const doneTodos = todos.filter((t) => t.status === TodoStatus.COMPLETED);
  const { todayDueTodos, overdueTodos: overdueTodoList } = splitTodayDisplayTodos(
    todos,
    date,
  );

  const totalToday = pendingTodos.length + doneTodos.length;
  const completedToday = doneTodos.length;

  return {
    date: dayStart,
    diaryEntries,
    todos,
    todayDueTodos,
    overdueTodos: overdueTodoList,
    pendingTodos,
    doneTodos,
    overdueCount: overdueTodos,
    stats: {
      completedToday,
      totalToday,
      completionRate:
        totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0,
    },
  };
}
