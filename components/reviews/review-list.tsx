import type { Review } from "@prisma/client";
import { ReviewCreateButton } from "@/components/reviews/review-create-button";
import { ReviewItem } from "@/components/reviews/review-item";
import { ModuleEmptyState } from "@/components/ui/module-ui";

export function ReviewList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return (
      <ModuleEmptyState
        module="review"
        title="还没有复盘"
        description="对照当日日记与待办完成情况，写下今天的好与坏，以及明天的重点。"
        action={<ReviewCreateButton />}
      />
    );
  }

  return (
    <ul className="space-y-2.5">
      {reviews.map((review) => (
        <ReviewItem key={review.id} review={review} />
      ))}
    </ul>
  );
}
