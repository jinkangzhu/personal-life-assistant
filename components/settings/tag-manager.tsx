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
import {
  SettingsManagerItem,
} from "@/components/settings/settings-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { TagBadge } from "@/components/tags/tag-badge";
import { ModuleInlineEmpty } from "@/components/ui/module-ui";
import type { TagWithUsage } from "@/lib/services/tag";
import { TAG_COLORS } from "@/lib/validators/tag";

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
      setCreateError(result.error ?? "创建失败");
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
      setEditError(result.error ?? "更新失败");
    });
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
          placeholder="新标签名称"
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
            title="标签颜色"
          />
          <Button type="submit" size="sm" disabled={pending}>
            添加标签
          </Button>
        </div>
      </form>
      <FormError message={createError} />

      {tags.length === 0 ? (
        <ModuleInlineEmpty
          title="暂无标签"
          description="写日记或笔记时可创建，也可以在这里预先添加"
        />
      ) : (
        <ul className="space-y-2.5">
          {tags.map((tag) => (
            <li key={tag.id}>
              <SettingsManagerItem
                accentStyle={{ backgroundColor: tag.color ?? TAG_COLORS[0] }}
              >
                {editingId === tag.id ? (
                  <form
                    className="flex flex-1 flex-col gap-2 pl-1 sm:flex-row sm:items-center"
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
                        保存
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
                        取消
                      </Button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex min-w-0 flex-1 items-center gap-3 pl-1">
                      <TagBadge tag={tag} />
                      <span className="text-xs text-[var(--color-muted)]">
                        使用 {tag.usageCount} 次
                      </span>
                    </div>
                    <div className="flex gap-2 pl-1 sm:pl-0">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingId(tag.id)}
                      >
                        编辑
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        disabled={pending}
                        onClick={() => setDeleteTarget({ id: tag.id, name: tag.name })}
                        aria-label={`删除 ${tag.name}`}
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </Button>
                    </div>
                  </>
                )}
              </SettingsManagerItem>
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
        title="删除标签"
        description={
          deleteTarget
            ? `确定删除标签「${deleteTarget.name}」？关联内容将移除此标签。`
            : ""
        }
        confirmLabel="删除"
        onConfirm={confirmDelete}
        pending={pending}
      />
    </div>
  );
}
