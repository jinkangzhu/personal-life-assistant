"use client";
import { FormError } from "@/components/ui/form-error";

import { useState, useTransition } from "react";
import { updatePlan } from "@/app/(main)/plans/actions";
import { PlanStatusSelect } from "@/components/plans/plan-status-select";
import { PlanTypeSelect } from "@/components/plans/plan-type-select";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import type { PlanWithTodos } from "@/lib/services/plan";
import { toDateInputValue } from "@/lib/utils";

const textareaClassName =
  "w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

export function PlanEditForm({
  plan,
  onCancel,
  onSaved,
}: {
  plan: PlanWithTodos;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await updatePlan(plan.id, formData);
      if (result.ok) {
        setError("");
        onSaved();
        return;
      }
      setError(result.error ?? "保存失败");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="mb-1.5 block text-sm text-[var(--color-muted)]">
          标题
        </label>
        <Input
          id="title"
          name="title"
          defaultValue={plan.title}
          required
          maxLength={200}
        />
      </div>

      <div>
        <label htmlFor="description" className="mb-1.5 block text-sm text-[var(--color-muted)]">
          描述
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={plan.description ?? ""}
          className={textareaClassName}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm text-[var(--color-muted)]">
          类型
        </label>
        <PlanTypeSelect defaultValue={plan.type} />
      </div>

      <div>
        <label className="mb-1.5 block text-sm text-[var(--color-muted)]">
          状态
        </label>
        <PlanStatusSelect defaultValue={plan.status} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm text-[var(--color-muted)]">
            开始日期
          </label>
          <DatePicker
            name="startDate"
            defaultValue={toDateInputValue(plan.startDate)}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-[var(--color-muted)]">
            结束日期
          </label>
          <DatePicker
            name="endDate"
            defaultValue={toDateInputValue(plan.endDate)}
          />
        </div>
      </div>

      <FormError message={error} />

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? "保存中…" : "保存"}
        </Button>
        <Button type="button" variant="outline" disabled={pending} onClick={onCancel}>
          取消
        </Button>
      </div>
    </form>
  );
}
