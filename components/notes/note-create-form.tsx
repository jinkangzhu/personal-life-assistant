"use client";
import { FormError } from "@/components/ui/form-error";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createNote } from "@/app/(main)/notes/actions";
import { CategorySelect } from "@/components/categories/category-select";
import { MarkdownField } from "@/components/diary/markdown-field";
import { TagSelector } from "@/components/tags/tag-selector";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
    <Card className="px-4 py-4">
      <form key={formKey} onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="note-title" className="mb-1.5 block text-xs text-[var(--color-muted)]">
            标题
          </label>
          <Input
            id="note-title"
            name="title"
            placeholder="笔记标题"
            maxLength={200}
            required
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs text-[var(--color-muted)]">
            分类
          </label>
          <CategorySelect
            key={`category-${formKey}`}
            categories={categories}
            placeholder="无分类"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs text-[var(--color-muted)]">
            正文（Markdown）
          </label>
          <MarkdownField key={`content-${formKey}`} rows={12} />
        </div>

        <div>
          <label className="mb-1.5 block text-xs text-[var(--color-muted)]">
            标签
          </label>
          <TagSelector key={`tags-${formKey}`} tags={tags} />
        </div>

        <FormError message={error} />

        <Button type="submit" disabled={pending}>
          {pending ? "保存中…" : "保存笔记"}
        </Button>
      </form>
    </Card>
  );
}
