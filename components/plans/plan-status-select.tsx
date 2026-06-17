"use client";

import { useState } from "react";
import { PlanStatus } from "@prisma/client";
import { cn } from "@/lib/utils";
import { PLAN_STATUS_LABELS } from "@/lib/validators/plan";

const STATUSES = [
  PlanStatus.ACTIVE,
  PlanStatus.COMPLETED,
  PlanStatus.ARCHIVED,
] as const;

const activeStyles: Record<PlanStatus, string> = {
  [PlanStatus.ACTIVE]: "bg-indigo-600/20 text-indigo-300 ring-indigo-500/30",
  [PlanStatus.COMPLETED]: "bg-emerald-500/20 text-emerald-300 ring-emerald-500/30",
  [PlanStatus.ARCHIVED]: "bg-zinc-500/20 text-zinc-200 ring-zinc-500/30",
};

export const planStatusAccentBar: Record<PlanStatus, string> = {
  [PlanStatus.ACTIVE]: "bg-indigo-500/70",
  [PlanStatus.COMPLETED]: "bg-emerald-500/70",
  [PlanStatus.ARCHIVED]: "bg-zinc-500/50",
};

export function PlanStatusSelect({
  name = "status",
  defaultValue = PlanStatus.ACTIVE,
  className,
}: {
  name?: string;
  defaultValue?: PlanStatus;
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
              {PLAN_STATUS_LABELS[status]}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function PlanStatusBadge({ status }: { status: PlanStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        activeStyles[status],
      )}
    >
      {PLAN_STATUS_LABELS[status]}
    </span>
  );
}
