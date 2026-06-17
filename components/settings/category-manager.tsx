"use client";
import { FormError } from '@/components/ui/form-error';

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import {
  createCategoryAction,
  deleteCategoryAction,
  reorderCategoriesAction,
  updateCategoryAction,
} from "@/app/(main)/settings/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SettingsManagerItem } from "@/components/settings/settings-ui";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ModuleInlineEmpty } from "@/components/ui/module-ui";
import { cn } from "@/lib/utils";
import type { Category } from "@prisma/client";

function SortableCategoryItem({
  category,
  index,
  pending,
  editingId,
  onEdit,
  onCancelEdit,
  onUpdate,
  onDelete,
}: {
  category: Category;
  index: number;
  pending: boolean;
  editingId: string | null;
  onEdit: (id: string) => void;
  onCancelEdit: () => void;
  onUpdate: (id: string, form: HTMLFormElement) => void;
  onDelete: (id: string, name: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && "z-10 opacity-90")}
    >
      <SettingsManagerItem
        accentClassName="bg-violet-400/55"
        isDragging={isDragging}
      >
        {editingId === category.id ? (
          <form
            className="flex flex-1 gap-2 pl-1"
            onSubmit={(event) => {
              event.preventDefault();
              onUpdate(category.id, event.currentTarget);
            }}
          >
            <Input
              name="name"
              defaultValue={category.name}
              required
              maxLength={50}
              className="flex-1"
            />
            <Button type="submit" size="sm" disabled={pending}>
              保存
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onCancelEdit}
            >
              取消
            </Button>
          </form>
        ) : (
          <>
            <button
              type="button"
              className="flex shrink-0 cursor-grab touch-none items-center justify-center rounded-md p-1 text-[var(--color-muted)] opacity-0 transition hover:bg-[var(--color-card-hover)] hover:text-indigo-400 active:cursor-grabbing group-hover/item:opacity-100 focus-visible:opacity-100"
              aria-label={`拖拽排序 ${category.name}`}
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-4 w-4" />
            </button>

            <div className="flex min-w-0 flex-1 items-center gap-3 pl-1">
              <span className="text-sm font-medium leading-snug">{category.name}</span>
              <span className="font-mono text-xs tabular-nums text-[var(--color-muted)]">
                #{index + 1}
              </span>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onEdit(category.id)}
              >
                编辑
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={pending}
                onClick={() => onDelete(category.id, category.name)}
                aria-label={`删除 ${category.name}`}
              >
                <Trash2 className="h-4 w-4 text-red-400" />
              </Button>
            </div>
          </>
        )}
      </SettingsManagerItem>
    </li>
  );
}

export function CategoryManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [createError, setCreateError] = useState("");
  const [editError, setEditError] = useState("");
  const [reorderError, setReorderError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [items, setItems] = useState(categories);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    setItems(categories);
  }, [categories]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const result = await createCategoryAction(formData);
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
      const result = await updateCategoryAction(id, formData);
      if (result.ok) {
        setEditError("");
        setEditingId(null);
        router.refresh();
        return;
      }
      setEditError(result.error ?? "更新失败");
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
      await deleteCategoryAction(id);
      router.refresh();
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const previousItems = items;
    const nextItems = arrayMove(items, oldIndex, newIndex);
    setItems(nextItems);
    setReorderError("");

    startTransition(async () => {
      const result = await reorderCategoriesAction(
        nextItems.map((item) => item.id),
      );
      if (result.ok) {
        router.refresh();
        return;
      }
      setReorderError(result.error ?? "排序失败");
      setItems(previousItems);
    });
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleCreate} className="flex gap-2">
        <Input
          name="name"
          placeholder="新分类名称，如：前端"
          required
          maxLength={50}
          className="flex-1"
        />
        <Button type="submit" size="sm" disabled={pending}>
          添加分类
        </Button>
      </form>
      <FormError message={createError} />

      {items.length === 0 ? (
        <ModuleInlineEmpty
          title="暂无分类"
          description="创建笔记时可选择分类，也可以在这里预先添加"
        />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map((item) => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="space-y-2.5">
              {items.map((category, index) => (
                <SortableCategoryItem
                  key={category.id}
                  category={category}
                  index={index}
                  pending={pending}
                  editingId={editingId}
                  onEdit={setEditingId}
                  onCancelEdit={() => {
                    setEditingId(null);
                    setEditError("");
                  }}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}

      {reorderError && <p className="text-sm text-red-400">{reorderError}</p>}
      <FormError message={editError} />
      <p className="text-xs text-[var(--color-muted)]">
        悬停后拖拽手柄可调整顺序。
      </p>
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="删除分类"
        description={
          deleteTarget
            ? `确定删除分类「${deleteTarget.name}」？关联笔记将变为无分类。`
            : ""
        }
        confirmLabel="删除"
        onConfirm={confirmDelete}
        pending={pending}
      />
    </div>
  );
}