"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  createRecurringTodo,
  getOwnedRecurringTodo,
  setRecurringTodoActive,
  softDeleteRecurringTodo,
  toggleRecurringOccurrence,
  updateRecurringOccurrenceNote,
  updateRecurringTodo,
} from "@/lib/services/recurring-todo";
import {
  getOwnedTodo,
  nextTodoSortOrder,
  reorderTodayTodos,
  reorderTodos,
} from "@/lib/services/todo";
import type { TodoReorderItem } from "@/lib/services/sort-order";
import { requireSession } from "@/lib/session";
import { parseDateInput } from "@/lib/utils";
import { recurringTodoCreateSchema } from "@/lib/validators/recurring-todo";
import {
  mapRecurrenceFormToType,
  parseWeeklyDaysInput,
  todoCreateSchema,
  todoUpdateSchema,
} from "@/lib/validators/todo";
import { Priority, RecurrenceType, TodoStatus } from "@prisma/client";
import { z } from "zod";

function revalidateTodoPaths(id?: string, planId?: string | null) {
  revalidatePath("/todos");
  revalidatePath("/today");
  revalidatePath("/plans");
  revalidatePath("/reviews");
  if (planId) revalidatePath(`/plans/${planId}`);
  if (id) {
    revalidatePath(`/todos/${id}`);
    revalidatePath(`/todos/recurring/${id}`);
  }
}

function formDataToObject(formData: FormData) {
  return Object.fromEntries(formData.entries()) as Record<string, string>;
}

export async function createTodo(formData: FormData) {
  const session = await requireSession();

  try {
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
      });

      revalidateTodoPaths(recurring.id, recurring.planId);
      return { ok: true as const, id: recurring.id, kind: "recurring" as const };
    }

    const todo = await prisma.todo.create({
      data: {
        userId: session.id,
        title: parsed.title,
        description: parsed.description || null,
        dueDate: parseDateInput(parsed.dueDate),
        priority: parsed.priority,
        sortOrder: await nextTodoSortOrder(session.id),
      },
    });

    revalidateTodoPaths(todo.id);
    return { ok: true as const, id: todo.id, kind: "one_time" as const };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { ok: false as const, error: error.errors[0]?.message ?? "参数无效" };
    }
    console.error("createTodo error:", error);
    return { ok: false as const, error: "创建失败" };
  }
}

export async function updateTodo(id: string, formData: FormData) {
  const session = await requireSession();

  try {
    const todo = await getOwnedTodo(session.id, id);
    const raw = formDataToObject(formData);
    const parsed = todoUpdateSchema.parse({
      title: raw.title,
      description: raw.description || undefined,
      dueDate: raw.dueDate || undefined,
      priority: raw.priority || Priority.MEDIUM,
      completionNote: raw.completionNote || undefined,
    });

    await prisma.todo.update({
      where: { id },
      data: {
        title: parsed.title,
        description: parsed.description || null,
        dueDate: parseDateInput(parsed.dueDate),
        priority: parsed.priority,
        completionNote: parsed.completionNote || null,
      },
    });

    revalidateTodoPaths(id, todo.planId);
    return { ok: true as const };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { ok: false as const, error: error.errors[0]?.message ?? "参数无效" };
    }
    if (error instanceof Error && error.message === "TODO_NOT_FOUND") {
      return { ok: false as const, error: "待办不存在" };
    }
    console.error("updateTodo error:", error);
    return { ok: false as const, error: "更新失败" };
  }
}

export async function updateRecurringTodoAction(id: string, formData: FormData) {
  const session = await requireSession();

  try {
    const existing = await getOwnedRecurringTodo(session.id, id);
    const raw = formDataToObject(formData);
    const parsed = recurringTodoCreateSchema.parse({
      title: raw.title,
      description: raw.description || undefined,
      priority: raw.priority || Priority.MEDIUM,
      recurrenceType: raw.recurrenceType,
      weeklyDays: parseWeeklyDaysInput(raw.weeklyDays),
      monthlyDay: raw.monthlyDay ? Number(raw.monthlyDay) : undefined,
      startDate: raw.startDate || undefined,
      endDate: raw.endDate || undefined,
    });

    await updateRecurringTodo(session.id, id, parsed);

    if (raw.periodDate) {
      const note = z.string().trim().max(2000).parse(raw.completionNote ?? "");
      await updateRecurringOccurrenceNote(
        session.id,
        id,
        raw.periodDate,
        note,
      );
    }

    revalidateTodoPaths(id, existing.planId);
    return { ok: true as const };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { ok: false as const, error: error.errors[0]?.message ?? "参数无效" };
    }
    if (error instanceof Error && error.message === "RECURRING_TODO_NOT_FOUND") {
      return { ok: false as const, error: "循环待办不存在" };
    }
    console.error("updateRecurringTodoAction error:", error);
    return { ok: false as const, error: "更新失败" };
  }
}

export async function deleteTodo(id: string) {
  const session = await requireSession();

  try {
    const todo = await getOwnedTodo(session.id, id);
    await prisma.todo.delete({ where: { id } });
    revalidateTodoPaths(id, todo.planId);
    redirect("/todos");
  } catch (error) {
    if (error instanceof Error && error.message === "TODO_NOT_FOUND") {
      return { ok: false as const, error: "待办不存在" };
    }
    throw error;
  }
}

export async function deleteRecurringTodoAction(id: string) {
  const session = await requireSession();

  try {
    const todo = await getOwnedRecurringTodo(session.id, id);
    await softDeleteRecurringTodo(session.id, id);
    revalidateTodoPaths(id, todo.planId);
    redirect("/todos");
  } catch (error) {
    if (error instanceof Error && error.message === "RECURRING_TODO_NOT_FOUND") {
      return { ok: false as const, error: "循环待办不存在" };
    }
    throw error;
  }
}

export async function pauseRecurringTodoAction(id: string) {
  const session = await requireSession();

  try {
    const todo = await getOwnedRecurringTodo(session.id, id);
    await setRecurringTodoActive(session.id, id, false);
    revalidateTodoPaths(id, todo.planId);
    return { ok: true as const };
  } catch (error) {
    if (error instanceof Error && error.message === "RECURRING_TODO_NOT_FOUND") {
      return { ok: false as const, error: "循环待办不存在" };
    }
    console.error("pauseRecurringTodoAction error:", error);
    return { ok: false as const, error: "暂停失败" };
  }
}

export async function resumeRecurringTodoAction(id: string) {
  const session = await requireSession();

  try {
    const todo = await getOwnedRecurringTodo(session.id, id);
    await setRecurringTodoActive(session.id, id, true);
    revalidateTodoPaths(id, todo.planId);
    return { ok: true as const };
  } catch (error) {
    if (error instanceof Error && error.message === "RECURRING_TODO_NOT_FOUND") {
      return { ok: false as const, error: "循环待办不存在" };
    }
    console.error("resumeRecurringTodoAction error:", error);
    return { ok: false as const, error: "恢复失败" };
  }
}

export async function updateTodoCompletionNote(id: string, completionNote: string) {
  const session = await requireSession();

  try {
    const todo = await getOwnedTodo(session.id, id);
    const note = z.string().trim().max(2000).parse(completionNote);

    await prisma.todo.update({
      where: { id },
      data: { completionNote: note || null },
    });

    revalidateTodoPaths(id, todo.planId);
    return { ok: true as const };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { ok: false as const, error: error.errors[0]?.message ?? "说明无效" };
    }
    if (error instanceof Error && error.message === "TODO_NOT_FOUND") {
      return { ok: false as const, error: "待办不存在" };
    }
    console.error("updateTodoCompletionNote error:", error);
    return { ok: false as const, error: "保存失败" };
  }
}

export async function updateRecurringCompletionNote(
  recurringTodoId: string,
  periodDate: string,
  completionNote: string,
) {
  const session = await requireSession();

  try {
    const todo = await getOwnedRecurringTodo(session.id, recurringTodoId);
    const note = z.string().trim().max(2000).parse(completionNote);
    await updateRecurringOccurrenceNote(
      session.id,
      recurringTodoId,
      periodDate,
      note,
    );
    revalidateTodoPaths(recurringTodoId, todo.planId);
    return { ok: true as const };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { ok: false as const, error: error.errors[0]?.message ?? "说明无效" };
    }
    if (error instanceof Error && error.message === "RECURRING_TODO_NOT_FOUND") {
      return { ok: false as const, error: "循环待办不存在" };
    }
    console.error("updateRecurringCompletionNote error:", error);
    return { ok: false as const, error: "保存失败" };
  }
}

export async function toggleTodoStatus(id: string) {
  const session = await requireSession();

  try {
    const todo = await getOwnedTodo(session.id, id);
    const isCompleted = todo.status === TodoStatus.COMPLETED;

    await prisma.todo.update({
      where: { id },
      data: {
        status: isCompleted ? TodoStatus.PENDING : TodoStatus.COMPLETED,
        completedAt: isCompleted ? null : new Date(),
      },
    });

    revalidateTodoPaths(id, todo.planId);
    return { ok: true as const };
  } catch (error) {
    if (error instanceof Error && error.message === "TODO_NOT_FOUND") {
      return { ok: false as const, error: "待办不存在" };
    }
    console.error("toggleTodoStatus error:", error);
    return { ok: false as const, error: "操作失败" };
  }
}

export async function toggleRecurringTodoStatus(
  recurringTodoId: string,
  periodDate: string,
) {
  const session = await requireSession();

  try {
    const todo = await getOwnedRecurringTodo(session.id, recurringTodoId);
    await toggleRecurringOccurrence(session.id, recurringTodoId, periodDate);
    revalidateTodoPaths(recurringTodoId, todo.planId);
    return { ok: true as const };
  } catch (error) {
    if (error instanceof Error && error.message === "RECURRING_TODO_NOT_FOUND") {
      return { ok: false as const, error: "循环待办不存在" };
    }
    if (error instanceof Error && error.message === "INVALID_PERIOD") {
      return { ok: false as const, error: "该日期不适用此循环规则" };
    }
    console.error("toggleRecurringTodoStatus error:", error);
    return { ok: false as const, error: "操作失败" };
  }
}

export async function reorderTodosAction(
  orderedItems: TodoReorderItem[],
  scope: "all" | "pending" | "today" = "all",
) {
  const session = await requireSession();

  try {
    if (scope === "today") {
      await reorderTodayTodos(session.id, orderedItems);
    } else {
      await reorderTodos(session.id, orderedItems, scope);
    }
    revalidateTodoPaths();
    return { ok: true as const };
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_ORDER") {
      return { ok: false as const, error: "排序无效" };
    }
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return { ok: false as const, error: "待办不存在" };
    }
    console.error("reorderTodosAction error:", error);
    return { ok: false as const, error: "排序失败" };
  }
}
