"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { createRecurringTodo, getOwnedRecurringTodo } from "@/lib/services/recurring-todo";
import { nextPlanSortOrder, reorderPlans, getOwnedPlan } from "@/lib/services/plan";
import { getOwnedTodo, nextTodoSortOrder } from "@/lib/services/todo";
import { requireSession } from "@/lib/session";
import { parseDateInput } from "@/lib/utils";
import { planCreateSchema, planUpdateSchema } from "@/lib/validators/plan";
import {
  mapRecurrenceFormToType,
  parseWeeklyDaysInput,
  todoCreateSchema,
} from "@/lib/validators/todo";
import { Priority, RecurrenceType } from "@prisma/client";
import { z } from "zod";

function revalidatePlanPaths(id?: string) {
  revalidatePath("/plans");
  revalidatePath("/plans/new");
  revalidatePath("/todos");
  revalidatePath("/today");
  revalidatePath("/search");
  if (id) {
    revalidatePath(`/plans/${id}`);
  }
}

function formDataToObject(formData: FormData) {
  return Object.fromEntries(formData.entries()) as Record<string, string>;
}

export async function createPlan(formData: FormData) {
  const session = await requireSession();

  try {
    const raw = formDataToObject(formData);
    const parsed = planCreateSchema.parse({
      title: raw.title,
      description: raw.description || undefined,
      type: raw.type,
      startDate: raw.startDate || undefined,
      endDate: raw.endDate || undefined,
      status: raw.status,
    });

    const plan = await prisma.plan.create({
      data: {
        userId: session.id,
        title: parsed.title,
        description: parsed.description || null,
        type: parsed.type,
        startDate: parseDateInput(parsed.startDate),
        endDate: parseDateInput(parsed.endDate),
        status: parsed.status,
        sortOrder: await nextPlanSortOrder(session.id),
      },
    });

    revalidatePlanPaths();
    return { ok: true as const, id: plan.id };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { ok: false as const, error: error.errors[0]?.message ?? "参数无效" };
    }
    console.error("createPlan error:", error);
    return { ok: false as const, error: "创建失败" };
  }
}

export async function updatePlan(id: string, formData: FormData) {
  const session = await requireSession();

  try {
    await getOwnedPlan(session.id, id);
    const raw = formDataToObject(formData);
    const parsed = planUpdateSchema.parse({
      title: raw.title,
      description: raw.description || undefined,
      type: raw.type,
      startDate: raw.startDate || undefined,
      endDate: raw.endDate || undefined,
      status: raw.status,
    });

    await prisma.plan.update({
      where: { id },
      data: {
        title: parsed.title,
        description: parsed.description || null,
        type: parsed.type,
        startDate: parseDateInput(parsed.startDate),
        endDate: parseDateInput(parsed.endDate),
        status: parsed.status,
      },
    });

    revalidatePlanPaths(id);
    return { ok: true as const };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { ok: false as const, error: error.errors[0]?.message ?? "参数无效" };
    }
    if (error instanceof Error && error.message === "PLAN_NOT_FOUND") {
      return { ok: false as const, error: "计划不存在" };
    }
    console.error("updatePlan error:", error);
    return { ok: false as const, error: "更新失败" };
  }
}

export async function deletePlan(id: string) {
  const session = await requireSession();

  try {
    await getOwnedPlan(session.id, id);
    await prisma.plan.delete({ where: { id } });
    revalidatePlanPaths();
    redirect("/plans");
  } catch (error) {
    if (error instanceof Error && error.message === "PLAN_NOT_FOUND") {
      return { ok: false as const, error: "计划不存在" };
    }
    throw error;
  }
}

export async function createPlanTodo(planId: string, formData: FormData) {
  const session = await requireSession();

  try {
    await getOwnedPlan(session.id, planId);
    const raw = formDataToObject(formData);
    const parsed = todoCreateSchema.parse({
      title: raw.title,
      description: raw.description || undefined,
      dueDate: raw.dueDate || undefined,
      priority: raw.priority || Priority.MEDIUM,
      recurrence: raw.recurrence || "none",
      weeklyDays: raw.weeklyDays || undefined,
      monthlyDay: raw.monthlyDay || undefined,
      recurrenceStartDate: raw.recurrenceStartDate || undefined,
      recurrenceEndDate: raw.recurrenceEndDate || undefined,
    });

    const recurrenceType = mapRecurrenceFormToType(parsed.recurrence);
    if (recurrenceType) {
      const recurring = await createRecurringTodo(session.id, {
        title: parsed.title,
        description: parsed.description,
        priority: parsed.priority,
        recurrenceType,
        weeklyDays:
          recurrenceType === RecurrenceType.WEEKLY
            ? parseWeeklyDaysInput(parsed.weeklyDays)
            : undefined,
        monthlyDay:
          recurrenceType === RecurrenceType.MONTHLY ? parsed.monthlyDay : undefined,
        startDate: parsed.recurrenceStartDate || parsed.dueDate || undefined,
        endDate: parsed.recurrenceEndDate || undefined,
        planId,
      });

      revalidatePlanPaths(planId);
      revalidatePath(`/todos/recurring/${recurring.id}`);
      return { ok: true as const, id: recurring.id, kind: "recurring" as const };
    }

    const todo = await prisma.todo.create({
      data: {
        userId: session.id,
        planId,
        title: parsed.title,
        description: parsed.description || null,
        dueDate: parseDateInput(parsed.dueDate),
        priority: parsed.priority,
        sortOrder: await nextTodoSortOrder(session.id),
      },
    });

    revalidatePlanPaths(planId);
    revalidatePath(`/todos/${todo.id}`);
    return { ok: true as const, id: todo.id, kind: "one_time" as const };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { ok: false as const, error: error.errors[0]?.message ?? "参数无效" };
    }
    if (error instanceof Error && error.message === "PLAN_NOT_FOUND") {
      return { ok: false as const, error: "计划不存在" };
    }
    console.error("createPlanTodo error:", error);
    return { ok: false as const, error: "创建失败" };
  }
}

export async function linkTodoToPlan(planId: string, todoId: string) {
  const session = await requireSession();

  try {
    await getOwnedPlan(session.id, planId);
    const todo = await getOwnedTodo(session.id, todoId);

    if (todo.planId && todo.planId !== planId) {
      return { ok: false as const, error: "该待办已关联其他计划" };
    }

    await prisma.todo.update({
      where: { id: todoId },
      data: { planId },
    });

    revalidatePlanPaths(planId);
    revalidatePath(`/todos/${todoId}`);
    return { ok: true as const };
  } catch (error) {
    if (error instanceof Error && error.message === "PLAN_NOT_FOUND") {
      return { ok: false as const, error: "计划不存在" };
    }
    if (error instanceof Error && error.message === "TODO_NOT_FOUND") {
      return { ok: false as const, error: "待办不存在" };
    }
    console.error("linkTodoToPlan error:", error);
    return { ok: false as const, error: "关联失败" };
  }
}

export async function unlinkTodoFromPlan(planId: string, todoId: string) {
  const session = await requireSession();

  try {
    await getOwnedPlan(session.id, planId);
    const todo = await getOwnedTodo(session.id, todoId);

    if (todo.planId !== planId) {
      return { ok: false as const, error: "待办不属于此计划" };
    }

    await prisma.todo.update({
      where: { id: todoId },
      data: { planId: null },
    });

    revalidatePlanPaths(planId);
    revalidatePath(`/todos/${todoId}`);
    return { ok: true as const };
  } catch (error) {
    if (error instanceof Error && error.message === "PLAN_NOT_FOUND") {
      return { ok: false as const, error: "计划不存在" };
    }
    if (error instanceof Error && error.message === "TODO_NOT_FOUND") {
      return { ok: false as const, error: "待办不存在" };
    }
    console.error("unlinkTodoFromPlan error:", error);
    return { ok: false as const, error: "取消关联失败" };
  }
}

export async function linkRecurringTodoToPlan(planId: string, recurringTodoId: string) {
  const session = await requireSession();

  try {
    await getOwnedPlan(session.id, planId);
    const recurring = await getOwnedRecurringTodo(session.id, recurringTodoId);

    if (recurring.deletedAt) {
      return { ok: false as const, error: "该循环待办已删除" };
    }

    if (recurring.planId && recurring.planId !== planId) {
      return { ok: false as const, error: "该待办已关联其他计划" };
    }

    await prisma.recurringTodo.update({
      where: { id: recurringTodoId },
      data: { planId },
    });

    revalidatePlanPaths(planId);
    revalidatePath(`/todos/recurring/${recurringTodoId}`);
    return { ok: true as const };
  } catch (error) {
    if (error instanceof Error && error.message === "PLAN_NOT_FOUND") {
      return { ok: false as const, error: "计划不存在" };
    }
    if (error instanceof Error && error.message === "RECURRING_TODO_NOT_FOUND") {
      return { ok: false as const, error: "待办不存在" };
    }
    console.error("linkRecurringTodoToPlan error:", error);
    return { ok: false as const, error: "关联失败" };
  }
}

export async function unlinkRecurringTodoFromPlan(
  planId: string,
  recurringTodoId: string,
) {
  const session = await requireSession();

  try {
    await getOwnedPlan(session.id, planId);
    const recurring = await getOwnedRecurringTodo(session.id, recurringTodoId);

    if (recurring.planId !== planId) {
      return { ok: false as const, error: "待办不属于此计划" };
    }

    await prisma.recurringTodo.update({
      where: { id: recurringTodoId },
      data: { planId: null },
    });

    revalidatePlanPaths(planId);
    revalidatePath(`/todos/recurring/${recurringTodoId}`);
    return { ok: true as const };
  } catch (error) {
    if (error instanceof Error && error.message === "PLAN_NOT_FOUND") {
      return { ok: false as const, error: "计划不存在" };
    }
    if (error instanceof Error && error.message === "RECURRING_TODO_NOT_FOUND") {
      return { ok: false as const, error: "待办不存在" };
    }
    console.error("unlinkRecurringTodoFromPlan error:", error);
    return { ok: false as const, error: "取消关联失败" };
  }
}

export async function reorderPlansAction(
  orderedIds: string[],
  scope: "all" | "pending" = "all",
) {
  const session = await requireSession();

  try {
    await reorderPlans(session.id, orderedIds, scope);
    revalidatePlanPaths();
    return { ok: true as const };
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_ORDER") {
      return { ok: false as const, error: "排序无效" };
    }
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return { ok: false as const, error: "计划不存在" };
    }
    console.error("reorderPlansAction error:", error);
    return { ok: false as const, error: "排序失败" };
  }
}
