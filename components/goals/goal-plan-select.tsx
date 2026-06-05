"use client";

import { useMemo, useState } from "react";
import type { PlanWithProgress } from "@/lib/services/plan";
import { cn } from "@/lib/utils";
import { PLAN_STATUS_LABELS } from "@/lib/validators/plan";

interface GoalPlanSelectProps {
  name?: string;
  plans: PlanWithProgress[];
  defaultValue?: string[];
  className?: string;
}

export function GoalPlanSelect({
  name = "planIds",
  plans,
  defaultValue = [],
  className,
}: GoalPlanSelectProps) {
  const [selected, setSelected] = useState<string[]>(defaultValue);

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const availablePlans = plans.filter((plan) => !selectedSet.has(plan.id));

  function togglePlan(planId: string) {
    setSelected((current) =>
      current.includes(planId)
        ? current.filter((id) => id !== planId)
        : [...current, planId],
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <input type="hidden" name={name} value={selected.join(",")} />

      {selected.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs text-[var(--color-muted)]">已选计划</p>
          <div className="flex flex-wrap gap-1.5">
            {selected.map((planId) => {
              const plan = plans.find((item) => item.id === planId);
              if (!plan) return null;
              return (
                <button
                  key={planId}
                  type="button"
                  onClick={() => togglePlan(planId)}
                  className="rounded-md bg-indigo-600/15 px-2.5 py-1 text-xs text-indigo-300 ring-2 ring-indigo-500/40 transition hover:bg-indigo-600/25"
                  title="点击移除"
                >
                  {plan.title}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {availablePlans.length > 0 ? (
        <div className="space-y-1.5">
          <p className="text-xs text-[var(--color-muted)]">选择关联计划</p>
          <ul className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-[var(--color-border)] p-2">
            {availablePlans.map((plan) => (
              <li key={plan.id}>
                <button
                  type="button"
                  onClick={() => togglePlan(plan.id)}
                  className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm transition hover:bg-[var(--color-card-hover)]"
                >
                  <span className="truncate">{plan.title}</span>
                  <span className="shrink-0 text-xs text-[var(--color-muted)]">
                    {PLAN_STATUS_LABELS[plan.status]}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-xs text-[var(--color-muted)]">
          {plans.length === 0 ? "暂无计划可关联" : "已选择全部可用计划"}
        </p>
      )}
    </div>
  );
}
