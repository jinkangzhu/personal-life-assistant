import { ModuleAccent } from "@/components/ui/module-ui";
import { cn } from "@/lib/utils";

export function TodayOverview({
  completed,
  total,
  completionRate,
}: {
  completed: number;
  total: number;
  completionRate: number;
}) {
  const rate = Math.min(100, Math.max(0, completionRate));

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-5 py-5">
      <ModuleAccent module="today" className="mb-5" />
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-xs font-medium tracking-wide text-[var(--color-muted)]">
            今日待办进度
          </p>
          <p className="mt-1.5 font-mono text-3xl font-semibold tabular-nums tracking-tight text-[var(--color-foreground)]">
            {completed}
            <span className="ml-1 text-lg font-normal text-[var(--color-muted)]">
              / {total}
            </span>
          </p>
        </div>
        <div className="min-w-[10rem] flex-1 sm:max-w-xs">
          <div
            className="h-1 overflow-hidden rounded-full bg-[var(--color-border)]/80"
            role="progressbar"
            aria-valuenow={rate}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="今日完成率"
          >
            <div
              className={cn(
                "h-full rounded-full transition-[width] duration-500 ease-out",
                rate >= 100
                  ? "bg-emerald-500/80"
                  : "bg-gradient-to-r from-amber-400/80 to-indigo-500/80",
              )}
              style={{ width: `${rate}%` }}
            />
          </div>
          <p className="mt-2 text-right font-mono text-xs tabular-nums text-[var(--color-muted)]">
            {rate}% 完成
          </p>
        </div>
      </div>
    </div>
  );
}
