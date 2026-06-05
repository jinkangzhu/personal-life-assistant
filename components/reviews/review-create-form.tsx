"use client";
import { FormError } from "@/components/ui/form-error";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createReview } from "@/app/(main)/reviews/actions";
import { MarkdownField } from "@/components/diary/markdown-field";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
    <Card className="px-4 py-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="hidden" name="periodDate" value={dateValue} />

        <div>
          <label className="mb-1.5 block text-sm text-[var(--color-muted)]">
            正文（Markdown）
          </label>
          <MarkdownField defaultValue={defaultContent} rows={16} />
        </div>

        <FormError message={error} />

        <Button type="submit" disabled={pending}>
          {pending ? "保存中…" : "保存复盘"}
        </Button>
      </form>
    </Card>
  );
}
