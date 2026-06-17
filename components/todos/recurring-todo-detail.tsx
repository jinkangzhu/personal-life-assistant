"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  deleteRecurringTodoAction,
  pauseRecurringTodoAction,
  resumeRecurringTodoAction,
} from "@/app/(main)/todos/actions";
import { RecordDetail } from "@/components/detail/record-detail";
import { RecurringTodoEditForm } from "@/components/todos/recurring-todo-edit-form";
import { RecurringTodoView } from "@/components/todos/recurring-todo-view";
import { priorityAccentBar } from "@/components/todos/priority-badge";
import { Button } from "@/components/ui/button";
import { ModulePanel } from "@/components/ui/module-ui";
import type { ActivityType } from "@prisma/client";
import type { RecurringTodoWithPlan, DisplayTodoItem } from "@/lib/services/recurring-todo";

export function RecurringTodoDetail({
  todo,
  currentPeriod,
  activityTypes = [],
}: {
  todo: RecurringTodoWithPlan & {
    occurrences: Array<{
      id: string;
      periodDate: Date;
      status: string;
      completionNote: string | null;
      completedAt: Date | null;
    }>;
  };
  currentPeriod: DisplayTodoItem | null;
  activityTypes?: ActivityType[];
}) {
  const router = useRouter();
  const [deletePending, startDeleteTransition] = useTransition();
  const [pausePending, startPauseTransition] = useTransition();

  function handleDelete() {
    startDeleteTransition(async () => {
      await deleteRecurringTodoAction(todo.id);
    });
  }

  function handlePauseToggle() {
    startPauseTransition(async () => {
      if (todo.active) {
        await pauseRecurringTodoAction(todo.id);
      } else {
        await resumeRecurringTodoAction(todo.id);
      }
      router.refresh();
    });
  }

  return (
    <ModulePanel module="todo" accentClassName={priorityAccentBar[todo.priority]}>
      <RecordDetail
        onDelete={todo.deletedAt ? undefined : handleDelete}
        deletePending={deletePending}
        deleteConfirmTitle="删除循环待办"
        deleteConfirmDescription="删除后将不再出现在待办列表中，历史完成记录会保留。"
        editForm={({ exitEdit }) => (
          <RecurringTodoEditForm
            key={todo.updatedAt.toISOString()}
            todo={todo}
            currentPeriod={currentPeriod}
            activityTypes={activityTypes}
            onCancel={exitEdit}
            onSaved={() => {
              exitEdit();
              router.refresh();
            }}
          />
        )}
      >
        <RecurringTodoView todo={todo} currentPeriod={currentPeriod} />
      </RecordDetail>

      {!todo.deletedAt && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-[var(--color-border)]/70 pt-4">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={pausePending}
            onClick={handlePauseToggle}
          >
            {pausePending
              ? "处理中…"
              : todo.active
                ? "暂停循环"
                : "恢复循环"}
          </Button>
        </div>
      )}
    </ModulePanel>
  );
}
