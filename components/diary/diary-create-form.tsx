"use client";
import { FormError } from '@/components/ui/form-error';

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createDiary } from "@/app/(main)/diary/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { MarkdownField } from "@/components/diary/markdown-field";
import { MoodSelect } from "@/components/diary/mood-select";
import { TagSelector } from "@/components/tags/tag-selector";
import type { Tag } from "@prisma/client";
import { toDateInputValue } from "@/lib/utils";

export function DiaryCreateForm({ tags = [] }: { tags?: Tag[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [formKey, setFormKey] = useState(0);
  const today = toDateInputValue(new Date());

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await createDiary(formData);
      if (result.ok) {
        setError("");
        setFormKey((key) => key + 1);
        router.refresh();
        if (result.id) {
          router.push(`/diary/${result.id}`);
        }
        return;
      }
      setError(result.error ?? "创建失败");
    });
  }

  return (
    <Card className="px-4 py-4">
      <form key={formKey} onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
          <div>
            <label htmlFor="diary-title" className="mb-1.5 block text-xs text-[var(--color-muted)]">
              标题（可选）
            </label>
            <Input
              id="diary-title"
              name="title"
              placeholder="今天发生了什么？"
              maxLength={200}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs text-[var(--color-muted)]">
              日期
            </label>
            <DatePicker
              key={`date-${formKey}`}
              name="date"
              defaultValue={today}
              allowClear={false}
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs text-[var(--color-muted)]">
            心情
          </label>
          <MoodSelect key={`mood-${formKey}`} />
        </div>

        <div>
          <label className="mb-1.5 block text-xs text-[var(--color-muted)]">
            正文（Markdown）
          </label>
          <MarkdownField key={`content-${formKey}`} rows={6} />
        </div>

        <div>
          <label className="mb-1.5 block text-xs text-[var(--color-muted)]">
            标签
          </label>
          <TagSelector key={`tags-${formKey}`} tags={tags} />
        </div>

        <FormError message={error} />

        <Button type="submit" disabled={pending}>
          {pending ? "保存中…" : "保存日记"}
        </Button>
      </form>
    </Card>
  );
}
