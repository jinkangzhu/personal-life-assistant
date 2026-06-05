"use client";
import { FormError } from "@/components/ui/form-error";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createTodo } from "@/app/(main)/todos/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { PrioritySelect } from "@/components/ui/priority-select";
import { RecurrenceFields, type RecurrenceFormValue } from "@/components/todos/recurrence-fields";
import { cn } from "@/lib/utils";

const textareaClassName =
  "w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

export function TodoCreateForm() {
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
    <Card className="px-4 py-4">
      <form key={formKey} onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="todo-title" className="mb-1.5 block text-xs text-[var(--color-muted)]">
            标题
          </label>
          <Input
            id="todo-title"
            name="title"
            placeholder="今天要做什么？"
            required
            maxLength={200}
          />
        </div>

        <div>
          <label htmlFor="todo-description" className="mb-1.5 block text-xs text-[var(--color-muted)]">
            描述（可选）
          </label>
          <textarea
            id="todo-description"
            name="description"
            rows={3}
            placeholder="补充说明…"
            className={textareaClassName}
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
              <label className="mb-1.5 block text-xs text-[var(--color-muted)]">
                截止日期
              </label>
              <DatePicker key={`date-${formKey}`} name="dueDate" />
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs text-[var(--color-muted)]">
              优先级
            </label>
            <PrioritySelect key={`priority-${formKey}`} />
          </div>
        </div>

        <FormError message={error} />

        <Button type="submit" disabled={pending}>
          {pending ? "创建中…" : "添加待办"}
        </Button>
      </form>
    </Card>
  );
}
