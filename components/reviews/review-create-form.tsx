"use client";
import { FormError } from "@/components/ui/form-error";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createReview } from "@/app/(main)/reviews/actions";
import { MarkdownField } from "@/components/diary/markdown-field";
import { Button } from "@/components/ui/button";
import {
  ModuleAccent,
  ModuleFormActions,
  ModuleFormLabel,
  ModuleFormShell,
} from "@/components/ui/module-ui";
import { toDateInputValue } from "@/lib/utils";

export function ReviewCreateForm({
  periodDate,
  defaultContent,
}: {
  periodDate: Date;
  defaultContent: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const dateValue = toDateInputValue(periodDate);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await createReview(formData);
      if (result.ok) {
        setError("");
        if (result.id) {
          router.push(`/reviews/${result.id}`);
        }
        return;
      }
      setError(result.error ?? "保存失败");
    });
  }

  return (
    <ModuleFormShell>
      <ModuleAccent module="review" className="mb-8" />

      <form onSubmit={handleSubmit} className="space-y-8">
        <input type="hidden" name="periodDate" value={dateValue} />

        <p className="text-sm leading-relaxed text-[var(--color-muted)]">
          对照右侧当日数据，写下今天做得好的、需要调整的，以及明天的重点。
        </p>

        <div>
          <ModuleFormLabel>复盘正文</ModuleFormLabel>
          <MarkdownField defaultValue={defaultContent} rows={16} />
        </div>

        <FormError message={error} />

        <ModuleFormActions>
          <Button type="submit" disabled={pending} size="lg" className="min-w-28">
            {pending ? "保存中…" : "保存复盘"}
          </Button>
        </ModuleFormActions>
      </form>
    </ModuleFormShell>
  );
}
