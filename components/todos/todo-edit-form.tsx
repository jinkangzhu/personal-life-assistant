"use client";
import { FormError } from "@/components/ui/form-error";

import { useState, useTransition } from "react";
import { updateTodo } from "@/app/(main)/todos/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { PrioritySelect } from "@/components/ui/priority-select";
import { ActivityTypeSelect } from "@/components/activity-types/activity-type-select";
import { DurationInput } from "@/components/todos/duration-input";
import type { TodoWithPlan } from "@/lib/services/todo";
import { toDateInputValue } from "@/lib/utils";
import type { ActivityType } from "@prisma/client";

const textareaClassName =
  "w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

export function TodoEditForm({
  todo,
  activityTypes = [],
  onCancel,
  onSaved,
}: {
  todo: TodoWithPlan;
  activityTypes?: ActivityType[];
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await updateTodo(todo.id, formData);
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
          defaultValue={todo.title}
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
          defaultValue={todo.description ?? ""}
          className={textareaClassName}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm text-[var(--color-muted)]">
            截止日期
          </label>
          <DatePicker
            name="dueDate"
            defaultValue={toDateInputValue(todo.dueDate)}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm text-[var(--color-muted)]">
            优先级
          </label>
          <PrioritySelect defaultValue={todo.priority} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm text-[var(--color-muted)]">
            预估时长
          </label>
          <DurationInput
            name="estimatedMinutes"
            defaultValue={todo.estimatedMinutes}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm text-[var(--color-muted)]">
            实际时长
          </label>
          <DurationInput name="actualMinutes" defaultValue={todo.actualMinutes} />
        </div>
      </div>

      {activityTypes.length > 0 && (
        <div>
          <label className="mb-1.5 block text-sm text-[var(--color-muted)]">
            活动类型
          </label>
          <ActivityTypeSelect
            activityTypes={activityTypes}
            defaultValue={todo.activityTypeId}
          />
        </div>
      )}

      <div>
        <label htmlFor="completionNote" className="mb-1.5 block text-sm text-[var(--color-muted)]">
          完成说明
        </label>
        <textarea
          id="completionNote"
          name="completionNote"
          rows={3}
          defaultValue={todo.completionNote ?? ""}
          placeholder="记录完成情况，或未完成的原因…"
          className={textareaClassName}
        />
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
