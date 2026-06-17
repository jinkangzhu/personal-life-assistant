"use client";

import { FormError } from "@/components/ui/form-error";

import { useState, useTransition } from "react";
import { updateGoal } from "@/app/(main)/goals/actions";
import {
  GoalFormLabel,
  GoalTitleInput,
  goalTextareaClassName,
} from "@/components/goals/goal-form-styles";
import { GoalStatusSelect } from "@/components/goals/goal-status-select";
import { Button } from "@/components/ui/button";
import type { GoalWithPlans } from "@/lib/services/goal";

export function GoalEditForm({
  goal,
  onCancel,
  onSaved,
}: {
  goal: GoalWithPlans;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await updateGoal(goal.id, formData);
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
        <label htmlFor="goal-title" className="sr-only">
          标题
        </label>
        <GoalTitleInput
          id="goal-title"
          name="title"
          defaultValue={goal.title}
          maxLength={200}
          required
        />
      </div>

      <div>
        <GoalFormLabel htmlFor="goal-description">背景与期望</GoalFormLabel>
        <textarea
          id="goal-description"
          name="description"
          rows={5}
          defaultValue={goal.description ?? ""}
          placeholder="为什么重要？希望看到什么变化？"
          className={goalTextareaClassName}
        />
      </div>

      <div>
        <GoalFormLabel>当前状态</GoalFormLabel>
        <GoalStatusSelect
          key={goal.updatedAt.toISOString()}
          defaultValue={goal.status}
        />
      </div>

      <FormError message={error} />

      <div className="flex flex-wrap items-center gap-3 border-t border-[var(--color-border)]/70 pt-4">
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
