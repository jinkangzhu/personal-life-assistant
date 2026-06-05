import { prisma } from "@/lib/db";

import { countRecurringProgressForPlan } from "@/lib/services/recurring-todo";
import {
  backfillPlanSortOrders,
  nextPlanSortOrder,
  reorderPlans,
} from "@/lib/services/sort-order";

import { startOfDay } from "@/lib/utils";

import type { Plan, Todo } from "@prisma/client";

import { Prisma, TodoStatus } from "@prisma/client";



export type PlanProgress = {

  total: number;

  completed: number;

  percentage: number;

};



export type PlanWithProgress = Plan & {

  progress: PlanProgress;

};



export type PlanWithTodos = Plan & {

  todos: Todo[];

  recurringTodos: Prisma.RecurringTodoGetPayload<{

    include: { plan: { select: { id: true; title: true } } };

  }>[];

  progress: PlanProgress;

};



export function computePlanProgress(

  todos: Pick<Todo, "status">[],

): PlanProgress {

  const active = todos.filter((todo) => todo.status !== TodoStatus.CANCELLED);

  const completed = active.filter((todo) => todo.status === TodoStatus.COMPLETED);

  const total = active.length;



  return {

    total,

    completed: completed.length,

    percentage: total === 0 ? 0 : Math.round((completed.length / total) * 100),

  };

}



export function mergePlanProgress(

  oneTime: PlanProgress,

  recurring: { total: number; completed: number },

): PlanProgress {

  const total = oneTime.total + recurring.total;

  const completed = oneTime.completed + recurring.completed;

  return {

    total,

    completed,

    percentage: total === 0 ? 0 : Math.round((completed / total) * 100),

  };

}



const listTodoSelect = {

  where: { status: { not: TodoStatus.CANCELLED } },

  select: { status: true },

} satisfies Prisma.Plan$todosArgs;



export async function listPlans(userId: string): Promise<PlanWithProgress[]> {
  await backfillPlanSortOrders(userId);

  const plans = await prisma.plan.findMany({
    where: { userId },
    include: { todos: listTodoSelect },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });



  const results: PlanWithProgress[] = [];



  for (const { todos, ...plan } of plans) {

    const oneTime = computePlanProgress(todos);

    const recurring = await countRecurringProgressForPlan(

      userId,

      plan.id,

      plan.startDate,

      plan.endDate,

    );

    results.push({

      ...plan,

      progress: mergePlanProgress(oneTime, recurring),

    });

  }



  return results;

}



const recurringInclude = {

  plan: { select: { id: true, title: true } },

} satisfies Prisma.RecurringTodoInclude;



export async function getPlanById(

  userId: string,

  id: string,

): Promise<PlanWithTodos | null> {

  const plan = await prisma.plan.findFirst({

    where: { id, userId },

    include: {

      todos: {

        where: { status: { not: TodoStatus.CANCELLED } },

        orderBy: [{ sortOrder: "asc" }, { priority: "desc" }, { dueDate: "asc" }],

      },

      recurringTodos: {

        where: { deletedAt: null },

        include: recurringInclude,

        orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],

      },

    },

  });



  if (!plan) return null;



  const oneTime = computePlanProgress(plan.todos);

  const recurring = await countRecurringProgressForPlan(

    userId,

    plan.id,

    plan.startDate,

    plan.endDate,

  );



  return {

    ...plan,

    progress: mergePlanProgress(oneTime, recurring),

  };

}



export async function getOwnedPlan(userId: string, id: string) {

  const plan = await getPlanById(userId, id);

  if (!plan) {

    throw new Error("PLAN_NOT_FOUND");

  }

  return plan;

}



export async function listUnlinkedTodos(userId: string) {

  return prisma.todo.findMany({

    where: {

      userId,

      planId: null,

      status: { not: TodoStatus.CANCELLED },

    },

    orderBy: [{ updatedAt: "desc" }],

    take: 100,

  });

}



export async function listUnlinkedRecurringTodos(userId: string) {

  return prisma.recurringTodo.findMany({

    where: {

      userId,

      planId: null,

      deletedAt: null,

      active: true,

    },

    orderBy: [{ updatedAt: "desc" }],

    take: 100,

  });

}

export { nextPlanSortOrder, reorderPlans };
