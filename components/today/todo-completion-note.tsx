"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  updateRecurringCompletionNote,
  updateTodoCompletionNote,
} from "@/app/(main)/todos/actions";
import type { DisplayTodoItem } from "@/lib/services/recurring-todo";
import { cn, toDateInputValue } from "@/lib/utils";

export function TodoCompletionNote({
  todo,
  className,
}: {
  todo: Pick<
    DisplayTodoItem,
    "kind" | "id" | "recurringId" | "periodDate" | "completionNote"
  >;
  className?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [note, setNote] = useState(todo.completionNote ?? "");
  const [error, setError] = useState("");

  function handleSave() {
    if (note === (todo.completionNote ?? "")) return;

    startTransition(async () => {
      const result =
        todo.kind === "recurring" && todo.recurringId && todo.periodDate
          ? await updateRecurringCompletionNote(
              todo.recurringId,
              toDateInputValue(todo.periodDate),
              note,
            )
          : await updateTodoCompletionNote(todo.id, note);

      if (result.ok) {
        setError("");
        router.refresh();
        return;
      }
      setError(result.error ?? "保存失败");
    });
  }

  return (
    <div className={cn("mt-2", className)}>
      <input
        type="text"
        value={note}
        onChange={(event) => setNote(event.target.value)}
        onBlur={handleSave}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            handleSave();
          }
        }}
        disabled={pending}
        placeholder="补充说明或未完成原因…"
        maxLength={2000}
        className="w-full rounded-md border border-[var(--color-border)] bg-transparent px-2.5 py-1.5 text-xs outline-none placeholder:text-[var(--color-muted)] focus-visible:border-indigo-500/50 focus-visible:ring-2 focus-visible:ring-indigo-500/20"
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
