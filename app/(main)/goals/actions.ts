"use server";



import { revalidatePath } from "next/cache";

import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";

import { nextGoalSortOrder, reorderGoals } from "@/lib/services/sort-order";

import { getOwnedGoal } from "@/lib/services/goal";

import { getOwnedPlan } from "@/lib/services/plan";

import { requireSession } from "@/lib/session";

import { goalCreateSchema, goalUpdateSchema } from "@/lib/validators/goal";

import { z } from "zod";



function revalidateGoalPaths(id?: string) {

  revalidatePath("/goals");

  revalidatePath("/search");

  revalidatePath("/plans");

  if (id) revalidatePath(`/goals/${id}`);

}



function formDataToObject(formData: FormData) {

  return Object.fromEntries(formData.entries()) as Record<string, string>;

}



async function parseGoalForm(raw: Record<string, string>) {

  return {

    title: raw.title,

    description: raw.description || undefined,

    status: raw.status,

  };

}



export async function createGoal(formData: FormData) {

  const session = await requireSession();



  try {

    const raw = formDataToObject(formData);

    const parsed = goalCreateSchema.parse(await parseGoalForm(raw));



    const goal = await prisma.longTermGoal.create({

      data: {

        userId: session.id,

        title: parsed.title,

        description: parsed.description || null,

        status: parsed.status,

        sortOrder: await nextGoalSortOrder(session.id),

      },

    });



    revalidateGoalPaths(goal.id);

    return { ok: true as const, id: goal.id };

  } catch (error) {

    if (error instanceof z.ZodError) {

      return { ok: false as const, error: error.errors[0]?.message ?? "参数无效" };

    }

    console.error("createGoal error:", error);

    return { ok: false as const, error: "创建失败" };

  }

}



export async function updateGoal(id: string, formData: FormData) {

  const session = await requireSession();



  try {

    await getOwnedGoal(session.id, id);

    const raw = formDataToObject(formData);

    const parsed = goalUpdateSchema.parse(await parseGoalForm(raw));



    await prisma.longTermGoal.update({

      where: { id },

      data: {

        title: parsed.title,

        description: parsed.description || null,

        status: parsed.status,

      },

    });



    revalidateGoalPaths(id);

    return { ok: true as const };

  } catch (error) {

    if (error instanceof z.ZodError) {

      return { ok: false as const, error: error.errors[0]?.message ?? "参数无效" };

    }

    if (error instanceof Error && error.message === "GOAL_NOT_FOUND") {

      return { ok: false as const, error: "目标不存在" };

    }

    console.error("updateGoal error:", error);

    return { ok: false as const, error: "更新失败" };

  }

}



export async function deleteGoal(id: string) {

  const session = await requireSession();



  try {

    await getOwnedGoal(session.id, id);

    await prisma.longTermGoal.delete({ where: { id } });

    revalidateGoalPaths();

    redirect("/goals");

  } catch (error) {

    if (error instanceof Error && error.message === "GOAL_NOT_FOUND") {

      return { ok: false as const, error: "目标不存在" };

    }

    throw error;

  }

}



export async function linkPlanToGoal(goalId: string, planId: string) {

  const session = await requireSession();



  try {

    await getOwnedGoal(session.id, goalId);

    await getOwnedPlan(session.id, planId);



    const existing = await prisma.goalPlan.findUnique({

      where: { goalId_planId: { goalId, planId } },

    });

    if (existing) {

      return { ok: true as const };

    }



    await prisma.goalPlan.create({

      data: { goalId, planId },

    });



    revalidateGoalPaths(goalId);

    revalidatePath(`/plans/${planId}`);

    return { ok: true as const };

  } catch (error) {

    if (error instanceof Error && error.message === "GOAL_NOT_FOUND") {

      return { ok: false as const, error: "目标不存在" };

    }

    if (error instanceof Error && error.message === "PLAN_NOT_FOUND") {

      return { ok: false as const, error: "计划不存在" };

    }

    console.error("linkPlanToGoal error:", error);

    return { ok: false as const, error: "关联失败" };

  }

}



export async function unlinkPlanFromGoal(goalId: string, planId: string) {

  const session = await requireSession();



  try {

    await getOwnedGoal(session.id, goalId);



    const link = await prisma.goalPlan.findUnique({

      where: { goalId_planId: { goalId, planId } },

    });

    if (!link) {

      return { ok: false as const, error: "计划不属于此目标" };

    }



    await prisma.goalPlan.delete({

      where: { goalId_planId: { goalId, planId } },

    });



    revalidateGoalPaths(goalId);

    revalidatePath(`/plans/${planId}`);

    return { ok: true as const };

  } catch (error) {

    if (error instanceof Error && error.message === "GOAL_NOT_FOUND") {

      return { ok: false as const, error: "目标不存在" };

    }

    console.error("unlinkPlanFromGoal error:", error);

    return { ok: false as const, error: "取消关联失败" };

  }

}



export async function reorderGoalsAction(orderedIds: string[]) {

  const session = await requireSession();



  try {

    await reorderGoals(session.id, orderedIds);

    revalidateGoalPaths();

    return { ok: true as const };

  } catch (error) {

    if (error instanceof Error && error.message === "INVALID_ORDER") {

      return { ok: false as const, error: "排序无效" };

    }

    if (error instanceof Error && error.message === "NOT_FOUND") {

      return { ok: false as const, error: "目标不存在" };

    }

    console.error("reorderGoalsAction error:", error);

    return { ok: false as const, error: "排序失败" };

  }

}


