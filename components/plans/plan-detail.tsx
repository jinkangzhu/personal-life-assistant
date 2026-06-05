"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deletePlan } from "@/app/(main)/plans/actions";
import { RecordDetail } from "@/components/detail/record-detail";
import { PlanEditForm } from "@/components/plans/plan-edit-form";
import { PlanTodosSection } from "@/components/plans/plan-todos-section";
import { PlanView } from "@/components/plans/plan-view";
import { Card } from "@/components/ui/card";
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
      <Card className="px-4 py-4">
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
      </Card>

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
