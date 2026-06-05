"use client";
import { FormError } from "@/components/ui/form-error";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createPlan } from "@/app/(main)/plans/actions";
import { PlanStatusSelect } from "@/components/plans/plan-status-select";
import { PlanTypeSelect } from "@/components/plans/plan-type-select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";

const textareaClassName =
  "w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

export function PlanCreateForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [formKey, setFormKey] = useState(0);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await createPlan(formData);
      if (result.ok) {
        setError("");
        setFormKey((key) => key + 1);
        router.refresh();
        if (result.id) {
          router.push(`/plans/${result.id}`);
        }
        return;
      }
      setError(result.error ?? "创建失败");
    });
  }

  return (
    <Card className="px-4 py-4">
      <form key={formKey} onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="plan-title" className="mb-1.5 block text-xs text-[var(--color-muted)]">
            标题
          </label>
          <Input
            id="plan-title"
            name="title"
            placeholder="计划标题"
            maxLength={200}
            required
          />
        </div>

        <div>
          <label htmlFor="plan-description" className="mb-1.5 block text-xs text-[var(--color-muted)]">
            描述（可选）
          </label>
          <textarea
            id="plan-description"
            name="description"
            rows={4}
            placeholder="计划目标与背景…"
            className={textareaClassName}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs text-[var(--color-muted)]">
            类型
          </label>
          <PlanTypeSelect key={`type-${formKey}`} />
        </div>

        <div>
          <label className="mb-1.5 block text-xs text-[var(--color-muted)]">
            状态
          </label>
          <PlanStatusSelect key={`status-${formKey}`} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs text-[var(--color-muted)]">
              开始日期
            </label>
            <DatePicker key={`start-${formKey}`} name="startDate" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-[var(--color-muted)]">
              结束日期
            </label>
            <DatePicker key={`end-${formKey}`} name="endDate" />
          </div>
        </div>

        <FormError message={error} />

        <Button type="submit" disabled={pending}>
          {pending ? "保存中…" : "保存计划"}
        </Button>
      </form>
    </Card>
  );
}
