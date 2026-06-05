"use client";
import { FormError } from "@/components/ui/form-error";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { createTodo } from "@/app/(main)/todos/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Priority } from "@prisma/client";

export function TodoQuickCreate({ defaultDueDate }: { defaultDueDate: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const result = await createTodo(formData);
      if (result.ok) {
        setError("");
        form.reset();
        router.refresh();
        return;
      }
      setError(result.error ?? "创建失败");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-2">
        <Input
          name="title"
          placeholder="快速添加今日待办…"
          required
          maxLength={200}
          className="flex-1"
        />
        <Button type="submit" size="sm" disabled={pending} className="shrink-0">
          <Plus className="h-4 w-4" />
          <span className="sr-only sm:not-sr-only sm:ml-1">
            {pending ? "添加中…" : "添加"}
          </span>
        </Button>
      </div>
      <input type="hidden" name="dueDate" value={defaultDueDate} />
      <input type="hidden" name="priority" value={Priority.MEDIUM} />
      <FormError message={error} size="sm" />
    </form>
  );
}
