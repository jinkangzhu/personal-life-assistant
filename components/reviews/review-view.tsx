import { MarkdownContent } from "@/components/ui/markdown-content";
import type { Review } from "@prisma/client";
import { formatDate } from "@/lib/utils";

export function ReviewView({ review }: { review: Review }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--color-muted)]">
        <span>每日复盘</span>
        <span>{formatDate(review.periodDate)}</span>
        <span>
          创建于 {new Date(review.createdAt).toLocaleString("zh-CN")}
        </span>
        {review.updatedAt.getTime() !== review.createdAt.getTime() && (
          <span>
            更新于 {new Date(review.updatedAt).toLocaleString("zh-CN")}
          </span>
        )}
      </div>

      <MarkdownContent content={review.content} />
    </div>
  );
}
