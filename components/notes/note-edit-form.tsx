"use client";
import { FormError } from "@/components/ui/form-error";

import { useState, useTransition } from "react";
import { updateNote } from "@/app/(main)/notes/actions";
import { CategorySelect } from "@/components/categories/category-select";
import { MarkdownField } from "@/components/diary/markdown-field";
import { TagSelector } from "@/components/tags/tag-selector";
import { Button } from "@/components/ui/button";
import {
  ModuleFormActions,
  ModuleFormLabel,
  ModuleTitleInput,
} from "@/components/ui/module-ui";
import type { NoteWithRelations } from "@/lib/services/note";
import { tagsToInputValue } from "@/lib/services/tag";
import type { Category, Tag } from "@prisma/client";

export function NoteEditForm({
  note,
  categories = [],
  tags = [],
  onCancel,
  onSaved,
}: {
  note: NoteWithRelations;
  categories?: Category[];
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
      const result = await updateNote(note.id, formData);
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
      <div>
        <label htmlFor="title" className="sr-only">
          标题
        </label>
        <ModuleTitleInput
          id="title"
          name="title"
          defaultValue={note.title}
          placeholder="这条笔记叫什么？"
          maxLength={200}
          required
        />
      </div>

      <div>
        <ModuleFormLabel>分类</ModuleFormLabel>
        <CategorySelect
          categories={categories}
          defaultValue={note.categoryId}
          placeholder="无分类"
        />
      </div>

      <div>
        <ModuleFormLabel>正文</ModuleFormLabel>
        <MarkdownField defaultValue={note.content} rows={12} />
      </div>

      <div>
        <ModuleFormLabel>标签</ModuleFormLabel>
        <TagSelector
          tags={tags}
          defaultValue={tagsToInputValue(note.tags)}
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
