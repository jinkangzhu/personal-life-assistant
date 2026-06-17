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
import { planStatusAccentBar } from "@/components/plans/plan-status-select";
import { CreateLinkButton } from "@/components/ui/create-link-button";
import { ModuleEmptyState } from "@/components/ui/module-ui";
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
          "group/item relative flex items-start gap-2 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] transition",
          isDragging
            ? "border-indigo-500/40 shadow-lg ring-2 ring-indigo-500/20"
            : "hover:border-indigo-500/20 hover:bg-[var(--color-card-hover)]",
        )}
      >
        <div
          className={cn(
            "absolute inset-y-0 left-0 w-0.5",
            planStatusAccentBar[plan.status],
          )}
          aria-hidden="true"
        />

        <button
          type="button"
          className="ml-2.5 mt-3 flex shrink-0 cursor-grab touch-none items-center justify-center rounded-md p-1 text-[var(--color-muted)] opacity-0 transition hover:bg-[var(--color-card-hover)] hover:text-indigo-400 active:cursor-grabbing group-hover/item:opacity-100 focus-visible:opacity-100"
          aria-label={`拖拽排序 ${plan.title}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <Link href={`/plans/${plan.id}`} className="group min-w-0 flex-1 px-3 py-3.5 pr-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 space-y-2">
              <p className="text-[0.9375rem] font-medium leading-snug tracking-tight transition group-hover/item:text-indigo-300">
                {plan.title}
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-[var(--color-muted)]">
                <span>{PLAN_TYPE_LABELS[plan.type]}</span>
                <span>{PLAN_STATUS_LABELS[plan.status]}</span>
                {dateRange && <span>{dateRange}</span>}
              </div>
            </div>
            <span className="shrink-0 pt-0.5 font-mono text-[0.6875rem] tabular-nums text-[var(--color-muted)]">
              {updatedLabel}
            </span>
          </div>

          {plan.description && (
            <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-[var(--color-muted)]">
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

const emptyStateMessages: Record<PlanFilter, { title: string; description?: string; showAction?: boolean }> = {
  pending: {
    title: "暂无进行中的计划",
    description: "切换筛选条件，或新建一个计划开始执行",
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
    title: "还没有计划",
    description: "把目标拆成有起止时间的步骤，关联待办并跟踪进度。",
    showAction: true,
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
      <ModuleEmptyState
        module="plan"
        title={emptyState.title}
        description={emptyState.description}
        action={
          emptyState.showAction ? (
            <CreateLinkButton href="/plans/new" label="新建计划" />
          ) : undefined
        }
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
        左侧色条表示状态。未绑定目标的计划默认排在前面；悬停后拖拽手柄可调整顺序。
      </p>
    </div>
  );
}
