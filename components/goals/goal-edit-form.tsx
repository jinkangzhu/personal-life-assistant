"use client";

import { FormError } from "@/components/ui/form-error";

import { useState, useTransition } from "react";
import { updateGoal } from "@/app/(main)/goals/actions";
import { GoalStatusSelect } from "@/components/goals/goal-status-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { GoalWithPlans } from "@/lib/services/goal";

const textareaClassName =
  "w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

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
      setError(result.error ?? "????");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="goal-title" className="mb-1.5 block text-sm text-[var(--color-muted)]">
          ??
        </label>
        <Input
          id="goal-title"
          name="title"
          defaultValue={goal.title}
          maxLength={200}
          required
        />
      </div>

      <div>
        <label htmlFor="goal-description" className="mb-1.5 block text-sm text-[var(--color-muted)]">
          ??????
        </label>
        <textarea
          id="goal-description"
          name="description"
          rows={4}
          defaultValue={goal.description ?? ""}
          className={textareaClassName}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm text-[var(--color-muted)]">
          ??
        </label>
        <GoalStatusSelect
          key={goal.updatedAt.toISOString()}
          defaultValue={goal.status}
        />
      </div>

      <FormError message={error} />

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? "????" : "??"}
        </Button>
        <Button type="button" variant="outline" disabled={pending} onClick={onCancel}>
          ??
        </Button>
      </div>
    </form>
  );
}
