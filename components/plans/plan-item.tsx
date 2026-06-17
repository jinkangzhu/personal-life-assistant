import Link from "next/link";
import { PlanProgressBar } from "@/components/plans/plan-progress";
import { planStatusAccentBar } from "@/components/plans/plan-status-select";
import type { PlanWithProgress } from "@/lib/services/plan";
import { cn } from "@/lib/utils";
import {
  PLAN_STATUS_LABELS,
  PLAN_TYPE_LABELS,
} from "@/lib/validators/plan";

export function PlanItem({ plan }: { plan: PlanWithProgress }) {
  const updatedLabel = new Date(plan.updatedAt).toLocaleString("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const dateRange = [plan.startDate, plan.endDate]
    .filter(Boolean)
    .map((date) =>
      date!.toLocaleDateString("zh-CN", { month: "short", day: "numeric" }),
    )
    .join(" — ");

  return (
    <li>
      <Link
        href={`/plans/${plan.id}`}
        className={cn(
          "group relative block overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-3.5 transition",
          "hover:border-indigo-500/20 hover:bg-[var(--color-card-hover)]",
        )}
      >
        <div
          className={cn(
            "absolute inset-y-0 left-0 w-0.5",
            planStatusAccentBar[plan.status],
          )}
          aria-hidden="true"
        />
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <p className="text-[0.9375rem] font-medium leading-snug tracking-tight transition group-hover:text-indigo-300">
              {plan.title}
            </p>
            <div className="flex flex-wrap gap-2 text-xs text-[var(--color-muted)]">
              <span>{PLAN_TYPE_LABELS[plan.type]}</span>
              <span>{PLAN_STATUS_LABELS[plan.status]}</span>
              {dateRange && <span>{dateRange}</span>}
            </div>
          </div>
          <span className="shrink-0 font-mono text-[0.6875rem] tabular-nums text-[var(--color-muted)]">
            {updatedLabel}
          </span>
        </div>

        {plan.description && (
          <p className="mt-2 line-clamp-2 text-sm text-[var(--color-muted)]">
            {plan.description}
          </p>
        )}

        <div className="mt-3">
          <PlanProgressBar progress={plan.progress} />
        </div>
      </Link>
    </li>
  );
}
