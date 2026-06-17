"use client";

import Link from "next/link";
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
import {
  GoalStatusBadge,
  goalStatusAccentBar,
} from "@/components/goals/goal-status-select";
import { CreateLinkButton } from "@/components/ui/create-link-button";
import { ModuleEmptyState } from "@/components/ui/module-ui";
import { goalDescriptionSummary, type GoalWithPlans } from "@/lib/services/goal";
import { useSortableListSensors } from "@/lib/utils/sortable-list";
import { cn } from "@/lib/utils";

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
          "group/item relative flex items-start gap-2 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] transition",
          isDragging
            ? "border-indigo-500/40 shadow-lg ring-2 ring-indigo-500/20"
            : "hover:border-indigo-500/20 hover:bg-[var(--color-card-hover)]",
        )}
      >
        <div
          className={cn(
            "absolute inset-y-0 left-0 w-0.5",
            goalStatusAccentBar[goal.status],
          )}
          aria-hidden="true"
        />

        <button
          type="button"
          className="ml-2.5 mt-3 flex shrink-0 cursor-grab touch-none items-center justify-center rounded-md p-1 text-[var(--color-muted)] opacity-0 transition hover:bg-[var(--color-card-hover)] hover:text-indigo-400 active:cursor-grabbing group-hover/item:opacity-100 focus-visible:opacity-100"
          aria-label={`拖拽排序 ${goal.title}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <Link href={`/goals/${goal.id}`} className="min-w-0 flex-1 px-3 py-3.5 pr-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 space-y-2.5">
              <p className="text-[0.9375rem] font-medium leading-snug tracking-tight transition group-hover/item:text-indigo-300">
                {goal.title}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <GoalStatusBadge status={goal.status} />
                <GoalPlanStatsSummary stats={goal.planStats} />
              </div>
            </div>
            <span className="shrink-0 pt-0.5 font-mono text-[0.6875rem] tabular-nums text-[var(--color-muted)]">
              {updatedLabel}
            </span>
          </div>

          {summary && (
            <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-[var(--color-muted)]">
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
      <ModuleEmptyState
        module="goal"
        title="还没有长期目标"
        description="先写下你想去的方向。之后可以关联计划，把大方向拆成可执行的步骤。"
        action={<CreateLinkButton href="/goals/new" label="写下第一个目标" />}
      />
    );
  }

  return (
    <div className="space-y-3">
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
            {items.map((goal) => (
              <SortableGoalItem key={goal.id} goal={goal} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      {reorderError && <p className="text-sm text-red-400">{reorderError}</p>}
      <p className="text-xs text-[var(--color-muted)]">
        左侧色条表示状态。悬停后拖拽手柄可调整顺序。
      </p>
    </div>
  );
}
