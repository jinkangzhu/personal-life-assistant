"use client";
import { FormError } from "@/components/ui/form-error";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createTodo } from "@/app/(main)/todos/actions";
import { ActivityTypeSelect } from "@/components/activity-types/activity-type-select";
import { DurationInput } from "@/components/todos/duration-input";
import { RecurrenceFields, type RecurrenceFormValue } from "@/components/todos/recurrence-fields";
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
import { PrioritySelect } from "@/components/ui/priority-select";
import { cn } from "@/lib/utils";
import type { ActivityType } from "@prisma/client";

export function TodoCreateForm({
  activityTypes = [],
}: {
  activityTypes?: ActivityType[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [formKey, setFormKey] = useState(0);
  const [recurrence, setRecurrence] = useState<RecurrenceFormValue>("none");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await createTodo(formData);
      if (result.ok) {
        setError("");
        setRecurrence("none");
        setFormKey((key) => key + 1);
        if (result.id) {
          router.push(
            result.kind === "recurring"
              ? `/todos/recurring/${result.id}`
              : `/todos/${result.id}`,
          );
        } else {
          router.push("/todos");
        }
        return;
      }
      setError(result.error ?? "创建失败");
    });
  }

  return (
    <ModuleFormShell>
      <ModuleAccent module="todo" className="mb-8" />

      <form key={formKey} onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label htmlFor="todo-title" className="sr-only">
            标题
          </label>
          <ModuleTitleInput
            id="todo-title"
            name="title"
            placeholder="接下来要做什么？"
            required
            maxLength={200}
            autoFocus
          />
          <p className="mt-3 text-xs leading-relaxed text-[var(--color-muted)]">
            写清楚动作，比写长描述更有用
          </p>
        </div>

        <ModuleFormSection>
          <div>
            <ModuleFormLabel htmlFor="todo-description">补充说明</ModuleFormLabel>
            <textarea
              id="todo-description"
              name="description"
              rows={3}
              placeholder="链接、上下文、完成标准…"
              className={moduleTextareaClassName}
            />
          </div>

          <RecurrenceFields
            key={`recurrence-${formKey}`}
            onRecurrenceChange={setRecurrence}
          />

          <div
            className={cn(
              "grid gap-4",
              recurrence === "none" ? "sm:grid-cols-2" : "sm:grid-cols-1",
            )}
          >
            {recurrence === "none" && (
              <div>
                <ModuleFormLabel>截止日期</ModuleFormLabel>
                <DatePicker key={`date-${formKey}`} name="dueDate" />
              </div>
            )}

            <div>
              <ModuleFormLabel>优先级</ModuleFormLabel>
              <PrioritySelect key={`priority-${formKey}`} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <ModuleFormLabel>预估时长</ModuleFormLabel>
              <DurationInput key={`estimated-${formKey}`} name="estimatedMinutes" />
            </div>

            {activityTypes.length > 0 && (
              <div>
                <ModuleFormLabel>活动类型</ModuleFormLabel>
                <ActivityTypeSelect
                  key={`activity-${formKey}`}
                  activityTypes={activityTypes}
                />
              </div>
            )}
          </div>
        </ModuleFormSection>

        <FormError message={error} />

        <ModuleFormActions>
          <Button type="submit" disabled={pending} size="lg" className="min-w-28">
            {pending ? "创建中…" : "添加待办"}
          </Button>
        </ModuleFormActions>
      </form>
    </ModuleFormShell>
  );
}
