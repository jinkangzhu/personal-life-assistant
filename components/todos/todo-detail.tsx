"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteTodo } from "@/app/(main)/todos/actions";
import { RecordDetail } from "@/components/detail/record-detail";
import { TodoEditForm } from "@/components/todos/todo-edit-form";
import { TodoView } from "@/components/todos/todo-view";
import { priorityAccentBar } from "@/components/todos/priority-badge";
import { ModulePanel } from "@/components/ui/module-ui";
import type { ActivityType } from "@prisma/client";
import type { TodoWithPlan } from "@/lib/services/todo";
import { TodoStatus } from "@prisma/client";

export function TodoDetail({
  todo,
  activityTypes = [],
}: {
  todo: TodoWithPlan;
  activityTypes?: ActivityType[];
}) {
  const router = useRouter();
  const [deletePending, startDeleteTransition] = useTransition();

  function handleDelete() {
    startDeleteTransition(async () => {
      await deleteTodo(todo.id);
    });
  }

  const accentClassName =
    todo.status === TodoStatus.COMPLETED
      ? "bg-emerald-500/70"
      : priorityAccentBar[todo.priority];

  return (
    <ModulePanel module="todo" accentClassName={accentClassName}>
      <RecordDetail
        onDelete={handleDelete}
        deletePending={deletePending}
        deleteConfirmTitle="删除待办"
        deleteConfirmDescription="确定删除此待办？此操作不可撤销。"
        editForm={({ exitEdit }) => (
          <TodoEditForm
            key={todo.updatedAt.toISOString()}
            todo={todo}
            activityTypes={activityTypes}
            onCancel={exitEdit}
            onSaved={() => {
              exitEdit();
              router.refresh();
            }}
          />
        )}
      >
        <TodoView todo={todo} />
      </RecordDetail>
    </ModulePanel>
  );
}
