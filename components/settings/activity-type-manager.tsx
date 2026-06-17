"use client";
import { FormError } from "@/components/ui/form-error";

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
  createActivityTypeAction,
  deleteActivityTypeAction,
  reorderActivityTypesAction,
  updateActivityTypeAction,
} from "@/app/(main)/settings/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SettingsManagerItem } from "@/components/settings/settings-ui";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ModuleInlineEmpty } from "@/components/ui/module-ui";
import { cn } from "@/lib/utils";
import type { ActivityType } from "@prisma/client";

function SortableActivityTypeItem({
  activityType,
  index,
  pending,
  editingId,
  onEdit,
  onCancelEdit,
  onUpdate,
  onDelete,
}: {
  activityType: ActivityType;
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
  } = useSortable({ id: activityType.id });

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
        accentClassName="bg-violet-500/70"
        isDragging={isDragging}
      >
        {editingId === activityType.id ? (
          <form
            className="flex flex-1 gap-2 pl-1"
            onSubmit={(event) => {
              event.preventDefault();
              onUpdate(activityType.id, event.currentTarget);
            }}
          >
            <Input
              name="name"
              defaultValue={activityType.name}
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
              aria-label={`拖拽排序 ${activityType.name}`}
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-4 w-4" />
            </button>

            <div className="flex min-w-0 flex-1 items-center gap-3 pl-1">
              <span className="text-sm font-medium leading-snug">{activityType.name}</span>
              <span className="font-mono text-xs tabular-nums text-[var(--color-muted)]">
                #{index + 1}
              </span>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onEdit(activityType.id)}
              >
                编辑
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={pending}
                onClick={() => onDelete(activityType.id, activityType.name)}
                aria-label={`删除 ${activityType.name}`}
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

export function ActivityTypeManager({
  activityTypes,
}: {
  activityTypes: ActivityType[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [createError, setCreateError] = useState("");
  const [editError, setEditError] = useState("");
  const [reorderError, setReorderError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [items, setItems] = useState(activityTypes);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    setItems(activityTypes);
  }, [activityTypes]);

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
      const result = await createActivityTypeAction(formData);
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
      const result = await updateActivityTypeAction(id, formData);
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
      await deleteActivityTypeAction(id);
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
      const result = await reorderActivityTypesAction(
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
          placeholder="新类型，如：工作"
          required
          maxLength={50}
          className="flex-1"
        />
        <Button type="submit" size="sm" disabled={pending}>
          添加类型
        </Button>
      </form>
      <FormError message={createError} />

      {items.length === 0 ? (
        <ModuleInlineEmpty
          title="暂无活动类型"
          description="创建待办时可选择类型，用于统计今日时长"
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
              {items.map((activityType, index) => (
                <SortableActivityTypeItem
                  key={activityType.id}
                  activityType={activityType}
                  index={index}
                  pending={pending}
                  editingId={editingId}
                  onEdit={setEditingId}
                  onCancelEdit={() => {
                    setEditingId(null);
                    setEditError("");
                  }}
                  onUpdate={handleUpdate}
                  onDelete={(id, name) => setDeleteTarget({ id, name })}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}

      {reorderError && <p className="text-sm text-red-400">{reorderError}</p>}
      <FormError message={editError} />
      <p className="text-xs text-[var(--color-muted)]">
        悬停后拖拽手柄可调整顺序。删除后关联待办将变为未分类。
      </p>
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="删除活动类型"
        description={
          deleteTarget
            ? `确定删除「${deleteTarget.name}」？关联待办将变为未分类。`
            : ""
        }
        confirmLabel="删除"
        onConfirm={confirmDelete}
        pending={pending}
      />
    </div>
  );
}
