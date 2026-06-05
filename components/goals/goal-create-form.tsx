"use client";
import { FormError } from "@/components/ui/form-error";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createGoal } from "@/app/(main)/goals/actions";
import { GoalStatusSelect } from "@/components/goals/goal-status-select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const textareaClassName =
  "w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

export function GoalCreateForm({ onCancel }: { onCancel?: () => void }) {
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
      setError(result.error ?? "????");
    });
  }

  return (
    <Card className="px-4 py-4">
      <form key={formKey} onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="goal-title" className="mb-1.5 block text-xs text-[var(--color-muted)]">
            ??
          </label>
          <Input
            id="goal-title"
            name="title"
            placeholder="????????? AI Agent"
            maxLength={200}
            required
          />
        </div>

        <div>
          <label htmlFor="goal-description" className="mb-1.5 block text-xs text-[var(--color-muted)]">
            ??????
          </label>
          <textarea
            id="goal-description"
            name="description"
            rows={4}
            placeholder="???????????"
            className={textareaClassName}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs text-[var(--color-muted)]">
            ??
          </label>
          <GoalStatusSelect key={`status-${formKey}`} />
        </div>

        <FormError message={error} />

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={pending}>
            {pending ? "????" : "????"}
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" disabled={pending} onClick={onCancel}>
              ??
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
