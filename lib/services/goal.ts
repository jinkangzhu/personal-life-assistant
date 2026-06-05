import { prisma } from "@/lib/db";
import {
  backfillGoalSortOrders,
  backfillPlanSortOrders,
  compareBySortOrder,
  nextGoalSortOrder,
  reorderGoals,
} from "@/lib/services/sort-order";
import {
  computePlanProgress,
  type PlanProgress,
  type PlanWithProgress,
} from "@/lib/services/plan";
import type { LongTermGoal, Plan } from "@prisma/client";
import { PlanStatus, TodoStatus } from "@prisma/client";

export type GoalPlanSummary = Plan & {
  progress: PlanProgress;
};

export type GoalPlanStats = {
  total: number;
  active: number;
  completed: number;
  archived: number;
};

export type GoalWithPlans = LongTermGoal & {
  plans: GoalPlanSummary[];
  planStats: GoalPlanStats;
};

const listTodoSelect = {
  where: { status: { not: TodoStatus.CANCELLED } },
  select: { status: true },
};

function computePlanStats(plans: Pick<Plan, "status">[]): GoalPlanStats {
  return {
    total: plans.length,
    active: plans.filter((plan) => plan.status === PlanStatus.ACTIVE).length,
    completed: plans.filter((plan) => plan.status === PlanStatus.COMPLETED).length,
    archived: plans.filter((plan) => plan.status === PlanStatus.ARCHIVED).length,
  };
}

function mapGoalPlans(
  goalPlans: { plan: Plan & { todos: { status: typeof TodoStatus[keyof typeof TodoStatus] }[] } }[],
): GoalPlanSummary[] {
  return goalPlans.map(({ plan }) => {
    const { todos, ...rest } = plan;
    return {
      ...rest,
      progress: computePlanProgress(todos),
    };
  });
}

const goalInclude = {
  plans: {
    include: {
      plan: {
        include: { todos: listTodoSelect },
      },
    },
  },
} as const;

function sortPlans(plans: GoalPlanSummary[]) {
  return [...plans].sort(compareBySortOrder);
}

export async function listGoals(userId: string): Promise<GoalWithPlans[]> {
  await backfillGoalSortOrders(userId);

  const goals = await prisma.longTermGoal.findMany({
    where: { userId },
    include: goalInclude,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return goals.map(({ plans, ...goal }) => {
    const linkedPlans = sortPlans(mapGoalPlans(plans));
    return {
      ...goal,
      plans: linkedPlans,
      planStats: computePlanStats(linkedPlans),
    };
  });
}

export async function getGoalById(
  userId: string,
  id: string,
): Promise<GoalWithPlans | null> {
  const goal = await prisma.longTermGoal.findFirst({
    where: { id, userId },
    include: goalInclude,
  });

  if (!goal) return null;

  const linkedPlans = sortPlans(mapGoalPlans(goal.plans));
  return {
    ...goal,
    plans: linkedPlans,
    planStats: computePlanStats(linkedPlans),
  };
}

export async function getOwnedGoal(userId: string, id: string) {
  const goal = await getGoalById(userId, id);
  if (!goal) {
    throw new Error("GOAL_NOT_FOUND");
  }
  return goal;
}

export async function listAvailablePlans(userId: string): Promise<PlanWithProgress[]> {
  await backfillPlanSortOrders(userId);

  const plans = await prisma.plan.findMany({
    where: { userId },
    include: { todos: listTodoSelect },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return plans.map(({ todos, ...plan }) => ({
    ...plan,
    progress: computePlanProgress(todos),
  }));
}

export async function validateOwnedPlanIds(userId: string, planIds: string[]) {
  if (planIds.length === 0) return;

  const plans = await prisma.plan.findMany({
    where: { userId, id: { in: planIds } },
    select: { id: true },
  });

  if (plans.length !== planIds.length) {
    throw new Error("PLAN_NOT_FOUND");
  }
}

export async function syncGoalPlans(goalId: string, planIds: string[]) {
  await prisma.$transaction([
    prisma.goalPlan.deleteMany({ where: { goalId } }),
    ...(planIds.length > 0
      ? [
          prisma.goalPlan.createMany({
            data: planIds.map((planId) => ({ goalId, planId })),
          }),
        ]
      : []),
  ]);
}

export async function listUnlinkedPlansForGoal(userId: string, goalId: string) {
  const linked = await prisma.goalPlan.findMany({
    where: { goalId },
    select: { planId: true },
  });
  const linkedIds = linked.map(({ planId }) => planId);

  const plans = await prisma.plan.findMany({
    where: {
      userId,
      ...(linkedIds.length > 0 ? { id: { notIn: linkedIds } } : {}),
    },
    include: { todos: listTodoSelect },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    take: 100,
  });

  return plans.map(({ todos, ...plan }) => ({
    ...plan,
    progress: computePlanProgress(todos),
  }));
}

export { nextGoalSortOrder, reorderGoals };

export function goalDescriptionSummary(
  description: string | null | undefined,
  maxLength = 120,
): string {
  const plain = (description ?? "").replace(/\s+/g, " ").trim();
  if (!plain) return "";
  if (plain.length <= maxLength) return plain;
  return `${plain.slice(0, maxLength)}…`;
}
