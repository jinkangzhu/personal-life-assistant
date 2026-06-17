"use client";
import { FormError } from "@/components/ui/form-error";

import { useState, useTransition } from "react";
import { updateTodo } from "@/app/(main)/todos/actions";
import { ActivityTypeSelect } from "@/components/activity-types/activity-type-select";
import { DurationInput } from "@/components/todos/duration-input";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  ModuleFormActions,
  ModuleFormLabel,
  ModuleTitleInput,
  moduleTextareaClassName,
} from "@/components/ui/module-ui";
import { PrioritySelect } from "@/components/ui/priority-select";
import type { TodoWithPlan } from "@/lib/services/todo";
import { toDateInputValue } from "@/lib/utils";
import type { ActivityType } from "@prisma/client";

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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="sr-only">
          标题
        </label>
        <ModuleTitleInput
          id="title"
          name="title"
          defaultValue={todo.title}
          required
          maxLength={200}
        />
      </div>

      <div>
        <ModuleFormLabel htmlFor="description">补充说明</ModuleFormLabel>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={todo.description ?? ""}
          className={moduleTextareaClassName}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <ModuleFormLabel>截止日期</ModuleFormLabel>
          <DatePicker
            name="dueDate"
            defaultValue={toDateInputValue(todo.dueDate)}
          />
        </div>

        <div>
          <ModuleFormLabel>优先级</ModuleFormLabel>
          <PrioritySelect defaultValue={todo.priority} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <ModuleFormLabel>预估时长</ModuleFormLabel>
          <DurationInput
            name="estimatedMinutes"
            defaultValue={todo.estimatedMinutes}
          />
        </div>

        <div>
          <ModuleFormLabel>实际时长</ModuleFormLabel>
          <DurationInput name="actualMinutes" defaultValue={todo.actualMinutes} />
        </div>
      </div>

      {activityTypes.length > 0 && (
        <div>
          <ModuleFormLabel>活动类型</ModuleFormLabel>
          <ActivityTypeSelect
            activityTypes={activityTypes}
            defaultValue={todo.activityTypeId}
          />
        </div>
      )}

      <div>
        <ModuleFormLabel htmlFor="completionNote">完成说明</ModuleFormLabel>
        <textarea
          id="completionNote"
          name="completionNote"
          rows={3}
          defaultValue={todo.completionNote ?? ""}
          placeholder="记录完成情况，或未完成的原因…"
          className={moduleTextareaClassName}
        />
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
