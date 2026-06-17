"use client";
import { FormError } from "@/components/ui/form-error";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createGoal } from "@/app/(main)/goals/actions";
import {
  GoalFormLabel,
  GoalHorizon,
  GoalTitleInput,
  goalTextareaClassName,
} from "@/components/goals/goal-form-styles";
import { GoalStatusSelect } from "@/components/goals/goal-status-select";
import { Button } from "@/components/ui/button";
import {
  ModuleFormActions,
  ModuleFormSection,
  ModuleFormShell,
} from "@/components/ui/module-ui";

export function GoalCreateForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [formKey, setFormKey] = useState(0);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await createGoal(formData);
      if (result.ok) {
        setError("");
        setFormKey((key) => key + 1);
        if (result.id) {
          router.push(`/goals/${result.id}`);
        }
        return;
      }
      setError(result.error ?? "创建失败");
    });
  }

  return (
    <ModuleFormShell>
      <GoalHorizon className="mb-8" />

      <form key={formKey} onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label htmlFor="goal-title" className="sr-only">
            标题
          </label>
          <GoalTitleInput
            id="goal-title"
            name="title"
            placeholder="你想成为什么，或做到什么？"
            maxLength={200}
            required
            autoFocus
          />
          <p className="mt-3 text-xs leading-relaxed text-[var(--color-muted)]">
            例如：提升英语、学习 AI Agent、完成一次马拉松
          </p>
        </div>

        <ModuleFormSection>
          <div>
            <GoalFormLabel htmlFor="goal-description">背景与期望</GoalFormLabel>
            <textarea
              id="goal-description"
              name="description"
              rows={5}
              placeholder="为什么重要？希望看到什么变化？"
              className={goalTextareaClassName}
            />
          </div>

          <div>
            <GoalFormLabel>当前状态</GoalFormLabel>
            <GoalStatusSelect key={`status-${formKey}`} />
          </div>
        </ModuleFormSection>

        <FormError message={error} />

        <ModuleFormActions>
          <Button type="submit" disabled={pending} size="lg" className="min-w-28">
            {pending ? "保存中…" : "保存目标"}
          </Button>
        </ModuleFormActions>
      </form>
    </ModuleFormShell>
  );
}
