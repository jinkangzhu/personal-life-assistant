import { prisma } from "@/lib/db";
import { PlanStatus, TodoStatus } from "@prisma/client";

export type ReorderScope = "all" | "pending" | "today";

export function needsSortOrderBackfill<T extends { sortOrder: number }>(
  items: T[],
): boolean {
  return items.length > 1 && items.every((item) => item.sortOrder === 0);
}

export async function validateOwnedIds(
  ownedIds: Set<string>,
  orderedIds: string[],
  expectedCount: number,
) {
  if (orderedIds.length !== expectedCount) {
    throw new Error("INVALID_ORDER");
  }

  for (const id of orderedIds) {
    if (!ownedIds.has(id)) {
      throw new Error("NOT_FOUND");
    }
  }
}

export async function backfillGoalSortOrders(userId: string) {
  const goals = await prisma.longTermGoal.findMany({
    where: { userId },
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    select: { id: true, sortOrder: true },
  });

  if (!needsSortOrderBackfill(goals)) return;

  await prisma.$transaction(
    goals.map((goal, index) =>
      prisma.longTermGoal.update({
        where: { id: goal.id },
        data: { sortOrder: index },
      }),
    ),
  );
}

export async function backfillPlanSortOrders(userId: string) {
  await backfillGoalSortOrders(userId);

  const [plans, goalLinks, goals] = await Promise.all([
    prisma.plan.findMany({
      where: { userId },
      select: { id: true, sortOrder: true, createdAt: true },
    }),
    prisma.goalPlan.findMany({
      where: { plan: { userId } },
      select: { planId: true, goalId: true },
    }),
    prisma.longTermGoal.findMany({
      where: { userId },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: { id: true, sortOrder: true },
    }),
  ]);

  if (!needsSortOrderBackfill(plans)) return;

  const goalOrderMap = new Map(goals.map((goal) => [goal.id, goal.sortOrder]));
  const planGoalSort = new Map<string, number>();

  for (const link of goalLinks) {
    const goalSort = goalOrderMap.get(link.goalId);
    if (goalSort === undefined) continue;
    const current = planGoalSort.get(link.planId);
    if (current === undefined || goalSort < current) {
      planGoalSort.set(link.planId, goalSort);
    }
  }

  const orderedIds = [...plans]
    .sort((a, b) => {
      const aLinked = planGoalSort.has(a.id);
      const bLinked = planGoalSort.has(b.id);
      if (aLinked !== bLinked) return aLinked ? 1 : -1;
      if (aLinked && bLinked) {
        const goalDiff =
          (planGoalSort.get(a.id) ?? 0) - (planGoalSort.get(b.id) ?? 0);
        if (goalDiff !== 0) return goalDiff;
      }
      return a.createdAt.getTime() - b.createdAt.getTime();
    })
    .map((plan) => plan.id);

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.plan.update({
        where: { id },
        data: { sortOrder: index },
      }),
    ),
  );
}

type TodoSortRow = {
  id: string;
  kind: "one_time" | "recurring";
  sortOrder: number;
  planId: string | null;
  createdAt: Date;
};

export async function backfillTodoSortOrders(userId: string) {
  await backfillPlanSortOrders(userId);

  const [oneTimeTodos, recurringTodos, plans] = await Promise.all([
    prisma.todo.findMany({
      where: { userId, status: { not: "CANCELLED" } },
      select: { id: true, sortOrder: true, planId: true, createdAt: true },
    }),
    prisma.recurringTodo.findMany({
      where: { userId, deletedAt: null },
      select: { id: true, sortOrder: true, planId: true, createdAt: true },
    }),
    prisma.plan.findMany({
      where: { userId },
      select: { id: true, sortOrder: true },
    }),
  ]);

  const rows: TodoSortRow[] = [
    ...oneTimeTodos.map((todo) => ({
      id: todo.id,
      kind: "one_time" as const,
      sortOrder: todo.sortOrder,
      planId: todo.planId,
      createdAt: todo.createdAt,
    })),
    ...recurringTodos.map((todo) => ({
      id: todo.id,
      kind: "recurring" as const,
      sortOrder: todo.sortOrder,
      planId: todo.planId,
      createdAt: todo.createdAt,
    })),
  ];

  if (!needsSortOrderBackfill(rows)) return;

  const planOrderMap = new Map(plans.map((plan) => [plan.id, plan.sortOrder]));

  const ordered = [...rows].sort((a, b) => {
    const aPlanSort = a.planId ? (planOrderMap.get(a.planId) ?? 0) : -1;
    const bPlanSort = b.planId ? (planOrderMap.get(b.planId) ?? 0) : -1;
    if (aPlanSort !== bPlanSort) return aPlanSort - bPlanSort;
    return a.createdAt.getTime() - b.createdAt.getTime();
  });

  await prisma.$transaction(
    ordered.map((item, index) => {
      if (item.kind === "one_time") {
        return prisma.todo.update({
          where: { id: item.id },
          data: { sortOrder: index },
        });
      }
      return prisma.recurringTodo.update({
        where: { id: item.id },
        data: { sortOrder: index },
      });
    }),
  );
}

export async function nextGoalSortOrder(userId: string) {
  const last = await prisma.longTermGoal.findFirst({
    where: { userId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });
  return (last?.sortOrder ?? -1) + 1;
}

export async function nextPlanSortOrder(userId: string) {
  const last = await prisma.plan.findFirst({
    where: { userId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });
  return (last?.sortOrder ?? -1) + 1;
}

export async function nextTodoSortOrder(userId: string) {
  const [lastOneTime, lastRecurring] = await Promise.all([
    prisma.todo.findFirst({
      where: { userId },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    }),
    prisma.recurringTodo.findFirst({
      where: { userId, deletedAt: null },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    }),
  ]);
  return Math.max(lastOneTime?.sortOrder ?? -1, lastRecurring?.sortOrder ?? -1) + 1;
}

export type TodoReorderItem = {
  id: string;
  kind: "one_time" | "recurring";
};

export async function reorderGoals(userId: string, orderedIds: string[]) {
  const goals = await prisma.longTermGoal.findMany({
    where: { userId },
    select: { id: true },
  });

  await validateOwnedIds(
    new Set(goals.map((goal) => goal.id)),
    orderedIds,
    goals.length,
  );

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.longTermGoal.update({
        where: { id },
        data: { sortOrder: index },
      }),
    ),
  );
}

async function applyPlanSortOrder(orderedIds: string[]) {
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.plan.update({
        where: { id },
        data: { sortOrder: index },
      }),
    ),
  );
}

export async function reorderPlans(
  userId: string,
  orderedIds: string[],
  scope: ReorderScope = "all",
) {
  const plans = await prisma.plan.findMany({
    where: { userId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: { id: true, status: true },
  });

  if (scope === "all") {
    await validateOwnedIds(
      new Set(plans.map((plan) => plan.id)),
      orderedIds,
      plans.length,
    );
    await applyPlanSortOrder(orderedIds);
    return;
  }

  const pendingIds = new Set(
    plans
      .filter((plan) => plan.status === PlanStatus.ACTIVE)
      .map((plan) => plan.id),
  );

  await validateOwnedIds(pendingIds, orderedIds, pendingIds.size);

  const pendingQueue = [...orderedIds];
  const mergedIds = plans.map((plan) => {
    if (pendingIds.has(plan.id)) {
      return pendingQueue.shift()!;
    }
    return plan.id;
  });

  await applyPlanSortOrder(mergedIds);
}

function todoReorderKey(item: TodoReorderItem) {
  return `${item.kind}:${item.id}`;
}

type TodoReorderSortRow = TodoReorderItem & {
  sortOrder: number;
  createdAt: Date;
  pending: boolean;
};

async function listTodoSortRows(userId: string): Promise<TodoReorderSortRow[]> {
  const [oneTimeTodos, recurringTodos] = await Promise.all([
    prisma.todo.findMany({
      where: { userId, status: { not: TodoStatus.CANCELLED } },
      select: { id: true, status: true, sortOrder: true, createdAt: true },
    }),
    prisma.recurringTodo.findMany({
      where: { userId, deletedAt: null },
      select: { id: true, active: true, sortOrder: true, createdAt: true },
    }),
  ]);

  const rows: TodoReorderSortRow[] = [
    ...oneTimeTodos.map((todo) => ({
      kind: "one_time" as const,
      id: todo.id,
      sortOrder: todo.sortOrder,
      createdAt: todo.createdAt,
      pending: todo.status === TodoStatus.PENDING,
    })),
    ...recurringTodos.map((todo) => ({
      kind: "recurring" as const,
      id: todo.id,
      sortOrder: todo.sortOrder,
      createdAt: todo.createdAt,
      pending: todo.active,
    })),
  ];

  return rows.sort(compareBySortOrder);
}

async function applyTodoSortOrder(orderedItems: TodoReorderItem[]) {
  await prisma.$transaction(
    orderedItems.map((item, index) => {
      if (item.kind === "one_time") {
        return prisma.todo.update({
          where: { id: item.id },
          data: { sortOrder: index },
        });
      }
      return prisma.recurringTodo.update({
        where: { id: item.id },
        data: { sortOrder: index },
      });
    }),
  );
}

export async function reorderTodos(
  userId: string,
  orderedItems: TodoReorderItem[],
  scope: ReorderScope = "all",
) {
  const rows = await listTodoSortRows(userId);

  if (scope === "all") {
    const allItems = rows.map(({ kind, id }) => ({ kind, id }));
    const oneTimeIds = new Set(
      rows.filter((row) => row.kind === "one_time").map((row) => row.id),
    );
    const recurringIds = new Set(
      rows.filter((row) => row.kind === "recurring").map((row) => row.id),
    );

    if (orderedItems.length !== allItems.length) {
      throw new Error("INVALID_ORDER");
    }

    const seenOneTime = new Set<string>();
    const seenRecurring = new Set<string>();

    for (const item of orderedItems) {
      if (item.kind === "one_time") {
        if (!oneTimeIds.has(item.id) || seenOneTime.has(item.id)) {
          throw new Error("NOT_FOUND");
        }
        seenOneTime.add(item.id);
        continue;
      }

      if (!recurringIds.has(item.id) || seenRecurring.has(item.id)) {
        throw new Error("NOT_FOUND");
      }
      seenRecurring.add(item.id);
    }

    await applyTodoSortOrder(orderedItems);
    return;
  }

  const pendingRows = rows.filter((row) => row.pending);
  const pendingKeys = new Set(pendingRows.map((row) => todoReorderKey(row)));

  if (orderedItems.length !== pendingRows.length) {
    throw new Error("INVALID_ORDER");
  }

  const seen = new Set<string>();
  for (const item of orderedItems) {
    const key = todoReorderKey(item);
    if (!pendingKeys.has(key) || seen.has(key)) {
      throw new Error("NOT_FOUND");
    }
    seen.add(key);
  }

  const pendingQueue = [...orderedItems];
  const mergedItems = rows.map((row) => {
    if (row.pending) {
      return pendingQueue.shift()!;
    }
    return { kind: row.kind, id: row.id };
  });

  await applyTodoSortOrder(mergedItems);
}

export function compareBySortOrder<T extends { sortOrder: number; createdAt: Date }>(
  a: T,
  b: T,
) {
  const orderDiff = a.sortOrder - b.sortOrder;
  if (orderDiff !== 0) return orderDiff;
  return a.createdAt.getTime() - b.createdAt.getTime();
}
