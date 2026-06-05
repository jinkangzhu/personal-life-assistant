"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { reorderTodosAction } from "@/app/(main)/todos/actions";
import { EmptyState } from "@/components/ui/card";
import type { DisplayTodoItem } from "@/lib/services/recurring-todo";
import type { TodoReorderItem } from "@/lib/services/sort-order";
import type { TodoFilter } from "@/lib/validators/todo";
import { useSortableListSensors } from "@/lib/utils/sortable-list";
import { cn } from "@/lib/utils";
import { TodoItem } from "./todo-item";

function getTodoSortableId(todo: DisplayTodoItem) {
  if (todo.kind === "recurring") {
    return `recurring:${todo.recurringId ?? todo.id}`;
  }
  return `one_time:${todo.id}`;
}

function toReorderItem(sortableId: string): TodoReorderItem {
  const separatorIndex = sortableId.indexOf(":");
  const kind = sortableId.slice(0, separatorIndex) as TodoReorderItem["kind"];
  const id = sortableId.slice(separatorIndex + 1);
  return { kind, id };
}

function dedupeSortableTodos(todos: DisplayTodoItem[]) {
  const seen = new Set<string>();
  const result: DisplayTodoItem[] = [];

  for (const todo of todos) {
    const sortableId = getTodoSortableId(todo);
    if (seen.has(sortableId)) continue;
    seen.add(sortableId);
    result.push(todo);
  }

  return result;
}

function SortableTodoRow({ todo }: { todo: DisplayTodoItem }) {
  const sortableId = getTodoSortableId(todo);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: sortableId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-start gap-2",
        isDragging && "z-10 opacity-90",
      )}
    >
      <button
        type="button"
        className="mt-3 flex shrink-0 cursor-grab touch-none items-center justify-center rounded-md p-1 text-[var(--color-muted)] transition hover:bg-[var(--color-card-hover)] hover:text-indigo-400 active:cursor-grabbing"
        aria-label={`拖拽排序 ${todo.title}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div
        className={cn(
          "min-w-0 flex-1",
          isDragging && "rounded-xl ring-2 ring-indigo-500/20",
        )}
      >
        <TodoItem todo={todo} as="div" />
      </div>
    </li>
  );
}

export function TodoList({
  todos,
  filter,
}: {
  todos: DisplayTodoItem[];
  filter: TodoFilter;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [reorderError, setReorderError] = useState("");
  const sensors = useSortableListSensors();
  const sortable = filter === "all";

  const initialItems = useMemo(() => dedupeSortableTodos(todos), [todos]);
  const [items, setItems] = useState(initialItems);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex(
      (item) => getTodoSortableId(item) === active.id,
    );
    const newIndex = items.findIndex(
      (item) => getTodoSortableId(item) === over.id,
    );
    if (oldIndex < 0 || newIndex < 0) return;

    const previousItems = items;
    const nextItems = arrayMove(items, oldIndex, newIndex);
    setItems(nextItems);
    setReorderError("");

    startTransition(async () => {
      const result = await reorderTodosAction(
        nextItems.map((item) => toReorderItem(getTodoSortableId(item))),
      );
      if (result.ok) {
        router.refresh();
        return;
      }
      setReorderError(result.error ?? "排序失败");
      setItems(previousItems);
    });
  }

  if (todos.length === 0) {
    return (
      <EmptyState
        variant="dashed"
        title="暂无待办"
        description="点击下方按钮添加待办，或切换筛选条件"
      />
    );
  }

  if (!sortable) {
    return (
      <ul className="space-y-2">
        {todos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </ul>
    );
  }

  return (
    <div className="space-y-2">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((item) => getTodoSortableId(item))}
          strategy={verticalListSortingStrategy}
        >
          <ul className="space-y-2">
            {items.map((todo) => (
              <SortableTodoRow key={getTodoSortableId(todo)} todo={todo} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      {reorderError && <p className="text-sm text-red-400">{reorderError}</p>}
      <p className="text-xs text-[var(--color-muted)]">
        未绑定计划的待办默认排在前面；拖拽后以手动顺序为准。
      </p>
    </div>
  );
}
