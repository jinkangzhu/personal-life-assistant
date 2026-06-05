"use client";
import { FormError } from "@/components/ui/form-error";

import { useState, useTransition } from "react";
import { updateReview } from "@/app/(main)/reviews/actions";
import { MarkdownField } from "@/components/diary/markdown-field";
import { Button } from "@/components/ui/button";
import type { Review } from "@prisma/client";

export function ReviewEditForm({
  review,
  onCancel,
  onSaved,
}: {
  review: Review;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await updateReview(review.id, formData);
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
        <label className="mb-1.5 block text-sm text-[var(--color-muted)]">
          正文（Markdown）
        </label>
        <MarkdownField defaultValue={review.content} rows={16} />
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
