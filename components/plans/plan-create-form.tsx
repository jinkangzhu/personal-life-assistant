"use client";
import { FormError } from "@/components/ui/form-error";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createPlan } from "@/app/(main)/plans/actions";
import { PlanStatusSelect } from "@/components/plans/plan-status-select";
import { PlanTypeSelect } from "@/components/plans/plan-type-select";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  ModuleAccent,
  ModuleFormActions,
  ModuleFormLabel,
  ModuleFormSection,
  ModuleFormShell,
  ModuleTitleInput,
  moduleTextareaClassName,
} from "@/components/ui/module-ui";

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
    <ModuleFormShell>
      <ModuleAccent module="plan" className="mb-8" />

      <form key={formKey} onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label htmlFor="plan-title" className="sr-only">
            标题
          </label>
          <ModuleTitleInput
            id="plan-title"
            name="title"
            placeholder="这一步要达成什么？"
            maxLength={200}
            required
            autoFocus
          />
          <p className="mt-3 text-xs leading-relaxed text-[var(--color-muted)]">
            例如：三月背完 N2 词汇、搭建个人网站
          </p>
        </div>

        <ModuleFormSection>
          <div>
            <ModuleFormLabel htmlFor="plan-description">背景与范围</ModuleFormLabel>
            <textarea
              id="plan-description"
              name="description"
              rows={4}
              placeholder="计划覆盖什么？边界在哪里？"
              className={moduleTextareaClassName}
            />
          </div>

          <div>
            <ModuleFormLabel>类型</ModuleFormLabel>
            <PlanTypeSelect key={`type-${formKey}`} />
          </div>

          <div>
            <ModuleFormLabel>当前状态</ModuleFormLabel>
            <PlanStatusSelect key={`status-${formKey}`} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <ModuleFormLabel>开始日期</ModuleFormLabel>
              <DatePicker key={`start-${formKey}`} name="startDate" />
            </div>
            <div>
              <ModuleFormLabel>结束日期</ModuleFormLabel>
              <DatePicker key={`end-${formKey}`} name="endDate" />
            </div>
          </div>
        </ModuleFormSection>

        <FormError message={error} />

        <ModuleFormActions>
          <Button type="submit" disabled={pending} size="lg" className="min-w-28">
            {pending ? "保存中…" : "保存计划"}
          </Button>
        </ModuleFormActions>
      </form>
    </ModuleFormShell>
  );
}
