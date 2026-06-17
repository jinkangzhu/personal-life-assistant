import { formatDurationPair } from "@/lib/duration";
import type { TodoWithPlan } from "@/lib/services/todo";
import { formatShortDate } from "@/lib/utils";
import { PRIORITY_LABELS } from "@/lib/validators/todo";
import { TodoStatus } from "@prisma/client";
import {
  ModuleField,
  ModuleFieldGrid,
  ModuleMetaDivider,
  ModuleMetaRow,
  ModuleProse,
} from "@/components/ui/module-ui";
import { PriorityBadge } from "./priority-badge";
import { TodoCheckbox } from "./todo-checkbox";

export function TodoView({ todo }: { todo: TodoWithPlan }) {
  const completed = todo.status === TodoStatus.COMPLETED;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <TodoCheckbox
          todo={{
            kind: "one_time",
            id: todo.id,
            status: todo.status,
          }}
          className="mt-1"
        />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-medium leading-snug tracking-tight">
              {todo.title}
            </h2>
            <PriorityBadge priority={todo.priority} />
          </div>
          <ModuleMetaRow>
            <span>{completed ? "已完成" : "未完成"}</span>
            {todo.completedAt && (
              <>
                <ModuleMetaDivider />
                <span>
                  完成于 {new Date(todo.completedAt).toLocaleString("zh-CN")}
                </span>
              </>
            )}
          </ModuleMetaRow>
        </div>
      </div>

      <ModuleFieldGrid>
        <ModuleField label="截止日期" value={formatShortDate(todo.dueDate)} />
        <ModuleField label="优先级" value={PRIORITY_LABELS[todo.priority]} />
        {todo.activityType && (
          <ModuleField label="活动类型" value={todo.activityType.name} />
        )}
        {(todo.estimatedMinutes || todo.actualMinutes) && (
          <ModuleField
            label="时长"
            value={formatDurationPair(todo.actualMinutes, todo.estimatedMinutes)}
          />
        )}
        {todo.plan && (
          <ModuleField
            label="关联计划"
            value={todo.plan.title}
            className="sm:col-span-2"
          />
        )}
      </ModuleFieldGrid>

      {todo.description && (
        <section className="space-y-2">
          <h3 className="text-xs font-medium tracking-wide text-[var(--color-muted)]">
            补充说明
          </h3>
          <ModuleProse>{todo.description}</ModuleProse>
        </section>
      )}

      {todo.completionNote && (
        <section className="space-y-2">
          <h3 className="text-xs font-medium tracking-wide text-[var(--color-muted)]">
            完成说明
          </h3>
          <ModuleProse>{todo.completionNote}</ModuleProse>
        </section>
      )}

      <ModuleMetaRow className="border-t border-[var(--color-border)]/70 pt-4">
        <span>创建于 {new Date(todo.createdAt).toLocaleString("zh-CN")}</span>
        {todo.updatedAt.getTime() !== todo.createdAt.getTime() && (
          <>
            <ModuleMetaDivider />
            <span>更新于 {new Date(todo.updatedAt).toLocaleString("zh-CN")}</span>
          </>
        )}
      </ModuleMetaRow>
    </div>
  );
}
