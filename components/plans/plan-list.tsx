"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
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
import { reorderPlansAction } from "@/app/(main)/plans/actions";
import { PlanItem } from "@/components/plans/plan-item";
import { PlanProgressBar } from "@/components/plans/plan-progress";
import { EmptyState } from "@/components/ui/card";
import type { PlanWithProgress } from "@/lib/services/plan";
import { useSortableListSensors } from "@/lib/utils/sortable-list";
import {
  PLAN_STATUS_LABELS,
  PLAN_TYPE_LABELS,
  type PlanFilter,
} from "@/lib/validators/plan";
import { cn } from "@/lib/utils";

function SortablePlanItem({ plan }: { plan: PlanWithProgress }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: plan.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const updatedLabel = new Date(plan.updatedAt).toLocaleString("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const dateRange = [plan.startDate, plan.endDate]
    .filter(Boolean)
    .map((date) =>
      date!.toLocaleDateString("zh-CN", { month: "short", day: "numeric" }),
    )
    .join(" — ");

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
          aria-label={`拖拽排序 ${plan.title}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <Link href={`/plans/${plan.id}`} className="group min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0 space-y-1">
              <p className="text-sm font-medium group-hover:text-indigo-400">
                {plan.title}
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-[var(--color-muted)]">
                <span>{PLAN_TYPE_LABELS[plan.type]}</span>
                <span>{PLAN_STATUS_LABELS[plan.status]}</span>
                {dateRange && <span>{dateRange}</span>}
              </div>
            </div>
            <span className="shrink-0 text-xs text-[var(--color-muted)]">
              {updatedLabel}
            </span>
          </div>

          {plan.description && (
            <p className="mt-2 line-clamp-2 text-sm text-[var(--color-muted)]">
              {plan.description}
            </p>
          )}

          <div className="mt-3">
            <PlanProgressBar progress={plan.progress} />
          </div>
        </Link>
      </div>
    </li>
  );
}

const emptyStateMessages: Record<PlanFilter, { title: string; description?: string }> = {
  pending: {
    title: "暂无进行中的计划",
    description: "切换筛选条件或创建新计划",
  },
  completed: {
    title: "暂无已完成的计划",
    description: "切换筛选条件查看其他计划",
  },
  archived: {
    title: "暂无已归档的计划",
    description: "切换筛选条件查看其他计划",
  },
  all: {
    title: "暂无计划，创建第一个计划开始拆解目标吧",
  },
};

export function PlanList({
  plans,
  filter,
}: {
  plans: PlanWithProgress[];
  filter: PlanFilter;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [items, setItems] = useState(plans);
  const [reorderError, setReorderError] = useState("");
  const sensors = useSortableListSensors();
  const sortable = filter === "all" || filter === "pending";
  const reorderScope = filter === "pending" ? "pending" : "all";

  useEffect(() => {
    setItems(plans);
  }, [plans]);

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
      const result = await reorderPlansAction(
        nextItems.map((item) => item.id),
        reorderScope,
      );
      if (result.ok) {
        router.refresh();
        return;
      }
      setReorderError(result.error ?? "排序失败");
      setItems(previousItems);
    });
  }

  if (plans.length === 0) {
    const emptyState = emptyStateMessages[filter];
    return (
      <EmptyState
        variant="dashed"
        title={emptyState.title}
        description={emptyState.description}
      />
    );
  }

  if (!sortable) {
    return (
      <ul className="space-y-2">
        {plans.map((plan) => (
          <PlanItem key={plan.id} plan={plan} />
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
          items={items.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="space-y-2">
            {items.map((plan) => (
              <SortablePlanItem key={plan.id} plan={plan} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      {reorderError && <p className="text-sm text-red-400">{reorderError}</p>}
      <p className="text-xs text-[var(--color-muted)]">
        未绑定目标的计划默认排在前面；拖拽后以手动顺序为准。
      </p>
    </div>
  );
}
