"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import {
  toggleRecurringTodoStatus,
  toggleTodoStatus,
} from "@/app/(main)/todos/actions";
import type { DisplayTodoItem } from "@/lib/services/recurring-todo";
import { cn, toDateInputValue } from "@/lib/utils";
import { TodoStatus } from "@prisma/client";

export function TodoCheckbox({
  todo,
  className,
}: {
  todo: Pick<
    DisplayTodoItem,
    "kind" | "id" | "status" | "recurringId" | "periodDate"
  >;
  className?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const completed = todo.status === TodoStatus.COMPLETED;

  function handleToggle() {
    startTransition(async () => {
      if (todo.kind === "recurring" && todo.recurringId && todo.periodDate) {
        await toggleRecurringTodoStatus(
          todo.recurringId,
          toDateInputValue(todo.periodDate),
        );
      } else {
        await toggleTodoStatus(todo.id);
      }
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={pending}
      aria-label={completed ? "标记为未完成" : "标记为完成"}
      className={cn(
        "shrink-0 rounded-full transition disabled:opacity-50",
        completed
          ? "text-[var(--color-success)]"
          : "text-[var(--color-muted)] hover:text-indigo-400",
        pending && "scale-110",
        className,
      )}
    >
      {completed ? (
        <CheckCircle2 className={cn("h-5 w-5", pending && "animate-check-pop")} />
      ) : (
        <Circle className={cn("h-5 w-5", pending && "animate-check-pop")} />
      )}
    </button>
  );
}
