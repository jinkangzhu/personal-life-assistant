"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  linkPlanToGoal,
  unlinkPlanFromGoal,
} from "@/app/(main)/goals/actions";
import { PlanProgressBar } from "@/components/plans/plan-progress";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
} from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogBackdrop,
  DialogDescription,
  DialogFooter,
  DialogPopup,
  DialogPortal,
  DialogTitle,
  DialogViewport,
} from "@/components/ui/dialog";
import { FormError } from "@/components/ui/form-error";
import { NativeSelect } from "@/components/ui/native-select";
import type { GoalWithPlans } from "@/lib/services/goal";
import type { PlanWithProgress } from "@/lib/services/plan";
import { PLAN_STATUS_LABELS, PLAN_TYPE_LABELS } from "@/lib/validators/plan";
import Link from "next/link";

export function GoalPlansSection({
  goal,
  unlinkedPlans,
}: {
  goal: GoalWithPlans;
  unlinkedPlans: PlanWithProgress[];
}) {
  const router = useRouter();
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkPending, startLinkTransition] = useTransition();
  const [unlinkPending, startUnlinkTransition] = useTransition();
  const [linkError, setLinkError] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [unlinkTargetId, setUnlinkTargetId] = useState<string | null>(null);

  function handleLinkOpenChange(open: boolean) {
    setLinkOpen(open);
    if (!open) {
      setLinkError("");
      setSelectedPlanId("");
    }
  }

  function handleLinkPlan() {
    if (!selectedPlanId) {
      setLinkError("请选择计划");
      return;
    }

    startLinkTransition(async () => {
      const result = await linkPlanToGoal(goal.id, selectedPlanId);
      if (result.ok) {
        setLinkError("");
        setSelectedPlanId("");
        setLinkOpen(false);
        router.refresh();
        return;
      }
      setLinkError(result.error ?? "关联失败");
    });
  }

  function confirmUnlink() {
    if (!unlinkTargetId) return;
    const planId = unlinkTargetId;
    setUnlinkTargetId(null);

    startUnlinkTransition(async () => {
      await unlinkPlanFromGoal(goal.id, planId);
      router.refresh();
    });
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>关联计划</CardTitle>
          <CardAction>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setLinkOpen(true)}
            >
              关联计划
            </Button>
          </CardAction>
        </CardHeader>

        {goal.plans.length === 0 ? (
          <EmptyState
            title="尚未关联计划"
            description="点击「关联计划」选择已有计划"
          />
        ) : (
          <CardContent className="pt-0">
            <ul className="space-y-2">
              {goal.plans.map((plan) => {
                const dateRange = [plan.startDate, plan.endDate]
                  .filter(Boolean)
                  .map((date) =>
                    date!.toLocaleDateString("zh-CN", {
                      month: "short",
                      day: "numeric",
                    }),
                  )
                  .join(" — ");

                return (
                  <li
                    key={plan.id}
                    className="rounded-lg border border-[var(--color-border)] p-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <Link
                            href={`/plans/${plan.id}`}
                            className="text-sm font-medium hover:text-indigo-400"
                          >
                            {plan.title}
                          </Link>
                          <div className="flex shrink-0 flex-wrap gap-2 text-xs text-[var(--color-muted)]">
                            <span>{PLAN_TYPE_LABELS[plan.type]}</span>
                            <span>{PLAN_STATUS_LABELS[plan.status]}</span>
                          </div>
                        </div>

                        {dateRange && (
                          <p className="mt-1 text-xs text-[var(--color-muted)]">
                            {dateRange}
                          </p>
                        )}

                        <div className="mt-3">
                          <PlanProgressBar progress={plan.progress} />
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={unlinkPending}
                        onClick={() => setUnlinkTargetId(plan.id)}
                        className="shrink-0 text-xs text-[var(--color-muted)] transition hover:text-red-400"
                      >
                        取消关联
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        )}
      </Card>

      <Dialog open={linkOpen} onOpenChange={handleLinkOpenChange}>
        <DialogPortal>
          <DialogBackdrop />
          <DialogViewport>
            <DialogPopup>
              <DialogTitle>关联计划</DialogTitle>
              <DialogDescription>
                从未关联此目标的计划中选择一项，关联到「{goal.title}」
              </DialogDescription>

              {unlinkedPlans.length === 0 ? (
                <p className="mt-5 text-sm text-[var(--color-muted)]">
                  暂无可关联的计划。你可以先在计划页创建计划。
                </p>
              ) : (
                <div className="mt-5 space-y-4">
                  <div>
                    <label
                      htmlFor="link-plan-select"
                      className="mb-1.5 block text-xs text-[var(--color-muted)]"
                    >
                      选择计划
                    </label>
                    <NativeSelect
                      id="link-plan-select"
                      value={selectedPlanId}
                      onChange={(event) => {
                        setSelectedPlanId(event.target.value);
                        setLinkError("");
                      }}
                      placeholder="选择计划"
                      className="w-full"
                      options={unlinkedPlans.map((plan) => ({
                        value: plan.id,
                        label: plan.title,
                      }))}
                    />
                  </div>

                  <FormError message={linkError} />
                </div>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  disabled={linkPending}
                  onClick={() => handleLinkOpenChange(false)}
                >
                  取消
                </Button>
                <Button
                  type="button"
                  disabled={linkPending || unlinkedPlans.length === 0}
                  onClick={handleLinkPlan}
                >
                  {linkPending ? "关联中…" : "确认关联"}
                </Button>
              </DialogFooter>
            </DialogPopup>
          </DialogViewport>
        </DialogPortal>
      </Dialog>

      <ConfirmDialog
        open={unlinkTargetId !== null}
        onOpenChange={(open) => {
          if (!open) setUnlinkTargetId(null);
        }}
        title="取消关联"
        description="确定取消与此目标的关联？计划本身不会被删除。"
        confirmLabel="取消关联"
        onConfirm={confirmUnlink}
        pending={unlinkPending}
      />
    </>
  );
}
