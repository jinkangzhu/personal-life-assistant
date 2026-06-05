import { GoalPlanStatsSummary } from "@/components/goals/goal-plan-stats";
import { GoalStatusBadge } from "@/components/goals/goal-status-select";
import type { GoalWithPlans } from "@/lib/services/goal";

export function GoalView({ goal }: { goal: GoalWithPlans }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[var(--color-muted)]">
        <GoalStatusBadge status={goal.status} />
        <GoalPlanStatsSummary stats={goal.planStats} />
        <span>
          创建于 {new Date(goal.createdAt).toLocaleString("zh-CN")}
        </span>
        {goal.updatedAt.getTime() !== goal.createdAt.getTime() && (
          <span>
            更新于 {new Date(goal.updatedAt).toLocaleString("zh-CN")}
          </span>
        )}
      </div>

      {goal.description && (
        <p className="whitespace-pre-wrap text-sm text-[var(--color-foreground)]">
          {goal.description}
        </p>
      )}
    </div>
  );
}
