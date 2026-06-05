import Link from "next/link";
import { MarkdownContent } from "@/components/ui/markdown-content";
import type { ReviewDayContext } from "@/lib/services/review";
import { CheckCircle2, Circle, BookOpen } from "lucide-react";

export function ReviewDayContext({ context }: { context: ReviewDayContext }) {
  const {
    diaryEntries,
    completedTodos,
    pendingTodos,
    completedRecurring,
    pendingRecurring,
  } = context;

  const completedCount = completedTodos.length + completedRecurring.length;
  const pendingCount = pendingTodos.length + pendingRecurring.length;

  return (
    <div className="space-y-4">
      <section>
        <div className="mb-2 flex items-center gap-2 text-sm font-medium">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          待办完成情况
        </div>
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-3 text-sm">
          <p className="mb-2 text-xs text-[var(--color-muted)]">
            已完成 {completedCount} · 未完成 {pendingCount}
          </p>
          {completedCount === 0 && pendingCount === 0 ? (
            <p className="text-[var(--color-muted)]">当日暂无相关待办</p>
          ) : (
            <ul className="space-y-1.5">
              {completedTodos.map((todo) => (
                <li key={todo.id} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                  <Link
                    href={`/todos/${todo.id}`}
                    className="text-[var(--color-foreground)] hover:text-indigo-400"
                  >
                    {todo.title}
                  </Link>
                </li>
              ))}
              {completedRecurring.map((todo) => (
                <li key={`recurring-done-${todo.title}`} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                  <span className="text-[var(--color-foreground)]">
                    {todo.title}
                    <span className="text-[var(--color-muted)]">（循环）</span>
                  </span>
                </li>
              ))}
              {pendingTodos.map((todo) => (
                <li key={todo.id} className="flex items-start gap-2">
                  <Circle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
                  <Link
                    href={`/todos/${todo.id}`}
                    className="text-[var(--color-foreground)] hover:text-indigo-400"
                  >
                    {todo.title}
                    {todo.completionNote && (
                      <span className="text-[var(--color-muted)]">
                        {" "}
                        — {todo.completionNote}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
              {pendingRecurring.map((todo) => (
                <li key={`recurring-pending-${todo.title}`} className="flex items-start gap-2">
                  <Circle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
                  <span className="text-[var(--color-foreground)]">
                    {todo.title}
                    <span className="text-[var(--color-muted)]">（循环）</span>
                    {todo.completionNote && (
                      <span className="text-[var(--color-muted)]">
                        {" "}
                        — {todo.completionNote}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section>
        <div className="mb-2 flex items-center gap-2 text-sm font-medium">
          <BookOpen className="h-4 w-4 text-indigo-400" />
          日记摘要
        </div>
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-3 text-sm">
          {diaryEntries.length === 0 ? (
            <p className="text-[var(--color-muted)]">当日暂无日记</p>
          ) : (
            <ul className="space-y-3">
              {diaryEntries.map((entry) => (
                <li key={entry.id}>
                  <Link
                    href={`/diary/${entry.id}`}
                    className="group block rounded-md transition hover:bg-[var(--color-card-hover)]"
                  >
                    {entry.title && (
                      <p className="mb-1 font-medium group-hover:text-indigo-400">
                        {entry.title}
                      </p>
                    )}
                    {entry.content.trim() ? (
                      <div className="relative max-h-[4.5rem] overflow-hidden text-[var(--color-muted)]">
                        <MarkdownContent
                          content={entry.content.slice(0, 200)}
                          className="[&_h1]:text-sm [&_h2]:text-sm [&_h3]:text-sm [&_p]:text-sm"
                        />
                        {entry.content.length > 200 && (
                          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-[var(--color-card)] to-transparent group-hover:from-[var(--color-card-hover)]" />
                        )}
                      </div>
                    ) : (
                      <p className="text-[var(--color-muted)]">（空）</p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
