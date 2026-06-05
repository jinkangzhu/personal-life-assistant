"use client";

import { useState } from "react";
import { Priority } from "@prisma/client";
import { cn } from "@/lib/utils";
import { PRIORITY_LABELS } from "@/lib/validators/todo";

const PRIORITIES = [Priority.LOW, Priority.MEDIUM, Priority.HIGH] as const;

const activeStyles: Record<Priority, string> = {
  [Priority.LOW]: "bg-zinc-500/20 text-zinc-200 ring-zinc-500/30",
  [Priority.MEDIUM]: "bg-indigo-600/20 text-indigo-300 ring-indigo-500/30",
  [Priority.HIGH]: "bg-amber-500/20 text-amber-300 ring-amber-500/30",
};

interface PrioritySelectProps {
  name?: string;
  defaultValue?: Priority;
  className?: string;
}

export function PrioritySelect({
  name = "priority",
  defaultValue = Priority.MEDIUM,
  className,
}: PrioritySelectProps) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div className={cn("space-y-2", className)}>
      <input type="hidden" name={name} value={value} />
      <div className="flex rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-1">
        {PRIORITIES.map((priority) => {
          const active = value === priority;
          return (
            <button
              key={priority}
              type="button"
              onClick={() => setValue(priority)}
              className={cn(
                "flex-1 rounded-md px-3 py-1.5 text-sm transition",
                active
                  ? cn("font-medium ring-1 ring-inset", activeStyles[priority])
                  : "text-[var(--color-muted)] hover:bg-[var(--color-card-hover)] hover:text-[var(--color-foreground)]",
              )}
            >
              {PRIORITY_LABELS[priority]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
