"use client";

import { FormError } from "@/components/ui/form-error";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import {
  createTagAction,
  deleteTagAction,
  updateTagAction,
} from "@/app/(main)/settings/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { TagBadge } from "@/components/tags/tag-badge";
import type { TagWithUsage } from "@/lib/services/tag";
import { TAG_COLORS } from "@/lib/validators/tag";

const MSG = {
  createFailed: "\u521b\u5efa\u5931\u8d25",
  updateFailed: "\u66f4\u65b0\u5931\u8d25",
  namePlaceholder: "\u65b0\u6807\u7b7e\u540d\u79f0",
  colorTitle: "\u6807\u7b7e\u989c\u8272",
  addTag: "\u6dfb\u52a0\u6807\u7b7e",
  empty: "\u6682\u65e0\u6807\u7b7e\uff0c\u53ef\u5728\u5199\u65e5\u8bb0\u65f6\u521b\u5efa\uff0c\u6216\u5728\u6b64\u6dfb\u52a0\u3002",
  save: "\u4fdd\u5b58",
  cancel: "\u53d6\u6d88",
  used: "\u4f7f\u7528",
  times: "\u6b21",
  edit: "\u7f16\u8f91",
  delete: "\u5220\u9664",
  deleteTitle: "\u5220\u9664\u6807\u7b7e",
  deleteConfirm: "\u5220\u9664",
} as const;

export function TagManager({ tags }: { tags: TagWithUsage[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [createError, setCreateError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editError, setEditError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const result = await createTagAction(formData);
      if (result.ok) {
        setCreateError("");
        form.reset();
        router.refresh();
        return;
      }
      setCreateError(result.error ?? MSG.createFailed);
    });
  }

  function handleUpdate(id: string, form: HTMLFormElement) {
    const formData = new FormData(form);

    startTransition(async () => {
      const result = await updateTagAction(id, formData);
      if (result.ok) {
        setEditError("");
        setEditingId(null);
        router.refresh();
        return;
      }
      setEditError(result.error ?? MSG.updateFailed);
    });
  }

  function handleDelete(id: string, name: string) {
    setDeleteTarget({ id, name });
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    const { id } = deleteTarget;
    setDeleteTarget(null);

    startTransition(async () => {
      await deleteTagAction(id);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleCreate} className="flex flex-col gap-2 sm:flex-row">
        <Input
          name="name"
          placeholder={MSG.namePlaceholder}
          required
          maxLength={50}
          className="flex-1"
        />
        <div className="flex items-center gap-2">
          <input
            type="color"
            name="color"
            defaultValue={TAG_COLORS[0]}
            className="h-8 w-10 cursor-pointer rounded border border-[var(--color-border)] bg-transparent"
            title={MSG.colorTitle}
          />
          <Button type="submit" size="sm" disabled={pending}>
            {MSG.addTag}
          </Button>
        </div>
      </form>
      <FormError message={createError} />

      {tags.length === 0 ? (
        <p className="text-sm text-[var(--color-muted)]">{MSG.empty}</p>
      ) : (
        <ul className="space-y-2">
          {tags.map((tag) => (
            <li key={tag.id}>
              <Card className="flex flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center">
                {editingId === tag.id ? (
                  <form
                    className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center"
                    onSubmit={(event) => {
                      event.preventDefault();
                      handleUpdate(tag.id, event.currentTarget);
                    }}
                  >
                    <Input
                      name="name"
                      defaultValue={tag.name}
                      required
                      maxLength={50}
                      className="flex-1"
                    />
                    <input
                      type="color"
                      name="color"
                      defaultValue={tag.color ?? TAG_COLORS[0]}
                      className="h-8 w-10 cursor-pointer rounded border border-[var(--color-border)] bg-transparent"
                    />
                    <div className="flex gap-2">
                      <Button type="submit" size="sm" disabled={pending}>
                        {MSG.save}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingId(null);
                          setEditError("");
                        }}
                      >
                        {MSG.cancel}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <TagBadge tag={tag} />
                      <span className="text-xs text-[var(--color-muted)]">
                        {MSG.used} {tag.usageCount} {MSG.times}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingId(tag.id)}
                      >
                        {MSG.edit}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        disabled={pending}
                        onClick={() => handleDelete(tag.id, tag.name)}
                        aria-label={`${MSG.delete} ${tag.name}`}
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </Button>
                    </div>
                  </>
                )}
              </Card>
            </li>
          ))}
        </ul>
      )}
      <FormError message={editError} />
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title={MSG.deleteTitle}
        description={
          deleteTarget
            ? `\u786e\u5b9a\u5220\u9664\u6807\u7b7e\u300c${deleteTarget.name}\u300d\uff1f\u5173\u8054\u5185\u5bb9\u5c06\u79fb\u9664\u6b64\u6807\u7b7e\u3002`
            : ""
        }
        confirmLabel={MSG.deleteConfirm}
        onConfirm={confirmDelete}
        pending={pending}
      />
    </div>
  );
}
