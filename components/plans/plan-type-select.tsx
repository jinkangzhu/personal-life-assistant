"use client";

import { useState } from "react";
import { PlanType } from "@prisma/client";
import { cn } from "@/lib/utils";
import { PLAN_TYPE_LABELS } from "@/lib/validators/plan";

const TYPES = [PlanType.SHORT_TERM, PlanType.LONG_TERM] as const;

export function PlanTypeSelect({
  name = "type",
  defaultValue = PlanType.SHORT_TERM,
  className,
}: {
  name?: string;
  defaultValue?: PlanType;
  className?: string;
}) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div className={cn("space-y-2", className)}>
      <input type="hidden" name={name} value={value} />
      <div className="flex rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-1">
        {TYPES.map((type) => {
          const active = value === type;
          return (
            <button
              key={type}
              type="button"
              onClick={() => setValue(type)}
              className={cn(
                "flex-1 rounded-md px-3 py-1.5 text-sm transition",
                active
                  ? "bg-indigo-600/20 font-medium text-indigo-300 ring-1 ring-inset ring-indigo-500/30"
                  : "text-[var(--color-muted)] hover:bg-[var(--color-card-hover)] hover:text-[var(--color-foreground)]",
              )}
            >
              {PLAN_TYPE_LABELS[type]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
