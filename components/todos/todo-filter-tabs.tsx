import Link from "next/link";
import { cn } from "@/lib/utils";
import type { TodoFilter } from "@/lib/validators/todo";

const filters: { value: TodoFilter; label: string }[] = [
  { value: "today", label: "今日" },
  { value: "all", label: "全部" },
  { value: "pending", label: "未完成" },
  { value: "completed", label: "已完成" },
];

export function TodoFilterTabs({
  active,
  className,
}: {
  active: TodoFilter;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap gap-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-1",
        className,
      )}
    >
      {filters.map(({ value, label }) => (
        <Link
          key={value}
          href={value === "today" ? "/todos" : `/todos?filter=${value}`}
          className={cn(
            "rounded-lg px-3 py-1.5 text-sm transition",
            active === value
              ? "bg-indigo-600/15 text-indigo-400"
              : "text-[var(--color-muted)] hover:bg-[var(--color-card-hover)] hover:text-[var(--color-foreground)]",
          )}
        >
          {label}
        </Link>
      ))}
    </div>
  );
}
