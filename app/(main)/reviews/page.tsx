import { requireSession } from "@/lib/session";
import { listReviews } from "@/lib/services/review";
import { PageShell } from "@/components/layout/page-shell";
import { ReviewCreateButton } from "@/components/reviews/review-create-button";
import { ReviewList } from "@/components/reviews/review-list";

export default async function ReviewsPage() {
  const session = await requireSession();
  const reviews = await listReviews(session.id);

  return (
    <PageShell
      title="复盘"
      description="对照当日记录，总结得失并定说明天的重点"
      action={<ReviewCreateButton />}
    >
      <ReviewList reviews={reviews} />
    </PageShell>
  );
}
