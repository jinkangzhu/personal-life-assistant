import { formatRecurrenceLabel, parseWeeklyDays } from "@/lib/recurrence";
import type { RecurringTodoWithPlan } from "@/lib/services/recurring-todo";
import { formatShortDate } from "@/lib/utils";
import { RECURRENCE_TYPE_LABELS } from "@/lib/validators/recurring-todo";
import { PRIORITY_LABELS } from "@/lib/validators/todo";
import { PriorityBadge } from "@/components/todos/priority-badge";
import { RecurrenceBadge } from "@/components/todos/recurrence-badge";

export function RecurringTodoView({
  todo,
}: {
  todo: RecurringTodoWithPlan & {
    occurrences?: Array<{
      id: string;
      periodDate: Date;
      status: string;
      completionNote: string | null;
      completedAt: Date | null;
    }>;
  };
}) {
  const recurrenceLabel = formatRecurrenceLabel({
    recurrenceType: todo.recurrenceType,
    weeklyDays: parseWeeklyDays(todo.weeklyDays),
    monthlyDay: todo.monthlyDay,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-medium">{todo.title}</h2>
        <PriorityBadge priority={todo.priority} />
        <RecurrenceBadge
          label={recurrenceLabel}
          paused={!todo.active}
          deleted={!!todo.deletedAt}
        />
      </div>

      <dl className="grid gap-3 sm:grid-cols-2">
        <Field label="重复" value={RECURRENCE_TYPE_LABELS[todo.recurrenceType]} />
        <Field label="规则" value={recurrenceLabel} />
        <Field label="优先级" value={PRIORITY_LABELS[todo.priority]} />
        <Field
          label="状态"
          value={
            todo.deletedAt
              ? "已删除"
              : todo.active
                ? "进行中"
                : "已暂停"
          }
        />
        <Field label="开始日期" value={formatShortDate(todo.startDate)} />
        <Field label="结束日期" value={formatShortDate(todo.endDate)} />
        {todo.plan && (
          <Field label="关联计划" value={todo.plan.title} className="sm:col-span-2" />
        )}
      </dl>

      {todo.description && (
        <section>
          <h3 className="mb-1.5 text-xs text-[var(--color-muted)]">描述</h3>
          <p className="whitespace-pre-wrap text-sm">{todo.description}</p>
        </section>
      )}

      {todo.occurrences && todo.occurrences.length > 0 && (
        <section>
          <h3 className="mb-2 text-xs text-[var(--color-muted)]">最近完成记录</h3>
          <ul className="space-y-2">
            {todo.occurrences.map((occurrence) => (
              <li
                key={occurrence.id}
                className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <span>{formatShortDate(occurrence.periodDate)}</span>
                  <span className="text-xs text-[var(--color-muted)]">
                    {occurrence.status === "COMPLETED" ? "已完成" : "未完成"}
                  </span>
                </div>
                {occurrence.completionNote && (
                  <p className="mt-1 text-xs text-[var(--color-muted)]">
                    {occurrence.completionNote}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {todo.deletedAt && (
        <p className="rounded-lg border border-dashed border-zinc-500/30 px-3 py-2 text-sm text-zinc-300">
          此循环待办已删除，历史完成记录仍保留。
        </p>
      )}
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
