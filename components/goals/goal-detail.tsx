"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteGoal } from "@/app/(main)/goals/actions";
import { RecordDetail } from "@/components/detail/record-detail";
import { GoalEditForm } from "@/components/goals/goal-edit-form";
import { GoalPlansSection } from "@/components/goals/goal-plans-section";
import { GoalView } from "@/components/goals/goal-view";
import { goalStatusAccentBar } from "@/components/goals/goal-status-select";
import { ModulePanel } from "@/components/ui/module-ui";
import type { GoalWithPlans } from "@/lib/services/goal";
import type { PlanWithProgress } from "@/lib/services/plan";

export function GoalDetail({
  goal,
  unlinkedPlans,
}: {
  goal: GoalWithPlans;
  unlinkedPlans: PlanWithProgress[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [deletePending, startDeleteTransition] = useTransition();

  function handleDelete() {
    startDeleteTransition(async () => {
      await deleteGoal(goal.id);
    });
  }

  return (
    <div className="space-y-6">
      <ModulePanel module="goal" accentClassName={goalStatusAccentBar[goal.status]}>
        <RecordDetail
          onDelete={handleDelete}
          deletePending={deletePending}
          deleteConfirmTitle="删除长期目标"
          deleteConfirmDescription="确定删除此长期目标？关联关系将被移除，计划本身不受影响。"
          onEditingChange={setEditing}
          editForm={({ exitEdit }) => (
            <GoalEditForm
              key={goal.updatedAt.toISOString()}
              goal={goal}
              onCancel={exitEdit}
              onSaved={() => {
                exitEdit();
                router.refresh();
              }}
            />
          )}
        >
          <GoalView goal={goal} />
        </RecordDetail>
      </ModulePanel>

      {!editing && (
        <GoalPlansSection goal={goal} unlinkedPlans={unlinkedPlans} />
      )}
    </div>
  );
}
