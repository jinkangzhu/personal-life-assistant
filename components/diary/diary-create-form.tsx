"use client";
import { FormError } from "@/components/ui/form-error";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createDiary } from "@/app/(main)/diary/actions";
import { MarkdownField } from "@/components/diary/markdown-field";
import { MoodSelect } from "@/components/diary/mood-select";
import { TagSelector } from "@/components/tags/tag-selector";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  ModuleAccent,
  ModuleFormActions,
  ModuleFormLabel,
  ModuleFormSection,
  ModuleFormShell,
  ModuleTitleInput,
} from "@/components/ui/module-ui";
import { toDateInputValue } from "@/lib/utils";
import type { Tag } from "@prisma/client";

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
    <ModuleFormShell>
      <ModuleAccent module="diary" className="mb-8" />

      <form key={formKey} onSubmit={handleSubmit} className="space-y-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-end">
          <div>
            <label htmlFor="diary-title" className="sr-only">
              标题
            </label>
            <ModuleTitleInput
              id="diary-title"
              name="title"
              placeholder="今天想记住什么？"
              maxLength={200}
              autoFocus
            />
          </div>

          <div>
            <ModuleFormLabel>日期</ModuleFormLabel>
            <DatePicker
              key={`date-${formKey}`}
              name="date"
              defaultValue={today}
              allowClear={false}
            />
          </div>
        </div>

        <ModuleFormSection>
          <div>
            <ModuleFormLabel>心情</ModuleFormLabel>
            <MoodSelect key={`mood-${formKey}`} />
          </div>

          <div>
            <ModuleFormLabel>正文</ModuleFormLabel>
            <MarkdownField key={`content-${formKey}`} rows={8} />
          </div>

          <div>
            <ModuleFormLabel>标签</ModuleFormLabel>
            <TagSelector key={`tags-${formKey}`} tags={tags} />
          </div>
        </ModuleFormSection>

        <FormError message={error} />

        <ModuleFormActions>
          <Button type="submit" disabled={pending} size="lg" className="min-w-28">
            {pending ? "保存中…" : "保存日记"}
          </Button>
        </ModuleFormActions>
      </form>
    </ModuleFormShell>
  );
}
