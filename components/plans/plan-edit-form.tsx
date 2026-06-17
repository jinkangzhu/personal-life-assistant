"use client";
import { FormError } from "@/components/ui/form-error";

import { useState, useTransition } from "react";
import { updatePlan } from "@/app/(main)/plans/actions";
import { PlanStatusSelect } from "@/components/plans/plan-status-select";
import { PlanTypeSelect } from "@/components/plans/plan-type-select";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  ModuleFormActions,
  ModuleFormLabel,
  ModuleTitleInput,
  moduleTextareaClassName,
} from "@/components/ui/module-ui";
import type { PlanWithTodos } from "@/lib/services/plan";
import { toDateInputValue } from "@/lib/utils";

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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="sr-only">
          标题
        </label>
        <ModuleTitleInput
          id="title"
          name="title"
          defaultValue={plan.title}
          required
          maxLength={200}
        />
      </div>

      <div>
        <ModuleFormLabel htmlFor="description">背景与范围</ModuleFormLabel>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={plan.description ?? ""}
          placeholder="计划覆盖什么？边界在哪里？"
          className={moduleTextareaClassName}
        />
      </div>

      <div>
        <ModuleFormLabel>类型</ModuleFormLabel>
        <PlanTypeSelect defaultValue={plan.type} />
      </div>

      <div>
        <ModuleFormLabel>当前状态</ModuleFormLabel>
        <PlanStatusSelect defaultValue={plan.status} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <ModuleFormLabel>开始日期</ModuleFormLabel>
          <DatePicker
            name="startDate"
            defaultValue={toDateInputValue(plan.startDate)}
          />
        </div>
        <div>
          <ModuleFormLabel>结束日期</ModuleFormLabel>
          <DatePicker
            name="endDate"
            defaultValue={toDateInputValue(plan.endDate)}
          />
        </div>
      </div>

      <FormError message={error} />

      <ModuleFormActions className="border-t-0 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? "保存中…" : "保存"}
        </Button>
        <Button type="button" variant="outline" disabled={pending} onClick={onCancel}>
          取消
        </Button>
      </ModuleFormActions>
    </form>
  );
}
