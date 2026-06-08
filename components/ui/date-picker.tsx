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

const DEFAULT_PRESETS = [
  { label: "今天", offset: 0 },
  { label: "明天", offset: 1 },
  { label: "7天后", offset: 7 },
] as const;

export const DATE_PICKER_FUTURE_PRESETS = DEFAULT_PRESETS;

export const DATE_PICKER_PAST_PRESETS = [
  { label: "今天", offset: 0 },
  { label: "昨天", offset: -1 },
  { label: "7天前", offset: -7 },
] as const;

export type DatePickerPreset = {
  label: string;
  offset: number;
};

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
  disabled?: boolean;
  clearLabel?: string;
  presets?: readonly DatePickerPreset[];
  showSelectedHint?: boolean;
  onValueChange?: (value: string) => void;
}

export function DatePicker({
  name,
  id,
  defaultValue = "",
  className,
  allowClear = true,
  disabled = false,
  clearLabel = "无截止日期",
  presets = DEFAULT_PRESETS,
  showSelectedHint = true,
  onValueChange,
}: DatePickerProps) {
  const initial = parseDateInputParts(defaultValue);
  const [year, setYear] = useState(initial?.year ?? "");
  const [month, setMonth] = useState(initial?.month ?? "");
  const [day, setDay] = useState(initial?.day ?? "");

  const value = joinDateInputParts(year, month, day);
  const dayOptions = useMemo(() => buildDayOptions(year, month), [year, month]);

  function emitValue(nextYear: string, nextMonth: string, nextDay: string) {
    onValueChange?.(joinDateInputParts(nextYear, nextMonth, nextDay));
  }

  function applyDate(date: Date) {
    const parts = parseDateInputParts(toDateInputValue(startOfDay(date)));
    if (!parts) return;
    setYear(parts.year);
    setMonth(parts.month);
    setDay(parts.day);
    emitValue(parts.year, parts.month, parts.day);
  }

  function handleYearChange(nextYear: string) {
    let nextDay = day;
    if (nextYear && month && day) {
      const maxDay = getDaysInMonth(Number(nextYear), Number(month));
      if (Number(day) > maxDay) {
        nextDay = String(maxDay).padStart(2, "0");
        setDay(nextDay);
      }
    }
    setYear(nextYear);
    emitValue(nextYear, month, nextDay);
  }

  function handleMonthChange(nextMonth: string) {
    let nextDay = day;
    if (year && nextMonth && day) {
      const maxDay = getDaysInMonth(Number(year), Number(nextMonth));
      if (Number(day) > maxDay) {
        nextDay = String(maxDay).padStart(2, "0");
        setDay(nextDay);
      }
    }
    setMonth(nextMonth);
    emitValue(year, nextMonth, nextDay);
  }

  function handleDayChange(nextDay: string) {
    setDay(nextDay);
    emitValue(year, month, nextDay);
  }

  function clearDate() {
    setYear("");
    setMonth("");
    setDay("");
    emitValue("", "", "");
  }

  const selectClassName = disabled ? "pointer-events-none opacity-60" : undefined;

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
          className={selectClassName}
          disabled={disabled}
        />
        <NativeSelect
          aria-label="月"
          value={month}
          onChange={(event) => handleMonthChange(event.target.value)}
          options={buildMonthOptions()}
          placeholder="月"
          className={selectClassName}
          disabled={disabled}
        />
        <NativeSelect
          aria-label="日"
          value={day}
          onChange={(event) => handleDayChange(event.target.value)}
          options={dayOptions}
          placeholder="日"
          className={selectClassName}
          disabled={disabled}
        />
      </div>

      {!disabled && presets.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {presets.map(({ label, offset }) => (
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
              {clearLabel}
            </button>
          )}
        </div>
      )}

      {showSelectedHint && value && (
        <p className="text-xs text-[var(--color-muted)]">已选：{value}</p>
      )}
    </div>
  );
}
