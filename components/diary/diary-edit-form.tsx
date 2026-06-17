"use client";
import { FormError } from "@/components/ui/form-error";

import { useState, useTransition } from "react";
import { updateDiary } from "@/app/(main)/diary/actions";
import { MarkdownField } from "@/components/diary/markdown-field";
import { MoodSelect } from "@/components/diary/mood-select";
import { TagSelector } from "@/components/tags/tag-selector";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  ModuleFormActions,
  ModuleFormLabel,
  ModuleTitleInput,
} from "@/components/ui/module-ui";
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-end">
        <div>
          <label htmlFor="title" className="sr-only">
            标题
          </label>
          <ModuleTitleInput
            id="title"
            name="title"
            defaultValue={entry.title ?? ""}
            placeholder="今天想记住什么？"
            maxLength={200}
          />
        </div>

        <div>
          <ModuleFormLabel>日期</ModuleFormLabel>
          <DatePicker
            name="date"
            defaultValue={toDateInputValue(entry.date)}
            allowClear={false}
          />
        </div>
      </div>

      <div>
        <ModuleFormLabel>心情</ModuleFormLabel>
        <MoodSelect defaultValue={entry.mood} />
      </div>

      <div>
        <ModuleFormLabel>正文</ModuleFormLabel>
        <MarkdownField defaultValue={entry.content} rows={12} />
      </div>

      <div>
        <ModuleFormLabel>标签</ModuleFormLabel>
        <TagSelector
          tags={tags}
          defaultValue={tagsToInputValue(entry.tags)}
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
