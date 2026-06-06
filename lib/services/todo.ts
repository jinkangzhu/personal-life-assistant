import { prisma } from "@/lib/db";
import {
  backfillTodoSortOrders,
  nextTodoSortOrder,
  reorderTodos,
  type TodoReorderItem,
} from "@/lib/services/sort-order";
import {
  sortTodayDisplayTodos,
  TODAY_MANUAL_SORT_BASE,
} from "@/lib/services/todo-sort";

import {

  getRecurringTodosForDate,

  listActiveRecurringTodos,

  recurringTemplatesToDisplayItems,

  toDisplayTodoFromOneTime,

  type DisplayTodoItem,

} from "@/lib/services/recurring-todo";

import { endOfDay, startOfDay } from "@/lib/utils";

import type { TodoFilter } from "@/lib/validators/todo";

import { Prisma, TodoStatus } from "@prisma/client";



const todoInclude = {

  plan: { select: { id: true, title: true } },

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

): Promise<DisplayTodoItem[]> {
  await backfillTodoSortOrders(userId);

  const oneTimeTodos = await listTodos(userId, filter, refDate);

  const oneTimeItems = oneTimeTodos.map(toDisplayTodoFromOneTime);



  if (filter === "today") {

    const recurringItems = await getRecurringTodosForDate(userId, refDate);

    return sortTodayDisplayTodos([...oneTimeItems, ...recurringItems]);

  }



  if (filter === "all" || filter === "pending") {

    const templates = await listActiveRecurringTodos(userId);

    const filteredTemplates =

      filter === "pending"

        ? templates.filter((todo) => todo.active)

        : templates;

    return sortDisplayTodos([

      ...oneTimeItems,

      ...recurringTemplatesToDisplayItems(filteredTemplates),

    ]);

  }



  return sortDisplayTodos(oneTimeItems);

}



function sortDisplayTodos(items: DisplayTodoItem[]) {
  return [...items].sort((a, b) => {
    const orderDiff = a.sortOrder - b.sortOrder;
    if (orderDiff !== 0) return orderDiff;
    return a.createdAt.getTime() - b.createdAt.getTime();
  });
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

function todoReorderKey(item: TodoReorderItem) {
  return `${item.kind}:${item.id}`;
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

export { nextTodoSortOrder, reorderTodos, type TodoReorderItem };
