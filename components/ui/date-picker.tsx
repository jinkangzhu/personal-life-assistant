"use client";

import { useMemo, useState } from "react";
import {
  addDays,
  cn,
  getDaysInMonth,
  joinDateInputParts,
  parseDateInputParts,
  startOfDay,
  toDateInputValue,
} from "@/lib/utils";
import { NativeSelect } from "./native-select";

const PRESETS = [
  { label: "今天", offset: 0 },
  { label: "明天", offset: 1 },
  { label: "7天后", offset: 7 },
] as const;

const currentYear = new Date().getFullYear();

function buildYearOptions() {
  return Array.from({ length: 7 }, (_, index) => {
    const year = currentYear - 1 + index;
    return { value: String(year), label: `${year}年` };
  });
}

function buildMonthOptions() {
  return Array.from({ length: 12 }, (_, index) => {
    const month = String(index + 1).padStart(2, "0");
    return { value: month, label: `${index + 1}月` };
  });
}

function buildDayOptions(year: string, month: string) {
  if (!year || !month) {
    return Array.from({ length: 31 }, (_, index) => {
      const day = String(index + 1).padStart(2, "0");
      return { value: day, label: `${index + 1}日` };
    });
  }

  const days = getDaysInMonth(Number(year), Number(month));
  return Array.from({ length: days }, (_, index) => {
    const day = String(index + 1).padStart(2, "0");
    return { value: day, label: `${index + 1}日` };
  });
}

interface DatePickerProps {
  name: string;
  id?: string;
  defaultValue?: string;
  className?: string;
  allowClear?: boolean;
}

export function DatePicker({
  name,
  id,
  defaultValue = "",
  className,
  allowClear = true,
}: DatePickerProps) {
  const initial = parseDateInputParts(defaultValue);
  const [year, setYear] = useState(initial?.year ?? "");
  const [month, setMonth] = useState(initial?.month ?? "");
  const [day, setDay] = useState(initial?.day ?? "");

  const value = joinDateInputParts(year, month, day);
  const dayOptions = useMemo(() => buildDayOptions(year, month), [year, month]);

  function applyDate(date: Date) {
    const parts = parseDateInputParts(toDateInputValue(startOfDay(date)));
    if (!parts) return;
    setYear(parts.year);
    setMonth(parts.month);
    setDay(parts.day);
  }

  function handleYearChange(nextYear: string) {
    setYear(nextYear);
    if (nextYear && month && day) {
      const maxDay = getDaysInMonth(Number(nextYear), Number(month));
      if (Number(day) > maxDay) {
        setDay(String(maxDay).padStart(2, "0"));
      }
    }
  }

  function handleMonthChange(nextMonth: string) {
    setMonth(nextMonth);
    if (year && nextMonth && day) {
      const maxDay = getDaysInMonth(Number(year), Number(nextMonth));
      if (Number(day) > maxDay) {
        setDay(String(maxDay).padStart(2, "0"));
      }
    }
  }

  function clearDate() {
    setYear("");
    setMonth("");
    setDay("");
  }

  return (
    <div className={cn("space-y-2", className)}>
      <input type="hidden" id={id} name={name} value={value} />

      <div className="flex gap-2">
        <NativeSelect
          aria-label="年"
          value={year}
          onChange={(event) => handleYearChange(event.target.value)}
          options={buildYearOptions()}
          placeholder="年"
        />
        <NativeSelect
          aria-label="月"
          value={month}
          onChange={(event) => handleMonthChange(event.target.value)}
          options={buildMonthOptions()}
          placeholder="月"
        />
        <NativeSelect
          aria-label="日"
          value={day}
          onChange={(event) => setDay(event.target.value)}
          options={dayOptions}
          placeholder="日"
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map(({ label, offset }) => (
          <button
            key={label}
            type="button"
            onClick={() => applyDate(addDays(new Date(), offset))}
            className="rounded-md bg-[var(--color-card-hover)] px-2.5 py-1 text-xs text-[var(--color-muted)] transition hover:bg-indigo-600/15 hover:text-indigo-400"
          >
            {label}
          </button>
        ))}
        {allowClear && (
          <button
            type="button"
            onClick={clearDate}
            className="rounded-md bg-[var(--color-card-hover)] px-2.5 py-1 text-xs text-[var(--color-muted)] transition hover:bg-[var(--color-border)] hover:text-[var(--color-foreground)]"
          >
            无截止日期
          </button>
        )}
      </div>

      {value && (
        <p className="text-xs text-[var(--color-muted)]">已选：{value}</p>
      )}
    </div>
  );
}
