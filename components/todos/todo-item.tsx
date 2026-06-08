import Link from "next/link";
import { formatDurationPair } from "@/lib/duration";
import type { DisplayTodoItem } from "@/lib/services/recurring-todo";
import { isDisplayTodoOverdue } from "@/lib/services/todo";
import { cn, formatShortDate } from "@/lib/utils";
import { TodoStatus } from "@prisma/client";
import { TodoCompletionNote } from "@/components/today/todo-completion-note";
import { PriorityBadge } from "./priority-badge";
import { RecurrenceBadge } from "./recurrence-badge";
import { TodoCheckbox } from "./todo-checkbox";

export function getTodoHref(todo: DisplayTodoItem) {
  if (todo.kind === "recurring") {
    return `/todos/recurring/${todo.recurringId ?? todo.id}`;
  }
  return `/todos/${todo.id}`;
}

export function TodoItem({
  todo,
  as = "li",
}: {
  todo: DisplayTodoItem;
  as?: "li" | "div";
}) {
  const completed = todo.status === TodoStatus.COMPLETED;
  const overdue = isDisplayTodoOverdue(todo);
  const showCheckbox = todo.kind === "one_time" || !!todo.periodDate;
  const Wrapper = as;

  return (
    <Wrapper
      className={cn(
        "flex items-start gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-3 transition-all duration-300",
        "hover:border-indigo-500/20 hover:bg-[var(--color-card-hover)]",
        completed && "border-[var(--color-success)]/20 bg-[var(--color-success)]/5",
      )}
    >
      {showCheckbox ? (
        <TodoCheckbox todo={todo} className="mt-0.5" />
      ) : (
        <span className="mt-0.5 h-5 w-5 shrink-0" />
      )}

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
            <RecurrenceBadge
              label={todo.recurrenceLabel}
              paused={todo.recurringPaused}
              deleted={todo.recurringDeleted}
            />
          )}
        </div>

        {todo.description && (
          <p className="mt-1 line-clamp-2 text-xs text-[var(--color-muted)]">
            {todo.description}
          </p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--color-muted)]">
          <span className={cn(overdue && "text-amber-400")}>
            {todo.kind === "recurring" && !todo.periodDate
              ? todo.recurrenceLabel ?? "循环待办"
              : formatShortDate(todo.dueDate)}
            {overdue && " · 已过期"}
          </span>
          {todo.plan && <span>计划：{todo.plan.title}</span>}
          {todo.activityType && <span>{todo.activityType.name}</span>}
          {formatDurationPair(todo.actualMinutes, todo.estimatedMinutes) && (
            <span>
              {formatDurationPair(todo.actualMinutes, todo.estimatedMinutes)}
            </span>
          )}
          {todo.completionNote && (
            <span className="line-clamp-1">说明：{todo.completionNote}</span>
          )}
        </div>

        {todo.periodDate && todo.status === TodoStatus.PENDING && (
          <TodoCompletionNote todo={todo} />
        )}
      </div>
    </Wrapper>
  );
}
