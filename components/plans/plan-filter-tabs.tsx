import Link from "next/link";
import { cn } from "@/lib/utils";
import type { PlanFilter } from "@/lib/validators/plan";

const filters: { value: PlanFilter; label: string }[] = [
  { value: "pending", label: "未完成" },
  { value: "completed", label: "已完成" },
  { value: "archived", label: "已归档" },
  { value: "all", label: "全部" },
];

export function PlanFilterTabs({
  active,
  className,
}: {
  active: PlanFilter;
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
          href={value === "pending" ? "/plans" : `/plans?filter=${value}`}
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
