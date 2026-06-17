"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deletePlan } from "@/app/(main)/plans/actions";
import { RecordDetail } from "@/components/detail/record-detail";
import { PlanEditForm } from "@/components/plans/plan-edit-form";
import { PlanTodosSection } from "@/components/plans/plan-todos-section";
import { PlanView } from "@/components/plans/plan-view";
import { planStatusAccentBar } from "@/components/plans/plan-status-select";
import { ModulePanel } from "@/components/ui/module-ui";
import type { PlanWithTodos } from "@/lib/services/plan";
import type { RecurringTodo, Todo } from "@prisma/client";

export function PlanDetail({
  plan,
  unlinkedTodos,
  unlinkedRecurringTodos,
}: {
  plan: PlanWithTodos;
  unlinkedTodos: Todo[];
  unlinkedRecurringTodos: RecurringTodo[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [deletePending, startDeleteTransition] = useTransition();

  function handleDelete() {
    startDeleteTransition(async () => {
      await deletePlan(plan.id);
    });
  }

  return (
    <div className="space-y-6">
      <ModulePanel module="plan" accentClassName={planStatusAccentBar[plan.status]}>
        <RecordDetail
          onDelete={handleDelete}
          deletePending={deletePending}
          deleteConfirmTitle="删除计划"
          deleteConfirmDescription="确定删除此计划？关联待办将保留但不再属于此计划。"
          onEditingChange={setEditing}
          editForm={({ exitEdit }) => (
            <PlanEditForm
              key={plan.updatedAt.toISOString()}
              plan={plan}
              onCancel={exitEdit}
              onSaved={() => {
                exitEdit();
                router.refresh();
              }}
            />
          )}
        >
          <PlanView plan={plan} />
        </RecordDetail>
      </ModulePanel>

      {!editing && (
        <PlanTodosSection
          plan={plan}
          unlinkedTodos={unlinkedTodos}
          unlinkedRecurringTodos={unlinkedRecurringTodos}
        />
      )}
    </div>
  );
}
