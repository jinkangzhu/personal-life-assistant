"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  deleteRecurringTodoAction,
  pauseRecurringTodoAction,
  resumeRecurringTodoAction,
  updateRecurringTodoAction,
} from "@/app/(main)/todos/actions";
import { formatRecurrenceLabel, parseWeeklyDays } from "@/lib/recurrence";
import type { DisplayTodoItem, RecurringTodoWithPlan } from "@/lib/services/recurring-todo";
import { toDateInputValue } from "@/lib/utils";
import { RecurrenceType } from "@prisma/client";
import { WeekdayPicker } from "@/components/todos/weekday-picker";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { FormError } from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { PrioritySelect } from "@/components/ui/priority-select";

const textareaClassName =
  "w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

export function RecurringTodoEditForm({
  todo,
  currentPeriod,
  onCancel,
  onSaved,
}: {
  todo: RecurringTodoWithPlan;
  currentPeriod?: DisplayTodoItem | null;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await updateRecurringTodoAction(todo.id, formData);
      if (result.ok) {
        setError("");
        onSaved();
        router.refresh();
        return;
      }
      setError(result.error ?? "保存失败");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="mb-1.5 block text-sm text-[var(--color-muted)]">
          标题
        </label>
        <Input id="title" name="title" defaultValue={todo.title} required maxLength={200} />
      </div>

      <div>
        <label htmlFor="description" className="mb-1.5 block text-sm text-[var(--color-muted)]">
          描述
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={todo.description ?? ""}
          className={textareaClassName}
        />
      </div>

      <input type="hidden" name="recurrenceType" value={todo.recurrenceType} />

      {todo.recurrenceType === RecurrenceType.WEEKLY && (
        <div>
          <label className="mb-2 block text-sm text-[var(--color-muted)]">
            重复于
          </label>
          <WeekdayPicker
            defaultValue={parseWeeklyDays(todo.weeklyDays)}
          />
        </div>
      )}

      {todo.recurrenceType === RecurrenceType.MONTHLY && (
        <div>
          <label htmlFor="monthlyDay" className="mb-1.5 block text-sm text-[var(--color-muted)]">
            每月日期
          </label>
          <NativeSelect
            id="monthlyDay"
            name="monthlyDay"
            defaultValue={String(todo.monthlyDay ?? 1)}
            className="w-full"
            options={Array.from({ length: 31 }, (_, index) => {
              const day = index + 1;
              return { value: String(day), label: `每月 ${day} 号` };
            })}
          />
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-sm text-[var(--color-muted)]">
          优先级
        </label>
        <PrioritySelect defaultValue={todo.priority} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm text-[var(--color-muted)]">
            开始日期
          </label>
          <DatePicker
            name="startDate"
            defaultValue={toDateInputValue(todo.startDate)}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-[var(--color-muted)]">
            结束日期
          </label>
          <DatePicker
            name="endDate"
            defaultValue={toDateInputValue(todo.endDate)}
          />
        </div>
      </div>

      <p className="text-xs text-[var(--color-muted)]">
        重复规则：{formatRecurrenceLabel({
          recurrenceType: todo.recurrenceType,
          weeklyDays: parseWeeklyDays(todo.weeklyDays),
          monthlyDay: todo.monthlyDay,
        })}
      </p>

      {currentPeriod?.periodDate && (
        <>
          <input
            type="hidden"
            name="periodDate"
            value={toDateInputValue(currentPeriod.periodDate)}
          />
          <div>
            <label
              htmlFor="completionNote"
              className="mb-1.5 block text-sm text-[var(--color-muted)]"
            >
              完成说明
              <span className="ml-1.5 text-xs">
                （{toDateInputValue(currentPeriod.periodDate)}）
              </span>
            </label>
            <textarea
              id="completionNote"
              name="completionNote"
              rows={3}
              defaultValue={currentPeriod.completionNote ?? ""}
              placeholder="记录完成情况，或未完成的原因…"
              className={textareaClassName}
            />
          </div>
        </>
      )}

      <FormError message={error} />

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? "保存中…" : "保存"}
        </Button>
        <Button type="button" variant="outline" disabled={pending} onClick={onCancel}>
          取消
        </Button>
      </div>
    </form>
  );
}
