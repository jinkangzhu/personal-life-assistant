"use client";
import { FormError } from "@/components/ui/form-error";

import { useState, useTransition } from "react";
import { updateDiary } from "@/app/(main)/diary/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { MarkdownField } from "@/components/diary/markdown-field";
import { MoodSelect } from "@/components/diary/mood-select";
import { TagSelector } from "@/components/tags/tag-selector";
import type { DiaryWithTags } from "@/lib/services/diary";
import { tagsToInputValue } from "@/lib/services/tag";
import type { Tag } from "@prisma/client";
import { toDateInputValue } from "@/lib/utils";

export function DiaryEditForm({
  entry,
  tags = [],
  onCancel,
  onSaved,
}: {
  entry: DiaryWithTags;
  tags?: Tag[];
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await updateDiary(entry.id, formData);
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
          defaultValue={entry.title ?? ""}
          placeholder="可选标题"
          maxLength={200}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm text-[var(--color-muted)]">
          日期
        </label>
        <DatePicker
          name="date"
          defaultValue={toDateInputValue(entry.date)}
          allowClear={false}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm text-[var(--color-muted)]">
          心情
        </label>
        <MoodSelect defaultValue={entry.mood} />
      </div>

      <div>
        <label className="mb-1.5 block text-sm text-[var(--color-muted)]">
          正文（Markdown）
        </label>
        <MarkdownField defaultValue={entry.content} rows={12} />
      </div>

      <div>
        <label className="mb-1.5 block text-sm text-[var(--color-muted)]">
          标签
        </label>
        <TagSelector
          tags={tags}
          defaultValue={tagsToInputValue(entry.tags)}
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
