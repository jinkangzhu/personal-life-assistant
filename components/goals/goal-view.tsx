import { GoalPlanStatsSummary } from "@/components/goals/goal-plan-stats";
import { GoalStatusBadge } from "@/components/goals/goal-status-select";
import {
  ModuleMetaDivider,
  ModuleMetaRow,
  ModuleProse,
} from "@/components/ui/module-ui";
import type { GoalWithPlans } from "@/lib/services/goal";

export function GoalView({ goal }: { goal: GoalWithPlans }) {
  return (
    <div className="space-y-5">
      <ModuleMetaRow>
        <GoalStatusBadge status={goal.status} />
        <GoalPlanStatsSummary stats={goal.planStats} />
        <ModuleMetaDivider />
        <span>创建于 {new Date(goal.createdAt).toLocaleString("zh-CN")}</span>
        {goal.updatedAt.getTime() !== goal.createdAt.getTime() && (
          <>
            <ModuleMetaDivider />
            <span>更新于 {new Date(goal.updatedAt).toLocaleString("zh-CN")}</span>
          </>
        )}
      </ModuleMetaRow>

      {goal.description ? (
        <ModuleProse>{goal.description}</ModuleProse>
      ) : (
        <p className="text-sm text-[var(--color-muted)]">暂无背景描述</p>
      )}
    </div>
  );
}
