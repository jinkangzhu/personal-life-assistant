"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Minus, Plus } from "lucide-react";
import {
  markSmokeFreeDayAction,
  recordSmokingAction,
  undoSmokingAction,
} from "@/app/(main)/today/actions";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { Card, CardContent } from "@/components/ui/card";
import {
  formatSmokingDiffFromYesterday,
  type SmokingStats,
} from "@/lib/services/smoking";
import { cn } from "@/lib/utils";

export function SmokingTracker({
  stats,
  dateValue,
}: {
  stats: SmokingStats;
  dateValue: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function runAction(action: () => Promise<{ ok: boolean; error?: string }>) {
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        setError("");
        router.refresh();
        return;
      }
      setError(result.error ?? "操作失败");
    });
  }

  const diffLabel = formatSmokingDiffFromYesterday(stats.diffFromYesterday);
  const diffPositive = stats.diffFromYesterday > 0;

  return (
    <Card size="sm">
      <CardContent className="pt-0">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-medium text-[var(--color-muted)]">戒烟追踪</p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={pending || stats.todayCount <= 0}
              onClick={() => runAction(() => undoSmokingAction(dateValue))}
            >
              <Minus className="h-4 w-4" />
              <span className="sr-only sm:not-sr-only sm:ml-1">减一根</span>
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={pending}
              onClick={() => runAction(() => recordSmokingAction(dateValue))}
            >
              <Plus className="h-4 w-4" />
              <span className="sr-only sm:not-sr-only sm:ml-1">抽一根</span>
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() => runAction(() => markSmokeFreeDayAction(dateValue))}
            >
              今日未抽
            </Button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatItem label="今日抽烟" value={`${stats.todayCount} 根`} accent />
          <StatItem
            label="相比昨天"
            value={diffLabel}
            valueClassName={cn(
              diffPositive && "text-emerald-400",
              stats.diffFromYesterday < 0 && "text-amber-400",
            )}
          />
          <StatItem label="累计已抽" value={`${stats.totalSmoked} 根`} />
          <StatItem
            label="累计戒烟"
            value={`${stats.quitDays} 天`}
            valueClassName="text-emerald-400"
          />
        </div>

        <FormError message={error} size="sm" className="mt-2" />
        <p className="mt-2 text-xs text-[var(--color-muted)]">
          点击「抽一根」记录；零吸烟日记入「今日未抽」后计入累计戒烟天数。
        </p>
      </CardContent>
    </Card>
  );
}

function StatItem({
  label,
  value,
  accent,
  valueClassName,
}: {
  label: string;
  value: string;
  accent?: boolean;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2.5">
      <p className="text-xs text-[var(--color-muted)]">{label}</p>
      <p
        className={cn(
          "mt-1 text-lg font-semibold",
          accent && "text-indigo-400",
          valueClassName,
        )}
      >
        {value}
      </p>
    </div>
  );
}
