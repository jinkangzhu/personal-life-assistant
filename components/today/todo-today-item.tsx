"use client";

import Link from "next/link";
import { formatDurationPair } from "@/lib/duration";
import type { DisplayTodoItem } from "@/lib/services/recurring-todo";
import { isDisplayTodoOverdue } from "@/lib/services/todo";
import { cn, formatShortDate } from "@/lib/utils";
import { TodoStatus } from "@prisma/client";
import { PriorityBadge } from "@/components/todos/priority-badge";
import { RecurrenceBadge } from "@/components/todos/recurrence-badge";
import { TodoCheckbox } from "@/components/todos/todo-checkbox";
import { getTodoHref } from "@/components/todos/todo-item";
import { TodoCompletionNote } from "./todo-completion-note";

export function TodoTodayItem({
  todo,
  showCompletionNote = false,
}: {
  todo: DisplayTodoItem;
  showCompletionNote?: boolean;
}) {
  const completed = todo.status === TodoStatus.COMPLETED;
  const overdue = isDisplayTodoOverdue(todo);
  const pending = todo.status === TodoStatus.PENDING;

  return (
    <li
      className={cn(
        "rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2.5 transition-all duration-300 sm:px-4 sm:py-3",
        "hover:border-indigo-500/20 hover:bg-[var(--color-card-hover)]",
        completed && "border-[var(--color-success)]/20 bg-[var(--color-success)]/5",
      )}
    >
      <div className="flex items-start gap-3">
        <TodoCheckbox todo={todo} className="mt-0.5" />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={getTodoHref(todo)}
              className={cn(
                "text-sm font-medium hover:text-indigo-400",
                completed && "text-[var(--color-muted)] line-through",
              )}
            >
              {todo.title}
            </Link>
            <PriorityBadge priority={todo.priority} />
            {todo.recurrenceLabel && (
              <RecurrenceBadge label={todo.recurrenceLabel} />
            )}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[var(--color-muted)]">
            <span className={cn(overdue && "text-amber-400")}>
              {formatShortDate(todo.dueDate)}
              {overdue && " · 已过期"}
            </span>
            {todo.plan && <span>计划：{todo.plan.title}</span>}
            {todo.activityType && <span>{todo.activityType.name}</span>}
            {formatDurationPair(todo.actualMinutes, todo.estimatedMinutes) && (
              <span>
                {formatDurationPair(todo.actualMinutes, todo.estimatedMinutes)}
              </span>
            )}
          </div>

          {pending && (showCompletionNote || todo.kind === "recurring") && (
            <TodoCompletionNote todo={todo} />
          )}

          {!showCompletionNote && todo.completionNote && (
            <p className="mt-1 line-clamp-2 text-xs text-[var(--color-muted)]">
              说明：{todo.completionNote}
            </p>
          )}
        </div>
      </div>
    </li>
  );
}
