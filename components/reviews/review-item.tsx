import Link from "next/link";
import { reviewContentSummary } from "@/lib/services/review";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Review } from "@prisma/client";

export function ReviewItem({ review }: { review: Review }) {
  const summary = reviewContentSummary(review.content);
  const updatedLabel = new Date(review.updatedAt).toLocaleString("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <li>
      <Link
        href={`/reviews/${review.id}`}
        className={cn(
          "group block rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-3 transition",
          "hover:border-indigo-500/20 hover:bg-[var(--color-card-hover)]",
        )}
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <span className="text-sm font-medium group-hover:text-indigo-400">
            {formatDate(review.periodDate)}
          </span>
          <span className="shrink-0 text-xs text-[var(--color-muted)]">
            {updatedLabel}
          </span>
        </div>

        {summary ? (
          <p className="mt-2 line-clamp-2 text-sm text-[var(--color-muted)]">
            {summary}
          </p>
        ) : (
          <p className="mt-2 text-sm text-[var(--color-muted)]">（空）</p>
        )}
      </Link>
    </li>
  );
}
