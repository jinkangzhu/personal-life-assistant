"use client";

import { useState } from "react";
import { WeekdayPicker } from "@/components/todos/weekday-picker";
import { DatePicker } from "@/components/ui/date-picker";
import { NativeSelect } from "@/components/ui/native-select";
import { cn, toDateInputValue } from "@/lib/utils";

const OPTIONS = [
  { value: "none", label: "不重复" },
  { value: "daily", label: "每天" },
  { value: "weekly", label: "每周" },
  { value: "monthly", label: "每月" },
] as const;

export type RecurrenceFormValue = (typeof OPTIONS)[number]["value"];

export function RecurrenceFields({
  onRecurrenceChange,
}: {
  onRecurrenceChange?: (value: RecurrenceFormValue) => void;
}) {
  const [recurrence, setRecurrence] = useState<RecurrenceFormValue>("none");
  const todayValue = toDateInputValue(new Date());

  function selectRecurrence(value: RecurrenceFormValue) {
    setRecurrence(value);
    onRecurrenceChange?.(value);
  }

  const monthlyDayOptions = Array.from({ length: 31 }, (_, index) => {
    const day = index + 1;
    return { value: String(day), label: `每月 ${day} 号` };
  });

  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1.5 block text-xs text-[var(--color-muted)]">
          重复
        </label>
        <input type="hidden" name="recurrence" value={recurrence} />
        <div className="flex flex-wrap gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-1">
          {OPTIONS.map((option) => {
            const active = recurrence === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => selectRecurrence(option.value)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm transition",
                  active
                    ? "bg-indigo-600/20 font-medium text-indigo-300 ring-1 ring-inset ring-indigo-500/30"
                    : "text-[var(--color-muted)] hover:bg-[var(--color-card-hover)] hover:text-[var(--color-foreground)]",
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {recurrence !== "none" && (
        <div className="space-y-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]/40 p-4">
          {recurrence === "weekly" && (
            <div>
              <label className="mb-2 block text-xs text-[var(--color-muted)]">
                重复于
              </label>
              <WeekdayPicker defaultValue={[new Date().getDay()]} />
            </div>
          )}

          {recurrence === "monthly" && (
            <div>
              <label
                htmlFor="monthlyDay"
                className="mb-1.5 block text-xs text-[var(--color-muted)]"
              >
                每月日期
              </label>
              <NativeSelect
                id="monthlyDay"
                name="monthlyDay"
                defaultValue={String(new Date().getDate())}
                options={monthlyDayOptions}
                className="w-full"
              />
              <p className="mt-1 text-xs text-[var(--color-muted)]">
                若当月没有该日期，将落在当月最后一天。
              </p>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs text-[var(--color-muted)]">
                开始日期
              </label>
              <DatePicker
                name="recurrenceStartDate"
                defaultValue={todayValue}
                allowClear={false}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-[var(--color-muted)]">
                结束日期（可选）
              </label>
              <DatePicker name="recurrenceEndDate" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
