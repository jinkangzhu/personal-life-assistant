"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { ArrowDown, ArrowUp, ArrowUpToLine } from "lucide-react";
import { pinTodayTodoToTopAction } from "@/app/(main)/todos/actions";
import { cn } from "@/lib/utils";
import {
  COMPLETED_TODO_SORT_LABELS,
  DEFAULT_COMPLETED_TODO_SORT,
  todosPageHref,
  type CompletedTodoSort,
  type CompletedTodoSortField,
  type SortOrder,
  type TodoDateRangeFilter,
} from "@/lib/validators/todo";

const SORT_FIELDS = Object.entries(COMPLETED_TODO_SORT_LABELS) as [
  CompletedTodoSortField,
  string,
][];

export function TodoCompletedSortBar({
  dateRange,
  completedSort,
}: {
  dateRange: TodoDateRangeFilter;
  completedSort: CompletedTodoSort | null;
}) {
  const router = useRouter();
  const active = completedSort ?? DEFAULT_COMPLETED_TODO_SORT;

  function navigate(next: CompletedTodoSort) {
    router.push(
      todosPageHref({
        filter: "completed",
        dateRange,
        completedSort: next,
      }),
    );
  }

  function handleFieldChange(sortBy: CompletedTodoSortField) {
    if (sortBy === active.sortBy && completedSort) return;
    navigate({ sortBy, sortOrder: active.sortOrder });
  }

  function toggleOrder() {
    const nextOrder: SortOrder = active.sortOrder === "asc" ? "desc" : "asc";
    navigate({ sortBy: active.sortBy, sortOrder: nextOrder });
  }

  return (
    <div className="flex items-center justify-end gap-1.5">
      <div className="flex rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-0.5">
        {SORT_FIELDS.map(([field, label]) => (
          <button
            key={field}
            type="button"
            onClick={() => handleFieldChange(field)}
            className={cn(
              "rounded-md px-2 py-1 text-xs transition",
              active.sortBy === field
                ? "bg-indigo-600/15 text-indigo-400"
                : "text-[var(--color-muted)] hover:text-[var(--color-foreground)]",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={toggleOrder}
        aria-label={active.sortOrder === "asc" ? "正序，点击切换为倒序" : "倒序，点击切换为正序"}
        title={active.sortOrder === "asc" ? "正序" : "倒序"}
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition",
          completedSort
            ? "border-indigo-500/30 bg-indigo-600/15 text-indigo-400"
            : "border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-muted)] hover:bg-[var(--color-card-hover)] hover:text-[var(--color-foreground)]",
        )}
      >
        {active.sortOrder === "asc" ? (
          <ArrowUp className="h-3.5 w-3.5" />
        ) : (
          <ArrowDown className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  );
}

export function TodoPinToTopButton({
  item,
  disabled,
}: {
  item: { kind: "one_time" | "recurring"; id: string };
  disabled?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handlePin() {
    startTransition(async () => {
      const result = await pinTodayTodoToTopAction(item);
      if (result.ok) {
        router.refresh();
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handlePin}
      disabled={disabled || pending}
      aria-label="置顶"
      title="置顶"
      className="mt-3 flex shrink-0 items-center justify-center rounded-md p-1.5 text-[var(--color-muted)] transition hover:bg-[var(--color-card-hover)] hover:text-indigo-400 disabled:opacity-50"
    >
      <ArrowUpToLine className="h-4 w-4" />
    </button>
  );
}
