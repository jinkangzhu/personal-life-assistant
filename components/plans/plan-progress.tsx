import type { PlanProgress } from "@/lib/services/plan";
import { cn } from "@/lib/utils";

export function PlanProgressBar({
  progress,
  className,
  showLabel = true,
}: {
  progress: PlanProgress;
  className?: string;
  showLabel?: boolean;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {showLabel && (
        <div className="flex items-center justify-between text-xs text-[var(--color-muted)]">
          <span>
            {progress.completed} / {progress.total} 已完成
          </span>
          <span>{progress.percentage}%</span>
        </div>
      )}
      <div className="h-2 overflow-hidden rounded-full bg-[var(--color-card-hover)]">
        <div
          className="h-full rounded-full bg-indigo-500 transition-all"
          style={{ width: `${progress.percentage}%` }}
        />
      </div>
    </div>
  );
}
