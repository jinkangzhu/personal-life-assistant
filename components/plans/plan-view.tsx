import { PlanProgressBar } from "@/components/plans/plan-progress";
import type { PlanWithTodos } from "@/lib/services/plan";
import {
  PLAN_STATUS_LABELS,
  PLAN_TYPE_LABELS,
} from "@/lib/validators/plan";

export function PlanView({ plan }: { plan: PlanWithTodos }) {
  const dateRange = [plan.startDate, plan.endDate]
    .filter(Boolean)
    .map((date) =>
      date!.toLocaleDateString("zh-CN", { month: "short", day: "numeric" }),
    )
    .join(" — ");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--color-muted)]">
        <span>{PLAN_TYPE_LABELS[plan.type]}</span>
        <span>{PLAN_STATUS_LABELS[plan.status]}</span>
        <span>{dateRange || "未设置日期"}</span>
        <span>
          创建于 {new Date(plan.createdAt).toLocaleString("zh-CN")}
        </span>
        {plan.updatedAt.getTime() !== plan.createdAt.getTime() && (
          <span>
            更新于 {new Date(plan.updatedAt).toLocaleString("zh-CN")}
          </span>
        )}
      </div>

      {plan.description && (
        <p className="whitespace-pre-wrap text-sm text-[var(--color-foreground)]">
          {plan.description}
        </p>
      )}

      <PlanProgressBar progress={plan.progress} />
    </div>
  );
}
