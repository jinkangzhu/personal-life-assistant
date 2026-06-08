import { prisma } from "@/lib/db";
import {
  backfillTodoSortOrders,
  nextTodoSortOrder,
  reorderTodos,
  type TodoReorderItem,
} from "@/lib/services/sort-order";
import {
  sortAllDisplayTodos,
  sortTodayDisplayTodos,
  TODAY_MANUAL_SORT_BASE,
} from "@/lib/services/todo-sort";

import {

  getRecurringTodosForDate,

  getRecurringTodosForDateRange,

  listActiveRecurringTodos,

  recurringTemplatesToDisplayItems,

  toDisplayTodoFromOneTime,

  type DisplayTodoItem,

} from "@/lib/services/recurring-todo";

import { addDays, endOfDay, startOfDay } from "@/lib/utils";

import type { TodoDateRangeFilter, TodoFilter } from "@/lib/validators/todo";
import { hasTodoDateRangeFilter } from "@/lib/validators/todo";

import { Prisma, TodoStatus } from "@prisma/client";



const todoInclude = {

  plan: { select: { id: true, title: true } },

  activityType: { select: { id: true, name: true } },

} satisfies Prisma.TodoInclude;



export type TodoWithPlan = Prisma.TodoGetPayload<{ include: typeof todoInclude }>;



export function buildTodoFilterWhere(

  userId: string,

  filter: TodoFilter,

  refDate: Date = new Date(),

): Prisma.TodoWhereInput {

  const dayStart = startOfDay(refDate);

  const dayEnd = endOfDay(refDate);



  switch (filter) {

    case "today":

      return {

        userId,

        status: { not: TodoStatus.CANCELLED },

        OR: [

          { dueDate: { gte: dayStart, lte: dayEnd } },

          {

            dueDate: { lt: dayStart },

            status: TodoStatus.PENDING,

          },

        ],

      };

    case "completed":

      return { userId, status: TodoStatus.COMPLETED };

    case "pending":

      return { userId, status: TodoStatus.PENDING };

    case "all":

    default:

      return { userId, status: { not: TodoStatus.CANCELLED } };

  }

}



export async function listTodos(

  userId: string,

  filter: TodoFilter,

  refDate: Date = new Date(),

) {

  return prisma.todo.findMany({

    where: buildTodoFilterWhere(userId, filter, refDate),

    orderBy: [{ sortOrder: "asc" }, { priority: "desc" }, { dueDate: "asc" }],

    include: todoInclude,

  });

}



export async function listDisplayTodos(

  userId: string,

  filter: TodoFilter,

  refDate: Date = new Date(),

  dateRange?: TodoDateRangeFilter,

): Promise<DisplayTodoItem[]> {
  await backfillTodoSortOrders(userId);

  const oneTimeTodos = await listTodos(userId, filter, refDate);

  const oneTimeItems = oneTimeTodos.map(toDisplayTodoFromOneTime);



  if (filter === "today") {

    const recurringItems = await getRecurringTodosForDate(userId, refDate);

    return sortTodayDisplayTodos([...oneTimeItems, ...recurringItems]);

  }



  const rangeActive = hasTodoDateRangeFilter(dateRange);

  let items: DisplayTodoItem[];

  if (filter === "all" || filter === "pending") {

    if (rangeActive && dateRange) {

      items = filterDisplayTodosByDateRange(oneTimeItems, dateRange);

      const effectiveRange = resolveTodoDateRangeBounds(dateRange);

      if (effectiveRange) {

        const recurringItems = await getRecurringTodosForDateRange(

          userId,

          effectiveRange.start,

          effectiveRange.end,

        );

        const filteredRecurring =

          filter === "pending"

            ? recurringItems.filter((todo) => todo.status === TodoStatus.PENDING)

            : recurringItems;

        items = filterDisplayTodosByDateRange(

          [...items, ...filteredRecurring],

          dateRange,

        );

      }

    } else {

      const templates = await listActiveRecurringTodos(userId);

      const filteredTemplates =

        filter === "pending"

          ? templates.filter((todo) => todo.active)

          : templates;

      items = [

        ...oneTimeItems,

        ...recurringTemplatesToDisplayItems(filteredTemplates),

      ];

    }

  } else {

    items = rangeActive && dateRange

      ? filterDisplayTodosByDateRange(oneTimeItems, dateRange)

      : oneTimeItems;

  }



  return filter === "all"
    ? sortAllDisplayTodos(items)
    : sortDisplayTodosByTimeDesc(items);

}



const MAX_TODO_DATE_RANGE_DAYS = 366;



function resolveTodoDateRangeBounds(

  range: TodoDateRangeFilter,

): { start: Date; end: Date } | null {

  if (!range.dateFrom && !range.dateTo) return null;

  const today = startOfDay(new Date());

  let start = range.dateFrom ? startOfDay(range.dateFrom) : startOfDay(range.dateTo!);

  let end = range.dateTo ? startOfDay(range.dateTo) : today;

  if (start > end) {

    [start, end] = [end, start];

  }

  const dayCount =

    Math.floor((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1;

  if (dayCount > MAX_TODO_DATE_RANGE_DAYS) {

    end = addDays(start, MAX_TODO_DATE_RANGE_DAYS - 1);

  }

  return { start, end };

}



function getTodoFilterDate(todo: DisplayTodoItem): Date | null {

  return todo.periodDate ?? todo.dueDate;

}



function matchesTodoDateRange(

  todo: DisplayTodoItem,

  range: TodoDateRangeFilter,

): boolean {

  const todoDate = getTodoFilterDate(todo);

  if (!todoDate) return false;

  const time = startOfDay(todoDate).getTime();

  if (range.dateFrom && time < startOfDay(range.dateFrom).getTime()) {

    return false;

  }

  if (range.dateTo && time > startOfDay(range.dateTo).getTime()) {

    return false;

  }

  return true;

}



export function filterDisplayTodosByDateRange(

  items: DisplayTodoItem[],

  range: TodoDateRangeFilter,

): DisplayTodoItem[] {

  if (!hasTodoDateRangeFilter(range)) return items;

  return items.filter((todo) => matchesTodoDateRange(todo, range));

}



function getTodoSortTime(todo: DisplayTodoItem): number {

  const date = getTodoFilterDate(todo);

  return date ? date.getTime() : todo.createdAt.getTime();

}



function sortDisplayTodosByTimeDesc(items: DisplayTodoItem[]) {

  return [...items].sort(

    (a, b) => getTodoSortTime(b) - getTodoSortTime(a),

  );

}



export async function getTodoById(userId: string, id: string) {

  return prisma.todo.findFirst({

    where: { id, userId },

    include: todoInclude,

  });

}



export async function getOwnedTodo(userId: string, id: string) {

  const todo = await getTodoById(userId, id);

  if (!todo) {

    throw new Error("TODO_NOT_FOUND");

  }

  return todo;

}



export function isTodoOverdue(

  todo: { dueDate: Date | null; status: TodoStatus; kind?: DisplayTodoItem["kind"] },

  refDate: Date = new Date(),

) {

  if (todo.kind === "recurring") return false;

  if (!todo.dueDate || todo.status !== TodoStatus.PENDING) return false;

  return todo.dueDate < startOfDay(refDate);

}



export function isDisplayTodoOverdue(

  todo: DisplayTodoItem,

  refDate: Date = new Date(),

) {

  return isTodoOverdue(todo, refDate);

}

export async function reorderTodayTodos(
  userId: string,
  orderedItems: TodoReorderItem[],
  refDate: Date = new Date(),
) {
  const todayItems = await listDisplayTodos(userId, "today", refDate);
  const todayKeys = new Set(
    todayItems.map((item) =>
      todoReorderKey({
        kind: item.kind,
        id: item.kind === "recurring" ? (item.recurringId ?? item.id) : item.id,
      }),
    ),
  );

  if (orderedItems.length !== todayKeys.size) {
    throw new Error("INVALID_ORDER");
  }

  const seen = new Set<string>();
  for (const item of orderedItems) {
    const key = todoReorderKey(item);
    if (!todayKeys.has(key) || seen.has(key)) {
      throw new Error("NOT_FOUND");
    }
    seen.add(key);
  }

  await prisma.$transaction(
    orderedItems.map((item, index) => {
      const sortOrder = TODAY_MANUAL_SORT_BASE + index;
      if (item.kind === "one_time") {
        return prisma.todo.update({
          where: { id: item.id },
          data: { sortOrder },
        });
      }
      return prisma.recurringTodo.update({
        where: { id: item.id },
        data: { sortOrder },
      });
    }),
  );
}

function todoReorderKey(item: TodoReorderItem) {
  return `${item.kind}:${item.id}`;
}

export function displayTodoToReorderItem(todo: DisplayTodoItem): TodoReorderItem {
  return {
    kind: todo.kind,
    id: todo.kind === "recurring" ? (todo.recurringId ?? todo.id) : todo.id,
  };
}

export async function pinTodayTodoToTop(
  userId: string,
  item: TodoReorderItem,
  refDate: Date = new Date(),
) {
  const todayItems = await listDisplayTodos(userId, "today", refDate);
  const currentOrder = todayItems.map(displayTodoToReorderItem);
  const targetKey = todoReorderKey(item);
  const index = currentOrder.findIndex(
    (entry) => todoReorderKey(entry) === targetKey,
  );

  if (index < 0) {
    throw new Error("NOT_FOUND");
  }
  if (index === 0) {
    return;
  }

  const reordered = [
    currentOrder[index],
    ...currentOrder.slice(0, index),
    ...currentOrder.slice(index + 1),
  ];

  await reorderTodayTodos(userId, reordered, refDate);
}

export { nextTodoSortOrder, reorderTodos, type TodoReorderItem };
