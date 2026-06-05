import Link from "next/link";
import { GoalPlanStatsSummary } from "@/components/goals/goal-plan-stats";
import { GoalStatusBadge } from "@/components/goals/goal-status-select";
import { goalDescriptionSummary, type GoalWithPlans } from "@/lib/services/goal";
import { cn } from "@/lib/utils";

export function GoalItem({ goal }: { goal: GoalWithPlans }) {
  const summary = goalDescriptionSummary(goal.description);
  const updatedLabel = new Date(goal.updatedAt).toLocaleString("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <li>
      <Link
        href={`/goals/${goal.id}`}
        className={cn(
          "group block rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-3 transition",
          "hover:border-indigo-500/20 hover:bg-[var(--color-card-hover)]",
        )}
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 space-y-2">
            <p className="text-sm font-medium group-hover:text-indigo-400">
              {goal.title}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <GoalStatusBadge status={goal.status} />
              <GoalPlanStatsSummary stats={goal.planStats} />
            </div>
          </div>
          <span className="shrink-0 text-xs text-[var(--color-muted)]">
            {updatedLabel}
          </span>
        </div>

        {summary && (
          <p className="mt-2 line-clamp-2 text-sm text-[var(--color-muted)]">
            {summary}
          </p>
        )}
      </Link>
    </li>
  );
}
