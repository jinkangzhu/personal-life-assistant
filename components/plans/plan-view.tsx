import { PlanProgressBar } from "@/components/plans/plan-progress";
import { PlanStatusBadge } from "@/components/plans/plan-status-select";
import {
  ModuleMetaDivider,
  ModuleMetaRow,
  ModuleProse,
} from "@/components/ui/module-ui";
import type { PlanWithTodos } from "@/lib/services/plan";
import { PLAN_TYPE_LABELS } from "@/lib/validators/plan";

export function PlanView({ plan }: { plan: PlanWithTodos }) {
  const dateRange = [plan.startDate, plan.endDate]
    .filter(Boolean)
    .map((date) =>
      date!.toLocaleDateString("zh-CN", { month: "short", day: "numeric" }),
    )
    .join(" — ");

  return (
    <div className="space-y-5">
      <ModuleMetaRow>
        <PlanStatusBadge status={plan.status} />
        <span>{PLAN_TYPE_LABELS[plan.type]}</span>
        <ModuleMetaDivider />
        <span>{dateRange || "未设置日期"}</span>
        <ModuleMetaDivider />
        <span>创建于 {new Date(plan.createdAt).toLocaleString("zh-CN")}</span>
        {plan.updatedAt.getTime() !== plan.createdAt.getTime() && (
          <>
            <ModuleMetaDivider />
            <span>更新于 {new Date(plan.updatedAt).toLocaleString("zh-CN")}</span>
          </>
        )}
      </ModuleMetaRow>

      {plan.description ? (
        <ModuleProse>{plan.description}</ModuleProse>
      ) : (
        <p className="text-sm text-[var(--color-muted)]">暂无背景描述</p>
      )}

      <div>
        <p className="mb-2 text-xs font-medium tracking-wide text-[var(--color-muted)]">
          待办进度
        </p>
        <PlanProgressBar progress={plan.progress} />
      </div>
    </div>
  );
}
