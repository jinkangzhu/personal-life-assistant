"use client";

import { useState } from "react";
import { GoalStatus } from "@prisma/client";
import { cn } from "@/lib/utils";
import { GOAL_STATUS_LABELS } from "@/lib/validators/goal";

const STATUSES = [
  GoalStatus.ACTIVE,
  GoalStatus.COMPLETED,
  GoalStatus.PAUSED,
] as const;

const activeStyles: Record<GoalStatus, string> = {
  [GoalStatus.ACTIVE]: "bg-indigo-600/20 text-indigo-300 ring-indigo-500/30",
  [GoalStatus.COMPLETED]: "bg-emerald-500/20 text-emerald-300 ring-emerald-500/30",
  [GoalStatus.PAUSED]: "bg-amber-500/20 text-amber-300 ring-amber-500/30",
};

export function GoalStatusSelect({
  name = "status",
  defaultValue = GoalStatus.ACTIVE,
  className,
}: {
  name?: string;
  defaultValue?: GoalStatus;
  className?: string;
}) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div className={cn("space-y-2", className)}>
      <input type="hidden" name={name} value={value} />
      <div className="flex flex-wrap gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-1">
        {STATUSES.map((status) => {
          const active = value === status;
          return (
            <button
              key={status}
              type="button"
              onClick={() => setValue(status)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm transition",
                active
                  ? cn("font-medium ring-1 ring-inset", activeStyles[status])
                  : "text-[var(--color-muted)] hover:bg-[var(--color-card-hover)] hover:text-[var(--color-foreground)]",
              )}
            >
              {GOAL_STATUS_LABELS[status]}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function GoalStatusBadge({ status }: { status: GoalStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        activeStyles[status],
      )}
    >
      {GOAL_STATUS_LABELS[status]}
    </span>
  );
}
