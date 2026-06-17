import { formatDurationPair, formatMinutes } from "@/lib/duration";
import { formatRecurrenceLabel, parseWeeklyDays } from "@/lib/recurrence";
import type { DisplayTodoItem, RecurringTodoWithPlan } from "@/lib/services/recurring-todo";
import { formatShortDate } from "@/lib/utils";
import { RECURRENCE_TYPE_LABELS } from "@/lib/validators/recurring-todo";
import { PRIORITY_LABELS } from "@/lib/validators/todo";
import { TodoCompletionNote } from "@/components/today/todo-completion-note";
import { PriorityBadge } from "@/components/todos/priority-badge";
import { RecurrenceBadge } from "@/components/todos/recurrence-badge";
import {
  ModuleField,
  ModuleFieldGrid,
  ModuleProse,
} from "@/components/ui/module-ui";

export function RecurringTodoView({
  todo,
  currentPeriod,
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
  currentPeriod?: DisplayTodoItem | null;
}) {
  const recurrenceLabel = formatRecurrenceLabel({
    recurrenceType: todo.recurrenceType,
    weeklyDays: parseWeeklyDays(todo.weeklyDays),
    monthlyDay: todo.monthlyDay,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-medium leading-snug tracking-tight">{todo.title}</h2>
        <PriorityBadge priority={todo.priority} />
        <RecurrenceBadge
          label={recurrenceLabel}
          paused={!todo.active}
          deleted={!!todo.deletedAt}
        />
      </div>

      <ModuleFieldGrid>
        <ModuleField label="重复" value={RECURRENCE_TYPE_LABELS[todo.recurrenceType]} />
        <ModuleField label="规则" value={recurrenceLabel} />
        <ModuleField label="优先级" value={PRIORITY_LABELS[todo.priority]} />
        {todo.activityType && (
          <ModuleField label="活动类型" value={todo.activityType.name} />
        )}
        {todo.estimatedMinutes && (
          <ModuleField label="预估时长" value={formatMinutes(todo.estimatedMinutes)} />
        )}
        <ModuleField
          label="状态"
          value={
            todo.deletedAt
              ? "已删除"
              : todo.active
                ? "进行中"
                : "已暂停"
          }
        />
        <ModuleField label="开始日期" value={formatShortDate(todo.startDate)} />
        <ModuleField label="结束日期" value={formatShortDate(todo.endDate)} />
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

      {currentPeriod && (
        <section>
          <h3 className="mb-1.5 text-xs text-[var(--color-muted)]">
            本期记录
            <span className="ml-1.5 font-normal">
              （{formatShortDate(currentPeriod.periodDate)}）
            </span>
          </h3>
          {formatDurationPair(
            currentPeriod.actualMinutes,
            currentPeriod.estimatedMinutes,
          ) && (
            <p className="mb-2 text-sm">
              时长：
              {formatDurationPair(
                currentPeriod.actualMinutes,
                currentPeriod.estimatedMinutes,
              )}
            </p>
          )}
          <TodoCompletionNote todo={currentPeriod} className="mt-0" />
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
