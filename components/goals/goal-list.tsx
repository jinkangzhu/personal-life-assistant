"use client";

import { useEffect, useState, useTransition } from "react";
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
import { reorderGoalsAction } from "@/app/(main)/goals/actions";
import { GoalPlanStatsSummary } from "@/components/goals/goal-plan-stats";
import { GoalStatusBadge } from "@/components/goals/goal-status-select";
import { EmptyState } from "@/components/ui/card";
import { goalDescriptionSummary, type GoalWithPlans } from "@/lib/services/goal";
import { useSortableListSensors } from "@/lib/utils/sortable-list";
import { cn } from "@/lib/utils";
import Link from "next/link";

function SortableGoalItem({ goal }: { goal: GoalWithPlans }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: goal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const summary = goalDescriptionSummary(goal.description);
  const updatedLabel = new Date(goal.updatedAt).toLocaleString("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && "z-10 opacity-90")}
    >
      <div
        className={cn(
          "flex items-start gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-3 transition",
          isDragging && "border-indigo-500/40 shadow-lg ring-2 ring-indigo-500/20",
        )}
      >
        <button
          type="button"
          className="mt-0.5 flex shrink-0 cursor-grab touch-none items-center justify-center rounded-md p-1 text-[var(--color-muted)] transition hover:bg-[var(--color-card-hover)] hover:text-indigo-400 active:cursor-grabbing"
          aria-label={`拖拽排序 ${goal.title}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <Link
          href={`/goals/${goal.id}`}
          className="group min-w-0 flex-1"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0 space-y-2">
              <p className="text-sm font-medium group-hover:text-indigo-400">
                {goal.title}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <GoalStatusBadge status={goal.status} />
                <GoalPlanStatsSummary stats={goal.planStats} />
              </div>
            </div>
            <span className="shrink-0 text-xs text-[var(--color-muted)]">
              {updatedLabel}
            </span>
          </div>

          {summary && (
            <p className="mt-2 line-clamp-2 text-sm text-[var(--color-muted)]">
              {summary}
            </p>
          )}
        </Link>
      </div>
    </li>
  );
}

export function GoalList({ goals }: { goals: GoalWithPlans[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [items, setItems] = useState(goals);
  const [reorderError, setReorderError] = useState("");
  const sensors = useSortableListSensors();

  useEffect(() => {
    setItems(goals);
  }, [goals]);

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
      const result = await reorderGoalsAction(nextItems.map((item) => item.id));
      if (result.ok) {
        router.refresh();
        return;
      }
      setReorderError(result.error ?? "排序失败");
      setItems(previousItems);
    });
  }

  if (items.length === 0) {
    return (
      <EmptyState
        variant="dashed"
        title="暂无长期目标，记录你的发展方向吧"
      />
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
          items={items.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="space-y-2">
            {items.map((goal) => (
              <SortableGoalItem key={goal.id} goal={goal} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      {reorderError && <p className="text-sm text-red-400">{reorderError}</p>}
      <p className="text-xs text-[var(--color-muted)]">
        拖拽左侧手柄调整目标顺序。
      </p>
    </div>
  );
}
