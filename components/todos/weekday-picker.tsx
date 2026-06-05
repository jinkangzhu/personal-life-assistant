"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { WEEKDAY_LABELS } from "@/lib/validators/recurring-todo";

export function WeekdayPicker({
  name = "weeklyDays",
  defaultValue = [],
}: {
  name?: string;
  defaultValue?: number[];
}) {
  const [selected, setSelected] = useState<number[]>(defaultValue);

  function toggle(day: number) {
    setSelected((current) =>
      current.includes(day)
        ? current.filter((value) => value !== day)
        : [...current, day].sort((a, b) => a - b),
    );
  }

  return (
    <>
      <input type="hidden" name={name} value={selected.join(",")} />
      <div className="flex flex-wrap gap-1">
        {WEEKDAY_LABELS.map((label, day) => {
          const active = selected.includes(day);
          return (
            <button
              key={day}
              type="button"
              onClick={() => toggle(day)}
              className={cn(
                "rounded-md px-2.5 py-1.5 text-sm transition",
                active
                  ? "bg-indigo-600/20 font-medium text-indigo-300 ring-1 ring-inset ring-indigo-500/30"
                  : "text-[var(--color-muted)] hover:bg-[var(--color-card-hover)] hover:text-[var(--color-foreground)]",
              )}
            >
              周{label}
            </button>
          );
        })}
      </div>
    </>
  );
}
