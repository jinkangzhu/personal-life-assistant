import { formatDurationPair } from "@/lib/duration";
import type { TodoWithPlan } from "@/lib/services/todo";
import { formatShortDate } from "@/lib/utils";
import { PRIORITY_LABELS } from "@/lib/validators/todo";
import { TodoStatus } from "@prisma/client";
import { PriorityBadge } from "./priority-badge";
import { TodoCheckbox } from "./todo-checkbox";

const fieldClassName = "whitespace-pre-wrap text-sm text-[var(--color-foreground)]";

export function TodoView({ todo }: { todo: TodoWithPlan }) {
  const completed = todo.status === TodoStatus.COMPLETED;

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <TodoCheckbox
          todo={{
            kind: "one_time",
            id: todo.id,
            status: todo.status,
          }}
          className="mt-0.5"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-medium">{todo.title}</h2>
            <PriorityBadge priority={todo.priority} />
          </div>
          <p className="mt-1 text-xs text-[var(--color-muted)]">
            状态：{completed ? "已完成" : "未完成"}
            {todo.completedAt &&
              ` · 完成于 ${new Date(todo.completedAt).toLocaleString("zh-CN")}`}
          </p>
        </div>
      </div>

      <dl className="grid gap-3 sm:grid-cols-2">
        <Field label="截止日期" value={formatShortDate(todo.dueDate)} />
        <Field label="优先级" value={PRIORITY_LABELS[todo.priority]} />
        {todo.activityType && (
          <Field label="活动类型" value={todo.activityType.name} />
        )}
        {(todo.estimatedMinutes || todo.actualMinutes) && (
          <Field
            label="时长"
            value={formatDurationPair(todo.actualMinutes, todo.estimatedMinutes)}
          />
        )}
        {todo.plan && <Field label="关联计划" value={todo.plan.title} className="sm:col-span-2" />}
      </dl>

      {todo.description && (
        <section>
          <h3 className="mb-1.5 text-xs text-[var(--color-muted)]">描述</h3>
          <p className={fieldClassName}>{todo.description}</p>
        </section>
      )}

      {todo.completionNote && (
        <section>
          <h3 className="mb-1.5 text-xs text-[var(--color-muted)]">完成说明</h3>
          <p className={fieldClassName}>{todo.completionNote}</p>
        </section>
      )}

      <p className="text-xs text-[var(--color-muted)]">
        创建于 {new Date(todo.createdAt).toLocaleString("zh-CN")}
        {todo.updatedAt.getTime() !== todo.createdAt.getTime() &&
          ` · 更新于 ${new Date(todo.updatedAt).toLocaleString("zh-CN")}`}
      </p>
    </div>
  );
}

function Field({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-xs text-[var(--color-muted)]">{label}</dt>
      <dd className="mt-0.5 text-sm">{value}</dd>
    </div>
  );
}
