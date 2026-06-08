"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ListFilter } from "lucide-react";
import {
  DATE_PICKER_FUTURE_PRESETS,
  DATE_PICKER_PAST_PRESETS,
  DatePicker,
} from "@/components/ui/date-picker";
import { cn, parseDateInput, toDateInputValue } from "@/lib/utils";
import {
  formatTodoDateRangeLabel,
  hasTodoDateRangeFilter,
  todoFilterHref,
  type TodoDateRangeFilter,
  type TodoFilter,
} from "@/lib/validators/todo";

const filters: { value: TodoFilter; label: string }[] = [
  { value: "today", label: "今日" },
  { value: "all", label: "全部" },
  { value: "pending", label: "未完成" },
  { value: "completed", label: "已完成" },
];

function buildTodosHref(filter: TodoFilter, dateRange: TodoDateRangeFilter) {
  return todoFilterHref(filter, dateRange);
}

export function TodoFilterBar({
  filter,
  dateRange,
}: {
  filter: TodoFilter;
  dateRange: TodoDateRangeFilter;
}) {
  const router = useRouter();
  const [panelOpen, setPanelOpen] = useState(false);
  const rangeActive = hasTodoDateRangeFilter(dateRange);
  const showDateFilter = filter !== "today";
  const fromValue = dateRange.dateFrom
    ? toDateInputValue(dateRange.dateFrom)
    : "";
  const toValue = dateRange.dateTo ? toDateInputValue(dateRange.dateTo) : "";

  function navigate(nextRange: TodoDateRangeFilter) {
    router.push(buildTodosHref(filter, nextRange));
  }

  function handleFromChange(value: string) {
    navigate({
      dateFrom: parseDateInput(value) ?? undefined,
      dateTo: dateRange.dateTo,
    });
  }

  function handleToChange(value: string) {
    navigate({
      dateFrom: dateRange.dateFrom,
      dateTo: parseDateInput(value) ?? undefined,
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2">
        <div
          className={cn(
            "flex min-w-0 flex-1 flex-wrap gap-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-1",
          )}
        >
          {filters.map(({ value, label }) => (
            <Link
              key={value}
              href={todoFilterHref(
                value,
                value === "today" ? undefined : dateRange,
              )}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm transition",
                filter === value
                  ? "bg-indigo-600/15 text-indigo-400"
                  : "text-[var(--color-muted)] hover:bg-[var(--color-card-hover)] hover:text-[var(--color-foreground)]",
              )}
            >
              {label}
            </Link>
          ))}
        </div>

        {showDateFilter && (
          <button
            type="button"
            aria-label="日期筛选"
            aria-expanded={panelOpen}
            onClick={() => setPanelOpen((open) => !open)}
            className={cn(
              "flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl border transition",
              panelOpen || rangeActive
                ? "border-indigo-500/30 bg-indigo-600/15 text-indigo-400"
                : "border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-muted)] hover:bg-[var(--color-card-hover)] hover:text-[var(--color-foreground)]",
            )}
          >
            <ListFilter className="h-4 w-4" />
          </button>
        )}
      </div>

      {showDateFilter && panelOpen && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-3">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs text-[var(--color-muted)]">
                开始日期
              </label>
              <DatePicker
                key={`from-${filter}-${fromValue}`}
                name="from"
                defaultValue={fromValue}
                allowClear
                clearLabel="不限"
                presets={DATE_PICKER_PAST_PRESETS}
                showSelectedHint={false}
                onValueChange={handleFromChange}
              />
            </div>
            <div>
              <label className="mb-2 block text-xs text-[var(--color-muted)]">
                结束日期
              </label>
              <DatePicker
                key={`to-${filter}-${toValue}`}
                name="to"
                defaultValue={toValue}
                allowClear
                clearLabel="不限"
                presets={DATE_PICKER_FUTURE_PRESETS}
                showSelectedHint={false}
                onValueChange={handleToChange}
              />
            </div>
          </div>
        </div>
      )}

      {showDateFilter && rangeActive && (
        <p className="text-xs text-indigo-400/90">
          当前展示 {formatTodoDateRangeLabel(dateRange)} 的待办
        </p>
      )}
    </div>
  );
}
