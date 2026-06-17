"use client";
import { FormError } from "@/components/ui/form-error";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createNote } from "@/app/(main)/notes/actions";
import { CategorySelect } from "@/components/categories/category-select";
import { MarkdownField } from "@/components/diary/markdown-field";
import { TagSelector } from "@/components/tags/tag-selector";
import { Button } from "@/components/ui/button";
import {
  ModuleAccent,
  ModuleFormActions,
  ModuleFormLabel,
  ModuleFormSection,
  ModuleFormShell,
  ModuleTitleInput,
} from "@/components/ui/module-ui";
import type { Category, Tag } from "@prisma/client";

export function NoteCreateForm({
  categories = [],
  tags = [],
}: {
  categories?: Category[];
  tags?: Tag[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [formKey, setFormKey] = useState(0);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await createNote(formData);
      if (result.ok) {
        setError("");
        setFormKey((key) => key + 1);
        router.refresh();
        if (result.id) {
          router.push(`/notes/${result.id}`);
        }
        return;
      }
      setError(result.error ?? "创建失败");
    });
  }

  return (
    <ModuleFormShell>
      <ModuleAccent module="note" className="mb-8" />

      <form key={formKey} onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label htmlFor="note-title" className="sr-only">
            标题
          </label>
          <ModuleTitleInput
            id="note-title"
            name="title"
            placeholder="这条笔记叫什么？"
            maxLength={200}
            required
            autoFocus
          />
          <p className="mt-3 text-xs leading-relaxed text-[var(--color-muted)]">
            好标题让你以后搜得到
          </p>
        </div>

        <ModuleFormSection>
          <div>
            <ModuleFormLabel>分类</ModuleFormLabel>
            <CategorySelect
              key={`category-${formKey}`}
              categories={categories}
              placeholder="无分类"
            />
          </div>

          <div>
            <ModuleFormLabel>正文</ModuleFormLabel>
            <MarkdownField key={`content-${formKey}`} rows={12} />
          </div>

          <div>
            <ModuleFormLabel>标签</ModuleFormLabel>
            <TagSelector key={`tags-${formKey}`} tags={tags} />
          </div>
        </ModuleFormSection>

        <FormError message={error} />

        <ModuleFormActions>
          <Button type="submit" disabled={pending} size="lg" className="min-w-28">
            {pending ? "保存中…" : "保存笔记"}
          </Button>
        </ModuleFormActions>
      </form>
    </ModuleFormShell>
  );
}
