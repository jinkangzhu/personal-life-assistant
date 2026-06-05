import type { Review } from "@prisma/client";
import { ReviewItem } from "@/components/reviews/review-item";
import { EmptyState } from "@/components/ui/card";

export function ReviewList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return (
      <EmptyState
        variant="dashed"
        title="暂无复盘，从今日页开始写第一条吧"
      />
    );
  }

  return (
    <ul className="space-y-2">
      {reviews.map((review) => (
        <ReviewItem key={review.id} review={review} />
      ))}
    </ul>
  );
}
